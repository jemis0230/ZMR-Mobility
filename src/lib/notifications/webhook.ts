import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';

/** Meta webhook signature check: X-Hub-Signature-256 = "sha256=" + HMAC-SHA256(app secret, raw body). */
export function validSignature(raw: string, header: string | null, secret: string | undefined): boolean {
  if (!secret || !header?.startsWith('sha256=')) return false;
  const want = Buffer.from(`sha256=${createHmac('sha256', secret).update(raw).digest('hex')}`);
  const got = Buffer.from(header);
  return got.length === want.length && timingSafeEqual(got, want);
}
