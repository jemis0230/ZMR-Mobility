import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SITE_WHATSAPP_URL, SITE_PHONE_HREF, SITE_INSTAGRAM_URL, SITE_SOCIALS } from '../src/lib/site.ts';

test('WhatsApp click-to-chat opens the confirmed ZMR number', () => {
  assert.equal(SITE_WHATSAPP_URL, 'https://wa.me/919211421514');
  assert.equal(SITE_PHONE_HREF, 'tel:+919211421514');
  // Optional prefilled text must be URL-encoded onto this base.
  const withText = `${SITE_WHATSAPP_URL}?text=${encodeURIComponent('Hi ZMR, I am interested in an EV & a test drive')}`;
  assert.equal(new URL(withText).searchParams.get('text'), 'Hi ZMR, I am interested in an EV & a test drive');
});

test('Instagram profile link is the approved URL and is used for structured data', () => {
  assert.equal(SITE_INSTAGRAM_URL, 'https://www.instagram.com/zmr_mobility?vrfl=MWlhbzBqNjhsNXY3dQ==');
  assert.ok(SITE_SOCIALS.includes(SITE_INSTAGRAM_URL));
});

test('public components use the shared constants, not hard-coded old destinations', () => {
  const files = ['src/presentation/components/Footer.tsx', 'src/presentation/components/WhatsAppButton.tsx', 'src/lib/site.ts', 'src/app/layout.tsx'];
  for (const f of files) {
    const src = readFileSync(f, 'utf8');
    assert.ok(!/9045222999|90452 22999|zmr_mobility_pvt|instagram\.com\/p\//.test(src), f);
  }
  assert.match(readFileSync('src/presentation/components/Footer.tsx', 'utf8'), /href: SITE_INSTAGRAM_URL/);
  assert.match(readFileSync('src/presentation/components/WhatsAppButton.tsx', 'utf8'), /href=\{SITE_WHATSAPP_URL\}/);
});
