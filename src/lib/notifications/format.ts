// Rendering of staff lead notifications (email and WhatsApp). Pure functions with no
// settings or secrets, so they can be unit-tested; content.ts builds the summary.

export type LeadSummary = {
  reference: string;
  receivedAt: Date;
  form: string;
  name: string;
  phone: string;
  email: string | null;
  inquiry: string;
  vehicle: string | null;
  details: [string, string][];
  message: string | null;
  adminUrl: string;
};

/** e.g. "20 Oct 2026, 3:04 pm IST" */
export function istTime(d: Date): string {
  return `${d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })} IST`;
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** Header-safe single line: no CR/LF (prevents header injection), bounded length. */
export const oneLine = (s: string, max = 120) => s.replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim().slice(0, max);

export function emailContent(l: LeadSummary) {
  const rows: [string, string][] = [
    ['Reference', l.reference],
    ['Received', istTime(l.receivedAt)],
    ['Enquiry', enquiryLine(l)],
    ['Name', l.name],
    ['Phone', l.phone],
    ...(l.email ? [['Email', l.email] as [string, string]] : []),
    ...(l.vehicle ? [['Vehicle', l.vehicle] as [string, string]] : []),
    ...l.details,
  ];
  const subject = oneLine(`New website lead ${l.reference}: ${enquiryLine(l)} – ${l.name}`, 150);
  const text = [
    'New lead from the ZMR Mobility website',
    '',
    ...rows.map(([k, v]) => `${k}: ${v}`),
    ...(l.message ? ['', 'Message:', l.message] : []),
    '',
    `Open in admin (sign-in required): ${l.adminUrl}`,
  ].join('\n');
  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#22322b">
<h2 style="margin:0 0 12px">New website lead ${esc(l.reference)}</h2>
<table cellpadding="6" style="border-collapse:collapse">${rows
    .map(([k, v]) => `<tr><td style="color:#555;vertical-align:top"><b>${esc(k)}</b></td><td>${esc(v)}</td></tr>`)
    .join('')}</table>
${l.message ? `<p style="margin:16px 0 4px"><b>Message</b></p><p style="white-space:pre-wrap;margin:0">${esc(l.message)}</p>` : ''}
<p style="margin-top:20px"><a href="${esc(l.adminUrl)}">Open this lead in the admin area</a> (sign-in required)</p>
</body></html>`;
  return { subject, text, html };
}

/** "Vehicle enquiry – Purchase"; the form name alone when it already says what was asked. */
export function enquiryLine(l: Pick<LeadSummary, 'form' | 'inquiry'>): string {
  const form = l.form.toLowerCase();
  const inquiry = l.inquiry.toLowerCase();
  if (!inquiry || form.includes(inquiry) || (form.includes('sell') && inquiry.includes('sell'))) return l.form;
  return `${l.form} – ${l.inquiry}`;
}

/** Number of body parameters in the WhatsApp template (docs/LEAD_NOTIFICATIONS.md). */
export const WHATSAPP_TEMPLATE_PARAMS = 7;

/**
 * Body parameters for the approved WhatsApp template (see docs/LEAD_NOTIFICATIONS.md):
 * {{1}} reference, {{2}} received (IST), {{3}} enquiry type, {{4}} vehicle,
 * {{5}} name, {{6}} phone, {{7}} link to the protected lead record.
 * Only what staff need to call back: no email address or free-text message (those stay
 * behind the admin sign-in). WhatsApp rejects empty values, newlines and tabs.
 */
export function whatsappParams(l: LeadSummary): string[] {
  return [
    l.reference,
    istTime(l.receivedAt),
    enquiryLine(l),
    l.vehicle || 'Not specified',
    l.name,
    l.phone,
    l.adminUrl,
  ].map((v) => oneLine(v, 200) || '-');
}
