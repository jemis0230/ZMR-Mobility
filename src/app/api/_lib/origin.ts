/**
 * CSRF check for cookie-authenticated POSTs: the request must come from a page on
 * this site. Browsers send Sec-Fetch-Site on every request (modern browsers) and
 * Origin on POSTs; a request with neither, or from another site, is refused.
 */
export function isSameOrigin(req: Request): boolean {
  const site = req.headers.get('sec-fetch-site');
  if (site) return site === 'same-origin';
  const origin = req.headers.get('origin');
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
