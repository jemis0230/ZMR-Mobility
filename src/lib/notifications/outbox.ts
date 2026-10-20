import 'server-only';
import type { NotificationChannel, Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { emailConfig, whatsappConfig } from './config';
import { leadSummary, sellSummary } from './content';
import { sendEmail, sendWhatsApp, type SendResult } from './providers';

// Database-backed outbox for lead notifications.
//
// - Rows are created in the same transaction as the lead, so a saved lead always has
//   its notifications queued, and provider failures never lose the lead.
// - Workers claim rows with FOR UPDATE SKIP LOCKED and a lease (lockedUntil), so the
//   same row is never sent by two workers; a crashed worker's row is picked up again
//   after the lease expires.
// - Recipients already accepted by the provider are remembered (sentTo) and skipped on
//   retries, so retries do not duplicate messages.

const CHANNELS: NotificationChannel[] = ['EMAIL', 'WHATSAPP'];
const LEASE_SECONDS = 120;
/** Wait before attempt n+1 (attempt numbers start at 1). */
const BACKOFF_SECONDS = [60, 5 * 60, 15 * 60, 60 * 60, 3 * 60 * 60];

type Tx = Prisma.TransactionClient;

export async function enqueueForLead(tx: Tx, leadId: string) {
  await tx.leadNotification.createMany({ data: CHANNELS.map((channel) => ({ leadId, channel })), skipDuplicates: true });
}

export async function enqueueForSellApplication(tx: Tx, sellApplicationId: string) {
  await tx.leadNotification.createMany({ data: CHANNELS.map((channel) => ({ sellApplicationId, channel })), skipDuplicates: true });
}

/** Claim due rows (optionally only the given ids) for this worker. */
async function claim(limit: number, ids?: string[]): Promise<string[]> {
  const rows = ids?.length
    ? await prisma.$queryRaw<{ id: string }[]>`
        UPDATE "LeadNotification" SET status = 'SENDING', "lockedUntil" = now() + make_interval(secs => ${LEASE_SECONDS}),
          attempts = attempts + 1, "updatedAt" = now()
        WHERE id IN (
          SELECT id FROM "LeadNotification"
          WHERE id = ANY(${ids}) AND ((status = 'QUEUED' AND "nextAttemptAt" <= now()) OR (status = 'SENDING' AND "lockedUntil" < now()))
          ORDER BY "nextAttemptAt" LIMIT ${limit} FOR UPDATE SKIP LOCKED)
        RETURNING id`
    : await prisma.$queryRaw<{ id: string }[]>`
        UPDATE "LeadNotification" SET status = 'SENDING', "lockedUntil" = now() + make_interval(secs => ${LEASE_SECONDS}),
          attempts = attempts + 1, "updatedAt" = now()
        WHERE id IN (
          SELECT id FROM "LeadNotification"
          WHERE (status = 'QUEUED' AND "nextAttemptAt" <= now()) OR (status = 'SENDING' AND "lockedUntil" < now())
          ORDER BY "nextAttemptAt" LIMIT ${limit} FOR UPDATE SKIP LOCKED)
        RETURNING id`;
  return rows.map((r) => r.id);
}

export type ProcessDeps = {
  sendEmail?: typeof sendEmail;
  sendWhatsApp?: typeof sendWhatsApp;
};

/** Send due notifications. Safe to call from several places at once. */
export async function processDueNotifications(opts: { limit?: number; ids?: string[] } = {}, deps: ProcessDeps = {}) {
  const ids = await claim(opts.limit ?? 20, opts.ids);
  const summary = { processed: ids.length, accepted: 0, retrying: 0, failed: 0, notConfigured: 0 };
  for (const id of ids) {
    const outcome = await processOne(id, deps);
    summary[outcome]++;
  }
  return summary;
}

async function processOne(id: string, deps: ProcessDeps): Promise<'accepted' | 'retrying' | 'failed' | 'notConfigured'> {
  const n = await prisma.leadNotification.findUniqueOrThrow({ where: { id }, include: { lead: true, sellApplication: true } });
  const summary = n.lead ? leadSummary(n.lead) : n.sellApplication ? sellSummary(n.sellApplication) : null;
  if (!summary) {
    await prisma.leadNotification.update({ where: { id }, data: { status: 'FAILED', lockedUntil: null, lastError: 'Source record no longer exists' } });
    return 'failed';
  }

  let results: SendResult[];
  if (n.channel === 'EMAIL') {
    const cfg = emailConfig();
    if (!cfg) return notConfigured(id, 'Email settings are incomplete (SMTP_*, LEAD_EMAIL_FROM, LEAD_NOTIFY_EMAIL_TO).');
    results = await (deps.sendEmail ?? sendEmail)(cfg, summary, n.sentTo);
  } else {
    const cfg = whatsappConfig();
    if (!cfg) return notConfigured(id, 'WhatsApp settings are incomplete (WHATSAPP_* variables).');
    results = await (deps.sendWhatsApp ?? sendWhatsApp)(cfg, summary, n.sentTo);
  }

  const sentTo = [...n.sentTo, ...results.filter((r) => r.ok).map((r) => r.recipient)];
  const messageIds = [
    ...n.providerMessageIds,
    ...results.flatMap((r) => (r.ok && r.messageId ? [r.messageId] : [])),
  ];
  const failures = results.filter((r): r is Extract<SendResult, { ok: false }> => !r.ok);

  if (failures.length === 0) {
    await prisma.leadNotification.update({
      where: { id },
      data: { status: 'ACCEPTED', sentTo, providerMessageIds: messageIds, acceptedAt: new Date(), lastError: null, lockedUntil: null },
    });
    return 'accepted';
  }

  const lastError = failures.map((f) => f.error).join(' | ').slice(0, 500);
  const canRetry = failures.some((f) => f.retryable) && n.attempts < n.maxAttempts;
  await prisma.leadNotification.update({
    where: { id },
    data: canRetry
      ? {
          status: 'QUEUED',
          sentTo,
          providerMessageIds: messageIds,
          lastError,
          lockedUntil: null,
          nextAttemptAt: new Date(Date.now() + BACKOFF_SECONDS[Math.min(n.attempts - 1, BACKOFF_SECONDS.length - 1)] * 1000),
        }
      : { status: 'FAILED', sentTo, providerMessageIds: messageIds, lastError, lockedUntil: null },
  });
  return canRetry ? 'retrying' : 'failed';
}

async function notConfigured(id: string, reason: string) {
  // Not a delivery attempt: give the attempt back so a later retry has its full budget.
  await prisma.leadNotification.update({
    where: { id },
    data: { status: 'NOT_CONFIGURED', attempts: { decrement: 1 }, lastError: reason, lockedUntil: null },
  });
  return 'notConfigured' as const;
}

/**
 * Staff retry: re-queue a failed / not-configured notification and try it now.
 * Recipients that already received it are skipped. Accepted or in-flight rows are left alone.
 */
export async function retryNotification(id: string, deps: ProcessDeps = {}) {
  const updated = await prisma.leadNotification.updateMany({
    where: { id, status: { in: ['FAILED', 'NOT_CONFIGURED', 'QUEUED'] } },
    data: { status: 'QUEUED', attempts: 0, nextAttemptAt: new Date(), lockedUntil: null },
  });
  if (updated.count === 0) return { retried: false as const, reason: 'This notification was already sent or is being sent.' };
  await processDueNotifications({ ids: [id], limit: 1 }, deps);
  const n = await prisma.leadNotification.findUniqueOrThrow({ where: { id }, select: { status: true, lastError: true } });
  return { retried: true as const, status: n.status, lastError: n.lastError };
}

/** Apply a WhatsApp delivery status from the webhook (sent / delivered / read / failed). */
export async function applyWhatsAppStatus(messageId: string, status: string, recipientId?: string, errorTitle?: string) {
  const n = await prisma.leadNotification.findFirst({ where: { channel: 'WHATSAPP', providerMessageIds: { has: messageId } } });
  if (!n) return false;
  if (status === 'delivered' && n.status === 'ACCEPTED') {
    await prisma.leadNotification.update({ where: { id: n.id }, data: { status: 'DELIVERED', deliveredAt: new Date() } });
  } else if (status === 'read' && (n.status === 'ACCEPTED' || n.status === 'DELIVERED')) {
    await prisma.leadNotification.update({ where: { id: n.id }, data: { status: 'READ', deliveredAt: n.deliveredAt ?? new Date() } });
  } else if (status === 'failed') {
    // Forget that recipient so a staff retry sends to it again.
    const sentTo = recipientId ? n.sentTo.filter((r) => r.replace(/^\+/, '') !== recipientId.replace(/^\+/, '')) : n.sentTo;
    await prisma.leadNotification.update({
      where: { id: n.id },
      data: { status: 'FAILED', sentTo, lastError: `WhatsApp delivery failed: ${errorTitle ?? 'unknown error'}`.slice(0, 500) },
    });
  }
  return true;
}
