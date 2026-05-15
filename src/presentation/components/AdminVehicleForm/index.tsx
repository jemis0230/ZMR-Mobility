'use client';

import { useState, useRef } from 'react';
import { createVehicleAction } from '@/app/actions/vehicleActions';
import { updateVehicle } from '@/app/admin/(dashboard)/vehicles/actions';
import { VEHICLE_CATEGORIES, type VehicleCategory } from '@/lib/constants';
import { Vehicle } from '@/domain/entities/Vehicle';
import { Zap, Plus, AlertCircle, Edit2, CheckCircle } from 'lucide-react';
import { SectionHeader, InputField, SelectField, TextareaField } from './FormField';
import VehicleImageUpload from './VehicleImageUpload';

interface AdminVehicleFormProps {
  initialData?: Vehicle;
  onVehicleSaved?: () => void;
}

export default function AdminVehicleForm({ initialData, onVehicleSaved }: AdminVehicleFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState(initialData?.category ?? '2 Wheeler');
  const [chargerType, setChargerType] = useState(initialData?.chargerType ?? 'Normal Charging');
  const formRef = useRef<HTMLFormElement>(null);

  const isCargo = category.includes('Cargo');
  const is3W = category.includes('3 Wheeler');
  const is4W = category.includes('4 Wheeler');

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const result = initialData
      ? await updateVehicle(initialData.id, formData)
      : await createVehicleAction(formData);

    setLoading(false);

    if (!result.success) {
      setError(result.error ?? 'An unexpected error occurred');
      return;
    }

    setSuccess(true);
    if (!initialData) {
      formRef.current?.reset();
      setCategory('2 Wheeler');
      setChargerType('Normal Charging');
    }
    onVehicleSaved?.();
  }

  return (
    <div className="glass-card p-8 max-w-2xl mx-auto border-primary/20">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary p-2 rounded-lg">
          {initialData ? <Edit2 className="w-5 h-5 text-background" /> : <Plus className="w-5 h-5 text-background" />}
        </div>
        <h2 className="text-2xl font-bold">
          {initialData ? `Edit ${initialData.make} ${initialData.model}` : 'Add New Vehicle'}
        </h2>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-400 text-sm">
          <CheckCircle className="w-5 h-5 shrink-0" />
          {initialData ? 'Vehicle updated successfully!' : 'Vehicle added to catalog!'}
        </div>
      )}

      <form ref={formRef} action={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ── Basic Information ─────────────────────────── */}
        <SectionHeader title="Basic Information" />

        <InputField label="Make (Brand)" name="make" required placeholder="e.g. Ather" defaultValue={initialData?.make} />
        <InputField label="Model" name="model" required placeholder="e.g. 450X" defaultValue={initialData?.model} />

        <SelectField label="Category" name="category" value={category} onChange={(v) => setCategory(v as VehicleCategory)}>
          {VEHICLE_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
        </SelectField>

        <InputField label="Range (KM)" name="range" type="number" required placeholder="e.g. 150" defaultValue={initialData?.range} />

        {category === '4 Wheeler (Cargo)' && (
          <InputField label="True Range (KM)" name="trueRange" type="number" placeholder="e.g. 140" defaultValue={initialData?.trueRange} />
        )}

        <InputField label="Top Speed (KM/H)" name="topSpeed" type="number" required placeholder="e.g. 90" defaultValue={initialData?.topSpeed} />
        <InputField label="Base Price (Monthly ₹)" name="basePrice" type="number" required placeholder="e.g. 2500" defaultValue={initialData?.basePrice} />
        <InputField label="Deposit (₹)" name="deposit" type="number" required placeholder="e.g. 7500" defaultValue={initialData?.deposit} />
        <InputField label="Warranty" name="warranty" required placeholder="e.g. 3 years or 100,000 km" defaultValue={initialData?.warranty} colSpan />

        {/* ── Dimensions ────────────────────────────────── */}
        <SectionHeader title="Dimensions & Weight" />

        <InputField label="Kerb Weight (kg)" name="kerbWeight" type="number" step="0.1" placeholder="e.g. 119" defaultValue={initialData?.kerbWeight} />
        {(is3W || is4W) && (
          <InputField label="Gross Vehicle Weight (kg)" name="gvW" type="number" step="0.1" placeholder="e.g. 805" defaultValue={initialData?.gvW} />
        )}
        <InputField label="Width (mm)" name="width" type="number" placeholder="e.g. 750" defaultValue={initialData?.width} />
        <InputField label="Height (mm)" name="height" type="number" placeholder="e.g. 1140" defaultValue={initialData?.height} />
        <InputField label="Length (mm)" name="length" type="number" placeholder="e.g. 1850" defaultValue={initialData?.length} />
        <InputField label="Ground Clearance (mm)" name="groundClearance" type="number" placeholder="e.g. 165" defaultValue={initialData?.groundClearance} />
        <InputField label="Wheelbase (mm)" name="wheelbase" type="number" placeholder="e.g. 1285" defaultValue={initialData?.wheelbase} />

        {/* ── Drivetrain ────────────────────────────────── */}
        <SectionHeader title="Drivetrain & Performance" />

        <InputField label="Battery Capacity (kWh)" name="batteryCap" type="number" step="0.1" required placeholder="e.g. 3.7" defaultValue={initialData?.batteryCap} />
        <InputField label="Battery Type" name="batteryType" placeholder="e.g. Lithium Ion" defaultValue={initialData?.batteryType} />
        {is3W && (
          <InputField label="Peak Voltage (V)" name="peakVoltage" type="number" placeholder="e.g. 48" defaultValue={initialData?.peakVoltage} />
        )}
        <InputField label="Motor Type" name="motorType" placeholder="e.g. PMS Motor" defaultValue={initialData?.motorType} />
        <InputField label="Peak Power" name="peakPower" placeholder="e.g. 4.3 kW" defaultValue={initialData?.peakPower} />
        <InputField label="Peak Torque" name="peakTorque" placeholder="e.g. 22 Nm" defaultValue={initialData?.peakTorque} />
        <InputField label="Transmission" name="transmission" defaultValue={initialData?.transmission ?? 'Auto'} />
        {!is4W && (
          <InputField label="Max Gradability (%)" name="gradability" type="number" placeholder="e.g. 15" defaultValue={initialData?.gradability} />
        )}

        {/* ── Charging ──────────────────────────────────── */}
        <SectionHeader title="Charging" />

        <SelectField label="Charger Type" name="chargerType" value={chargerType} onChange={setChargerType}>
          <option value="Normal Charging">Normal Charging</option>
          <option value="Fast Charging">Fast Charging</option>
        </SelectField>

        <InputField label="Charging Time" name="chargingTime" placeholder="e.g. 6 Hrs 10 Minutes" defaultValue={initialData?.chargingTime} />

        {chargerType === 'Fast Charging' && (
          <InputField label="Fast Charging Time" name="fastChargingTime" placeholder="e.g. 0-80% in 37 Minutes" defaultValue={initialData?.fastChargingTime} />
        )}

        <SelectField
          label="On-board Charger"
          name="onBoardCharger"
          value={initialData?.onBoardCharger ? 'true' : 'false'}
          onChange={() => {}}
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </SelectField>

        {/* ── Cargo Specifications ──────────────────────── */}
        {isCargo && (
          <>
            <SectionHeader title="Cargo Specifications" />
            <InputField label="Payload Capacity (kg)" name="payload" type="number" placeholder="e.g. 500" defaultValue={initialData?.payload} />
            <InputField label="Volume (ft³)" name="volume" type="number" step="0.01" placeholder="e.g. 25.46" defaultValue={initialData?.volume} />
            <InputField label="Container Dimensions (L x B x H)" name="containerDims" placeholder="e.g. 1840 x 1425 x 275" defaultValue={initialData?.containerDims} colSpan />
          </>
        )}

        {/* ── Media ─────────────────────────────────────── */}
        <VehicleImageUpload
          initialMainImage={initialData?.mainImage}
          initialSideImages={initialData?.sideImages}
        />

        {/* ── Descriptions ──────────────────────────────── */}
        <SectionHeader title="Detailed Descriptions" />
        <TextareaField label="Overview" name="overviewText" placeholder="Write an engaging overview paragraph about this vehicle..." defaultValue={initialData?.overviewText} />
        <TextareaField label="Technical Specifications" name="techSpecsText" placeholder="Write about battery, charging, and tech specs..." defaultValue={initialData?.techSpecsText} />
        <TextareaField label="Performance & Efficiency" name="performanceText" placeholder="Write about performance, efficiency, and maneuverability..." defaultValue={initialData?.performanceText} />
        <TextareaField label="Leasing Information" name="leasingInfoText" placeholder="Write about leasing terms, warranty, and benefits..." defaultValue={initialData?.leasingInfoText} />

        {/* ── Submit ────────────────────────────────────── */}
        <div className="md:col-span-2 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-background font-bold py-3 rounded-xl hover:bg-primary-dark transition-all electric-glow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
            ) : (
              <>
                {initialData ? <Edit2 className="w-4 h-4" /> : <Zap className="w-4 h-4 fill-current" />}
                {initialData ? 'Update Vehicle' : 'Add Vehicle to Catalog'}
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
