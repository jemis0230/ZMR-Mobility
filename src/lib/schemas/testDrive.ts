import { z } from 'zod';

const INDIAN_PHONE_RE = /^[6-9]\d{9}$/;

/** Cities ZMR Mobility lists as operating locations; the customer picks their preferred one. */
export const TEST_DRIVE_CITIES = [
  { city: 'Lucknow', state: 'Uttar Pradesh' },
  { city: 'Dehradun', state: 'Uttarakhand' },
  { city: 'Chennai', state: 'Tamil Nadu' },
  { city: 'Bangalore', state: 'Karnataka' },
] as const;

/** How far ahead a preferred date may be. */
export const TEST_DRIVE_MAX_DAYS_AHEAD = 60;

/** Today's date (YYYY-MM-DD) in India, where the requests are handled. */
export function todayInIndia(now = new Date()): string {
  return now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export const TestDriveSchema = z
  .object({
    name: z.string().trim().min(2, 'Please enter your full name.').max(80, 'Name is too long.'),
    phone: z
      .string()
      .trim()
      .transform((v) => v.replace(/[\s\-+]/g, '').replace(/^91(?=\d{10}$)/, ''))
      .refine((v) => INDIAN_PHONE_RE.test(v), 'Enter a valid 10-digit Indian mobile number.'),
    city: z
      .string()
      .trim()
      .refine((v) => TEST_DRIVE_CITIES.some((c) => c.city === v), 'Please choose your preferred city.'),
    vehicleId: z
      .string()
      .trim()
      .optional()
      .transform((v) => v || null)
      .refine((v) => v === null || /^[a-z0-9]{10,40}$/i.test(v), 'Please choose a vehicle from the list.'),
    preferredDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please choose a preferred date.'),
    message: z.string().trim().max(1000, 'Message is too long (max 1000 characters).').optional().transform((v) => v || null),
    // Honeypot: real visitors never fill this hidden field.
    website: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    const today = todayInIndia();
    if (v.preferredDate < today) {
      ctx.addIssue({ code: 'custom', path: ['preferredDate'], message: 'Please choose today or a later date.' });
    } else if (v.preferredDate > addDays(today, TEST_DRIVE_MAX_DAYS_AHEAD)) {
      ctx.addIssue({ code: 'custom', path: ['preferredDate'], message: `Please choose a date within the next ${TEST_DRIVE_MAX_DAYS_AHEAD} days.` });
    }
  });

export type TestDriveInput = z.infer<typeof TestDriveSchema>;
