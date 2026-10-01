import prisma from '@/lib/prisma';
import Link from 'next/link';
import {
  Users, ShoppingBag, Car, ArrowRight,
  Clock, CheckCircle2, AlertCircle, RotateCcw,
  Star, Zap, TrendingUp, BookOpen,
} from 'lucide-react';

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

const LEAD_STATUS: Record<string, { label: string; color: string }> = {
  PENDING:     { label: 'Pending',   color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  CONTACTED:   { label: 'Contacted', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  QUALIFIED:   { label: 'Qualified', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  CLOSED_WON:  { label: 'Won',       color: 'text-green-400 bg-green-400/10 border-green-400/20' },
  CLOSED_LOST: { label: 'Lost',      color: 'text-red-400 bg-red-400/10 border-red-400/20' },
};

const SELL_STATUS: Record<string, { label: string; color: string }> = {
  NEW:       { label: 'New',       color: 'text-primary bg-primary/10 border-primary/20' },
  REVIEWING: { label: 'Reviewing', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  VALUED:    { label: 'Valued',    color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  ACCEPTED:  { label: 'Accepted',  color: 'text-green-400 bg-green-400/10 border-green-400/20' },
  REJECTED:  { label: 'Rejected',  color: 'text-red-400 bg-red-400/10 border-red-400/20' },
};

export default async function AdminDashboardPage() {
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [
    totalLeads, pendingLeads, contactedLeads, closedLeads, leadsThisMonth,
    totalApps, newApps, reviewingApps, valuedClosedApps, appsThisMonth,
    totalVehicles, vehiclesByCategory, activeLeasePlans,
    publishedBlogs, draftBlogs,
    recentLeads, recentApps,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: 'PENDING' } }),
    prisma.lead.count({ where: { status: 'CONTACTED' } }),
    prisma.lead.count({ where: { status: { in: ['CLOSED_WON', 'CLOSED_LOST'] } } }),
    prisma.lead.count({ where: { createdAt: { gte: startOfMonth } } }),

    prisma.sellApplication.count(),
    prisma.sellApplication.count({ where: { status: 'NEW' } }),
    prisma.sellApplication.count({ where: { status: 'REVIEWING' } }),
    prisma.sellApplication.count({ where: { status: { in: ['VALUED', 'ACCEPTED'] } } }),
    prisma.sellApplication.count({ where: { createdAt: { gte: startOfMonth } } }),

    prisma.vehicle.count(),
    prisma.vehicle.groupBy({ by: ['category'], _count: { _all: true }, orderBy: { _count: { category: 'desc' } } }),
    prisma.leasePlan.count({ where: { isActive: true } }),

    prisma.blogPost.count({ where: { published: true } }),
    prisma.blogPost.count({ where: { published: false } }),

    prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, inquiryType: true, status: true, createdAt: true },
    }),
    prisma.sellApplication.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, applicationId: true, brandName: true, modelName: true, status: true, createdAt: true },
    }),
  ]);

  const leadConversionRate = totalLeads > 0 ? Math.round((closedLeads / totalLeads) * 100) : 0;
  const sellConversionRate = totalApps > 0 ? Math.round((valuedClosedApps / totalApps) * 100) : 0;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-black">Dashboard</h1>
        <p className="text-ink/60 mt-1">Live overview of your business activity</p>
      </div>

      {/* ── Leads Pipeline ─────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-black uppercase tracking-widest text-ink/65">Leads Pipeline</h2>
          </div>
          <Link href="/admin/leads" className="flex items-center gap-1 text-xs text-primary/70 hover:text-primary transition-colors font-bold">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-6 border-ink/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-widest text-ink/60">Total Leads</p>
              <TrendingUp className="w-4 h-4 text-primary/40" />
            </div>
            <p className="text-4xl font-black text-ink">{totalLeads}</p>
            <p className="text-xs text-ink/50">
              <span className="text-primary font-bold">{leadsThisMonth}</span> this month
            </p>
          </div>

          <div className="glass-card p-6 border-amber-400/10 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-widest text-ink/60">Pending</p>
              <AlertCircle className="w-4 h-4 text-amber-400/50" />
            </div>
            <p className="text-4xl font-black text-amber-400">{pendingLeads}</p>
            <p className="text-xs text-ink/50">Awaiting contact</p>
          </div>

          <div className="glass-card p-6 border-blue-400/10 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-widest text-ink/60">Contacted</p>
              <Clock className="w-4 h-4 text-blue-400/50" />
            </div>
            <p className="text-4xl font-black text-blue-400">{contactedLeads}</p>
            <p className="text-xs text-ink/50">In progress</p>
          </div>

          <div className="glass-card p-6 border-green-400/10 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-widest text-ink/60">Closed</p>
              <CheckCircle2 className="w-4 h-4 text-green-400/50" />
            </div>
            <p className="text-4xl font-black text-green-400">{closedLeads}</p>
            <p className="text-xs text-ink/50">
              <span className="text-green-400 font-bold">{leadConversionRate}%</span> conversion
            </p>
          </div>
        </div>
      </section>

      {/* ── Sell Applications ──────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-black uppercase tracking-widest text-ink/65">Sell Applications</h2>
          </div>
          <Link href="/admin/sell-applications" className="flex items-center gap-1 text-xs text-primary/70 hover:text-primary transition-colors font-bold">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-6 border-ink/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-widest text-ink/60">Total Apps</p>
              <TrendingUp className="w-4 h-4 text-primary/40" />
            </div>
            <p className="text-4xl font-black text-ink">{totalApps}</p>
            <p className="text-xs text-ink/50">
              <span className="text-primary font-bold">{appsThisMonth}</span> this month
            </p>
          </div>

          <div className="glass-card p-6 border-primary/10 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-widest text-ink/60">New</p>
              <Zap className="w-4 h-4 text-primary/50" />
            </div>
            <p className="text-4xl font-black text-primary">{newApps}</p>
            <p className="text-xs text-ink/50">Needs review</p>
          </div>

          <div className="glass-card p-6 border-amber-400/10 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-widest text-ink/60">Reviewing</p>
              <RotateCcw className="w-4 h-4 text-amber-400/50" />
            </div>
            <p className="text-4xl font-black text-amber-400">{reviewingApps}</p>
            <p className="text-xs text-ink/50">Being assessed</p>
          </div>

          <div className="glass-card p-6 border-green-400/10 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-widest text-ink/60">Valued / Closed</p>
              <CheckCircle2 className="w-4 h-4 text-green-400/50" />
            </div>
            <p className="text-4xl font-black text-green-400">{valuedClosedApps}</p>
            <p className="text-xs text-ink/50">
              <span className="text-green-400 font-bold">{sellConversionRate}%</span> of all apps
            </p>
          </div>
        </div>
      </section>

      {/* ── Inventory & Content ────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4 text-primary" />
          <h2 className="text-xs font-black uppercase tracking-widest text-ink/65">Inventory & Content</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-6 border-ink/[0.08] space-y-3 md:col-span-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-widest text-ink/60">Vehicles in Catalog</p>
              <Link href="/admin/vehicles" className="text-primary/60 hover:text-primary transition-colors">
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <p className="text-4xl font-black text-ink">{totalVehicles}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {vehiclesByCategory.map((g) => (
                <span key={g.category} className="text-[10px] font-bold bg-ink/5 border border-ink/10 rounded-full px-2 py-0.5 text-ink/65">
                  {g.category.replace(' Wheeler', 'W')} · {g._count._all}
                </span>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 border-ink/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-widest text-ink/60">Lease Plans</p>
              <Star className="w-4 h-4 text-primary/40" />
            </div>
            <p className="text-4xl font-black text-ink">{activeLeasePlans}</p>
            <p className="text-xs text-ink/50">Active plans</p>
          </div>

          <div className="glass-card p-6 border-ink/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-widest text-ink/60">Blog Posts</p>
              <Link href="/admin/blogs" className="text-primary/60 hover:text-primary transition-colors">
                <BookOpen className="w-4 h-4" />
              </Link>
            </div>
            <p className="text-4xl font-black text-ink">{publishedBlogs}</p>
            <p className="text-xs text-ink/50">
              Published · <span className="text-amber-400 font-bold">{draftBlogs}</span> drafts
            </p>
          </div>
        </div>
      </section>

      {/* ── Recent Activity ────────────────────────────────────── */}
      <section className="grid md:grid-cols-2 gap-6">

        <div className="glass-card border-ink/[0.08] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-ink/[0.08]">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-black">Recent Leads</h3>
            </div>
            <Link href="/admin/leads" className="text-xs text-primary/60 hover:text-primary transition-colors font-bold flex items-center gap-1">
              All leads <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentLeads.length === 0 ? (
            <div className="px-6 py-10 text-center text-ink/40 text-sm">No leads yet</div>
          ) : (
            <div className="divide-y divide-ink/[0.08]">
              {recentLeads.map((lead) => {
                const st = LEAD_STATUS[lead.status] ?? LEAD_STATUS.PENDING;
                return (
                  <div key={lead.id} className="px-6 py-3 flex items-center justify-between gap-3 hover:bg-ink/[0.02] transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-ink truncate">{lead.name}</p>
                      <p className="text-xs text-ink/50 truncate">{lead.inquiryType}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${st.color}`}>
                        {st.label}
                      </span>
                      <span className="text-[10px] text-ink/45">{timeAgo(lead.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="glass-card border-ink/[0.08] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-ink/[0.08]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-black">Recent Sell Applications</h3>
            </div>
            <Link href="/admin/sell-applications" className="text-xs text-primary/60 hover:text-primary transition-colors font-bold flex items-center gap-1">
              All apps <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentApps.length === 0 ? (
            <div className="px-6 py-10 text-center text-ink/40 text-sm">No applications yet</div>
          ) : (
            <div className="divide-y divide-ink/[0.08]">
              {recentApps.map((app) => {
                const st = SELL_STATUS[app.status] ?? SELL_STATUS.NEW;
                return (
                  <div key={app.id} className="px-6 py-3 flex items-center justify-between gap-3 hover:bg-ink/[0.02] transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-ink truncate">
                        {app.brandName} {app.modelName}
                      </p>
                      <p className="text-xs text-ink/50 font-mono">{app.applicationId}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${st.color}`}>
                        {st.label}
                      </span>
                      <span className="text-[10px] text-ink/45">{timeAgo(app.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </section>
    </div>
  );
}
