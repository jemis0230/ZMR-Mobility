import { z } from 'zod';
import { INQUIRY_TYPES, LEAD_STATUSES } from '@/lib/constants';

const INDIAN_PHONE_RE = /^[6-9]\d{9}$/;

export const LeadSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name (at least 2 characters).'),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/\s/g, ''))
    .refine((v) => INDIAN_PHONE_RE.test(v), 'Enter a valid 10-digit Indian mobile number.'),
  state: z.string().trim().min(1, 'Please select your state.'),
  city: z.string().trim().min(1, 'Please select your city.'),
  inquiryType: z
    .enum(INQUIRY_TYPES, { message: 'Invalid inquiry type' })
    .optional()
    .transform((v) => v ?? 'VEHICLE_LEASING'),
  vehicleId: z.string().optional().transform((v) => v || null),
  vehicleName: z.string().optional().transform((v) => v || null),
});

export type LeadInput = z.infer<typeof LeadSchema>;

export const GeneralInquirySchema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name.'),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s\-\+]/g, '').replace(/^91/, ''))
    .refine((v) => INDIAN_PHONE_RE.test(v), 'Enter a valid 10-digit Indian mobile number.'),
  email: z
    .string()
    .trim()
    .optional()
    .transform((v) => v || '')
    .refine((v) => v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Enter a valid email address.')
    .transform((v) => v || null),
  inquiryType: z
    .enum(INQUIRY_TYPES, { message: 'Invalid inquiry type' })
    .optional()
    .transform((v) => v ?? 'VEHICLE_LEASING'),
  notes: z.string().optional().transform((v) => v?.trim() || null),
});

export type GeneralInquiryInput = z.infer<typeof GeneralInquirySchema>;

export const LeadStatusSchema = z.enum(LEAD_STATUSES);
