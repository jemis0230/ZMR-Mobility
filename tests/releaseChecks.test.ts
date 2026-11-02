import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { CUSTOMER_PHOTOS, anyPhotoHasLocation } from '../src/lib/customerPhotos.ts';
import { isSameOrigin } from '../src/app/api/_lib/origin.ts';

// SHA-256 of the originals supplied by ZMR; the site must serve them unchanged.
const ORIGINAL_SHA256_PREFIX: Record<string, string> = {
  '/customers/zmr-customer-bangalore-red-scooter.webp': '091ca98dacc0',
  '/customers/zmr-customer-bangalore-purple-scooter.jpg': 'a68331719649',
  '/customers/zmr-customer-bangalore-green-scooter.jpg': 'a98e7c9cc8ac',
  '/customers/zmr-customer-chennai-white-scooter.webp': '37e2596a4324',
  '/customers/zmr-customer-new-delhi.webp': '0d42973f4e5c',
};

test('customer photos are the supplied originals, byte for byte, with no extra location badge', () => {
  assert.deepEqual(CUSTOMER_PHOTOS.map((p) => p.src), Object.keys(ORIGINAL_SHA256_PREFIX));
  for (const p of CUSTOMER_PHOTOS) {
    const file = 'public' + p.src;
    assert.ok(existsSync(file), file);
    const sha = createHash('sha256').update(readFileSync(file)).digest('hex');
    assert.ok(sha.startsWith(ORIGINAL_SHA256_PREFIX[p.src]), `${file} changed`);
    assert.ok(p.alt.length > 20, 'descriptive alt text');
  }
  // The label is inside each image, so no duplicate caption is rendered.
  assert.equal(anyPhotoHasLocation(CUSTOMER_PHOTOS), false);
});

const req = (h: Record<string, string>) => new Request('https://zmr-mobility.vercel.app/api/auth/fresh-login', { method: 'POST', headers: h });

test('fresh-login POST is accepted only from this site', () => {
  assert.equal(isSameOrigin(req({ 'sec-fetch-site': 'same-origin' })), true);
  assert.equal(isSameOrigin(req({ 'sec-fetch-site': 'cross-site' })), false);
  assert.equal(isSameOrigin(req({ 'sec-fetch-site': 'same-site' })), false);
  assert.equal(isSameOrigin(req({ origin: 'https://zmr-mobility.vercel.app', host: 'zmr-mobility.vercel.app' })), true);
  assert.equal(isSameOrigin(req({ origin: 'https://evil.example', host: 'zmr-mobility.vercel.app' })), false);
  assert.equal(isSameOrigin(req({})), false);
});
