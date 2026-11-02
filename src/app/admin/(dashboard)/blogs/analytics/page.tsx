import Link from 'next/link';
import { BarChart3, Info } from 'lucide-react';
import { requireSession } from '@/lib/auth';
import { getBlogReport } from '@/lib/blog/analytics';
import { parseRange, REPORT_TIMEZONE_LABEL, VIEW_SOURCE_LABEL, MAX_RANGE_DAYS, istDay } from '@/lib/blog/viewRules';

export const dynamic = 'force-dynamic';

const fmt = (n: number) => n.toLocaleString('en-IN');
const fmtDay = (day: string) =>
  new Date(`${day}T00:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' });

interface PageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

// Blog analytics for staff (admin and superadmin). The admin layout already requires a
// signed-in, active staff account; the check is repeated here because this page reads
// reporting data directly.
export default async function BlogAnalyticsPage({ searchParams }: PageProps) {
  await requireSession();
  const { from, to } = await searchParams;
  const range = parseRange(from, to);
  const report = await getBlogReport(range);
  const maxDay = Math.max(1, ...report.byDay.map((d) => d.views));
  const presets = [7, 30, 90].map((n) => {
    const r = parseRange(undefined, undefined);
    const start = new Date(Date.parse(`${r.to}T00:00:00Z`) - (n - 1) * 86_400_000).toISOString().slice(0, 10);
    return { label: `Last ${n} days`, href: `/admin/blogs/analytics?from=${start}&to=${r.to}`, active: range.from === start && range.to === r.to };
  });
  const showLabels = report.byDay.length <= 31;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold flex items-center gap-3"><BarChart3 className="w-7 h-7 text-primary" aria-hidden /> Blog analytics</h1>
        <p className="text-ink/60 text-sm">
          Views of published articles on this website, {fmtDay(range.from)} {range.from.slice(0, 4)} – {fmtDay(range.to)} {range.to.slice(0, 4)} · times in {REPORT_TIMEZONE_LABEL}.
        </p>
      </div>

      {/* Date range */}
      <form method="get" className="glass-card p-4 border-ink/[0.08] flex flex-wrap items-end gap-3">
        <label className="text-xs font-bold text-ink/70">
          From
          <input type="date" name="from" defaultValue={range.from} max={istDay(new Date())} className="zmr-select mt-1 block rounded-lg px-3 py-2 text-sm" />
        </label>
        <label className="text-xs font-bold text-ink/70">
          To
          <input type="date" name="to" defaultValue={range.to} max={istDay(new Date())} className="zmr-select mt-1 block rounded-lg px-3 py-2 text-sm" />
        </label>
        <button type="submit" className="rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-bold px-4 py-2.5">Apply</button>
        <div className="flex flex-wrap gap-2 sm:ml-auto">
          {presets.map((p) => (
            <Link key={p.label} href={p.href} aria-current={p.active ? 'true' : undefined} className={`rounded-lg border px-3 py-2 text-xs font-bold ${p.active ? 'border-primary/40 bg-primary/10 text-primary' : 'border-ink/15 text-ink/70 hover:border-primary/40'}`}>
              {p.label}
            </Link>
          ))}
        </div>
        {range.note && <p role="status" className="w-full text-xs text-amber-800">{range.note}</p>}
      </form>

      {/* Summary */}
      <dl className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Article views', value: fmt(report.totalViews), hint: 'in the selected range' },
          { label: 'Articles viewed', value: fmt(report.articlesViewed), hint: 'with at least one view' },
          { label: 'Published articles', value: fmt(report.publishedCount), hint: 'live on the website now' },
          {
            label: 'Counting since',
            value: report.collectionStartedAt ? report.collectionStartedAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }) : '—',
            hint: report.collectionStartedAt ? 'first recorded view' : 'no views recorded yet',
          },
        ].map((c) => (
          <div key={c.label} className="glass-card p-4 border-ink/[0.08]">
            <dt className="text-[11px] font-bold uppercase tracking-widest text-ink/60">{c.label}</dt>
            <dd className="mt-1 text-2xl font-black text-forest">{c.value}</dd>
            <dd className="text-xs text-ink/55">{c.hint}</dd>
          </div>
        ))}
      </dl>

      {report.totalViews === 0 && (
        <p role="status" className="rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink/75">
          No article views were recorded in this range.{!report.collectionStartedAt && ' Counting starts with this release; there is no earlier history to show.'}
        </p>
      )}

      {/* Views over time */}
      <section aria-labelledby="by-day" className="glass-card p-5 border-ink/[0.08]">
        <h2 id="by-day" className="text-sm font-bold uppercase tracking-widest text-ink/70">Views per day · {REPORT_TIMEZONE_LABEL}</h2>
        <div className="mt-4 overflow-x-auto">
          <div className="flex items-end gap-[2px] h-40 min-w-full" style={{ minWidth: `${report.byDay.length * 10}px` }} role="img" aria-label={`Daily article views from ${range.from} to ${range.to}`}>
            {report.byDay.map((d) => (
              <div key={d.day} className="flex-1 min-w-[6px] h-full flex flex-col justify-end" title={`${fmtDay(d.day)}: ${fmt(d.views)} view${d.views === 1 ? '' : 's'}`}>
                <div className="rounded-t bg-primary/80" style={{ height: `${(d.views / maxDay) * 100}%`, minHeight: d.views ? 2 : 0 }} />
              </div>
            ))}
          </div>
          {showLabels && (
            <div className="flex gap-[2px] mt-1 text-[9px] text-ink/50" aria-hidden style={{ minWidth: `${report.byDay.length * 10}px` }}>
              {report.byDay.map((d, i) => (
                <span key={d.day} className="flex-1 min-w-[6px] text-center">{i % Math.ceil(report.byDay.length / 8) === 0 ? fmtDay(d.day) : ''}</span>
              ))}
            </div>
          )}
        </div>
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-xs font-bold text-primary">Show as table</summary>
          <table className="mt-2 text-xs">
            <thead><tr><th className="text-left pr-6">Date</th><th className="text-right">Views</th></tr></thead>
            <tbody>{report.byDay.map((d) => <tr key={d.day}><td className="pr-6">{d.day}</td><td className="text-right">{fmt(d.views)}</td></tr>)}</tbody>
          </table>
        </details>
      </section>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        {/* Views by article (most viewed first) */}
        <section aria-labelledby="by-article" className="glass-card p-5 border-ink/[0.08] overflow-x-auto">
          <h2 id="by-article" className="text-sm font-bold uppercase tracking-widest text-ink/70">Views by article (most viewed first)</h2>
          {report.byArticle.length === 0 ? (
            <p className="mt-3 text-sm text-ink/60">No published articles yet.</p>
          ) : (
            <table className="mt-3 w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-widest text-ink/55">
                  <th className="py-2 pr-3">#</th><th className="py-2 pr-3">Article</th><th className="py-2 pr-3 text-right">Views</th><th className="py-2 text-right">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/[0.08]">
                {report.byArticle.map((a, i) => (
                  <tr key={a.id}>
                    <td className="py-2 pr-3 text-ink/50">{i + 1}</td>
                    <td className="py-2 pr-3">
                      {a.published ? (
                        <Link href={`/blogs/${a.slug}`} target="_blank" className="font-semibold text-forest hover:text-primary hover:underline">{a.title}</Link>
                      ) : (
                        <span className="font-semibold text-ink/70">{a.title} <span className="text-[10px] font-bold uppercase text-amber-700">now unpublished</span></span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-right font-bold text-forest">{fmt(a.views)}</td>
                    <td className="py-2 text-right text-ink/60">{report.totalViews ? `${Math.round((a.views / report.totalViews) * 100)}%` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Referrer type */}
        <section aria-labelledby="by-source" className="glass-card p-5 border-ink/[0.08]">
          <h2 id="by-source" className="text-sm font-bold uppercase tracking-widest text-ink/70">Where readers came from</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {report.bySource.map((s) => (
              <li key={s.source} className="flex justify-between gap-3">
                <span className="text-ink/75">{VIEW_SOURCE_LABEL[s.source]}</span>
                <span className="font-bold text-forest">{fmt(s.views)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] text-ink/55">Based on the referring site&apos;s name, which browsers often withhold; those views count as direct / unknown.</p>
        </section>
      </div>

      {/* Definitions */}
      <section aria-labelledby="defs" className="rounded-xl border border-ink/10 bg-white p-5 text-sm text-ink/75">
        <h2 id="defs" className="font-bold text-forest flex items-center gap-2"><Info className="w-4 h-4" aria-hidden /> How views are counted</h2>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li><strong>Article view</strong>: a published article page opened in a browser that runs the page&apos;s script. Each article counts at most once per browser tab session (reloading or returning in the same tab does not add views).</li>
          <li>Not counted: drafts, signed-in staff, known crawlers/link previews and automated tools, and more than {60} views per connection in 10 minutes.</li>
          <li>Views are page loads, not unique people: one person on two devices, or in two tabs, counts twice. No cookies, IP addresses or personal details are stored.</li>
          <li>Days follow {REPORT_TIMEZONE_LABEL}. Ranges can cover up to {MAX_RANGE_DAYS} days. Counting started with this release; earlier traffic is not available here.</li>
        </ul>
      </section>
    </div>
  );
}
