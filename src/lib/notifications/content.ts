import 'server-only';
import type { Lead, SellApplication } from '@prisma/client';
import { adminBaseUrl } from './config';

// What staff need to follow up, built once and rendered for email and WhatsApp.

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

const FORM_LABEL: Record<string, string> = {
  'contact-form': 'Contact Us form',
  'vehicle-enquiry': 'Vehicle enquiry',
  'test-drive': 'Test drive request',
  'sell-ev': 'Sell Your EV',
};

const INQUIRY_LABEL: Record<string, string> = {
  VEHICLE_LEASING: 'Leasing',
  VEHICLE_RENTING: 'Rental',
  VEHICLE_PURCHASE: 'Purchase',
  CORPORATE_ENTERPRISE: 'Corporate / enterprise',
  FLEET_LOGISTICS: 'Fleet / logistics',
  DEALERSHIP_FRANCHISE: 'Dealership / franchise',
  B2B_PARTNERSHIP: 'B2B partnership',
  TEST_DRIVE: 'Test drive',
  OTHER: 'Other',
};

export const formLabel = (source: string | null | undefined) => FORM_LABEL[source ?? ''] ?? 'Website form';
export const inquiryLabel = (t: string) => INQUIRY_LABEL[t] ?? t;

export function leadSummary(lead: Lead): LeadSummary {
  const details: [string, string][] = [];
  const place = [lead.city, lead.state].filter(Boolean).join(', ');
  if (place) details.push(['Location', place]);
  if (lead.preferredDate) details.push(['Preferred date', lead.preferredDate.toISOString().slice(0, 10)]);
  const ref = lead.reference ?? lead.id;
  return {
    reference: ref,
    receivedAt: lead.createdAt,
    form: formLabel(lead.source),
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    inquiry: inquiryLabel(lead.inquiryType),
    vehicle: lead.vehicleName,
    details,
    message: lead.notes,
    adminUrl: `${adminBaseUrl()}/admin/leads?q=${encodeURIComponent(ref)}`,
  };
}

export function sellSummary(app: SellApplication): LeadSummary {
  return {
    reference: app.applicationId,
    receivedAt: app.createdAt,
    form: formLabel('sell-ev'),
    name: app.contactName,
    phone: app.contactPhone,
    email: app.contactEmail || null,
    inquiry: 'Sell an EV',
    vehicle: `${app.brandName} ${app.modelName} (${app.year})`,
    details: [
      ['City', app.contactCity],
      ['Category', app.category],
      ['Seller type', app.sellerType],
      ['Ownership', app.ownership],
      ['Battery condition', app.batteryCondition],
      ['Vehicle condition', app.vehicleCondition],
      ['Accident history', app.hasAccident ? 'Yes' : 'No'],
      ['Loan status', app.loanStatus],
      ['Expected price', `₹${Math.round(app.expectedPriceRs).toLocaleString('en-IN')}`],
    ],
    message: null,
    adminUrl: `${adminBaseUrl()}/admin/sell-applications?q=${encodeURIComponent(app.applicationId)}`,
  };
}

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
    ['Form', l.form],
    ['Name', l.name],
    ['Phone', l.phone],
    ...(l.email ? [['Email', l.email] as [string, string]] : []),
    ['Inquiry', l.inquiry],
    ...(l.vehicle ? [['Vehicle', l.vehicle] as [string, string]] : []),
    ...l.details,
  ];
  const subject = oneLine(`New website lead ${l.reference}: ${l.form} – ${l.name}`, 150);
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

/**
 * Body parameters for the approved WhatsApp template (see docs/LEAD_NOTIFICATIONS.md):
 * {{1}} reference, {{2}} form, {{3}} name, {{4}} phone, {{5}} admin link.
 * WhatsApp rejects newlines/tabs and long runs of spaces in parameters.
 */
export function whatsappParams(l: LeadSummary): string[] {
  return [l.reference, l.form, l.name, l.phone, l.adminUrl].map((v) => oneLine(v, 200));
}
