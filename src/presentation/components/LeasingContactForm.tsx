'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Send, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import {
  submitGeneralInquiryAction,
  type GeneralInquiryFormState,
} from '@/app/actions/leadActions';

const INTEREST_OPTIONS = [
  { value: 'Vehicle Leasing', label: 'EV Leasing (Personal)' },
  { value: 'Fleet / Logistics / Ride Hailing', label: 'Fleet / Logistics / Ride Hailing' },
  { value: 'Corporate / Enterprise Requirement', label: 'Corporate / Enterprise' },
  { value: 'B2B Partnership', label: 'B2B Partnership' },
  { value: 'Dealership / Franchise Inquiry', label: 'Dealership / Franchise' },
  { value: 'Other', label: 'General Inquiry' },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-primary text-background font-bold py-4 rounded-xl hover:bg-primary/90 transition-all electric-glow flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Submitting…
        </>
      ) : (
        <>
          <Send className="w-4 h-4" />
          Submit Inquiry
        </>
      )}
    </button>
  );
}

const initialState: GeneralInquiryFormState = { success: false };

export default function LeasingContactForm() {
  const [state, formAction] = useFormState(submitGeneralInquiryAction, initialState);

  if (state.success) {
    return (
      <div className="glass-card p-12 text-center space-y-4 border-primary/20">
        <CheckCircle className="w-12 h-12 text-primary mx-auto" />
        <h3 className="text-2xl font-bold">Inquiry Sent!</h3>
        <p className="text-white/60">Our EV expert will contact you within 24 hours.</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-8 md:p-12">
      <h3 className="text-2xl font-bold mb-2">Tell Us How We Can Help</h3>
      <p className="text-white/40 mb-8 text-sm">
        Fill out the form below and our team will get back to you shortly.
      </p>

      <form action={formAction} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40">
              Full Name
            </label>
            <input
              name="name"
              required
              className={`w-full bg-white/5 border rounded-xl px-4 py-3 focus:border-primary outline-none transition-all ${
                state.errors?.name ? 'border-red-500/70' : 'border-white/10'
              }`}
              placeholder="John Doe"
            />
            {state.errors?.name && (
              <p className="flex items-center gap-1 text-xs text-red-400">
                <AlertCircle className="w-3 h-3" /> {state.errors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40">
              Phone Number
            </label>
            <input
              name="phone"
              required
              type="tel"
              className={`w-full bg-white/5 border rounded-xl px-4 py-3 focus:border-primary outline-none transition-all ${
                state.errors?.phone ? 'border-red-500/70' : 'border-white/10'
              }`}
              placeholder="+91 98765 43210"
            />
            {state.errors?.phone && (
              <p className="flex items-center gap-1 text-xs text-red-400">
                <AlertCircle className="w-3 h-3" /> {state.errors.phone}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-white/40">
            Email Address
          </label>
          <input
            name="email"
            type="email"
            className={`w-full bg-white/5 border rounded-xl px-4 py-3 focus:border-primary outline-none transition-all ${
              state.errors?.email ? 'border-red-500/70' : 'border-white/10'
            }`}
            placeholder="john@example.com"
          />
          {state.errors?.email && (
            <p className="flex items-center gap-1 text-xs text-red-400">
              <AlertCircle className="w-3 h-3" /> {state.errors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-white/40">
            I'm interested in
          </label>
          <select
            name="inquiryCategory"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-primary outline-none transition-all appearance-none [&>option]:bg-[#0d1117]"
          >
            {INTEREST_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-white/40">
            Message{' '}
            <span className="text-white/20 normal-case font-normal tracking-normal">
              (Optional)
            </span>
          </label>
          <textarea
            name="notes"
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-primary outline-none transition-all resize-none"
            placeholder="Tell us about your fleet requirements..."
          />
        </div>

        {state.errors?.general && (
          <p className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {state.errors.general}
          </p>
        )}

        <SubmitButton />
      </form>
    </div>
  );
}
