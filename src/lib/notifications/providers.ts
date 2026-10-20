import 'server-only';
import nodemailer from 'nodemailer';
import type { EmailConfig, WhatsAppConfig } from './config';
import { isValidEmail } from './config';
import { emailContent, whatsappParams, oneLine, type LeadSummary } from './content';

// Each sender returns per-recipient results. `retryable` marks temporary failures
// (network, rate limits, 5xx/4xx SMTP replies) that are worth another attempt.

export type SendResult =
  | { ok: true; recipient: string; messageId: string | null }
  | { ok: false; recipient: string; error: string; retryable: boolean };

export async function sendEmail(cfg: EmailConfig, lead: LeadSummary, alreadySent: string[]): Promise<SendResult[]> {
  const to = cfg.to.filter((r) => !alreadySent.includes(r));
  if (!to.length) return [];
  const { subject, text, html } = emailContent(lead);
  const transport = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.password },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  try {
    const info = await transport.sendMail({
      from: cfg.from, // the authenticated sender, never the customer
      to,
      // Staff can reply straight to the customer; only a validated single address.
      ...(lead.email && isValidEmail(lead.email) ? { replyTo: oneLine(lead.email, 200) } : {}),
      subject,
      text,
      html,
    });
    const accepted = new Set((info.accepted ?? []).map(String));
    return to.map((r) =>
      accepted.has(r)
        ? { ok: true as const, recipient: r, messageId: info.messageId ?? null }
        : { ok: false as const, recipient: r, error: 'Rejected by the mail server', retryable: false },
    );
  } catch (e) {
    const err = e as { responseCode?: number; code?: string; message?: string };
    const retryable = !err.responseCode || err.responseCode < 500; // network errors and 4xx replies
    const error = oneLine(`${err.code ?? 'SMTP'}${err.responseCode ? ` ${err.responseCode}` : ''}: ${err.message ?? 'send failed'}`, 300);
    return to.map((r) => ({ ok: false as const, recipient: r, error, retryable }));
  } finally {
    transport.close();
  }
}

export async function sendWhatsApp(
  cfg: WhatsAppConfig,
  lead: LeadSummary,
  alreadySent: string[],
  fetchImpl: typeof fetch = fetch,
): Promise<SendResult[]> {
  const params = whatsappParams(lead);
  const out: SendResult[] = [];
  for (const to of cfg.recipients.filter((r) => !alreadySent.includes(r))) {
    try {
      const res = await fetchImpl(`${cfg.apiBase}/${cfg.apiVersion}/${cfg.phoneNumberId}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${cfg.accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to.replace(/^\+/, ''),
          type: 'template',
          template: {
            name: cfg.template,
            language: { code: cfg.language },
            components: [{ type: 'body', parameters: params.map((text) => ({ type: 'text', text })) }],
          },
        }),
        signal: AbortSignal.timeout(15_000),
      });
      const json = (await res.json().catch(() => ({}))) as { messages?: { id: string }[]; error?: { message?: string; code?: number } };
      if (res.ok && json.messages?.[0]?.id) {
        out.push({ ok: true, recipient: to, messageId: json.messages[0].id });
      } else {
        const retryable = res.status === 429 || res.status >= 500;
        out.push({ ok: false, recipient: to, retryable, error: oneLine(`WhatsApp ${res.status}${json.error?.code ? ` (${json.error.code})` : ''}: ${json.error?.message ?? 'request failed'}`, 300) });
      }
    } catch (e) {
      out.push({ ok: false, recipient: to, retryable: true, error: oneLine(`WhatsApp network error: ${(e as Error).message}`, 300) });
    }
  }
  return out;
}
