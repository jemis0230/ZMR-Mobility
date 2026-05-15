import { getLeads } from '@/app/actions/leadActions';
import AdminLeadsClient from './AdminLeadsClient';

interface PageProps {
  searchParams: { q?: string; status?: string; page?: string };
}

export default async function AdminLeadsPage({ searchParams }: PageProps) {
  const search = searchParams.q ?? '';
  const statusFilter = searchParams.status ?? 'ALL';
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10) || 1);

  const result = await getLeads({ search, statusFilter, page });
  const leads = result.data ?? [];
  const total = result.total ?? 0;
  const pageCount = result.pageCount ?? 1;
  const pendingCount = leads.filter((l) => l.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leads & Contacts</h1>
          <p className="text-white/40 text-sm mt-1">
            {result.success
              ? `${total} lead${total !== 1 ? 's' : ''}${pendingCount > 0 ? ` · ${pendingCount} pending on this page` : ''}`
              : 'Manage inquiries from your website forms.'}
          </p>
        </div>
      </div>

      <AdminLeadsClient
        leads={leads}
        search={search}
        statusFilter={statusFilter}
        page={page}
        pageCount={pageCount}
        total={total}
        dbError={!result.success}
      />
    </div>
  );
}
