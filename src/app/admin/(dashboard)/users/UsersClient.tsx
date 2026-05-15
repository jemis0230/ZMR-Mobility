'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import {
  createAdminUserAction,
  resetUserPasswordAction,
  toggleUserActiveAction,
  deleteAdminUserAction,
} from '@/app/actions/authActions';
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
            <h2 className="text-lg font-black text-white">{title}</h2>
            <p className="text-white/40 text-sm mt-0.5">Share this password with the user</p>
          </div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-amber-300 text-sm font-medium">
            This password will <strong>NOT</strong> be shown again. Copy it now before closing.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-white/40">
            Generated Password
          </p>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 font-mono text-lg text-white tracking-wider break-all">
            {password}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={copy}
            className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-bold py-3 rounded-xl transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Password'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-primary text-background font-bold py-3 rounded-xl hover:bg-primary/90 transition-all electric-glow"
          >
            I've Saved It
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add user form ───────────────────────────────────────────────────────────────

const addInitial = { success: false, error: undefined, generatedPassword: undefined };

function AddUserSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-primary text-background font-bold py-3 rounded-xl hover:bg-primary/90 transition-all electric-glow disabled:opacity-50"
    >
      {pending ? (
        <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin mx-auto" />
      ) : (
        'Create User & Generate Password'
      )}
    </button>
  );
}

function AddUserModal({ onClose, onCreated }: { onClose: () => void; onCreated: (pw: string) => void }) {
  const [state, formAction] = useFormState(createAdminUserAction, addInitial);

  if (state.success && state.generatedPassword) {
    onCreated(state.generatedPassword);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-card border-white/10 w-full max-w-md p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black">Add New Admin User</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/50">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="client@example.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-primary focus:outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/50">
              Display Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Client Name"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-primary focus:outline-none transition-all"
            />
          </div>

          {state.error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {state.error}
            </p>
          )}

          <AddUserSubmitButton />
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
      const fd = new FormData();
      fd.append('userId', userId);
      const result = await resetUserPasswordAction({ success: false }, fd);
      if (result.success && result.generatedPassword) {
        setRevealPassword({ pw: result.generatedPassword, title: 'Password Reset' });
      }
      router.refresh();
    });
  };

  const handleToggleActive = (userId: string) => {
    startTransition(async () => {
      await toggleUserActiveAction(userId);
      router.refresh();
    });
  };

  const handleDelete = (userId: string) => {
    startTransition(async () => {
      await deleteAdminUserAction(userId);
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
          <p className="text-white/40 text-sm">{users.length} admin user{users.length !== 1 ? 's' : ''}</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-primary text-background font-bold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-all electric-glow text-sm"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>

        {/* Users table */}
        <div className="glass-card border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-white/30">User</th>
                  <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-white/30">Role</th>
                  <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-white/30">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-white/30">Last Login</th>
                  <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-white/30">Joined</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => {
                  const isSelf = user.id === currentUserId;
                  const isSuperadmin = user.role === 'superadmin';
                  const canModify = !isSelf && !isSuperadmin;

                  return (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-black flex-shrink-0">
                            {(user.name || user.email)[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">
                              {user.name || '—'}
                              {isSelf && (
                                <span className="ml-2 text-[10px] text-primary/70 font-normal">(you)</span>
                              )}
                            </p>
                            <p className="text-xs text-white/40">{user.email}</p>
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
                          <span className="text-[10px] font-black uppercase tracking-wider text-white/50 bg-white/5 border border-white/10 px-2 py-1 rounded-full">
                            Admin
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${
                          user.isActive
                            ? 'text-green-400 bg-green-400/10 border border-green-400/20'
                            : 'text-white/30 bg-white/5 border border-white/10'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-white/40">{formatDate(user.lastLoginAt)}</td>
                      <td className="px-6 py-4 text-sm text-white/40">{formatDate(user.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          {/* Reset password — only for non-superadmin users */}
                          {canModify && (
                            <button
                              onClick={() => handleResetPassword(user.id)}
                              disabled={isPending}
                              title="Reset Password"
                              className="p-2 rounded-lg hover:bg-amber-500/10 text-white/30 hover:text-amber-400 transition-all disabled:opacity-40"
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
                              className="p-2 rounded-lg hover:bg-white/5 text-white/30 hover:text-white transition-all disabled:opacity-40"
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
                                  className="px-2 py-1 rounded-lg text-white/40 text-xs hover:text-white transition-all"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDelete(user.id)}
                                title="Delete User"
                                className="p-2 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all"
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
