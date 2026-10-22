// Reads leads for the admin Excel export. Read-only: nothing here changes a lead,
// its status or its notifications.

import prisma from '@/lib/prisma';
import { buildLeadWhere, type ExportLead, type ExportSellApplication, type LeadFilters } from '@/lib/leadExportCore';

/** Rows fetched per database round trip. */
const CHUNK = 1000;

const LEAD_FIELDS = {
  id: true,
  reference: true,
  createdAt: true,
  name: true,
  phone: true,
  email: true,
  state: true,
  city: true,
  inquiryType: true,
  source: true,
  vehicleName: true,
  preferredDate: true,
  notes: true,
  status: true,
} as const;

const SELL_FIELDS = {
  id: true,
  applicationId: true,
  createdAt: true,
  updatedAt: true,
  contactName: true,
  contactPhone: true,
  contactEmail: true,
  contactCity: true,
  category: true,
  sellerType: true,
  brandName: true,
  modelName: true,
  year: true,
  ownership: true,
  batteryCondition: true,
  vehicleCondition: true,
  hasAccident: true,
  loanStatus: true,
  documents: true,
  expectedPriceRs: true,
  status: true,
  adminNotes: true,
} as const;

/** Newest first; id breaks ties so chunks never repeat or skip a row. */
const ORDER = [{ createdAt: 'desc' as const }, { id: 'desc' as const }];

/** Rows strictly after (older than) the last row of the previous chunk. */
function after(last: { createdAt: Date; id: string } | undefined) {
  return last ? { OR: [{ createdAt: { lt: last.createdAt } }, { createdAt: last.createdAt, id: { lt: last.id } }] } : {};
}

export function countLeads(filters: LeadFilters | null): Promise<number> {
  return prisma.lead.count({ where: filters ? buildLeadWhere(filters) : {} });
}

export function countSellApplications(): Promise<number> {
  return prisma.sellApplication.count();
}

/** Every lead matching the filters (null = all leads), across all pages. */
export async function fetchLeadsForExport(filters: LeadFilters | null): Promise<ExportLead[]> {
  const where = filters ? buildLeadWhere(filters) : {};
  const rows: ExportLead[] = [];
  for (;;) {
    const chunk = await prisma.lead.findMany({
      where: { AND: [where, after(rows[rows.length - 1])] },
      orderBy: ORDER,
      take: CHUNK,
      select: LEAD_FIELDS,
    });
    rows.push(...chunk);
    if (chunk.length < CHUNK) return rows;
  }
}

export async function fetchSellApplicationsForExport(): Promise<ExportSellApplication[]> {
  const rows: ExportSellApplication[] = [];
  for (;;) {
    const chunk = await prisma.sellApplication.findMany({
      where: after(rows[rows.length - 1]),
      orderBy: ORDER,
      take: CHUNK,
      select: SELL_FIELDS,
    });
    rows.push(...chunk);
    if (chunk.length < CHUNK) return rows;
  }
}
