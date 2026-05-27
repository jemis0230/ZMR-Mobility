'use client';

import { useState } from 'react';
import { api } from '@/lib/api-client';
import { AlertCircle, CheckCircle2, Lock } from 'lucide-react';

export default function ChangePasswordForm({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const form = e.currentTarget;
    const currentPassword = (form.elements.namedItem('currentPassword') as HTMLInputElement).value;
    const newPassword = (form.elements.namedItem('newPassword') as HTMLInputElement).value;
    const confirmPassword = (form.elements.namedItem('confirmPassword') as HTMLInputElement).value;

    const result = await api.put(`/admin/users/${userId}`, {
      action: 'change-password',
      currentPassword,
      newPassword,
      confirmPassword,
    });

    setLoading(false);

    if (!result.success) {
      setError(result.error ?? 'Failed to update password');
      return;
    }

    setSuccess(true);
    form.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          Password changed successfully!
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-background font-bold py-3 rounded-xl hover:bg-primary/90 transition-all electric-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
        ) : (
          <>
            <Lock className="w-4 h-4" />
            Update Password
          </>
        )}
      </button>
    </form>
  );
}
