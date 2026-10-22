// Lead listing filters and the Excel (.xlsx) workbook for the admin lead export.
//
// The admin lead list (getLeads) and the export route both build their database
// filter here, so an export always matches what staff see on screen. This file only
// imports the spreadsheet library so its tests run directly with `node --test`.
//
// Spreadsheet safety: every customer-supplied value is written as a typed string
// cell (shared string, never a formula) with the Text number format "@", so text
// such as "=HYPERLINK(...)", "+91…" or "-5" stays literal, also after a cell is edited.

import writeExcelFile from 'write-excel-file/node';
import type { Cell, CellObject, Feature, Row, SheetData } from 'write-excel-file/node';
import {
  findElement,
  getCellAddress,
  getOrderOfSiblings,
  getSelfClosingTagMarkup,
  insertElementMarkupAccordingToOrderOfSiblings,
} from 'write-excel-file/utility';
import type { Stream } from 'node:stream';
import type { Blob as NodeBlob } from 'node:buffer';

/** The library's file-content type for its Node build. */
type NodeFileContent = Stream | Buffer | NodeBlob;

// ── Labels (same wording as the admin screens) ───────────────────────────────

export const LEAD_SOURCE_LABEL: Record<string, string> = {
  'contact-form': 'Contact Us form',
  'vehicle-enquiry': 'Vehicle enquiry',
  'test-drive': 'Test drive',
};

export const INQUIRY_TYPE_LABEL: Record<string, string> = {
  VEHICLE_LEASING: 'Vehicle Leasing',
  VEHICLE_RENTING: 'Vehicle Renting',
  VEHICLE_PURCHASE: 'Vehicle Purchase',
  CORPORATE_ENTERPRISE: 'Corporate / Enterprise',
  FLEET_LOGISTICS: 'Fleet / Logistics',
  DEALERSHIP_FRANCHISE: 'Dealership / Franchise',
  B2B_PARTNERSHIP: 'B2B Partnership',
  TEST_DRIVE: 'Test Drive Request',
  OTHER: 'Other',
};

export const LEAD_STATUS_LABEL: Record<string, string> = {
  PENDING: 'New',
  CONTACTED: 'Contacted',
  QUALIFIED: 'In progress',
  CLOSED_WON: 'Closed – won',
  CLOSED_LOST: 'Closed – lost',
};

export const SELL_STATUS_LABEL: Record<string, string> = {
  NEW: 'New',
  REVIEWING: 'Reviewing',
  VALUED: 'Valued',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
};

const CATEGORY_LABEL: Record<string, string> = {
  TWO_WHEELER: '2 Wheeler',
  THREE_WHEELER_CARGO: '3 Wheeler (Cargo)',
  THREE_WHEELER_PASSENGER: '3 Wheeler (Passenger)',
  FOUR_WHEELER_PASSENGER: '4 Wheeler (Passenger)',
  FOUR_WHEELER_CARGO: '4 Wheeler (Cargo)',
};

/** Status filter buttons on the leads screen ("CLOSED" covers won and lost). */
export const LEAD_STATUS_FILTER_LABEL: Record<string, string> = {
  ALL: 'All',
  PENDING: 'New',
  CONTACTED: 'Contacted',
  QUALIFIED: 'In progress',
  CLOSED: 'Closed',
};

// ── Filters ──────────────────────────────────────────────────────────────────

export type LeadFilters = {
  search: string;
  /** ALL, a lead status, or CLOSED (won + lost). */
  status: string;
  /** Website form ('' = all forms). */
  source: string;
  /** '' = all, 'problem' = a staff notification failed or is not set up. */
  notify: string;
  /** Inquiry type ('' = all). Supported by the listing, not shown as a control. */
  inquiryType: string;
};

export const MAX_SEARCH_LENGTH = 200;

type ParamSource = URLSearchParams | Record<string, string | undefined>;

function param(params: ParamSource, key: string): string {
  const v = params instanceof URLSearchParams ? params.get(key) : params[key];
  return (v ?? '').trim();
}

/** Validates filter values from a URL. Unknown values are rejected, never passed to the database. */
export function parseLeadFilters(params: ParamSource): { ok: true; filters: LeadFilters } | { ok: false; error: string } {
  const search = param(params, 'q');
  const status = param(params, 'status') || 'ALL';
  const source = param(params, 'source');
  const notify = param(params, 'notify');
  const inquiryType = param(params, 'inquiryType');

  if (search.length > MAX_SEARCH_LENGTH) return { ok: false, error: `Search text is too long (max ${MAX_SEARCH_LENGTH} characters).` };
  if (!(status in LEAD_STATUS_FILTER_LABEL)) return { ok: false, error: 'Unknown status filter.' };
  if (source && !(source in LEAD_SOURCE_LABEL)) return { ok: false, error: 'Unknown form filter.' };
  if (notify && notify !== 'problem') return { ok: false, error: 'Unknown notification filter.' };
  if (inquiryType && !(inquiryType in INQUIRY_TYPE_LABEL)) return { ok: false, error: 'Unknown inquiry type filter.' };
  return { ok: true, filters: { search, status, source, notify, inquiryType } };
}

export function hasActiveFilters(f: LeadFilters): boolean {
  return Boolean(f.search || f.status !== 'ALL' || f.source || f.notify || f.inquiryType);
}

/**
 * Prisma `where` for the lead list. Values are passed to Prisma as data (it builds a
 * parameterised query); nothing is concatenated into SQL.
 */
export function buildLeadWhere(f: LeadFilters): Record<string, unknown> {
  const where: Record<string, unknown> = {};
  if (f.status === 'CLOSED') where.status = { in: ['CLOSED_WON', 'CLOSED_LOST'] };
  else if (f.status !== 'ALL') where.status = f.status;
  if (f.source) where.source = f.source;
  if (f.inquiryType) where.inquiryType = f.inquiryType;
  if (f.notify === 'problem') where.notifications = { some: { status: { in: ['FAILED', 'NOT_CONFIGURED'] } } };
  if (f.search) {
    const q = f.search;
    where.OR = [
      { reference: { contains: q, mode: 'insensitive' } },
      { name: { contains: q, mode: 'insensitive' } },
      { phone: { contains: q } },
      { email: { contains: q, mode: 'insensitive' } },
      { vehicleName: { contains: q, mode: 'insensitive' } },
      { state: { contains: q, mode: 'insensitive' } },
      { city: { contains: q, mode: 'insensitive' } },
    ];
  }
  return where;
}

/** Human-readable description of the filters, for the workbook's "Export details" sheet. */
export function describeLeadFilters(f: LeadFilters): string[][] {
  return [
    ['Search', f.search || '(none)'],
    ['Status', LEAD_STATUS_FILTER_LABEL[f.status] ?? f.status],
    ['Form', f.source ? LEAD_SOURCE_LABEL[f.source] ?? f.source : 'All forms'],
    ['Notifications', f.notify === 'problem' ? 'Failed or not set up' : 'All notifications'],
    ...(f.inquiryType ? [['Inquiry type', INQUIRY_TYPE_LABEL[f.inquiryType] ?? f.inquiryType]] : []),
  ];
}

// ── Workbook ─────────────────────────────────────────────────────────────────

/** Excel's hard limits. Rows beyond the sheet limit are refused before generation. */
export const EXCEL_MAX_CELL_CHARS = 32_767;
export const EXCEL_MAX_ROWS = 1_048_576;
/** Largest export generated in one request (per worksheet), well inside Excel's row limit. */
export const MAX_EXPORT_ROWS = 50_000;

export const TIMEZONE_LABEL = 'IST (UTC+05:30)';
const TZ = 'IST, UTC+05:30';
const IST_OFFSET_MS = 330 * 60_000;

export type ExportLead = {
  id: string;
  reference: string | null;
  createdAt: Date;
  name: string;
  phone: string;
  email: string | null;
  state: string;
  city: string;
  inquiryType: string;
  source: string | null;
  vehicleName: string | null;
  preferredDate: Date | null;
  notes: string | null;
  status: string;
};

export type ExportSellApplication = {
  id: string;
  applicationId: string;
  createdAt: Date;
  updatedAt: Date;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  contactCity: string;
  category: string;
  sellerType: string;
  brandName: string;
  modelName: string;
  year: number;
  ownership: string;
  batteryCondition: string;
  vehicleCondition: string;
  hasAccident: boolean;
  loanStatus: string;
  documents: string[];
  expectedPriceRs: number;
  status: string;
  adminNotes: string | null;
};

/**
 * Excel stores dates without a timezone, so instants are converted to Indian wall-clock
 * time (IST has no daylight saving) and the column header names the timezone.
 */
export function toIstWallClock(d: Date): Date {
  return new Date(d.getTime() + IST_OFFSET_MS);
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** e.g. ZMR_Leads_2026-10-22_143000.xlsx (time in IST). */
export function exportFileName(now: Date, scope: 'filtered' | 'all'): string {
  const t = toIstWallClock(now);
  const stamp = `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}_${pad(t.getUTCHours())}${pad(t.getUTCMinutes())}${pad(t.getUTCSeconds())}`;
  return `ZMR_Leads_${scope === 'all' ? 'All_' : ''}${stamp}.xlsx`;
}

/** Keeps a value inside Excel's per-cell limit, saying so in the cell instead of cutting silently. */
export function fitCell(value: string): string {
  if (value.length <= EXCEL_MAX_CELL_CHARS) return value;
  const note = ` … [shortened for Excel: ${value.length} characters in total; see the admin panel for the full text]`;
  return value.slice(0, EXCEL_MAX_CELL_CHARS - note.length) + note;
}

/** Literal text cell; empty for missing optional values. */
function text(value: string | null | undefined, wrap = false): Cell {
  if (value === null || value === undefined || value === '') return null;
  const cell: CellObject = { value: fitCell(value), type: String, format: '@' };
  if (wrap) {
    cell.wrap = true;
    cell.alignVertical = 'top';
  }
  return cell;
}

function dateTime(d: Date | null): Cell {
  return d ? { value: toIstWallClock(d), type: Date, format: 'yyyy-mm-dd hh:mm' } : null;
}

/** Calendar dates (e.g. preferred test-drive day) are stored as UTC midnight: no shift. */
function dateOnly(d: Date | null): Cell {
  return d ? { value: d, type: Date, format: 'yyyy-mm-dd' } : null;
}

function header(labels: string[]): Row {
  return labels.map((value) => ({ value, type: String, fontWeight: 'bold', backgroundColor: '#E7F1EC', alignVertical: 'center' }) as CellObject);
}

const LEAD_COLUMNS: { header: string; width: number }[] = [
  { header: 'Reference', width: 15 },
  { header: 'Lead ID', width: 28 },
  { header: `Submitted (${TZ})`, width: 22 },
  { header: 'Customer name', width: 24 },
  { header: 'Phone', width: 15 },
  { header: 'Email', width: 30 },
  { header: 'State', width: 16 },
  { header: 'City', width: 16 },
  { header: 'Inquiry type', width: 22 },
  { header: 'Form', width: 18 },
  { header: 'Vehicle', width: 26 },
  { header: 'Preferred test-drive date', width: 14 },
  { header: 'Message', width: 60 },
  { header: 'Status', width: 14 },
];

export function leadRows(leads: ExportLead[]): SheetData {
  return [
    header(LEAD_COLUMNS.map((c) => c.header)),
    ...leads.map((l): Row => [
      text(l.reference),
      text(l.id),
      dateTime(l.createdAt),
      text(l.name),
      text(l.phone),
      text(l.email),
      text(l.state),
      text(l.city),
      text(INQUIRY_TYPE_LABEL[l.inquiryType] ?? l.inquiryType),
      text(l.source ? LEAD_SOURCE_LABEL[l.source] ?? l.source : null),
      text(l.vehicleName),
      dateOnly(l.preferredDate),
      text(l.notes, true),
      text(LEAD_STATUS_LABEL[l.status] ?? l.status),
    ]),
  ];
}

const SELL_COLUMNS: { header: string; width: number }[] = [
  { header: 'Application ID', width: 18 },
  { header: 'Record ID', width: 28 },
  { header: `Submitted (${TZ})`, width: 22 },
  { header: `Last updated (${TZ})`, width: 22 },
  { header: 'Customer name', width: 24 },
  { header: 'Phone', width: 15 },
  { header: 'Email', width: 30 },
  { header: 'City', width: 16 },
  { header: 'Vehicle category', width: 20 },
  { header: 'Seller type', width: 14 },
  { header: 'Brand', width: 16 },
  { header: 'Model', width: 20 },
  { header: 'Year', width: 8 },
  { header: 'Ownership', width: 12 },
  { header: 'Battery condition', width: 16 },
  { header: 'Vehicle condition', width: 16 },
  { header: 'Accident history', width: 10 },
  { header: 'Loan status', width: 14 },
  { header: 'Documents', width: 30 },
  { header: 'Expected price (₹)', width: 16 },
  { header: 'Status', width: 12 },
  { header: 'Staff notes', width: 40 },
];

export function sellRows(apps: ExportSellApplication[]): SheetData {
  return [
    header(SELL_COLUMNS.map((c) => c.header)),
    ...apps.map((a): Row => [
      text(a.applicationId),
      text(a.id),
      dateTime(a.createdAt),
      dateTime(a.updatedAt),
      text(a.contactName),
      text(a.contactPhone),
      text(a.contactEmail),
      text(a.contactCity),
      text(CATEGORY_LABEL[a.category] ?? a.category),
      text(a.sellerType),
      text(a.brandName),
      text(a.modelName),
      { value: a.year, type: Number, format: '0' },
      text(a.ownership),
      text(a.batteryCondition),
      text(a.vehicleCondition),
      text(a.hasAccident ? 'Yes' : 'No'),
      text(a.loanStatus),
      text(a.documents.join(', '), true),
      { value: a.expectedPriceRs, type: Number, format: '#,##0' },
      text(SELL_STATUS_LABEL[a.status] ?? a.status),
      text(a.adminNotes, true),
    ]),
  ];
}

/**
 * Adds Excel column filters (an <autoFilter/> over the header and data rows) to the
 * sheets that have a range, plus the hidden name Excel itself writes for it.
 */
function autoFilterFeature(sheets: { name: string; columns: number; rows: number }[]): Feature<NodeFileContent> {
  const ref = (i: number) => `${getCellAddress(0, 0)}:${getCellAddress(sheets[i].rows - 1, sheets[i].columns - 1)}`;
  const absolute = (i: number) => ref(i).replace(/([A-Z]+)(\d+)/g, '$$$1$$$2');
  return {
    files: {
      transform: {
        'xl/worksheets/sheet{id}.xml': {
          transform: (xml, _options, { sheetIndex }) => {
            const s = sheets[sheetIndex];
            if (!s || s.columns === 0 || findElement(xml, 'autoFilter')) return xml;
            return insertElementMarkupAccordingToOrderOfSiblings(
              xml,
              getSelfClosingTagMarkup('autoFilter', { ref: ref(sheetIndex) }),
              getOrderOfSiblings('xl/worksheets/sheet{id}.xml', 'worksheet') ?? [],
              'worksheet',
            );
          },
        },
        'xl/workbook.xml': {
          transform: (xml) => {
            const names = sheets
              .map((s, i) => (s.columns === 0 ? '' : `<definedName name="_xlnm._FilterDatabase" localSheetId="${i}" hidden="1">'${s.name}'!${absolute(i)}</definedName>`))
              .join('');
            if (!names) return xml;
            // The library writes an empty <definedNames/>; fill it, or add one after <sheets>.
            if (xml.includes('<definedNames/>')) return xml.replace('<definedNames/>', `<definedNames>${names}</definedNames>`);
            if (findElement(xml, 'definedNames')) return xml;
            return xml.replace('</sheets>', `</sheets><definedNames>${names}</definedNames>`);
          },
        },
      },
    },
  };
}

export type WorkbookInput = {
  scope: 'filtered' | 'all';
  generatedAt: Date;
  filters: LeadFilters;
  leads: ExportLead[];
  /** Only for "all": sell-vehicle applications, which have their own admin screen. */
  sellApplications?: ExportSellApplication[];
};

export async function buildLeadWorkbook(input: WorkbookInput): Promise<Buffer> {
  const leadData = leadRows(input.leads);
  const sellData = input.sellApplications ? sellRows(input.sellApplications) : null;
  if (leadData.length > EXCEL_MAX_ROWS || (sellData && sellData.length > EXCEL_MAX_ROWS)) {
    throw new Error('Too many rows for one Excel worksheet.');
  }

  const g = toIstWallClock(input.generatedAt);
  const generated = `${g.getUTCFullYear()}-${pad(g.getUTCMonth() + 1)}-${pad(g.getUTCDate())} ${pad(g.getUTCHours())}:${pad(g.getUTCMinutes())} ${TIMEZONE_LABEL}`;
  const details: string[][] = [
    ['Generated', generated],
    ['Scope', input.scope === 'all' ? 'All leads' : 'Leads matching the filters on the Leads screen (all pages)'],
    ...(input.scope === 'filtered' ? describeLeadFilters(input.filters) : []),
    ['Leads', String(input.leads.length)],
    ...(sellData ? [['Sell applications', String(input.sellApplications!.length)]] : []),
    ['Times', `All times are ${TIMEZONE_LABEL}.`],
    ['Note', 'Leads do not store a "last updated" time, so none is shown. Sell applications include it.'],
  ];
  const detailData: SheetData = [header(['Item', 'Value']), ...details.map(([k, v]) => [text(k), text(v, true)])];

  const sheets = [
    { name: 'Leads', data: leadData, columns: LEAD_COLUMNS },
    ...(sellData ? [{ name: 'Sell applications', data: sellData, columns: SELL_COLUMNS }] : []),
    { name: 'Export details', data: detailData, columns: [{ header: '', width: 22 }, { header: '', width: 70 }] },
  ];

  return writeExcelFile(
    sheets.map((s) => ({
      data: s.data,
      sheet: s.name,
      columns: s.columns.map((c) => ({ width: c.width })),
      stickyRowsCount: 1,
    })),
    {
      features: [
        autoFilterFeature(
          sheets.map((s) => ({ name: s.name, columns: s.name === 'Export details' ? 0 : s.columns.length, rows: s.data.length })),
        ),
      ],
    },
  ).toBuffer();
}
