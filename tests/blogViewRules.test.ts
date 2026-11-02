import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifySource, isLikelyBot, isValidSlug, istDay, istMidnightUtc, parseRange, MAX_RANGE_DAYS } from '../src/lib/blog/viewRules.ts';

const CHROME = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

test('bots, tools and missing user agents are not counted', () => {
  assert.equal(isLikelyBot(CHROME), false);
  for (const ua of ['Googlebot/2.1', 'facebookexternalhit/1.1', 'WhatsApp/2.23', 'curl/8.0', 'HeadlessChrome/120', 'Mozilla/5.0 (compatible; bingbot/2.0)', '', null, 'abc']) {
    assert.equal(isLikelyBot(ua as string | null), true, String(ua));
  }
});

test('slugs are validated', () => {
  assert.ok(isValidSlug('ev-leasing-guide-2026'));
  for (const s of ['', '-x', 'a/b', 'a b', '<script>', 'x'.repeat(201), 5, null]) assert.equal(isValidSlug(s), false, String(s));
});

test('referrer host → coarse source', () => {
  const site = ['zmr-mobility.vercel.app', 'zmrmobility.in'];
  assert.equal(classifySource('', site), 'direct');
  assert.equal(classifySource(undefined, site), 'direct');
  assert.equal(classifySource('www.zmrmobility.in', site), 'internal');
  assert.equal(classifySource('zmr-mobility.vercel.app', site), 'internal');
  assert.equal(classifySource('www.google.co.in', site), 'search');
  assert.equal(classifySource('duckduckgo.com', site), 'search');
  assert.equal(classifySource('l.facebook.com', site), 'social');
  assert.equal(classifySource('www.linkedin.com', site), 'social');
  assert.equal(classifySource('t.co', site), 'social');
  assert.equal(classifySource('example.org', site), 'other');
  assert.equal(classifySource('bad host!', site), 'other');
});

test('IST day boundaries', () => {
  // 18:29 UTC on 1 Nov is 23:59 IST on 1 Nov; 18:30 UTC is 00:00 IST on 2 Nov.
  assert.equal(istDay(new Date('2026-11-01T18:29:00Z')), '2026-11-01');
  assert.equal(istDay(new Date('2026-11-01T18:30:00Z')), '2026-11-02');
  assert.equal(istMidnightUtc('2026-11-02').toISOString(), '2026-11-01T18:30:00.000Z');
});

test('report range parsing', () => {
  const now = new Date('2026-11-02T06:00:00Z');
  const d = parseRange(undefined, undefined, now);
  assert.equal(d.to, '2026-11-02');
  assert.equal(d.days.length, 30);
  assert.equal(d.from, '2026-10-04');
  assert.equal(d.endUtc.toISOString(), '2026-11-02T18:30:00.000Z');

  const swapped = parseRange('2026-10-10', '2026-10-01', now);
  assert.deepEqual([swapped.from, swapped.to], ['2026-10-01', '2026-10-10']);

  const future = parseRange('2026-10-01', '2027-01-01', now);
  assert.equal(future.to, '2026-11-02');

  const bad = parseRange('2026-02-30', 'nope', now);
  assert.equal(bad.to, '2026-11-02');
  assert.match(bad.note ?? '', /invalid/);

  const long = parseRange('2020-01-01', '2026-11-02', now);
  assert.equal(long.days.length, MAX_RANGE_DAYS);
  assert.match(long.note ?? '', /limited/);
});
