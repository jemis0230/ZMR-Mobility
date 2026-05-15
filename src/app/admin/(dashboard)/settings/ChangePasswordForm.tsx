'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { changePasswordAction } from '@/app/actions/authActions';
import { AlertCircle, CheckCircle2, Lock } from 'lucide-react';

const initialState = { success: false, error: undefined };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-primary text-background font-bold py-3 rounded-xl hover:bg-primary/90 transition-all electric-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {pending ? (
        <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
      ) : (
        <>
          <Lock className="w-4 h-4" />
          Update Password
        </>
      )}
    </button>
  );
}

export default function ChangePasswordForm() {
  const [state, formAction] = useFormState(changePasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-white/50">
          Current Password
        </label>
        <input
          type="password"
          name="currentPassword"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-primary focus:outline-none transition-all"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-white/50">
          New Password
        </label>
        <input
          type="password"
          name="newPassword"
          required
          autoComplete="new-password"
          placeholder="Min 8 characters"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-primary focus:outline-none transition-all"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-white/50">
          Confirm New Password
        </label>
        <input
          type="password"
          name="confirmPassword"
          required
          autoComplete="new-password"
          placeholder="••••••••"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-primary focus:outline-none transition-all"
        />
      </div>

      {state.error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          Password changed successfully!
        </div>
      )}

      <SubmitButton />
    </form>
  );
}
