import React from 'react';

const INPUT_CLASS =
  'w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 focus:border-primary outline-none transition-all';
const LABEL_CLASS = 'text-[11px] font-bold uppercase tracking-wider text-white/50';

// ─── Section header ───────────────────────────────────────────

export function SectionHeader({ title }: { title: string }) {
  return (
    <div className="md:col-span-2 border-b border-white/5 pb-2 mt-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-primary">{title}</h3>
    </div>
  );
}

// ─── Labeled input ────────────────────────────────────────────

interface InputFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'number';
  required?: boolean;
  placeholder?: string;
  defaultValue?: string | number | null;
  step?: string;
  colSpan?: boolean;
}

export function InputField({
  label, name, type = 'text', required, placeholder, defaultValue, step, colSpan,
}: InputFieldProps) {
  return (
    <div className={`space-y-2${colSpan ? ' md:col-span-2' : ''}`}>
      <label className={LABEL_CLASS}>{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue ?? ''}
        step={step}
        className={INPUT_CLASS}
      />
    </div>
  );
}

// ─── Labeled select ───────────────────────────────────────────

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  colSpan?: boolean;
}

export function SelectField({ label, name, value, onChange, children, colSpan }: SelectFieldProps) {
  return (
    <div className={`space-y-2${colSpan ? ' md:col-span-2' : ''}`}>
      <label className={LABEL_CLASS}>{label}</label>
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${INPUT_CLASS} appearance-none`}
      >
        {children}
      </select>
    </div>
  );
}

// ─── Labeled textarea ─────────────────────────────────────────

interface TextareaFieldProps {
  label: string;
  name: string;
  rows?: number;
  placeholder?: string;
  defaultValue?: string | null;
}

export function TextareaField({ label, name, rows = 3, placeholder, defaultValue }: TextareaFieldProps) {
  return (
    <div className="md:col-span-2 space-y-2">
      <label className={LABEL_CLASS}>{label}</label>
      <textarea
        name={name}
        rows={rows}
        placeholder={placeholder}
        defaultValue={defaultValue ?? ''}
        className={`${INPUT_CLASS} resize-none py-3`}
      />
    </div>
  );
}
