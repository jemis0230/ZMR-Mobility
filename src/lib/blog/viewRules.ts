// Rules for first-party blog view counting and reporting (see docs/BLOG_ANALYTICS.md).
// No imports, so these run directly under `node --test`.

/** Reports use India Standard Time; IST has no daylight saving. */
export const REPORT_TIMEZONE = 'Asia/Kolkata';
export const REPORT_TIMEZONE_LABEL = 'IST (UTC+05:30)';
const IST_OFFSET_MS = 330 * 60_000;

/** Longest date range a report can cover. */
export const MAX_RANGE_DAYS = 366;
export const DEFAULT_RANGE_DAYS = 30;

/** Per-connection ceiling on counted views (abuse protection, not a business limit). */
export const VIEW_RATE_LIMIT = { limit: 60, windowSec: 600 };

/**
 * User agents that are not people reading in a browser: crawlers, link-preview
 * fetchers, monitoring and headless tools. Requests without a user agent are treated
 * the same. Views are only sent by the page's script, so most simple bots that do not
 * run JavaScript never reach the counter at all.
 */
const BOT_UA_RE =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora link preview|whatsapp|telegram|discord|slack|skype|vkshare|pinterest|lighthouse|pagespeed|headless|phantomjs|puppeteer|playwright|selenium|curl|wget|python-requests|httpclient|okhttp|go-http-client|axios|node-fetch|uptime|monitor|pingdom|statuscake/i;

export function isLikelyBot(userAgent: string | null | undefined): boolean {
  return !userAgent || userAgent.trim().length < 10 || BOT_UA_RE.test(userAgent);
}

export function isValidSlug(slug: unknown): slug is string {
  return typeof slug === 'string' && /^[a-z0-9][a-z0-9-]{0,199}$/i.test(slug);
}

export type ViewSource = 'direct' | 'internal' | 'search' | 'social' | 'other';
export const VIEW_SOURCES: ViewSource[] = ['direct', 'internal', 'search', 'social', 'other'];
export const VIEW_SOURCE_LABEL: Record<ViewSource, string> = {
  direct: 'Direct / unknown',
  internal: 'From this website',
  search: 'Search engines',
  social: 'Social media & messaging',
  other: 'Other websites',
};

const SEARCH_HOSTS = /(^|\.)(google|bing|duckduckgo|yahoo|yandex|ecosia|baidu|brave)\./i;
const SOCIAL_HOSTS = /(^|\.)(facebook|fb|instagram|linkedin|lnkd|twitter|x|t|youtube|reddit|whatsapp|wa|telegram|pinterest|quora)\.(com|me|co|org|in)$/i;

/**
 * Coarse referrer type from the referring page's host name only (the page sends just
 * the host, never the full address). Browsers often withhold referrers, so "direct"
 * also covers unknown sources.
 */
export function classifySource(referrerHost: unknown, siteHosts: string[]): ViewSource {
  if (typeof referrerHost !== 'string' || !referrerHost) return 'direct';
  const host = referrerHost.toLowerCase().replace(/^www\./, '').slice(0, 253);
  if (!/^[a-z0-9.-]+$/.test(host)) return 'other';
  if (siteHosts.some((h) => host === h.toLowerCase().replace(/^www\./, ''))) return 'internal';
  if (SEARCH_HOSTS.test(host)) return 'search';
  if (SOCIAL_HOSTS.test(host)) return 'social';
  return 'other';
}

/** YYYY-MM-DD of an instant in IST. */
export function istDay(d: Date): string {
  return new Date(d.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

/** UTC instant at 00:00 IST on a YYYY-MM-DD date. */
export function istMidnightUtc(day: string): Date {
  return new Date(Date.parse(`${day}T00:00:00Z`) - IST_OFFSET_MS);
}

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const isRealDay = (s: string) => DAY_RE.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`)) && new Date(`${s}T00:00:00Z`).toISOString().slice(0, 10) === s;
const addDays = (day: string, n: number) => new Date(Date.parse(`${day}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);

export type ReportRange = {
  from: string; // inclusive, YYYY-MM-DD (IST)
  to: string; // inclusive, YYYY-MM-DD (IST)
  startUtc: Date; // inclusive
  endUtc: Date; // exclusive
  days: string[];
  note?: string;
};

/**
 * Date range from the report form. Invalid or missing dates fall back to the last 30
 * days; reversed dates are swapped; ranges are capped at MAX_RANGE_DAYS and never end
 * after today.
 */
export function parseRange(fromRaw: unknown, toRaw: unknown, now = new Date()): ReportRange {
  const today = istDay(now);
  let note: string | undefined;
  let to = typeof toRaw === 'string' && isRealDay(toRaw) ? toRaw : today;
  let from = typeof fromRaw === 'string' && isRealDay(fromRaw) ? fromRaw : addDays(to, -(DEFAULT_RANGE_DAYS - 1));
  if ((fromRaw && fromRaw !== from) || (toRaw && toRaw !== to)) note = 'An invalid date was replaced with the default.';
  if (to > today) to = today;
  if (from > to) [from, to] = [to, from];
  const span = (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000 + 1;
  if (span > MAX_RANGE_DAYS) {
    from = addDays(to, -(MAX_RANGE_DAYS - 1));
    note = `Ranges are limited to ${MAX_RANGE_DAYS} days; showing the last ${MAX_RANGE_DAYS} days up to the end date.`;
  }
  const days: string[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) days.push(d);
  return { from, to, startUtc: istMidnightUtc(from), endUtc: istMidnightUtc(addDays(to, 1)), days, note };
}
