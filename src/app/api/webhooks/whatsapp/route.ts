import { applyWhatsAppStatus } from '@/lib/notifications/outbox';
import { validSignature } from '@/lib/notifications/webhook';

export const dynamic = 'force-dynamic';

// WhatsApp Cloud API webhook: delivery statuses for lead notifications.
// GET  = Meta's subscription check (hub.verify_token must match WHATSAPP_WEBHOOK_VERIFY_TOKEN).
// POST = status updates, accepted only with a valid X-Hub-Signature-256 (WHATSAPP_APP_SECRET).

export async function GET(req: Request) {
  const u = new URL(req.url);
  const token = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  if (token && u.searchParams.get('hub.mode') === 'subscribe' && u.searchParams.get('hub.verify_token') === token) {
    return new Response(u.searchParams.get('hub.challenge') ?? '', { status: 200 });
  }
  return new Response('Forbidden', { status: 403 });
}

type StatusEvent = { id: string; status: string; recipient_id?: string; errors?: { title?: string }[] };

export async function POST(req: Request) {
  const raw = await req.text();
  if (!validSignature(raw, req.headers.get('x-hub-signature-256'), process.env.WHATSAPP_APP_SECRET)) {
    return new Response('Invalid signature', { status: 401 });
  }
  let body: { entry?: { changes?: { value?: { statuses?: StatusEvent[] } }[] }[] };
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response('Bad request', { status: 400 });
  }
  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      for (const s of change.value?.statuses ?? []) {
        await applyWhatsAppStatus(s.id, s.status, s.recipient_id, s.errors?.[0]?.title);
      }
    }
  }
  // Inbound customer messages are not processed here (no automatic replies).
  return new Response('OK', { status: 200 });
}
