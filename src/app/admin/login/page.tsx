import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Zap } from 'lucide-react';
import LoginForm from './LoginForm';

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect('/admin');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center">
          <div className="bg-primary p-2.5 rounded-xl">
            <Zap className="w-6 h-6 text-background fill-background" />
          </div>
          <span className="text-2xl font-black tracking-tight">
            ZMR <span className="text-primary">ADMIN</span>
          </span>
        </div>

        {/* Login card */}
        <div className="glass-card p-8 space-y-6 border-white/10">
          <div>
            <h1 className="text-xl font-black text-white">Sign in</h1>
            <p className="text-white/40 text-sm mt-1">Admin access only</p>
          </div>
          <LoginForm />
        </div>

        <p className="text-center text-white/20 text-xs">
          ZMR Mobility Admin Panel
        </p>
      </div>
    </div>
  );
}
