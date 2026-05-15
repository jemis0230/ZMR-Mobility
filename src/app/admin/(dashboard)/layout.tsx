import { requireSession } from '@/lib/auth';
import AdminShell from './AdminShell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  return <AdminShell session={session}>{children}</AdminShell>;
}
