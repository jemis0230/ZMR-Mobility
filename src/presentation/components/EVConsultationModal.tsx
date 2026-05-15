'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, CheckCircle, Loader2, ChevronDown, AlertCircle } from 'lucide-react';
import { submitLeadAction, type LeadFormState } from '@/app/actions/leadActions';
import { INQUIRY_CATEGORIES } from '@/lib/constants';
import { INDIA_STATES_CITIES, STATE_NAMES } from '@/lib/data/india-locations';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface EVConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId?: string;
  vehicleName?: string;
}

// ─────────────────────────────────────────────────────────────
// Custom Select Component
// ─────────────────────────────────────────────────────────────
function StyledSelect({
  id,
  name,
  value,
  onChange,
  placeholder,
  options,
  error,
  disabled,
}: {
  id: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
  error?: string;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full appearance-none bg-white/5 border rounded-xl px-4 py-3 pr-10 outline-none transition-all duration-200 text-sm
          ${error ? 'border-red-500/70 bg-red-500/5 text-white' : 'border-white/10 focus:border-[#00FF85]/60 text-white/80 focus:text-white'}
          ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:border-white/20'}
          [&>option]:bg-[#0d1117] [&>option]:text-white`}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <ChevronDown className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${disabled ? 'text-white/20' : 'text-white/40'}`} />
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1 mt-1.5 text-xs text-red-400"
        >
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </motion.p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Submit Button (uses useFormStatus for pending state)
// ─────────────────────────────────────────────────────────────
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full relative overflow-hidden rounded-xl py-3.5 text-sm font-extrabold tracking-wide transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
      style={{
        background: pending
          ? 'rgba(0,255,133,0.15)'
          : 'linear-gradient(135deg, #00FF85 0%, #00d46e 100%)',
        color: pending ? '#00FF85' : '#050d0a',
        border: pending ? '1px solid rgba(0,255,133,0.3)' : '1px solid transparent',
        boxShadow: pending ? 'none' : '0 0 30px rgba(0,255,133,0.35), 0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      <span className="flex items-center justify-center gap-2">
        {pending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Submitting…
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            Book Free Consultation
          </>
        )}
      </span>
      {!pending && (
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.5 }}
          className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
        />
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Modal Component
// ─────────────────────────────────────────────────────────────
export default function EVConsultationModal({
  isOpen,
  onClose,
  vehicleId,
  vehicleName,
}: EVConsultationModalProps) {
  const initialState: LeadFormState = { success: false };
  const [state, formAction] = useFormState(submitLeadAction, initialState);

  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const cities = selectedState ? (INDIA_STATES_CITIES[selectedState] ?? []) : [];

  // Reset city when state changes
  useEffect(() => {
    setSelectedCity('');
  }, [selectedState]);

  // Lock scroll when modal open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280, duration: 0.35 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-md max-h-[95vh] overflow-y-auto rounded-2xl"
              style={{
                background: 'linear-gradient(145deg, #0f1923 0%, #0a1118 100%)',
                border: '1px solid rgba(0,255,133,0.18)',
                boxShadow: '0 0 0 1px rgba(0,255,133,0.05), 0 25px 60px rgba(0,0,0,0.7), 0 0 80px rgba(0,255,133,0.06)',
              }}
            >
              {state.success ? (
                /* ─── Success State ─── */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                  className="flex flex-col items-center justify-center p-10 text-center gap-5"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
                    className="relative"
                  >
                    <div className="w-20 h-20 rounded-full bg-[#00FF85]/10 border border-[#00FF85]/30 flex items-center justify-center"
                      style={{ boxShadow: '0 0 40px rgba(0,255,133,0.25)' }}>
                      <CheckCircle className="w-10 h-10 text-[#00FF85]" />
                    </div>
                    {/* Pulse rings */}
                    <motion.div
                      animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
                      className="absolute inset-0 rounded-full border border-[#00FF85]/40"
                    />
                  </motion.div>

                  <div>
                    <h3 className="text-2xl font-extrabold text-white mb-2">You're all set! 🎉</h3>
                    <p className="text-white/50 text-sm leading-relaxed">
                      Our EV expert will call you within <span className="text-[#00FF85] font-bold">24 hours</span> to discuss your requirements.
                    </p>
                  </div>

                  <div className="w-full p-4 rounded-xl bg-white/5 border border-white/8 text-xs text-white/40 text-center">
                    India's #1 EV Leasing Platform · Zero Upfront Hassle
                  </div>

                  <button
                    onClick={handleClose}
                    className="text-sm text-white/40 hover:text-white/70 transition-colors font-medium"
                  >
                    Close
                  </button>
                </motion.div>
              ) : (
                /* ─── Form State ─── */
                <>
                  {/* Header */}
                  <div className="flex items-start justify-between p-6 pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#00FF85]/10 border border-[#00FF85]/25 flex items-center justify-center flex-shrink-0"
                        style={{ boxShadow: '0 0 20px rgba(0,255,133,0.15)' }}>
                        <Zap className="w-5 h-5 text-[#00FF85]" />
                      </div>
                      <div>
                        <h2 className="text-lg font-extrabold text-white leading-tight">
                          Book a Free EV Consultation
                        </h2>
                        <p className="text-white/35 text-xs mt-0.5">We'll call you within 24 hours</p>
                      </div>
                    </div>
                    <button
                      onClick={handleClose}
                      className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all flex-shrink-0 ml-2"
                    >
                      <X className="w-4 h-4 text-white/60" />
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="mx-6 mt-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                  {/* Form */}
                  <form ref={formRef} action={formAction} className="p-6 space-y-4">
                    {/* Hidden fields */}
                    {vehicleId && <input type="hidden" name="vehicleId" value={vehicleId} />}
                    {vehicleName && <input type="hidden" name="vehicleName" value={vehicleName} />}
                    <input type="hidden" name="state" value={selectedState} />
                    <input type="hidden" name="city" value={selectedCity} />
                    <input type="hidden" name="inquiryCategory" value={selectedCategory} />

                    {/* Row: Name + Phone */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Full Name */}
                      <div className="space-y-1.5">
                        <label htmlFor="modal-name" className="block text-xs font-bold uppercase tracking-widest text-white/35">
                          Full Name
                        </label>
                        <input
                          id="modal-name"
                          name="name"
                          type="text"
                          placeholder="Rahul Sharma"
                          autoComplete="name"
                          className={`w-full bg-white/5 border rounded-xl px-4 py-3 outline-none transition-all duration-200 text-sm text-white placeholder:text-white/25
                            ${state.errors?.name ? 'border-red-500/70 bg-red-500/5' : 'border-white/10 focus:border-[#00FF85]/60 hover:border-white/20'}`}
                        />
                        {state.errors?.name && (
                          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-1 text-xs text-red-400">
                            <AlertCircle className="w-3 h-3 flex-shrink-0" />{state.errors.name}
                          </motion.p>
                        )}
                      </div>

                      {/* Phone */}
                      <div className="space-y-1.5">
                        <label htmlFor="modal-phone" className="block text-xs font-bold uppercase tracking-widest text-white/35">
                          Phone Number
                        </label>
                        <div className={`flex items-center bg-white/5 border rounded-xl overflow-hidden transition-all duration-200
                          ${state.errors?.phone ? 'border-red-500/70 bg-red-500/5' : 'border-white/10 focus-within:border-[#00FF85]/60 hover:border-white/20'}`}>
                          <span className="px-3 text-sm font-bold text-[#00FF85]/80 border-r border-white/10 py-3 bg-[#00FF85]/5 flex-shrink-0">+91</span>
                          <input
                            id="modal-phone"
                            name="phone"
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            placeholder="9876543210"

                            className="flex-1 bg-transparent px-3 py-3 outline-none text-sm text-white placeholder:text-white/25 min-w-0"
                          />
                        </div>
                        {state.errors?.phone && (
                          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-1 text-xs text-red-400">
                            <AlertCircle className="w-3 h-3 flex-shrink-0" />{state.errors.phone}
                          </motion.p>
                        )}
                      </div>
                    </div>

                    {/* Row: State + City */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-widest text-white/35">State</label>
                        <StyledSelect
                          id="modal-state"
                          name="_state_display"
                          value={selectedState}
                          onChange={setSelectedState}
                          placeholder="Select state"
                          options={STATE_NAMES}
                          error={state.errors?.state}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-widest text-white/35">City</label>
                        <StyledSelect
                          id="modal-city"
                          name="_city_display"
                          value={selectedCity}
                          onChange={setSelectedCity}
                          placeholder={selectedState ? 'Select city' : 'Select state first'}
                          options={cities}
                          error={state.errors?.city}
                          disabled={!selectedState}
                        />
                      </div>
                    </div>

                    {/* Category */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-widest text-white/35">
                        Category <span className="text-white/20 normal-case font-normal tracking-normal">(optional)</span>
                      </label>
                      <div className="relative">
                        <select
                          id="modal-category"
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 outline-none transition-all duration-200 text-sm text-white/80 focus:border-[#00FF85]/60 focus:text-white hover:border-white/20 cursor-pointer [&>option]:bg-[#0d1117] [&>option]:text-white"
                        >
                          <option value="">Please select the category that best represents your requirement</option>
                          {INQUIRY_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      </div>
                    </div>

                    {/* General error */}
                    {state.errors?.general && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm"
                      >
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {state.errors.general}
                      </motion.div>
                    )}

                    {/* Submit */}
                    <SubmitButton />

                    <p className="text-center text-xs text-white/20">
                      🔒 Your information is 100% secure. No spam, ever.
                    </p>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
