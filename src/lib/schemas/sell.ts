import { z } from 'zod';
import { VEHICLE_CATEGORIES, SELL_STATUSES } from '@/lib/constants';

const INDIAN_PHONE_RE = /^[6-9]\d{9}$/;
const currentYear = new Date().getFullYear();

export const SellApplicationSchema = z.object({
  category: z.enum(VEHICLE_CATEGORIES, { message: 'Invalid vehicle category' }),
  sellerType: z.string().min(1, 'Seller type is required'),
  brandId: z.string().min(1, 'Brand is required'),
  brandName: z.string().min(1, 'Brand name is required'),
  modelId: z.string().min(1, 'Model is required'),
  modelName: z.string().min(1, 'Model name is required'),
  year: z.number().int().min(2000, 'Year must be 2000 or later').max(currentYear, `Year cannot exceed ${currentYear}`),
  ownership: z.string().min(1, 'Ownership is required'),
  batteryCondition: z.string().min(1, 'Battery condition is required'),
  vehicleCondition: z.string().min(1, 'Vehicle condition is required'),
  hasAccident: z.boolean(),
  loanStatus: z.string().min(1, 'Loan status is required'),
  documents: z.array(z.string()),
  expectedPrice: z.number().positive('Expected price must be positive'),
  contactName: z.string().trim().min(2, 'Contact name must be at least 2 characters'),
  contactPhone: z
    .string()
    .trim()
    .refine((v) => INDIAN_PHONE_RE.test(v), 'Enter a valid 10-digit Indian mobile number'),
  contactEmail: z
    .string()
    .trim()
    .email('Enter a valid email address'),
  contactCity: z.string().trim().min(1, 'City is required'),
});

export type SellApplicationInput = z.infer<typeof SellApplicationSchema>;

export const SellStatusSchema = z.enum(SELL_STATUSES);
