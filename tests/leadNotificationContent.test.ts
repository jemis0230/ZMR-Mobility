import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emailContent, enquiryLine, istTime, whatsappParams, WHATSAPP_TEMPLATE_PARAMS, type LeadSummary } from '../src/lib/notifications/format.ts';

const base: LeadSummary = {
  reference: 'ZMR-L-7K3QX9',
  receivedAt: new Date('2026-11-14T09:35:00Z'),
  form: 'Vehicle enquiry',
  name: 'Test Customer',
  phone: '9876543210',
  email: 'customer@example.com',
  inquiry: 'Purchase',
  vehicle: '2023 Ather 450X',
  details: [['Location', 'Chennai, Tamil Nadu']],
  message: 'Private note\nsecond line',
  adminUrl: 'https://zmr-mobility.vercel.app/admin/leads?q=ZMR-L-7K3QX9',
};

test('submission time is shown in IST', () => {
  assert.match(istTime(base.receivedAt), /14 Nov 2026, 3:05 pm IST/);
});

test('enquiry type combines form and inquiry without repeating itself', () => {
  assert.equal(enquiryLine(base), 'Vehicle enquiry – Purchase');
  assert.equal(enquiryLine({ form: 'Test drive request', inquiry: 'Test drive' }), 'Test drive request');
  assert.equal(enquiryLine({ form: 'Sell Your EV', inquiry: 'Sell an EV' }), 'Sell Your EV');
  assert.equal(enquiryLine({ form: 'Contact Us form', inquiry: 'Leasing' }), 'Contact Us form – Leasing');
});

test('WhatsApp parameters: reference, time, enquiry, vehicle, name, phone, protected link – nothing else', () => {
  const p = whatsappParams(base);
  assert.equal(p.length, WHATSAPP_TEMPLATE_PARAMS);
  assert.deepEqual(p, [
    'ZMR-L-7K3QX9',
    istTime(base.receivedAt),
    'Vehicle enquiry – Purchase',
    '2023 Ather 450X',
    'Test Customer',
    '9876543210',
    'https://zmr-mobility.vercel.app/admin/leads?q=ZMR-L-7K3QX9',
  ]);
  const joined = p.join(' ');
  assert.ok(!joined.includes('customer@example.com'), 'no email address on WhatsApp');
  assert.ok(!joined.includes('Private note'), 'no free-text message on WhatsApp');
});

test('WhatsApp parameters are never empty and never contain newlines', () => {
  const p = whatsappParams({ ...base, vehicle: null, name: 'A\n\tB' });
  assert.equal(p[3], 'Not specified');
  assert.equal(p[4], 'A B');
  for (const v of p) assert.ok(v.length > 0 && !/[\r\n\t]/.test(v));
});

test('email has reference, time, enquiry, vehicle and contact details; subject is header-safe', () => {
  const e = emailContent({ ...base, name: 'Evil\r\nBcc: x@y.z' });
  assert.ok(!/[\r\n]/.test(e.subject));
  assert.match(e.subject, /^New website lead ZMR-L-7K3QX9: Vehicle enquiry – Purchase/);
  for (const s of ['Reference: ZMR-L-7K3QX9', `Received: ${istTime(base.receivedAt)}`, 'Enquiry: Vehicle enquiry – Purchase', 'Vehicle: 2023 Ather 450X', 'Phone: 9876543210', 'Open in admin (sign-in required)']) {
    assert.ok(e.text.includes(s), s);
  }
  const h = emailContent({ ...base, name: '<script>alert(1)</script>' }).html;
  assert.ok(!h.includes('<script>') && h.includes('&lt;script&gt;'));
});
