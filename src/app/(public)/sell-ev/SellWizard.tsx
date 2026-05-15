'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, CheckCircle, Loader2, Copy, Check,
  Zap, Car, Bike, Truck, AlertCircle, Search, X,
} from 'lucide-react';
import { getBrands, getModelsByBrand } from '@/app/actions/evCatalogActions';
import EVImage from '@/presentation/components/EVImage';
import { submitSellApplication, type WizardFormData } from '@/app/actions/sellActions';
import { type VehicleCategory } from '@/lib/constants';

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const TOTAL_STEPS = 13;

const CATEGORIES: { value: VehicleCategory; label: string; icon: React.ElementType; desc: string }[] = [
  { value: '2 Wheeler',             label: '2 Wheeler',    icon: Bike,  desc: 'Scooters, E-bikes' },
  { value: '3 Wheeler (Passenger)', label: '3W Passenger', icon: Car,   desc: 'E-Rickshaws, Autos' },
  { value: '3 Wheeler (Cargo)',     label: '3W Cargo',     icon: Truck, desc: 'Cargo Autos' },
  { value: '4 Wheeler (Passenger)', label: '4W Passenger', icon: Car,   desc: 'Cars, SUVs' },
  { value: '4 Wheeler (Cargo)',     label: '4W Cargo',     icon: Truck, desc: 'Vans, Pickups' },
];

const SELLER_TYPES = [
  { value: 'Consumer', label: 'Consumer', desc: 'I own this vehicle personally' },
  { value: 'Dealer', label: 'Dealer', desc: 'I am a registered EV dealer' },
];

const OWNERSHIP_OPTIONS = [
  { value: 'First Owner', label: 'First Owner' },
  { value: 'Second Owner', label: 'Second Owner' },
  { value: 'Third Owner or More', label: 'Third Owner or More' },
];

const BATTERY_OPTIONS = [
  { value: 'Excellent', label: 'Excellent', desc: '90%+ health' },
  { value: 'Good', label: 'Good', desc: '75–90% health' },
  { value: 'Average', label: 'Average', desc: '60–75% health' },
  { value: 'Poor', label: 'Poor', desc: 'Below 60%' },
  { value: 'Not Sure', label: 'Not Sure', desc: "I don't know" },
];

const CONDITION_OPTIONS = [
  { value: 'Excellent', label: 'Excellent', desc: 'Like new, no issues' },
  { value: 'Good', label: 'Good', desc: 'Minor wear, fully functional' },
  { value: 'Fair', label: 'Fair', desc: 'Visible wear, works fine' },
  { value: 'Needs Repair', label: 'Needs Repair', desc: 'Has mechanical issues' },
];

const LOAN_OPTIONS = [
  { value: 'No Loan', label: 'No Loan', desc: 'Fully paid off' },
  { value: 'Loan Closed', label: 'Loan Closed', desc: 'Loan closed, NOC available' },
  { value: 'Loan Active', label: 'Loan Active', desc: 'EMIs still ongoing' },
];

const DOCUMENTS = ['RC', 'Insurance', 'Charger'];

const YEAR_OPTIONS = (() => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= 2010; y--) years.push(y);
  return years;
})();

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type FormState = Partial<WizardFormData> & { documents: string[] };

type BrandOption = { id: string; name: string; categories: string[] };
type ModelOption = { id: string; name: string; photo: string | null };

// ─────────────────────────────────────────────────────────────
// Animation variants
// ─────────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  const pct = Math.round((step / TOTAL_STEPS) * 100);
  return (
    <div className="mb-8">
      <div className="flex justify-between text-xs text-white/30 mb-2">
        <span>Step {step} of {TOTAL_STEPS}</span>
        <span>{pct}% complete</span>
      </div>
      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function OptionCard({
  selected, onClick, children,
}: {
  selected: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
        selected
          ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(0,255,133,0.15)]'
          : 'border-white/10 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.06]'
      }`}
    >
      {children}
    </button>
  );
}

function NavButtons({
  step, onBack, onNext, nextDisabled, nextLabel = 'Continue', loading = false,
}: {
  step: number;
  onBack: () => void;
  onNext: () => void;
  nextDisabled: boolean;
  nextLabel?: string;
  loading?: boolean;
}) {
  return (
    <div className="flex gap-3 mt-8">
      {step > 1 && (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-5 py-3 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-all text-sm font-medium"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled || loading}
        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: nextDisabled || loading ? 'rgba(0,255,133,0.1)' : 'linear-gradient(135deg,#00FF85,#00d46e)',
          color: nextDisabled || loading ? '#00FF85' : '#050d0a',
          boxShadow: nextDisabled || loading ? 'none' : '0 0 24px rgba(0,255,133,0.3)',
        }}
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
        ) : (
          <>{nextLabel} <ChevronRight className="w-4 h-4" /></>
        )}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Wizard
// ─────────────────────────────────────────────────────────────

export default function SellWizard() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [form, setForm] = useState<FormState>({ documents: [] });
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [appId, setAppId] = useState('');
  const [copied, setCopied] = useState(false);
  const [modelSearch, setModelSearch] = useState('');

  // Fetch brands for the selected category when leaving step 1
  const fetchBrandsForCategory = useCallback(async (category: string) => {
    setBrandsLoading(true);
    setBrands([]);
    const res = await getBrands(category);
    if (res.success && res.data) setBrands(res.data);
    setBrandsLoading(false);
  }, []);

  // Fetch models when brand selected — filter by selected category
  const fetchModels = useCallback(async (brandId: string, category?: string) => {
    setModelsLoading(true);
    const res = await getModelsByBrand(brandId, category);
    if (res.success && res.data) setModels(res.data);
    else setModels([]);
    setModelsLoading(false);
  }, []);

  const go = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleDoc = (doc: string) => {
    setForm((prev) => {
      const docs = prev.documents ?? [];
      return {
        ...prev,
        documents: docs.includes(doc) ? docs.filter((d) => d !== doc) : [...docs, doc],
      };
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    const res = await submitSellApplication(form as WizardFormData);
    setSubmitting(false);
    if (res.success && res.applicationId) {
      setAppId(res.applicationId);
      setDirection(1);
      setStep(14);
    } else {
      setSubmitError(res.error ?? 'Something went wrong. Please try again.');
    }
  };

  const copyAppId = () => {
    navigator.clipboard.writeText(appId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Step content definitions ──
  const renderStep = () => {
    switch (step) {
      // ── Step 1: Category ──
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-black text-white mb-1">What type of EV do you want to sell?</h2>
            <p className="text-white/40 text-sm mb-6">Select the category that best describes your vehicle.</p>
            <div className="space-y-3">
              {CATEGORIES.map(({ value, label, icon: Icon, desc }) => (
                <OptionCard
                  key={value}
                  selected={form.category === value}
                  onClick={() => {
                    // Reset brand/model if category changed
                    if (form.category !== value) {
                      setForm((prev) => ({
                        ...prev,
                        category: value,
                        brandId: undefined,
                        brandName: undefined,
                        modelId: undefined,
                        modelName: undefined,
                      }));
                      setModels([]);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${form.category === value ? 'bg-primary/20' : 'bg-white/5'}`}>
                      <Icon className={`w-4 h-4 ${form.category === value ? 'text-primary' : 'text-white/40'}`} />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{label}</p>
                      <p className="text-white/40 text-xs">{desc}</p>
                    </div>
                    {form.category === value && <CheckCircle className="w-4 h-4 text-primary ml-auto flex-shrink-0" />}
                  </div>
                </OptionCard>
              ))}
            </div>
            <NavButtons
              step={step}
              onBack={() => go(step - 1)}
              onNext={() => {
                if (form.category) fetchBrandsForCategory(form.category);
                go(2);
              }}
              nextDisabled={!form.category}
            />
          </div>
        );

      // ── Step 2: Identity ──
      case 2:
        return (
          <div>
            <h2 className="text-2xl font-black text-white mb-1">What best describes you?</h2>
            <p className="text-white/40 text-sm mb-6">This helps us tailor the valuation process.</p>
            <div className="space-y-3">
              {SELLER_TYPES.map(({ value, label, desc }) => (
                <OptionCard key={value} selected={form.sellerType === value} onClick={() => set('sellerType', value)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">{label}</p>
                      <p className="text-white/40 text-sm mt-0.5">{desc}</p>
                    </div>
                    {form.sellerType === value && <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />}
                  </div>
                </OptionCard>
              ))}
            </div>
            <NavButtons step={step} onBack={() => go(1)} onNext={() => go(3)} nextDisabled={!form.sellerType} />
          </div>
        );

      // ── Step 3: Brand ──
      case 3:
        return (
          <div>
            <h2 className="text-2xl font-black text-white mb-1">Select the brand</h2>
            <p className="text-white/40 text-sm mb-6">Who manufactured your EV?</p>
            {brandsLoading ? (
              <div className="py-16 flex flex-col items-center gap-3 text-white/30">
                <Loader2 className="w-6 h-6 animate-spin" />
                <p className="text-sm">Loading brands…</p>
              </div>
            ) : brands.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <p className="text-white/40 text-sm">No brands found for <span className="text-white/70 font-semibold">{form.category}</span>.</p>
                <p className="text-white/25 text-xs">Our catalog is being updated. Please contact us directly.</p>
                <a href="mailto:contact@zmrmobility.com" className="inline-block mt-1 text-primary text-xs font-bold hover:underline">contact@zmrmobility.com</a>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                {brands.map(({ id, name }) => (
                  <OptionCard
                    key={id}
                    selected={form.brandId === id}
                    onClick={() => {
                      set('brandId', id);
                      set('brandName', name);
                      set('modelId', undefined as unknown as string);
                      set('modelName', undefined as unknown as string);
                      fetchModels(id, form.category);
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm text-white truncate">{name}</span>
                      {form.brandId === id && <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                    </div>
                  </OptionCard>
                ))}
              </div>
            )}
            <NavButtons step={step} onBack={() => go(2)} onNext={() => go(4)} nextDisabled={!form.brandId} />
          </div>
        );

      // ── Step 4: Model ──
      case 4: {
        const filteredModels = modelSearch.trim()
          ? models.filter((m) => m.name.toLowerCase().includes(modelSearch.toLowerCase()))
          : models;

        return (
          <div>
            <h2 className="text-2xl font-black text-white mb-1">Select the model</h2>
            <p className="text-white/40 text-sm mb-4">Choose the specific model of your {form.brandName}.</p>
            {modelsLoading ? (
              <div className="py-16 flex flex-col items-center gap-3 text-white/30">
                <Loader2 className="w-6 h-6 animate-spin" />
                <p className="text-sm">Loading models…</p>
              </div>
            ) : models.length === 0 ? (
              <div className="py-12 text-center text-white/30 text-sm">
                No models found for this brand. Please go back and select a different brand.
              </div>
            ) : (
              <>
                {/* Search */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search model name…"
                    value={modelSearch}
                    onChange={(e) => setModelSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-8 py-2.5 text-sm text-white outline-none focus:border-primary/50 placeholder:text-white/20 transition-all"
                  />
                  {modelSearch && (
                    <button
                      type="button"
                      onClick={() => setModelSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Compact model list */}
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {filteredModels.length === 0 ? (
                    <p className="text-center text-white/25 text-sm py-8">No models match "{modelSearch}"</p>
                  ) : filteredModels.map(({ id, name, photo }) => {
                    const selected = form.modelId === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => { set('modelId', id); set('modelName', name); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all duration-150 ${
                          selected
                            ? 'border-primary bg-primary/10 shadow-[0_0_16px_rgba(0,255,133,0.1)]'
                            : 'border-white/8 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
                        }`}
                      >
                        {photo ? (
                          <EVImage
                            src={photo}
                            alt={name}
                            className="w-9 h-9 rounded-lg flex-shrink-0"
                            imgClassName="w-full h-full object-contain"
                            iconSize="sm"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg ev-shimmer-base flex items-center justify-center flex-shrink-0">
                            <Car className="w-4 h-4 text-[#00FF85]/20" />
                          </div>
                        )}
                        <span className={`flex-1 text-sm font-semibold truncate ${selected ? 'text-white' : 'text-white/80'}`}>{name}</span>
                        {selected && <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
            <NavButtons step={step} onBack={() => { go(3); setModelSearch(''); }} onNext={() => go(5)} nextDisabled={!form.modelId} />
          </div>
        );
      }

      // ── Step 5: Year ──
      case 5:
        return (
          <div>
            <h2 className="text-2xl font-black text-white mb-1">What year was it manufactured?</h2>
            <p className="text-white/40 text-sm mb-6">Select the registration / manufacturing year.</p>
            <div className="relative">
              <select
                value={form.year ?? ''}
                onChange={(e) => set('year', parseInt(e.target.value))}
                className="w-full appearance-none bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-lg font-semibold outline-none focus:border-primary transition-all [&>option]:bg-[#0d1117]"
              >
                <option value="">Select year…</option>
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 w-4 h-4 text-white/40 pointer-events-none" />
            </div>
            <NavButtons step={step} onBack={() => go(4)} onNext={() => go(6)} nextDisabled={!form.year} />
          </div>
        );

      // ── Step 6: Ownership ──
      case 6:
        return (
          <div>
            <h2 className="text-2xl font-black text-white mb-1">How many owners has this vehicle had?</h2>
            <p className="text-white/40 text-sm mb-6">Include yourself as the current owner.</p>
            <div className="space-y-3">
              {OWNERSHIP_OPTIONS.map(({ value, label }) => (
                <OptionCard key={value} selected={form.ownership === value} onClick={() => set('ownership', value)}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{label}</span>
                    {form.ownership === value && <CheckCircle className="w-4 h-4 text-primary" />}
                  </div>
                </OptionCard>
              ))}
            </div>
            <NavButtons step={step} onBack={() => go(5)} onNext={() => go(7)} nextDisabled={!form.ownership} />
          </div>
        );

      // ── Step 7: Battery ──
      case 7:
        return (
          <div>
            <h2 className="text-2xl font-black text-white mb-1">How is the battery performing?</h2>
            <p className="text-white/40 text-sm mb-6">Choose the option that best describes current battery health.</p>
            <div className="space-y-3">
              {BATTERY_OPTIONS.map(({ value, label, desc }) => (
                <OptionCard key={value} selected={form.batteryCondition === value} onClick={() => set('batteryCondition', value)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{label}</p>
                      <p className="text-white/40 text-xs mt-0.5">{desc}</p>
                    </div>
                    {form.batteryCondition === value && <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />}
                  </div>
                </OptionCard>
              ))}
            </div>
            <NavButtons step={step} onBack={() => go(6)} onNext={() => go(8)} nextDisabled={!form.batteryCondition} />
          </div>
        );

      // ── Step 8: Condition ──
      case 8:
        return (
          <div>
            <h2 className="text-2xl font-black text-white mb-1">Overall condition of the vehicle?</h2>
            <p className="text-white/40 text-sm mb-6">Physical and mechanical condition, excluding battery.</p>
            <div className="space-y-3">
              {CONDITION_OPTIONS.map(({ value, label, desc }) => (
                <OptionCard key={value} selected={form.vehicleCondition === value} onClick={() => set('vehicleCondition', value)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{label}</p>
                      <p className="text-white/40 text-xs mt-0.5">{desc}</p>
                    </div>
                    {form.vehicleCondition === value && <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />}
                  </div>
                </OptionCard>
              ))}
            </div>
            <NavButtons step={step} onBack={() => go(7)} onNext={() => go(9)} nextDisabled={!form.vehicleCondition} />
          </div>
        );

      // ── Step 9: Accident ──
      case 9:
        return (
          <div>
            <h2 className="text-2xl font-black text-white mb-1">Any major accident history?</h2>
            <p className="text-white/40 text-sm mb-6">Include incidents that required significant repairs.</p>
            <div className="space-y-3">
              {[{ value: false, label: 'No', desc: 'No major accidents' }, { value: true, label: 'Yes', desc: 'Vehicle has had a major accident' }].map(({ value, label, desc }) => (
                <OptionCard key={String(value)} selected={form.hasAccident === value} onClick={() => set('hasAccident', value)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{label}</p>
                      <p className="text-white/40 text-xs mt-0.5">{desc}</p>
                    </div>
                    {form.hasAccident === value && <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />}
                  </div>
                </OptionCard>
              ))}
            </div>
            <NavButtons step={step} onBack={() => go(8)} onNext={() => go(10)} nextDisabled={form.hasAccident === undefined} />
          </div>
        );

      // ── Step 10: Loan ──
      case 10:
        return (
          <div>
            <h2 className="text-2xl font-black text-white mb-1">Is there any loan on this vehicle?</h2>
            <p className="text-white/40 text-sm mb-6">Loan status affects the transfer process.</p>
            <div className="space-y-3">
              {LOAN_OPTIONS.map(({ value, label, desc }) => (
                <OptionCard key={value} selected={form.loanStatus === value} onClick={() => set('loanStatus', value)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{label}</p>
                      <p className="text-white/40 text-xs mt-0.5">{desc}</p>
                    </div>
                    {form.loanStatus === value && <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />}
                  </div>
                </OptionCard>
              ))}
            </div>
            <NavButtons step={step} onBack={() => go(9)} onNext={() => go(11)} nextDisabled={!form.loanStatus} />
          </div>
        );

      // ── Step 11: Documents ──
      case 11:
        return (
          <div>
            <h2 className="text-2xl font-black text-white mb-1">Which documents do you have?</h2>
            <p className="text-white/40 text-sm mb-6">Select all that apply. More documents = higher valuation.</p>
            <div className="space-y-3">
              {DOCUMENTS.map((doc) => {
                const checked = form.documents.includes(doc);
                return (
                  <button
                    key={doc}
                    type="button"
                    onClick={() => toggleDoc(doc)}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 ${
                      checked
                        ? 'border-primary bg-primary/10'
                        : 'border-white/10 bg-white/[0.03] hover:border-white/30'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${checked ? 'bg-primary border-primary' : 'border-white/30'}`}>
                      {checked && <Check className="w-3 h-3 text-background" />}
                    </div>
                    <span className="font-semibold text-white">{doc}</span>
                  </button>
                );
              })}
            </div>
            <NavButtons step={step} onBack={() => go(10)} onNext={() => go(12)} nextDisabled={false} nextLabel="Continue" />
          </div>
        );

      // ── Step 12: Price ──
      case 12:
        return (
          <div>
            <h2 className="text-2xl font-black text-white mb-1">What's your expected selling price?</h2>
            <p className="text-white/40 text-sm mb-6">Enter the amount you expect to receive. Our team will share the actual valuation.</p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold text-lg">₹</span>
              <input
                type="number"
                min={0}
                placeholder="e.g. 80000"
                value={form.expectedPrice ?? ''}
                onChange={(e) => set('expectedPrice', parseFloat(e.target.value) || 0)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-5 py-4 text-white text-lg font-semibold outline-none focus:border-primary transition-all placeholder:text-white/20"
              />
            </div>
            <NavButtons step={step} onBack={() => go(11)} onNext={() => go(13)} nextDisabled={!form.expectedPrice || form.expectedPrice <= 0} />
          </div>
        );

      // ── Step 13: Contact ──
      case 13: {
        const phoneValid = !form.contactPhone || /^[6-9]\d{9}$/.test(form.contactPhone.replace(/\s/g, ''));
        const emailValid = !form.contactEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail);
        const allFilled = !!(form.contactName?.trim() && form.contactPhone?.trim() && form.contactEmail?.trim() && form.contactCity?.trim());
        const canSubmit = allFilled && phoneValid && emailValid;

        return (
          <div>
            <h2 className="text-2xl font-black text-white mb-1">Your contact details</h2>
            <p className="text-white/40 text-sm mb-6">Our team will reach out to you with the valuation.</p>
            <div className="space-y-4">
              {[
                { label: 'Full Name', key: 'contactName', type: 'text', placeholder: 'Rahul Sharma' },
                { label: 'Mobile Number', key: 'contactPhone', type: 'tel', placeholder: '9876543210' },
                { label: 'Email Address', key: 'contactEmail', type: 'email', placeholder: 'rahul@example.com' },
                { label: 'City', key: 'contactCity', type: 'text', placeholder: 'Mumbai' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/30">{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={(form as Record<string, unknown>)[key] as string ?? ''}
                    onChange={(e) => set(key as keyof FormState, e.target.value as never)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary transition-all placeholder:text-white/20"
                  />
                </div>
              ))}
            </div>
            {submitError && (
              <p className="flex items-center gap-2 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {submitError}
              </p>
            )}
            <NavButtons
              step={step}
              onBack={() => go(12)}
              onNext={handleSubmit}
              nextDisabled={!canSubmit}
              nextLabel="Submit Application"
              loading={submitting}
            />
          </div>
        );
      }

      // ── Step 14: Success ──
      case 14:
        return (
          <div className="text-center py-4 space-y-6">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto" style={{ boxShadow: '0 0 50px rgba(0,255,133,0.2)' }}>
                <CheckCircle className="w-12 h-12 text-primary" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.5], opacity: [0.4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full border border-primary/40"
              />
            </div>

            <div>
              <h2 className="text-3xl font-black text-white mb-2">Application Submitted!</h2>
              <p className="text-white/50">Our team will review your submission and contact you within 24–48 hours.</p>
            </div>

            <div className="glass-card p-6 space-y-3 text-left">
              <p className="text-xs font-bold uppercase tracking-widest text-white/30">Your Application ID</p>
              <div className="flex items-center gap-3">
                <code className="flex-1 text-2xl font-black text-primary tracking-wider">{appId}</code>
                <button
                  type="button"
                  onClick={copyAppId}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold hover:bg-primary/20 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-white/30 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-primary flex-shrink-0" />
                Take a screenshot of this ID for your reference. You'll need it to track your application.
              </p>
            </div>

            <div className="bg-white/5 rounded-2xl p-5 text-sm text-white/40 text-center leading-relaxed">
              We'll evaluate your <span className="text-white/70 font-semibold">{form.brandName} {form.modelName} ({form.year})</span> and get back to you at <span className="text-white/70 font-semibold">{form.contactPhone}</span>.
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="glass-card p-8 md:p-10"
      style={{ border: '1px solid rgba(0,255,133,0.1)', boxShadow: '0 0 60px rgba(0,255,133,0.04)' }}
    >
      {step <= TOTAL_STEPS && <ProgressBar step={step} />}

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
