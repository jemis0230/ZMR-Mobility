import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { Zap } from 'lucide-react';
import LoginForm from './LoginForm';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ signout?: string }> }) {
  const session = await getSession();
  if (session) redirect('/admin');
  const { signout } = await searchParams;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center">
          <div className="bg-primary p-2.5 rounded-xl">
            <Zap className="w-6 h-6 text-white fill-background" />
          </div>
          <span className="text-2xl font-black tracking-tight">
            ZMR <span className="text-primary">ADMIN</span>
          </span>
        </div>

        {/* Login card */}
        <div className="glass-card p-8 space-y-6 border-ink/10">
          <div>
            <h1 className="text-xl font-black text-ink">Sign in</h1>
            <p className="text-ink/60 text-sm mt-1">Admin access only</p>
          </div>
          {signout === 'failed' && (
            <p role="alert" className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-ink/80">
              Your previous admin session was removed from this browser, but the server could not confirm it was ended.
              Please sign in again; if this keeps happening, use Sign out inside the dashboard.
            </p>
          )}
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center text-ink/40 text-xs">
          ZMR Mobility Admin Panel
        </p>
      </div>
    </div>
  );
}
