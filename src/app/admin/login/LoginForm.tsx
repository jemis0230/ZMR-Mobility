'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { loginAction } from '@/app/actions/authActions';
import { AlertCircle, LogIn } from 'lucide-react';

const initialState = { success: false as boolean, error: undefined as string | undefined };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-primary text-background font-bold py-3 rounded-xl hover:bg-primary/90 transition-all electric-glow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
      ) : (
        <>
          <LogIn className="w-4 h-4" />
          Sign In
        </>
      )}
    </button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useFormState(loginAction, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) router.push('/admin');
  }, [state?.success]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-white/50">
          Email
        </label>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="admin@example.com"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-primary focus:outline-none transition-all"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-white/50">
          Password
        </label>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-primary focus:outline-none transition-all"
        />
      </div>

      {state?.error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {state?.error}
        </div>
      )}

      <SubmitButton />
    </form>
  );
}
