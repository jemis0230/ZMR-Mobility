import 'server-only';
import type { Lead, SellApplication } from '@prisma/client';
import { adminBaseUrl } from './config';
import type { LeadSummary } from './format';

export type { LeadSummary } from './format';
export { emailContent, whatsappParams, oneLine, istTime, enquiryLine, WHATSAPP_TEMPLATE_PARAMS } from './format';

// What staff need to follow up, built once and rendered for email and WhatsApp.

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
