import { getLeads } from '@/app/actions/leadActions';
import AdminLeadsClient from './AdminLeadsClient';
import prisma from '@/lib/prisma';
import LeadExportMenu from '@/presentation/components/admin/LeadExportMenu';
import { MAX_EXPORT_ROWS } from '@/lib/leadExportCore';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string; source?: string; notify?: string }>;
}

export default async function AdminLeadsPage({ searchParams }: PageProps) {
  const { q, status, page: pageStr, source = '', notify = '' } = await searchParams;
  const search = q ?? '';
  const statusFilter = status ?? 'ALL';
  const page = Math.max(1, parseInt(pageStr ?? '1', 10) || 1);

  const result = await getLeads({ search, statusFilter, page, source: source || undefined, notify: notify || undefined });
  const leads = result.data ?? [];
  const total = result.total ?? 0;
  const pageCount = result.pageCount ?? 1;
  const pendingCount = leads.filter((l) => l.status === 'PENDING').length;
  const [problemCount, allLeadCount, sellCount] = await Promise.all([
    prisma.leadNotification.count({ where: { leadId: { not: null }, status: { in: ['FAILED', 'NOT_CONFIGURED'] } } }),
    prisma.lead.count(),
    prisma.sellApplication.count(),
  ]);
  const hasFilters = Boolean(search.trim() || statusFilter !== 'ALL' || source || notify);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leads & Contacts</h1>
          <p className="text-ink/60 text-sm mt-1">
            {result.success
              ? `${total} lead${total !== 1 ? 's' : ''}${pendingCount > 0 ? ` · ${pendingCount} new on this page` : ''}`
              : 'Manage inquiries from your website forms.'}
          </p>
        </div>
        {result.success && (
          <LeadExportMenu
            counts={{ filtered: total, allLeads: allLeadCount, sellApplications: sellCount }}
            filters={{ q: search, status: statusFilter, source, notify }}
            hasFilters={hasFilters}
            maxRows={MAX_EXPORT_ROWS}
          />
        )}
      </div>

      {problemCount > 0 && (
        <p role="status" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-ink/85">
          <strong>{problemCount} staff notification{problemCount === 1 ? '' : 's'}</strong> failed or are waiting for email/WhatsApp settings.{' '}
          <a href="/admin/leads?notify=problem" className="font-bold text-primary-dark underline">Show those leads</a>
        </p>
      )}

      <AdminLeadsClient
        leads={leads}
        search={search}
        statusFilter={statusFilter}
        source={source}
        notify={notify}
        page={page}
        pageCount={pageCount}
        total={total}
        dbError={!result.success}
      />
    </div>
  );
}
