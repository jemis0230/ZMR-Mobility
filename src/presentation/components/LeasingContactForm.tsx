'use client';

import { useState } from 'react';
import { api } from '@/lib/api-client';
import { Send, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

const INTEREST_OPTIONS = [
  { value: 'VEHICLE_LEASING',      label: 'EV Leasing (Personal)' },
  { value: 'VEHICLE_RENTING',      label: 'EV Rent' },
  { value: 'VEHICLE_PURCHASE',     label: 'EV Buying' },
  { value: 'FLEET_LOGISTICS',      label: 'Fleet / Logistics / Ride Hailing' },
  { value: 'CORPORATE_ENTERPRISE', label: 'Corporate / Enterprise' },
  { value: 'B2B_PARTNERSHIP',      label: 'B2B Partnership' },
  { value: 'DEALERSHIP_FRANCHISE', label: 'Dealership / Franchise' },
  { value: 'OTHER',                label: 'General Inquiry' },
];

interface Fields {
  name: string;
  phone: string;
  email: string;
  inquiryCategory: string;
  notes: string;
}

type FieldKey = keyof Fields;

function validate(fields: Fields): Partial<Record<FieldKey, string>> {
  const errs: Partial<Record<FieldKey, string>> = {};
  if (!fields.name.trim()) errs.name = 'Full name is required';
  const phone = fields.phone.replace(/\s/g, '');
  if (!phone) errs.phone = 'Phone number is required';
  else if (!/^[6-9]\d{9}$/.test(phone)) errs.phone = 'Enter a valid 10-digit Indian mobile number';
  if (!fields.email.trim()) errs.email = 'Email address is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) errs.email = 'Enter a valid email (e.g. you@example.com)';
  if (!fields.inquiryCategory) errs.inquiryCategory = 'Please select an option';
  return errs;
}

export default function LeasingContactForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [fields, setFields] = useState<Fields>({
    name: '',
    phone: '',
    email: '',
    inquiryCategory: '',
    notes: '',
  });

  const errors = validate(fields);
  const touch = (key: FieldKey) => setTouched(prev => ({ ...prev, [key]: true }));
  const set = (key: FieldKey, value: string) => setFields(prev => ({ ...prev, [key]: value }));

  const fieldCls = (key: FieldKey) =>
    `w-full bg-ink/5 border rounded-xl px-4 py-3 focus:border-primary outline-none transition-all placeholder:text-ink/40 text-ink text-sm ${
      touched[key] && errors[key] ? 'border-red-500/60 focus:border-red-500' : 'border-ink/10'
    }`;

  if (success) {
    return (
      <div className="glass-card p-12 text-center space-y-4 border-primary/20">
        <CheckCircle className="w-12 h-12 text-primary mx-auto" />
        <h3 className="text-2xl font-bold">Inquiry Sent!</h3>
        <p className="text-ink/70">Our EV expert will contact you within 24 hours.</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Touch all fields to show all errors at once
    setTouched({ name: true, phone: true, email: true, inquiryCategory: true });
    const errs = validate(fields);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setServerError(null);

    const result = await api.post('/leads', {
      type: 'general',
      name: fields.name.trim(),
      phone: fields.phone.replace(/\s/g, ''),
      email: fields.email.trim(),
      inquiryType: fields.inquiryCategory,
      notes: fields.notes,
    });

    setLoading(false);
    if (!result.success) {
      setServerError(result.error ?? 'Something went wrong. Please try again.');
      return;
    }
    setSuccess(true);
  }

  return (
    <div className="glass-card p-8 md:p-12">
      <h3 className="text-2xl font-bold mb-2">Tell Us How We Can Help</h3>
      <p className="text-ink/60 mb-8 text-sm">
        Fill out the form below and our team will get back to you shortly.
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Name + Phone */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-ink/60">Full Name</label>
            <input
              type="text"
              placeholder="Rahul Sharma"
              value={fields.name}
              onChange={(e) => set('name', e.target.value)}
              onBlur={() => touch('name')}
              className={fieldCls('name')}
            />
            {touched.name && errors.name && (
              <p className="flex items-center gap-1.5 text-xs text-red-400">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.name}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-ink/60">Phone Number</label>
            <div className="flex">
              <span className="flex items-center px-3 bg-ink/5 border border-r-0 border-ink/10 rounded-l-xl text-ink/60 text-sm font-semibold shrink-0">
                +91
              </span>
              <input
                type="tel"
                placeholder="9876543210"
                maxLength={10}
                value={fields.phone}
                onChange={(e) => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                onBlur={() => touch('phone')}
                className={`flex-1 bg-ink/5 border rounded-r-xl px-4 py-3 focus:border-primary outline-none transition-all placeholder:text-ink/40 text-ink text-sm ${
                  touched.phone && errors.phone ? 'border-red-500/60 focus:border-red-500' : 'border-ink/10'
                }`}
              />
            </div>
            {touched.phone && errors.phone && (
              <p className="flex items-center gap-1.5 text-xs text-red-400">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.phone}
              </p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-ink/60">Email Address</label>
          <input
            type="email"
            placeholder="rahul@example.com"
            value={fields.email}
            onChange={(e) => set('email', e.target.value)}
            onBlur={() => touch('email')}
            className={fieldCls('email')}
          />
          {touched.email && errors.email && (
            <p className="flex items-center gap-1.5 text-xs text-red-400">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.email}
            </p>
          )}
        </div>

        {/* Interest */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-ink/60">I'm interested in</label>
          <select
            value={fields.inquiryCategory}
            onChange={(e) => { set('inquiryCategory', e.target.value); touch('inquiryCategory'); }}
            onBlur={() => touch('inquiryCategory')}
            className={`w-full bg-ink/5 border rounded-xl px-4 py-3 focus:border-primary outline-none transition-all appearance-none cursor-pointer [&>option]:bg-white text-sm ${
              touched.inquiryCategory && errors.inquiryCategory
                ? 'border-red-500/60 focus:border-red-500 text-ink'
                : 'border-ink/10'
            } ${fields.inquiryCategory ? 'text-ink' : 'text-ink/50'}`}
          >
            <option value="" disabled>Select an option…</option>
            {INTEREST_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {touched.inquiryCategory && errors.inquiryCategory && (
            <p className="flex items-center gap-1.5 text-xs text-red-400">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.inquiryCategory}
            </p>
          )}
        </div>

        {/* Message */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-ink/60">
            Message <span className="text-ink/40 normal-case font-normal tracking-normal">(Optional)</span>
          </label>
          <textarea
            rows={4}
            value={fields.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Tell us about your fleet requirements..."
            className="w-full bg-ink/5 border border-ink/10 rounded-xl px-4 py-3 focus:border-primary outline-none transition-all resize-none placeholder:text-ink/40 text-ink text-sm"
          />
        </div>

        {serverError && (
          <p className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" /> {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary/90 transition-all electric-glow flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
          ) : (
            <><Send className="w-4 h-4" /> Submit Inquiry</>
          )}
        </button>
      </form>
    </div>
  );
}
