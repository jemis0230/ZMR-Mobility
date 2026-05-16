import { getSellApplications } from '@/app/actions/sellActions';
import SellApplicationsClient from './SellApplicationsClient';

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

export default async function SellApplicationsPage({ searchParams }: PageProps) {
  const { q, status, page: pageStr } = await searchParams;
  const search = q ?? '';
  const statusFilter = status ?? 'ALL';
  const page = Math.max(1, parseInt(pageStr ?? '1', 10) || 1);

  const result = await getSellApplications({ search, statusFilter, page });
  const apps = result.data ?? [];
  const total = result.total ?? 0;
  const pageCount = result.pageCount ?? 1;
  const newCount = apps.filter((a) => a.status === 'NEW').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sell Applications</h1>
        <p className="text-white/40 text-sm mt-1">
          {result.success
            ? `${total} application${total !== 1 ? 's' : ''}${newCount > 0 ? ` · ${newCount} new` : ''}`
            : 'Manage used EV sell requests from your website.'}
        </p>
      </div>

      <SellApplicationsClient
        apps={apps}
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
