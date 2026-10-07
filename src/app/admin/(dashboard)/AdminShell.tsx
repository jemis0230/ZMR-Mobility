'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Car,
  MessageSquare,
  Settings,
  Zap,
  HelpCircle,
  BookOpen,
  ShoppingBag,
  Users,
  UserCog,
  LogOut,
  Menu,
  X,
  SlidersHorizontal,
  Newspaper,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import type { SessionPayload } from '@/lib/auth';

interface AdminShellProps {
  session: SessionPayload;
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { name: 'Vehicles', icon: Car, href: '/admin/vehicles' },
  { name: 'Blogs', icon: MessageSquare, href: '/admin/blogs' },
  { name: 'FAQs', icon: HelpCircle, href: '/admin/faqs' },
  { name: 'Press & Media', icon: Newspaper, href: '/admin/press' },
  { name: 'Leads/Contacts', icon: Users, href: '/admin/leads' },
  { name: 'EV Catalog', icon: BookOpen, href: '/admin/ev-catalog' },
  { name: 'Vehicle Config', icon: SlidersHorizontal, href: '/admin/vehicle-config' },
  { name: 'Sell Applications', icon: ShoppingBag, href: '/admin/sell-applications' },
  { name: 'Users', icon: UserCog, href: '/admin/users', superadminOnly: true },
  { name: 'Settings', icon: Settings, href: '/admin/settings' },
];

export default function AdminShell({ session, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    await api.post('/auth/logout', {});
    router.push('/admin/login');
  }

  const visibleItems = NAV_ITEMS.filter(
    (item) => !('superadminOnly' in item && item.superadminOnly) || session.role === 'superadmin'
  );

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  const currentPage = visibleItems.find((item) => isActive(item.href))?.name ?? 'Admin';

  return (
    <div className="flex min-h-screen bg-background text-foreground">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-24 z-40 w-64 border-r border-ink/[0.08] bg-background flex flex-col
        h-[calc(100vh-6rem)] transform transition-transform duration-300 ease-in-out
        md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-5 flex items-center gap-2 border-b border-ink/[0.08]">
          <div className="bg-primary p-1.5 rounded-lg">
            <Zap className="w-5 h-5 text-white fill-background" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            ZMR <span className="text-primary">ADMIN</span>
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1 mt-2 overflow-y-auto">
          {visibleItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                isActive(item.href)
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'hover:bg-ink/5 text-ink/70 hover:text-primary border border-transparent'
              }`}
            >
              <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform flex-shrink-0" />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="p-4 border-t border-ink/[0.08] space-y-2">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-sm font-black flex-shrink-0">
              {(session.name || session.email)[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-ink truncate">
                {session.name || session.email}
              </p>
              <p className="text-[10px] text-ink/50 truncate">{session.email}</p>
            </div>
          </div>

          {session.role === 'superadmin' && (
            <div className="px-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                Superadmin
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-ink/60 hover:text-red-500 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Mobile top bar */}
        <div className="md:hidden fixed top-14 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-background/95 backdrop-blur-sm border-b border-ink/[0.08]">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-ink/5 border border-ink/10 text-ink/75 hover:text-primary transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1 rounded-md">
              <Zap className="w-3.5 h-3.5 text-white fill-background" />
            </div>
            <span className="text-sm font-bold text-ink/85">{currentPage}</span>
          </div>
          <div className="w-9" /> {/* spacer to balance hamburger */}
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-8 pt-36 md:pt-28">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
