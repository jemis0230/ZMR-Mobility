import { requireSession } from '@/lib/auth';
import ChangePasswordForm from './ChangePasswordForm';

export default async function SettingsPage() {
  const session = await requireSession();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black">Settings</h1>
        <p className="text-white/40 mt-1">Manage your account preferences</p>
      </div>

      <div className="max-w-md">
        <div className="glass-card p-8 border-white/5 space-y-6">
          <div>
            <h2 className="text-lg font-black">Change Password</h2>
            <p className="text-white/40 text-sm mt-1">
              Signed in as <span className="text-white">{session.email}</span>
            </p>
          </div>
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
