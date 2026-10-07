"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { TEST_DRIVE_CITIES, TEST_DRIVE_MAX_DAYS_AHEAD, todayInIndia, addDays } from "@/lib/schemas/testDrive";

type Field = "name" | "phone" | "city" | "vehicleId" | "preferredDate" | "message";
type VehicleOption = { id: string; label: string };

const INPUT =
  "w-full rounded-xl border bg-white px-4 py-3 text-sm text-forest placeholder:text-ink/50 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/25";

function validate(values: Record<Field, string>, today: string): Partial<Record<Field, string>> {
  const errors: Partial<Record<Field, string>> = {};
  if (values.name.trim().length < 2) errors.name = "Please enter your full name.";
  const phone = values.phone.replace(/[\s\-+]/g, "").replace(/^91(?=\d{10}$)/, "");
  if (!/^[6-9]\d{9}$/.test(phone)) errors.phone = "Enter a valid 10-digit Indian mobile number.";
  if (!values.city) errors.city = "Please choose your preferred city.";
  if (!values.preferredDate) errors.preferredDate = "Please choose a preferred date.";
  else if (values.preferredDate < today) errors.preferredDate = "Please choose today or a later date.";
  else if (values.preferredDate > addDays(today, TEST_DRIVE_MAX_DAYS_AHEAD)) errors.preferredDate = `Please choose a date within the next ${TEST_DRIVE_MAX_DAYS_AHEAD} days.`;
  if (values.message.length > 1000) errors.message = "Message is too long (max 1000 characters).";
  return errors;
}

export default function TestDriveModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const uid = useId();
  const today = todayInIndia();
  const [values, setValues] = useState<Record<Field, string>>({ name: "", phone: "", city: "", vehicleId: "", preferredDate: "", message: "" });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [submitError, setSubmitError] = useState("");
  const [vehicles, setVehicles] = useState<VehicleOption[] | null>(null);
  const [vehiclesFailed, setVehiclesFailed] = useState(false);

  // Native <dialog>: focus trap, Escape to close and inert background come for free.
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    if (!open || vehicles !== null) return;
    fetch("/api/test-drive")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((j) => setVehicles(j.data as VehicleOption[]))
      .catch(() => { setVehicles([]); setVehiclesFailed(true); });
  }, [open, vehicles]);

  const id = (f: Field) => `${uid}-${f}`;
  const set = (f: Field) => (v: string) => {
    setValues((s) => ({ ...s, [f]: v }));
    if (errors[f]) setErrors((e) => ({ ...e, [f]: undefined }));
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate(values, today);
    setErrors(found);
    setSubmitError("");
    const first = (Object.keys(found) as Field[])[0];
    if (first) {
      document.getElementById(id(first))?.focus();
      return;
    }
    setStatus("sending");
    try {
      const website = (e.currentTarget.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";
      const res = await fetch("/api/test-drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, website }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        const field = json?.details?.field as Field | undefined;
        if (field && field in values) {
          setErrors({ [field]: json.error });
          setStatus("idle");
          document.getElementById(id(field))?.focus();
          return;
        }
        throw new Error(json?.error || "Request failed");
      }
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setSubmitError(err instanceof Error && err.message !== "Request failed" ? err.message : "We couldn’t send your request. Please try again, or call us on +91 90452 22999.");
    }
  }

  function handleClose() {
    onClose();
    if (status === "sent") {
      setValues({ name: "", phone: "", city: "", vehicleId: "", preferredDate: "", message: "" });
      setStatus("idle");
    }
  }

  const fieldError = (f: Field) =>
    errors[f] ? (
      <p id={`${id(f)}-err`} className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-red-700">
        <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden /> {errors[f]}
      </p>
    ) : null;
  const a11y = (f: Field) => ({
    id: id(f),
    "aria-invalid": errors[f] ? true : undefined,
    "aria-describedby": errors[f] ? `${id(f)}-err` : undefined,
  });
  const border = (f: Field) => (errors[f] ? "border-red-600" : "border-ink/20");

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={`${uid}-title`}
      onClose={handleClose}
      onClick={(e) => { if (e.target === dialogRef.current) handleClose(); }}
      className="w-[min(560px,calc(100vw-2rem))] max-h-[calc(100dvh-2rem)] rounded-3xl bg-cream p-0 text-forest shadow-2xl backdrop:bg-forest/50"
    >
      <div className="relative p-6 sm:p-8">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close test drive form"
          className="absolute right-4 top-4 rounded-full p-2 text-ink/70 hover:bg-white hover:text-forest"
        >
          <X className="w-5 h-5" aria-hidden />
        </button>

        {status === "sent" ? (
          <div className="py-6 text-center" role="status">
            <CheckCircle2 className="mx-auto w-12 h-12 text-leaf" aria-hidden />
            <h2 id={`${uid}-title`} className="mt-4 text-2xl font-black">Request received</h2>
            <p className="mt-2 text-sm text-ink/80">
              Thanks, {values.name.trim().split(" ")[0]}. Our team will call you to confirm a time.
              Your preferred date ({new Date(`${values.preferredDate}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}) is not booked until we confirm it with you.
            </p>
            <button type="button" onClick={handleClose} className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-dark">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Test drive</p>
            <h2 id={`${uid}-title`} className="mt-1 text-2xl font-black">Book a test drive</h2>
            <p className="mt-1 text-sm text-ink/75">
              Tell us when suits you. The date is a preference — our team will call to confirm availability and a time.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor={id("name")} className="mb-1.5 block text-sm font-bold">Full name <span aria-hidden className="text-red-700">*</span></label>
                <input {...a11y("name")} name="name" autoComplete="name" required value={values.name} onChange={(e) => set("name")(e.target.value)} className={`${INPUT} ${border("name")}`} />
                {fieldError("name")}
              </div>
              <div>
                <label htmlFor={id("phone")} className="mb-1.5 block text-sm font-bold">Mobile number <span aria-hidden className="text-red-700">*</span></label>
                <input {...a11y("phone")} name="phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="10-digit mobile" required value={values.phone} onChange={(e) => set("phone")(e.target.value)} className={`${INPUT} ${border("phone")}`} />
                {fieldError("phone")}
              </div>
              <div>
                <label htmlFor={id("city")} className="mb-1.5 block text-sm font-bold">Preferred city <span aria-hidden className="text-red-700">*</span></label>
                <select {...a11y("city")} name="city" required value={values.city} onChange={(e) => set("city")(e.target.value)} className={`${INPUT} ${border("city")}`}>
                  <option value="">Choose a city</option>
                  {TEST_DRIVE_CITIES.map((c) => <option key={c.city} value={c.city}>{c.city}</option>)}
                </select>
                {fieldError("city")}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor={id("vehicleId")} className="mb-1.5 block text-sm font-bold">Vehicle <span className="font-normal text-ink/70">(optional)</span></label>
                <select {...a11y("vehicleId")} name="vehicleId" value={values.vehicleId} onChange={(e) => set("vehicleId")(e.target.value)} disabled={vehicles === null} className={`${INPUT} ${border("vehicleId")}`}>
                  <option value="">{vehicles === null ? "Loading available vehicles…" : "No preference / not sure yet"}</option>
                  {vehicles?.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
                </select>
                {vehiclesFailed && <p className="mt-1.5 text-xs text-ink/70">The vehicle list couldn’t load — mention the vehicle in your message instead.</p>}
                {fieldError("vehicleId")}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor={id("preferredDate")} className="mb-1.5 block text-sm font-bold">Preferred date <span aria-hidden className="text-red-700">*</span></label>
                <input {...a11y("preferredDate")} name="preferredDate" type="date" required min={today} max={addDays(today, TEST_DRIVE_MAX_DAYS_AHEAD)} value={values.preferredDate} onChange={(e) => set("preferredDate")(e.target.value)} className={`${INPUT} ${border("preferredDate")}`} />
                {fieldError("preferredDate")}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor={id("message")} className="mb-1.5 block text-sm font-bold">Message <span className="font-normal text-ink/70">(optional)</span></label>
                <textarea {...a11y("message")} name="message" rows={3} maxLength={1000} value={values.message} onChange={(e) => set("message")(e.target.value)} placeholder="Preferred time of day, questions about the vehicle…" className={`${INPUT} ${border("message")} resize-y`} />
                {fieldError("message")}
              </div>
              {/* Honeypot for bots — hidden from people and assistive tech */}
              <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label htmlFor={`${uid}-website`}>Website</label>
                <input id={`${uid}-website`} name="website" tabIndex={-1} autoComplete="off" />
              </div>
            </div>

            {status === "error" && (
              <p role="alert" className="mt-4 flex gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden /> {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-70"
            >
              {status === "sending" ? <><Loader2 className="w-4 h-4 animate-spin" aria-hidden /> Sending…</> : "Request test drive"}
            </button>
            <p className="mt-3 text-center text-[11px] text-ink/65">We use your details only to arrange this test drive.</p>
          </form>
        )}
      </div>
    </dialog>
  );
}
