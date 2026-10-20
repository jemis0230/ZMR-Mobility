import 'server-only';
import { after } from 'next/server';
import type { InquiryType, Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { enqueueForLead, enqueueForSellApplication, processDueNotifications } from '@/lib/notifications/outbox';
import { consume, clientIp } from '@/lib/rateLimit';

// Saving website leads: one place for every lead-creating form, so each submission is
// stored durably, de-duplicated, and has its staff notifications queued in the same
// transaction. Notifications are then sent after the response (and retried later by
// the scheduled worker), so the visitor never waits on email/WhatsApp.

export type LeadSource = 'contact-form' | 'vehicle-enquiry' | 'test-drive';

export type NewLead = {
  name: string;
  phone: string;
  email?: string | null;
  state?: string;
  city?: string;
  inquiryType: InquiryType;
  vehicleId?: string | null;
  vehicleName?: string | null;
  preferredDate?: Date | null;
  notes?: string | null;
};

/** Same person + same form + same subject within this window counts as a resubmission. */
const DUPLICATE_WINDOW_MS = 10 * 60 * 1000;

function makeReference(prefix: string) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return `${prefix}-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')}`;
}

/** Serialise concurrent submissions for the same phone + form (double-clicks, retries). */
async function lockSubmission(tx: Prisma.TransactionClient, key: string) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))`;
}

export async function createLead(source: LeadSource, data: NewLead): Promise<{ id: string; reference: string; duplicate: boolean }> {
  const result = await prisma.$transaction(async (tx) => {
    await lockSubmission(tx, `lead:${source}:${data.phone}`);
    const existing = await tx.lead.findFirst({
      where: {
        source,
        phone: data.phone,
        inquiryType: data.inquiryType,
        vehicleId: data.vehicleId ?? null,
        createdAt: { gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true, reference: true },
    });
    if (existing) return { id: existing.id, reference: existing.reference ?? existing.id, duplicate: true };

    // 32^6 ≈ 1 billion references; the unique index guards against the rare clash.
    const reference = makeReference('ZMR-L');
    const lead = await tx.lead.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email ?? null,
        state: data.state ?? '',
        city: data.city ?? '',
        inquiryType: data.inquiryType,
        vehicleId: data.vehicleId ?? null,
        vehicleName: data.vehicleName ?? null,
        preferredDate: data.preferredDate ?? null,
        notes: data.notes ?? null,
        status: 'PENDING',
        source,
        reference,
      },
      select: { id: true },
    });
    await enqueueForLead(tx, lead.id);
    return { id: lead.id, reference, duplicate: false };
  });
  if (!result.duplicate) sendSoon(result.id, 'lead');
  return result;
}

/**
 * Save a Sell Your EV application with its notifications queued (same transaction),
 * returning the existing application for a resubmission within the duplicate window.
 */
export async function createSellApplication(
  data: Omit<Prisma.SellApplicationCreateInput, 'applicationId' | 'notifications'>,
): Promise<{ applicationId: string; duplicate: boolean }> {
  const result = await prisma.$transaction(async (tx) => {
    await lockSubmission(tx, `sell:${data.contactPhone}`);
    const existing = await tx.sellApplication.findFirst({
      where: { contactPhone: data.contactPhone, modelId: data.modelId, createdAt: { gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) } },
      select: { id: true, applicationId: true },
    });
    if (existing) return { id: existing.id, applicationId: existing.applicationId, duplicate: true };
    const applicationId = `ZMR-SELL-${crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
    const app = await tx.sellApplication.create({ data: { ...data, applicationId }, select: { id: true } });
    await enqueueForSellApplication(tx, app.id);
    return { id: app.id, applicationId, duplicate: false };
  });
  if (!result.duplicate) sendSoon(result.id, 'sell');
  return { applicationId: result.applicationId, duplicate: result.duplicate };
}

/** Try the new lead's notifications right after the response is sent. */
function sendSoon(sourceId: string, kind: 'lead' | 'sell') {
  after(async () => {
    try {
      const rows = await prisma.leadNotification.findMany({
        where: kind === 'lead' ? { leadId: sourceId } : { sellApplicationId: sourceId },
        select: { id: true },
      });
      await processDueNotifications({ ids: rows.map((r) => r.id), limit: rows.length || 1 });
    } catch (e) {
      // Left queued; the scheduled worker or a staff retry will send it.
      console.error('[leads] immediate notification attempt failed', (e as Error).message);
    }
  });
}

/** Public form protection: hidden honeypot field and per-IP submission limit. */
export async function checkPublicSubmission(req: Request, body: unknown, form: string): Promise<Response | 'bot' | null> {
  const website = (body as { website?: unknown } | null)?.website;
  if (typeof website === 'string' && website.trim() !== '') return 'bot';
  const r = await consume({ key: `form:${form}:${clientIp(req.headers)}`, limit: 8, windowSec: 10 * 60 });
  if (!r.allowed) {
    return Response.json(
      { success: false, error: 'Too many submissions from your connection. Please wait a few minutes or call us on +91 90452 22999.' },
      { status: 429, headers: { 'Retry-After': String(r.retryAfterSec) } },
    );
  }
  return null;
}
