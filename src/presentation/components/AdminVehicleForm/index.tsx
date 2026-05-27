'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { VEHICLE_CATEGORIES, CATEGORY_DISPLAY, CHARGER_TYPES, CHARGER_TYPE_DISPLAY, TRANSMISSION_TYPES, TRANSMISSION_DISPLAY, isCargo, is3Wheeler, is4Wheeler, type VehicleCategory, type ChargerType, type TransmissionType } from '@/lib/constants';
import { Vehicle, LeasePlan, RentPlan } from '@/domain/entities/Vehicle';
import { Zap, Plus, AlertCircle, Edit2, CheckCircle, Trash2, Eye, EyeOff } from 'lucide-react';
import { SectionHeader, InputField, SelectField, TextareaField } from './FormField';
import VehicleImageUpload from './VehicleImageUpload';

// ── Types ─────────────────────────────────────────────────────

type PendingLeasePlan = { key: number; tenureMonths: number; monthlyPriceRs: number; depositRs: number };
type PendingRentPlan  = { key: number; durationDays: number; pricePerDayRs: number;  depositRs: number };

interface LookupOption { id: string; name: string; }

interface AdminVehicleFormProps {
  initialData?: Vehicle;
  batteryTypes?: LookupOption[];
  motorTypes?: LookupOption[];
}

// ── Toggle field ──────────────────────────────────────────────

function ToggleField({ label, name, checked, onChange, description }: {
  label: string; name: string; checked: boolean; onChange: (v: boolean) => void; description?: string;
}) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 mt-0.5 ${checked ? 'bg-primary' : 'bg-white/20'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        <input type="hidden" name={name} value={checked ? 'on' : ''} />
      </button>
      <div>
        <p className="font-semibold text-sm text-white">{label}</p>
        {description && <p className="text-xs text-white/40 mt-0.5">{description}</p>}
      </div>
    </div>
  );
}

// ── Charging time picker ──────────────────────────────────────

function ChargingTimePicker({ defaultMinutes }: { defaultMinutes?: number | null }) {
  const initial = defaultMinutes ?? 0;
  const [hours, setHours] = useState(Math.floor(initial / 60));
  const [mins, setMins] = useState(initial % 60);
  const total = hours * 60 + mins;

  return (
    <div className="md:col-span-2 space-y-2">
      <label className="text-xs font-bold uppercase tracking-widest text-white/40">Charging Time</label>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <input
            type="number" min="0" max="23" value={hours}
            onChange={(e) => setHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
            className="w-20 bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-center outline-none focus:border-primary transition-all"
          />
          <span className="text-white/40 text-sm">hrs</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number" min="0" max="59" value={mins}
            onChange={(e) => setMins(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
            className="w-20 bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-center outline-none focus:border-primary transition-all"
          />
          <span className="text-white/40 text-sm">min</span>
        </div>
        <span className="text-white/30 text-sm">= {total} min total</span>
      </div>
      <input type="hidden" name="chargingTimeMinutes" value={total} />
    </div>
  );
}

// ── Plan rows (edit mode — persisted in DB) ───────────────────

function LeasePlanRow({ plan, onDelete, onToggle }: { plan: LeasePlan; onDelete: () => void; onToggle: () => void }) {
  return (
    <div className={`flex items-center justify-between p-3 border rounded-lg text-sm transition-colors ${plan.isActive ? 'bg-white/5 border-white/10' : 'bg-white/2 border-white/5 opacity-60'}`}>
      <span className="text-white/70">{plan.tenureMonths} months</span>
      <span className="font-semibold">₹{plan.monthlyPriceRs.toLocaleString('en-IN')}/mo</span>
      <span className="text-white/50 text-xs">Dep: ₹{plan.depositRs.toLocaleString('en-IN')}</span>
      <div className="flex gap-1">
        <button type="button" onClick={onToggle} title={plan.isActive ? 'Deactivate' : 'Activate'}
          className={`p-1.5 rounded-lg transition-colors ${plan.isActive ? 'hover:bg-yellow-500/20 text-yellow-400' : 'hover:bg-green-500/20 text-green-400'}`}>
          {plan.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
        <button type="button" onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function RentPlanRow({ plan, onDelete, onToggle }: { plan: RentPlan; onDelete: () => void; onToggle: () => void }) {
  return (
    <div className={`flex items-center justify-between p-3 border rounded-lg text-sm transition-colors ${plan.isActive ? 'bg-white/5 border-white/10' : 'bg-white/2 border-white/5 opacity-60'}`}>
      <span className="text-white/70">{plan.durationDays} day{plan.durationDays !== 1 ? 's' : ''}</span>
      <span className="font-semibold">₹{plan.pricePerDayRs.toLocaleString('en-IN')}/day</span>
      <span className="text-white/50 text-xs">Dep: ₹{plan.depositRs.toLocaleString('en-IN')}</span>
      <div className="flex gap-1">
        <button type="button" onClick={onToggle} title={plan.isActive ? 'Deactivate' : 'Activate'}
          className={`p-1.5 rounded-lg transition-colors ${plan.isActive ? 'hover:bg-yellow-500/20 text-yellow-400' : 'hover:bg-green-500/20 text-green-400'}`}>
          {plan.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
        <button type="button" onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Pending plan rows (create mode — not in DB yet) ───────────

function PendingLeasePlanRow({ plan, onDelete }: { plan: PendingLeasePlan; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm">
      <span className="text-white/70">{plan.tenureMonths} months</span>
      <span className="font-semibold">₹{plan.monthlyPriceRs.toLocaleString('en-IN')}/mo</span>
      <span className="text-white/50 text-xs">Dep: ₹{plan.depositRs.toLocaleString('en-IN')}</span>
      <button type="button" onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

function PendingRentPlanRow({ plan, onDelete }: { plan: PendingRentPlan; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm">
      <span className="text-white/70">{plan.durationDays} day{plan.durationDays !== 1 ? 's' : ''}</span>
      <span className="font-semibold">₹{plan.pricePerDayRs.toLocaleString('en-IN')}/day</span>
      <span className="text-white/50 text-xs">Dep: ₹{plan.depositRs.toLocaleString('en-IN')}</span>
      <button type="button" onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── Inline add-plan panel (edit mode) — NO nested <form> ──────

function AddPlanPanel({ type, vehicleId, onAdded }: {
  type: 'lease' | 'rent';
  vehicleId: string;
  onAdded: (plan: LeasePlan | RentPlan) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [f1, setF1] = useState('');
  const [f2, setF2] = useState('');
  const [deposit, setDeposit] = useState('');

  async function handleAdd() {
    if (!f1 || !f2 || !deposit) { setError('All fields are required'); return; }
    setAdding(true); setError(null);
    const body = type === 'lease'
      ? { tenureMonths: +f1, monthlyPriceRs: +f2, depositRs: +deposit, isActive: true }
      : { durationDays: +f1, pricePerDayRs: +f2, depositRs: +deposit, isActive: true };
    const result = await api.post<LeasePlan | RentPlan>(`/vehicles/${vehicleId}/${type}-plans`, body);
    setAdding(false);
    if (!result.success) { setError(result.error ?? 'Failed to add plan'); return; }
    setF1(''); setF2(''); setDeposit('');
    onAdded(result.data);
  }

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary';
  const labelCls = 'text-[10px] font-bold uppercase tracking-wider text-white/40';

  return (
    <div className="grid grid-cols-3 gap-3 p-3 bg-white/3 border border-white/5 rounded-lg mt-2">
      {error && <p className="col-span-3 text-red-400 text-xs">{error}</p>}
      {type === 'lease' ? (
        <>
          <div className="space-y-1"><label className={labelCls}>Tenure (months)</label><input type="number" min="1" placeholder="24" value={f1} onChange={e => setF1(e.target.value)} className={inputCls} /></div>
          <div className="space-y-1"><label className={labelCls}>Monthly (₹)</label><input type="number" min="0" step="0.01" placeholder="2500" value={f2} onChange={e => setF2(e.target.value)} className={inputCls} /></div>
        </>
      ) : (
        <>
          <div className="space-y-1"><label className={labelCls}>Duration (days)</label><input type="number" min="1" placeholder="30" value={f1} onChange={e => setF1(e.target.value)} className={inputCls} /></div>
          <div className="space-y-1"><label className={labelCls}>Per Day (₹)</label><input type="number" min="0" step="0.01" placeholder="800" value={f2} onChange={e => setF2(e.target.value)} className={inputCls} /></div>
        </>
      )}
      <div className="space-y-1"><label className={labelCls}>Deposit (₹)</label><input type="number" min="0" step="0.01" placeholder="5000" value={deposit} onChange={e => setDeposit(e.target.value)} className={inputCls} /></div>
      <div className="col-span-3 flex justify-end">
        <button type="button" onClick={handleAdd} disabled={adding} className="flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
          {adding ? <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
          Add
        </button>
      </div>
    </div>
  );
}

// ── Inline add-plan panel (create mode — pushes to local state) ─

function AddPendingPlanPanel({ type, onAdd }: {
  type: 'lease' | 'rent';
  onAdd: (data: PendingLeasePlan | PendingRentPlan) => void;
}) {
  const [f1, setF1] = useState('');
  const [f2, setF2] = useState('');
  const [deposit, setDeposit] = useState('');

  function handleAdd() {
    const n1 = parseFloat(f1), n2 = parseFloat(f2), nd = parseFloat(deposit);
    if (isNaN(n1) || isNaN(n2) || isNaN(nd)) return;
    if (type === 'lease') {
      onAdd({ key: Date.now(), tenureMonths: n1, monthlyPriceRs: n2, depositRs: nd } as PendingLeasePlan);
    } else {
      onAdd({ key: Date.now(), durationDays: n1, pricePerDayRs: n2, depositRs: nd } as PendingRentPlan);
    }
    setF1(''); setF2(''); setDeposit('');
  }

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary';
  const labelCls = 'text-[10px] font-bold uppercase tracking-wider text-white/40';

  return (
    <div className="grid grid-cols-3 gap-3 p-3 bg-white/3 border border-white/5 rounded-lg mt-2">
      {type === 'lease' ? (
        <>
          <div className="space-y-1"><label className={labelCls}>Tenure (months)</label><input type="number" min="1" placeholder="24" value={f1} onChange={e => setF1(e.target.value)} className={inputCls} /></div>
          <div className="space-y-1"><label className={labelCls}>Monthly (₹)</label><input type="number" min="0" step="0.01" placeholder="2500" value={f2} onChange={e => setF2(e.target.value)} className={inputCls} /></div>
        </>
      ) : (
        <>
          <div className="space-y-1"><label className={labelCls}>Duration (days)</label><input type="number" min="1" placeholder="30" value={f1} onChange={e => setF1(e.target.value)} className={inputCls} /></div>
          <div className="space-y-1"><label className={labelCls}>Per Day (₹)</label><input type="number" min="0" step="0.01" placeholder="800" value={f2} onChange={e => setF2(e.target.value)} className={inputCls} /></div>
        </>
      )}
      <div className="space-y-1"><label className={labelCls}>Deposit (₹)</label><input type="number" min="0" step="0.01" placeholder="5000" value={deposit} onChange={e => setDeposit(e.target.value)} className={inputCls} /></div>
      <div className="col-span-3 flex justify-end">
        <button type="button" onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-lg text-sm font-semibold transition-colors">
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────

export default function AdminVehicleForm({ initialData, batteryTypes = [], motorTypes = [] }: AdminVehicleFormProps) {
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<VehicleCategory>(initialData?.category ?? 'TWO_WHEELER');
  const [chargerType, setChargerType] = useState<ChargerType>(initialData?.chargerType ?? 'NORMAL');
  const [transmission, setTransmission] = useState<TransmissionType>(initialData?.transmission ?? 'AUTO');

  const [showInLeasing, setShowInLeasing] = useState(initialData?.showInLeasing ?? false);
  const [showInBuying, setShowInBuying] = useState(initialData?.showInBuying ?? false);
  const [showInRent, setShowInRent] = useState(initialData?.showInRent ?? false);

  // DB-persisted plans (edit mode)
  const [leasePlans, setLeasePlans] = useState<LeasePlan[]>(initialData?.leasePlans ?? []);
  const [rentPlans, setRentPlans] = useState<RentPlan[]>(initialData?.rentPlans ?? []);

  // Pending plans not yet in DB (create mode)
  const [pendingLease, setPendingLease] = useState<PendingLeasePlan[]>([]);
  const [pendingRent, setPendingRent] = useState<PendingRentPlan[]>([]);

  const cargoVehicle = isCargo(category);
  const threeWheeler = is3Wheeler(category);
  const fourWheeler = is4Wheeler(category);
  const isEdit = !!initialData;

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    // Attach pending plans as JSON for create mode
    if (!isEdit) {
      formData.set('pendingLeasePlans', JSON.stringify(pendingLease.map(({ key: _k, ...p }) => p)));
      formData.set('pendingRentPlans',  JSON.stringify(pendingRent.map(({ key: _k, ...p }) => p)));
    }

    const result = isEdit
      ? await api.upload(`/vehicles/${initialData.id}`, formData, 'PUT')
      : await api.upload('/vehicles', formData);

    setLoading(false);

    if (!result.success) {
      setError(result.error ?? 'An unexpected error occurred');
      return;
    }

    router.push('/admin/vehicles');
    router.refresh();
  }

  return (
    <div className="glass-card p-8 max-w-3xl mx-auto border-primary/20">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary p-2 rounded-lg">
          {isEdit ? <Edit2 className="w-5 h-5 text-background" /> : <Plus className="w-5 h-5 text-background" />}
        </div>
        <h2 className="text-2xl font-bold">
          {isEdit ? `Edit ${initialData.make} ${initialData.model}` : 'Add New Vehicle'}
        </h2>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      <form action={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ── Basic ─────────────────────────────────────── */}
        <SectionHeader title="Basic Information" />
        <InputField label="Make (Brand)" name="make" required placeholder="e.g. Ather" defaultValue={initialData?.make} />
        <InputField label="Model" name="model" required placeholder="e.g. 450X" defaultValue={initialData?.model} />
        <SelectField label="Category" name="category" value={category} onChange={(v) => setCategory(v as VehicleCategory)}>
          {VEHICLE_CATEGORIES.map((cat) => <option key={cat} value={cat}>{CATEGORY_DISPLAY[cat]}</option>)}
        </SelectField>
        <InputField label="Warranty" name="warranty" placeholder="e.g. 3 years or 100,000 km" defaultValue={initialData?.warranty} />

        {/* ── Performance ───────────────────────────────── */}
        <SectionHeader title="Performance" />
        <InputField label="Certified Range (km)" name="certifiedRangeKm" type="number" required placeholder="e.g. 150" defaultValue={initialData?.certifiedRangeKm} />
        <InputField label="Real-World Range (km)" name="realWorldRangeKm" type="number" placeholder="e.g. 120" defaultValue={initialData?.realWorldRangeKm} />
        <InputField label="Top Speed (km/h)" name="topSpeedKmh" type="number" required placeholder="e.g. 90" defaultValue={initialData?.topSpeedKmh} />

        {/* ── Drivetrain ────────────────────────────────── */}
        <SectionHeader title="Battery & Drivetrain" />
        <InputField label="Battery Capacity (kWh)" name="batteryCapKwh" type="number" step="0.1" required placeholder="e.g. 3.7" defaultValue={initialData?.batteryCapKwh} />
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-white/50">Battery Type</label>
          <select name="batteryTypeId" defaultValue={initialData?.batteryTypeId ?? ''} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 focus:border-primary outline-none transition-all appearance-none [&>option]:bg-[#0d1117]">
            <option value="">— None —</option>
            {batteryTypes.map((bt) => <option key={bt.id} value={bt.id}>{bt.name}</option>)}
          </select>
        </div>
        {(threeWheeler || fourWheeler) && (
          <InputField label="Peak Voltage (V)" name="peakVoltageV" type="number" placeholder="e.g. 48" defaultValue={initialData?.peakVoltageV} />
        )}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-white/50">Motor Type</label>
          <select name="motorTypeId" defaultValue={initialData?.motorTypeId ?? ''} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 focus:border-primary outline-none transition-all appearance-none [&>option]:bg-[#0d1117]">
            <option value="">— None —</option>
            {motorTypes.map((mt) => <option key={mt.id} value={mt.id}>{mt.name}</option>)}
          </select>
        </div>
        <InputField label="Peak Power (kW)" name="peakPowerKw" type="number" step="0.01" placeholder="e.g. 4.3" defaultValue={initialData?.peakPowerKw ?? undefined} />
        <InputField label="Peak Torque (Nm)" name="peakTorqueNm" type="number" step="0.01" placeholder="e.g. 22" defaultValue={initialData?.peakTorqueNm ?? undefined} />
        <SelectField label="Transmission" name="transmission" value={transmission} onChange={(v) => setTransmission(v as TransmissionType)}>
          {TRANSMISSION_TYPES.map((t) => <option key={t} value={t}>{TRANSMISSION_DISPLAY[t]}</option>)}
        </SelectField>
        {!fourWheeler && (
          <InputField label="Max Gradability (%)" name="gradabilityPct" type="number" step="0.1" placeholder="e.g. 15" defaultValue={initialData?.gradabilityPct} />
        )}

        {/* ── Charging ──────────────────────────────────── */}
        <SectionHeader title="Charging" />
        <SelectField label="Charger Type" name="chargerType" value={chargerType} onChange={(v) => setChargerType(v as ChargerType)}>
          {CHARGER_TYPES.map((ct) => <option key={ct} value={ct}>{CHARGER_TYPE_DISPLAY[ct]}</option>)}
        </SelectField>
        <SelectField label="On-board Charger" name="hasOnBoardCharger" value={initialData?.hasOnBoardCharger !== false ? 'on' : ''} onChange={() => {}}>
          <option value="on">Yes</option>
          <option value="">No</option>
        </SelectField>
        <ChargingTimePicker defaultMinutes={initialData?.chargingTimeMinutes} />

        {/* ── Dimensions ────────────────────────────────── */}
        <SectionHeader title="Dimensions & Weight" />
        <InputField label="Curb Weight (kg)" name="curbWeightKg" type="number" step="0.1" placeholder="e.g. 119" defaultValue={initialData?.curbWeightKg} />
        {(threeWheeler || fourWheeler) && (
          <InputField label="Gross Weight (kg)" name="grossWeightKg" type="number" step="0.1" placeholder="e.g. 805" defaultValue={initialData?.grossWeightKg} />
        )}
        <InputField label="Width (mm)" name="widthMm" type="number" placeholder="e.g. 750" defaultValue={initialData?.widthMm} />
        <InputField label="Height (mm)" name="heightMm" type="number" placeholder="e.g. 1140" defaultValue={initialData?.heightMm} />
        <InputField label="Length (mm)" name="lengthMm" type="number" placeholder="e.g. 1850" defaultValue={initialData?.lengthMm} />
        <InputField label="Ground Clearance (mm)" name="groundClearanceMm" type="number" placeholder="e.g. 165" defaultValue={initialData?.groundClearanceMm} />
        <InputField label="Wheelbase (mm)" name="wheelbaseMm" type="number" placeholder="e.g. 1285" defaultValue={initialData?.wheelbaseMm} />

        {/* ── Cargo ─────────────────────────────────────── */}
        {cargoVehicle && (
          <>
            <SectionHeader title="Cargo Specifications" />
            <InputField label="Payload Capacity (kg)" name="payloadKg" type="number" step="0.1" placeholder="e.g. 500" defaultValue={initialData?.payloadKg} />
            <InputField label="Cargo Volume (L)" name="cargoVolumeL" type="number" step="0.1" placeholder="e.g. 720" defaultValue={initialData?.cargoVolumeL} />
            <InputField label="Container Dimensions (L × W × H mm)" name="containerDimensions" placeholder="e.g. 1840 × 1425 × 275" defaultValue={initialData?.containerDimensions} colSpan />
          </>
        )}

        {/* ── Media ─────────────────────────────────────── */}
        <VehicleImageUpload
          initialMainImage={initialData?.mainImage}
          initialSideImages={initialData?.images.map((img) => img.url)}
        />

        {/* ── Descriptions ──────────────────────────────── */}
        <SectionHeader title="Detailed Descriptions" />
        <TextareaField label="Overview" name="overview" placeholder="Write an engaging overview paragraph about this vehicle..." defaultValue={initialData?.overview} />
        <TextareaField label="Technical Specifications" name="techSpecs" placeholder="Write about battery, charging, and tech specs..." defaultValue={initialData?.techSpecs} />
        <TextareaField label="Performance & Efficiency" name="performance" placeholder="Write about performance, efficiency, and maneuverability..." defaultValue={initialData?.performance} />

        {/* ── Visibility & Pricing ──────────────────────── */}
        <SectionHeader title="Visibility & Pricing" />

        {/* Leasing toggle + info */}
        <div className="md:col-span-2">
          <ToggleField label="Show in Leasing" name="showInLeasing" checked={showInLeasing} onChange={setShowInLeasing} description="Vehicle will appear on the Leasing section" />
        </div>
        {showInLeasing && (
          <div className="md:col-span-2">
            <TextareaField label="Leasing Information" name="leasingInfo" placeholder="Write about leasing terms, warranty, and benefits..." defaultValue={initialData?.leasingInfo} />
          </div>
        )}

        {/* Lease plans */}
        <div className="md:col-span-2 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-white/50">Lease Plans</p>
          {isEdit ? (
            <>
              {leasePlans.length === 0 && <p className="text-sm text-white/30 italic py-1">No lease plans yet.</p>}
              {leasePlans.map((plan) => (
                <LeasePlanRow
                  key={plan.id}
                  plan={plan}
                  onDelete={async () => { await api.del(`/vehicles/${initialData!.id}/lease-plans/${plan.id}`); setLeasePlans((p) => p.filter((x) => x.id !== plan.id)); }}
                  onToggle={async () => { await api.put(`/vehicles/${initialData!.id}/lease-plans/${plan.id}`, { isActive: !plan.isActive }); setLeasePlans((p) => p.map((x) => x.id === plan.id ? { ...x, isActive: !x.isActive } : x)); }}
                />
              ))}
              <AddPlanPanel type="lease" vehicleId={initialData.id} onAdded={(plan) => setLeasePlans((p) => [...p, plan as LeasePlan])} />
            </>
          ) : (
            <>
              {pendingLease.length === 0 && <p className="text-sm text-white/30 italic py-1">No lease plans yet — add below.</p>}
              {pendingLease.map((plan) => (
                <PendingLeasePlanRow key={plan.key} plan={plan} onDelete={() => setPendingLease((p) => p.filter((x) => x.key !== plan.key))} />
              ))}
              <AddPendingPlanPanel type="lease" onAdd={(p) => setPendingLease((prev) => [...prev, p as PendingLeasePlan])} />
            </>
          )}
        </div>

        {/* Buying toggle + price */}
        <div className="md:col-span-2">
          <ToggleField label="Show in Buying" name="showInBuying" checked={showInBuying} onChange={setShowInBuying} description="Vehicle will appear on the Buying section" />
        </div>
        {showInBuying && (
          <>
            <InputField label="Buying Price (₹)" name="buyingPrice" type="number" step="0.01" placeholder="e.g. 150000" defaultValue={initialData?.buyingPrice ?? undefined} />
            <TextareaField label="Buying Information" name="buyingInfo" placeholder="Write about purchase terms, warranty, and benefits..." defaultValue={initialData?.buyingInfo} />
          </>
        )}

        {/* Rent toggle + info */}
        <div className="md:col-span-2">
          <ToggleField label="Show in Rent" name="showInRent" checked={showInRent} onChange={setShowInRent} description="Vehicle will appear on the Rent section" />
        </div>
        {showInRent && (
          <div className="md:col-span-2">
            <TextareaField label="Rental Information" name="rentalInfo" placeholder="Write about rental terms, conditions, and benefits..." defaultValue={initialData?.rentalInfo} />
          </div>
        )}

        {/* Rent plans */}
        <div className="md:col-span-2 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-white/50">Rent Plans</p>
          {isEdit ? (
            <>
              {rentPlans.length === 0 && <p className="text-sm text-white/30 italic py-1">No rent plans yet.</p>}
              {rentPlans.map((plan) => (
                <RentPlanRow
                  key={plan.id}
                  plan={plan}
                  onDelete={async () => { await api.del(`/vehicles/${initialData!.id}/rent-plans/${plan.id}`); setRentPlans((p) => p.filter((x) => x.id !== plan.id)); }}
                  onToggle={async () => { await api.put(`/vehicles/${initialData!.id}/rent-plans/${plan.id}`, { isActive: !plan.isActive }); setRentPlans((p) => p.map((x) => x.id === plan.id ? { ...x, isActive: !x.isActive } : x)); }}
                />
              ))}
              <AddPlanPanel type="rent" vehicleId={initialData.id} onAdded={(plan) => setRentPlans((p) => [...p, plan as RentPlan])} />
            </>
          ) : (
            <>
              {pendingRent.length === 0 && <p className="text-sm text-white/30 italic py-1">No rent plans yet — add below.</p>}
              {pendingRent.map((plan) => (
                <PendingRentPlanRow key={plan.key} plan={plan} onDelete={() => setPendingRent((p) => p.filter((x) => x.key !== plan.key))} />
              ))}
              <AddPendingPlanPanel type="rent" onAdd={(p) => setPendingRent((prev) => [...prev, p as PendingRentPlan])} />
            </>
          )}
        </div>

        {/* ── Submit ────────────────────────────────────── */}
        <div className="md:col-span-2 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-background font-bold py-3 rounded-xl hover:bg-primary/90 transition-all electric-glow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
            ) : (
              <>
                {isEdit ? <Edit2 className="w-4 h-4" /> : <Zap className="w-4 h-4 fill-current" />}
                {isEdit ? 'Update Vehicle' : 'Add Vehicle to Catalog'}
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
