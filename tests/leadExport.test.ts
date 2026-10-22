import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inflateRawSync } from 'node:zlib';
import {
  EXCEL_MAX_CELL_CHARS,
  buildLeadWhere,
  buildLeadWorkbook,
  exportFileName,
  fitCell,
  parseLeadFilters,
  toIstWallClock,
  type ExportLead,
} from '../src/lib/leadExportCore.ts';

/** Reads the files of a zip (xlsx) archive; enough for checking the generated XML. */
function unzip(buf: Buffer): Record<string, string> {
  const files: Record<string, string> = {};
  const eocd = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  let p = buf.readUInt32LE(eocd + 16);
  const count = buf.readUInt16LE(eocd + 10);
  for (let i = 0; i < count; i++) {
    const method = buf.readUInt16LE(p + 10);
    const size = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extra = buf.readUInt16LE(p + 30);
    const comment = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen);
    const start = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
    const data = buf.subarray(start, start + size);
    files[name] = (method === 8 ? inflateRawSync(data) : data).toString('utf8');
    p += 46 + nameLen + extra + comment;
  }
  return files;
}

const NO_FILTERS = { search: '', status: 'ALL', source: '', notify: '', inquiryType: '' };

function lead(over: Partial<ExportLead> = {}): ExportLead {
  return {
    id: 'clsynthetic0001',
    reference: 'ZMR-L-TEST01',
    createdAt: new Date('2026-10-22T09:00:00Z'),
    name: 'Test Customer',
    phone: '09876543210',
    email: 'test@example.com',
    state: 'Uttar Pradesh',
    city: 'Lucknow',
    inquiryType: 'TEST_DRIVE',
    source: 'test-drive',
    vehicleName: 'Sample EV',
    preferredDate: new Date('2026-10-25T00:00:00Z'),
    notes: 'Hello',
    status: 'PENDING',
    ...over,
  };
}

test('filters: valid values pass, unknown values are rejected', () => {
  const ok = parseLeadFilters(new URLSearchParams('q=%20ravi%20&status=CLOSED&source=test-drive&notify=problem'));
  assert.deepEqual(ok, { ok: true, filters: { search: 'ravi', status: 'CLOSED', source: 'test-drive', notify: 'problem', inquiryType: '' } });
  assert.equal(parseLeadFilters({ status: 'DROP TABLE' }).ok, false);
  assert.equal(parseLeadFilters({ source: 'other' }).ok, false);
  assert.equal(parseLeadFilters({ notify: 'all' }).ok, false);
  assert.equal(parseLeadFilters({ inquiryType: 'X' }).ok, false);
  assert.equal(parseLeadFilters({ q: 'x'.repeat(201) }).ok, false);
  assert.deepEqual(parseLeadFilters({}), { ok: true, filters: NO_FILTERS });
});

test('filters: where clause matches the lead list rules', () => {
  assert.deepEqual(buildLeadWhere(NO_FILTERS), {});
  const w = buildLeadWhere({ ...NO_FILTERS, status: 'CLOSED', source: 'contact-form', notify: 'problem', search: '987' });
  assert.deepEqual(w.status, { in: ['CLOSED_WON', 'CLOSED_LOST'] });
  assert.equal(w.source, 'contact-form');
  assert.deepEqual(w.notifications, { some: { status: { in: ['FAILED', 'NOT_CONFIGURED'] } } });
  assert.equal((w.OR as unknown[]).length, 7);
  assert.deepEqual(buildLeadWhere({ ...NO_FILTERS, status: 'CONTACTED' }).status, 'CONTACTED');
});

test('file name uses the IST time of the export', () => {
  // 09:00:00 UTC = 14:30:00 IST
  assert.equal(exportFileName(new Date('2026-10-22T09:00:00Z'), 'filtered'), 'ZMR_Leads_2026-10-22_143000.xlsx');
  assert.equal(exportFileName(new Date('2026-10-22T20:15:07Z'), 'all'), 'ZMR_Leads_All_2026-10-23_014507.xlsx');
});

test('IST wall clock and Excel cell limit', () => {
  assert.equal(toIstWallClock(new Date('2026-01-01T00:00:00Z')).toISOString(), '2026-01-01T05:30:00.000Z');
  assert.equal(fitCell('abc'), 'abc');
  const long = fitCell('x'.repeat(40_000));
  assert.equal(long.length, EXCEL_MAX_CELL_CHARS);
  assert.match(long, /shortened for Excel: 40000 characters/);
});

test('workbook: real xlsx with Leads sheet, header, freeze, filter and literal text', async () => {
  const leads = [
    lead(),
    lead({ id: 'clsynthetic0002', reference: null, name: 'सीता देवी', phone: '+919876543210', email: null, notes: '=HYPERLINK("http://example.com","x")', source: null, preferredDate: null }),
    lead({ id: 'clsynthetic0003', notes: '+SUM(1,2) -3 @cmd', name: 'Zoë 😀' }),
  ];
  const buf = await buildLeadWorkbook({ scope: 'filtered', generatedAt: new Date('2026-10-22T09:00:00Z'), filters: NO_FILTERS, leads });
  assert.equal(buf.subarray(0, 2).toString(), 'PK'); // zip container, not CSV/HTML
  const files = unzip(buf);
  assert.ok(files['[Content_Types].xml'].includes('spreadsheetml.sheet.main+xml'));
  assert.match(files['xl/workbook.xml'], /<sheet [^>]*name="Leads"/);
  assert.match(files['xl/workbook.xml'], /<sheet [^>]*name="Export details"/);
  assert.doesNotMatch(files['xl/workbook.xml'], /Sell applications/);

  const sheet = files['xl/worksheets/sheet1.xml'];
  assert.match(sheet, /<autoFilter ref="A1:N4"\/>/);
  assert.match(sheet, /<pane [^>]*ySplit="1"[^>]*state="frozen"/);
  assert.doesNotMatch(sheet, /<f>/); // no formulas anywhere
  assert.match(files['xl/workbook.xml'], /_xlnm\._FilterDatabase[^<]*>'Leads'!\$A\$1:\$N\$4</);

  const strings = files['xl/sharedStrings.xml'];
  for (const s of ['09876543210', '+919876543210', 'सीता देवी', 'Zoë 😀', 'ZMR-L-TEST01', 'test@example.com', 'Submitted (IST, UTC+05:30)']) {
    assert.ok(strings.includes(s), `missing ${s}`);
  }
  assert.ok(strings.includes('=HYPERLINK(&quot;http://example.com&quot;,&quot;x&quot;)') || strings.includes('=HYPERLINK("http://example.com","x")'));
  assert.ok(strings.includes('+SUM(1,2) -3 @cmd'));
  // Bold header style exists.
  assert.match(files['xl/styles.xml'], /<b\/>/);
});

test('workbook: "all" adds the sell applications worksheet', async () => {
  const buf = await buildLeadWorkbook({
    scope: 'all',
    generatedAt: new Date(),
    filters: NO_FILTERS,
    leads: [lead()],
    sellApplications: [
      {
        id: 'clsell1', applicationId: 'ZMR-SELL-TEST', createdAt: new Date(), updatedAt: new Date(), contactName: 'Seller', contactPhone: '0123456789',
        contactEmail: 's@example.com', contactCity: 'Pune', category: 'TWO_WHEELER', sellerType: 'Individual', brandName: 'Brand', modelName: 'Model',
        year: 2022, ownership: '1st', batteryCondition: 'Good', vehicleCondition: 'Good', hasAccident: false, loanStatus: 'None',
        documents: ['RC'], expectedPriceRs: 85000, status: 'NEW', adminNotes: null,
      },
    ],
  });
  const files = unzip(buf);
  assert.match(files['xl/workbook.xml'], /name="Sell applications"/);
  assert.match(files['xl/worksheets/sheet2.xml'], /<autoFilter ref="A1:V2"\/>/);
  assert.ok(files['xl/sharedStrings.xml'].includes('0123456789'));
});
