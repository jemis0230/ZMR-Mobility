'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { api } from '@/lib/api-client';
import {
  Plus,
  KeyRound,
  Trash2,
  UserX,
  UserCheck,
  Copy,
  Check,
  AlertTriangle,
  X,
  Shield,
} from 'lucide-react';

type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
};

// ── Password reveal modal ───────────────────────────────────────────────────────

function PasswordRevealModal({
  password,
  title,
  onClose,
}: {
  password: string;
  title: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-card border-amber-500/30 w-full max-w-md p-8 space-y-6">
        <div className="flex items-start gap-3">
          <div className="bg-amber-500/20 p-2 rounded-lg flex-shrink-0">
            <KeyRound className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-ink">{title}</h2>
            <p className="text-ink/60 text-sm mt-0.5">Share this password with the user</p>
          </div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-amber-300 text-sm font-medium">
            This password will <strong>NOT</strong> be shown again. Copy it now before closing.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-ink/60">
            Generated Password
          </p>
          <div className="bg-ink/5 border border-ink/10 rounded-xl p-4 font-mono text-lg text-ink tracking-wider break-all">
            {password}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={copy}
            className="flex-1 flex items-center justify-center gap-2 bg-ink/10 hover:bg-ink/15 text-ink font-bold py-3 rounded-xl transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Password'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-all electric-glow"
          >
            I've Saved It
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add user form ───────────────────────────────────────────────────────────────

function AddUserModal({ onClose, onCreated }: { onClose: () => void; onCreated: (pw: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const result = await api.post<{ generatedPassword: string }>('/admin/users', { email, name });
    setLoading(false);
    if (!result.success) { setError(result.error ?? 'Failed to create user'); return; }
    onCreated(result.data.generatedPassword);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-card border-ink/10 w-full max-w-md p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black">Add New Admin User</h2>
          <button onClick={onClose} className="text-ink/60 hover:text-ink transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-ink/65">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="client@example.com"
              className="w-full bg-ink/5 border border-ink/10 rounded-xl px-4 py-3 text-ink placeholder-ink/40 focus:border-primary focus:outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-ink/65">
              Display Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Client Name"
              className="w-full bg-ink/5 border border-ink/10 rounded-xl px-4 py-3 text-ink placeholder-ink/40 focus:border-primary focus:outline-none transition-all"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-all electric-glow disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin mx-auto" />
            ) : (
              'Create User & Generate Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────────

export default function UsersClient({
  users,
  currentUserId,
}: {
  users: AdminUser[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showAddModal, setShowAddModal] = useState(false);
  const [revealPassword, setRevealPassword] = useState<{ pw: string; title: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleResetPassword = (userId: string) => {
    startTransition(async () => {
      const result = await api.put<{ generatedPassword: string }>(`/admin/users/${userId}`, { action: 'reset-password' });
      if (result.success) {
        setRevealPassword({ pw: result.data.generatedPassword, title: 'Password Reset' });
      }
      router.refresh();
    });
  };

  const handleToggleActive = (userId: string) => {
    startTransition(async () => {
      await api.put(`/admin/users/${userId}`, { action: 'toggle-active' });
      router.refresh();
    });
  };

  const handleDelete = (userId: string) => {
    startTransition(async () => {
      await api.del(`/admin/users/${userId}`);
      setConfirmDelete(null);
      router.refresh();
    });
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return 'Never';
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <>
      {/* Add user modal */}
      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onCreated={(pw) => {
            setShowAddModal(false);
            setRevealPassword({ pw, title: 'User Created — Save This Password' });
            router.refresh();
          }}
        />
      )}

      {/* Password reveal modal */}
      {revealPassword && (
        <PasswordRevealModal
          password={revealPassword.pw}
          title={revealPassword.title}
          onClose={() => {
            setRevealPassword(null);
            router.refresh();
          }}
        />
      )}

      <div className="space-y-4">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <p className="text-ink/60 text-sm">{users.length} admin user{users.length !== 1 ? 's' : ''}</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-primary text-white font-bold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-all electric-glow text-sm"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>

        {/* Users table */}
        <div className="glass-card border-ink/[0.08] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink/[0.08]">
                  <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-ink/50">User</th>
                  <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-ink/50">Role</th>
                  <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-ink/50">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-ink/50">Last Login</th>
                  <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-ink/50">Joined</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/[0.08]">
                {users.map((user) => {
                  const isSelf = user.id === currentUserId;
                  const isSuperadmin = user.role === 'superadmin';
                  const canModify = !isSelf && !isSuperadmin;

                  return (
                    <tr key={user.id} className="hover:bg-ink/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-black flex-shrink-0">
                            {(user.name || user.email)[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-ink">
                              {user.name || '—'}
                              {isSelf && (
                                <span className="ml-2 text-[10px] text-primary/70 font-normal">(you)</span>
                              )}
                            </p>
                            <p className="text-xs text-ink/60">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isSuperadmin ? (
                          <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded-full w-fit">
                            <Shield className="w-3 h-3" />
                            Superadmin
                          </span>
                        ) : (
                          <span className="text-[10px] font-black uppercase tracking-wider text-ink/65 bg-ink/5 border border-ink/10 px-2 py-1 rounded-full">
                            Admin
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${
                          user.isActive
                            ? 'text-green-400 bg-green-400/10 border border-green-400/20'
                            : 'text-ink/50 bg-ink/5 border border-ink/10'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-ink/60">{formatDate(user.lastLoginAt)}</td>
                      <td className="px-6 py-4 text-sm text-ink/60">{formatDate(user.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          {/* Reset password — only for non-superadmin users */}
                          {canModify && (
                            <button
                              onClick={() => handleResetPassword(user.id)}
                              disabled={isPending}
                              title="Reset Password"
                              className="p-2 rounded-lg hover:bg-amber-500/10 text-ink/50 hover:text-amber-400 transition-all disabled:opacity-40"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>
                          )}

                          {/* Toggle active */}
                          {canModify && (
                            <button
                              onClick={() => handleToggleActive(user.id)}
                              disabled={isPending}
                              title={user.isActive ? 'Deactivate' : 'Activate'}
                              className="p-2 rounded-lg hover:bg-ink/5 text-ink/50 hover:text-ink transition-all disabled:opacity-40"
                            >
                              {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </button>
                          )}

                          {/* Delete */}
                          {canModify && (
                            confirmDelete === user.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDelete(user.id)}
                                  disabled={isPending}
                                  className="px-2 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/30 transition-all"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setConfirmDelete(null)}
                                  className="px-2 py-1 rounded-lg text-ink/60 text-xs hover:text-ink transition-all"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDelete(user.id)}
                                title="Delete User"
                                className="p-2 rounded-lg hover:bg-red-500/10 text-ink/50 hover:text-red-400 transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
