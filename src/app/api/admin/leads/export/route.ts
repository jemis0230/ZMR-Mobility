import { withSession, isResponse } from '@/app/api/_lib/auth-guard';
import {
  MAX_EXPORT_ROWS,
  buildLeadWorkbook,
  exportFileName,
  parseLeadFilters,
} from '@/lib/leadExportCore';
import {
  countLeads,
  countSellApplications,
  fetchLeadsForExport,
  fetchSellApplicationsForExport,
} from '@/lib/leadExport';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

// Personal data: never stored by browsers' shared caches, proxies or the CDN.
const NO_STORE = {
  'Cache-Control': 'private, no-store, max-age=0',
  Pragma: 'no-cache',
  'X-Content-Type-Options': 'nosniff',
};

function error(status: number, message: string): Response {
  return Response.json({ success: false, error: message }, { status, headers: NO_STORE });
}

// GET /api/admin/leads/export?scope=filtered&q=&status=&source=&notify=
// GET /api/admin/leads/export?scope=all
//
// Staff only (the same check as the Leads screen; every active admin account may see
// every lead). "filtered" uses exactly the Leads screen filters, across all pages;
// "all" adds the sell-vehicle applications on their own worksheet. Read-only.
export async function GET(req: Request) {
  const session = await withSession();
  if (isResponse(session)) {
    return error(session.status, session.status === 401 ? 'Please sign in again to export leads.' : 'You do not have permission to export leads.');
  }

  const params = new URL(req.url).searchParams;
  const scope = params.get('scope');
  if (scope !== 'filtered' && scope !== 'all') return error(400, 'Choose what to export.');

  const parsed = parseLeadFilters(params);
  if (!parsed.ok) return error(400, parsed.error);
  const filters = scope === 'filtered' ? parsed.filters : null;

  try {
    const [leadCount, sellCount] = await Promise.all([
      countLeads(filters),
      scope === 'all' ? countSellApplications() : Promise.resolve(0),
    ]);
    if (leadCount + sellCount === 0) {
      return error(404, scope === 'filtered' ? 'No leads match the selected filters.' : 'There are no leads to export yet.');
    }
    if (leadCount > MAX_EXPORT_ROWS || sellCount > MAX_EXPORT_ROWS) {
      return error(
        413,
        `This export has more than ${MAX_EXPORT_ROWS.toLocaleString('en-IN')} rows, the most one download can hold. Narrow the filters (for example by status or form) and export in parts.`,
      );
    }

    const [leads, sellApplications] = await Promise.all([
      fetchLeadsForExport(filters),
      scope === 'all' ? fetchSellApplicationsForExport() : Promise.resolve(undefined),
    ]);
    const now = new Date();
    const workbook = await buildLeadWorkbook({ scope, generatedAt: now, filters: parsed.filters, leads, sellApplications });

    // Audit trail without customer data.
    console.info(`[lead-export] user=${session.userId} scope=${scope} leads=${leads.length} sell=${sellApplications?.length ?? 0}`);

    const fileName = exportFileName(now, scope);
    return new Response(new Uint8Array(workbook), {
      status: 200,
      headers: {
        ...NO_STORE,
        'Content-Type': XLSX_TYPE,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': String(workbook.length),
        'X-Export-Rows': String(leads.length + (sellApplications?.length ?? 0)),
      },
    });
  } catch (e) {
    // Error names only: messages from the database layer can echo filter values.
    console.error('[lead-export] failed:', e instanceof Error ? e.name : 'unknown error');
    return error(500, 'The Excel file could not be created. Please try again in a moment.');
  }
}
