import Link from "next/link";
import { ShieldCheck, FileCheck2, FileSignature, Umbrella, RefreshCcw, Phone, Mail, ArrowRight } from "lucide-react";
import FaqAccordion from "./FaqAccordion";
import { POLICY_CONTACT, type PolicyItem, type PolicyTopicKey } from "@/lib/policies";

const ICONS: Record<PolicyTopicKey, typeof ShieldCheck> = {
  warranty: ShieldCheck,
  ownership_transfer: FileCheck2,
  noc: FileSignature,
  insurance: Umbrella,
  buyback: RefreshCcw,
};

function ContactRow({ dark = false }: { dark?: boolean }) {
  const btn = dark
    ? "bg-cream text-forest hover:bg-white"
    : "bg-primary text-white hover:bg-primary-dark";
  const ghost = dark
    ? "border-cream/40 text-cream hover:bg-white/10"
    : "border-ink/20 text-forest hover:border-primary bg-white";
  return (
    <div className="flex flex-wrap gap-3">
      <a href={POLICY_CONTACT.phoneHref} className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-colors ${btn}`}>
        <Phone className="w-4 h-4" aria-hidden /> Call {POLICY_CONTACT.phone}
      </a>
      <a href={`mailto:${POLICY_CONTACT.email}?subject=${encodeURIComponent("Warranty & ownership question")}`} className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition-colors ${ghost}`}>
        <Mail className="w-4 h-4" aria-hidden /> {POLICY_CONTACT.email}
      </a>
    </div>
  );
}

/** Full section: dedicated page and home page. */
export default function PolicySection({
  items, headingLevel = "h2", showPageLink = false, id = "warranty-ownership",
}: { items: PolicyItem[]; headingLevel?: "h1" | "h2"; showPageLink?: boolean; id?: string }) {
  const Heading = headingLevel;
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-36">
      <div className="max-w-3xl">
        <p className="text-primary text-xs font-bold uppercase tracking-widest">Buy with confidence</p>
        <Heading id={`${id}-title`} className="text-3xl md:text-4xl font-black mt-2 text-forest">Warranty &amp; Ownership Support</Heading>
        <p className="text-ink/80 mt-3 leading-relaxed">
          Warranty, registration transfer, NOC, insurance and buyback terms can differ from vehicle to vehicle.
          Here is what to check — and our team will confirm the exact terms for the vehicle you choose before you buy.
        </p>
      </div>

      <ul className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          const Icon = ICONS[item.key];
          return (
            <li key={item.key} className="rounded-2xl bg-white border border-ink/10 p-6 shadow-card">
              <span className="w-11 h-11 rounded-xl bg-tint flex items-center justify-center">
                <Icon className="w-5 h-5 text-leaf" aria-hidden />
              </span>
              <h3 className="mt-4 font-bold text-lg text-forest">{item.title}</h3>
              <p className="mt-2 text-sm text-ink/80 leading-relaxed whitespace-pre-line">{item.answer}</p>
            </li>
          );
        })}
        <li className="rounded-2xl bg-forest text-cream p-6 flex flex-col justify-between gap-5 focus-on-dark">
          <div>
            <h3 className="font-bold text-lg text-lime">Talk to our team</h3>
            <p className="mt-2 text-sm text-cream/90 leading-relaxed">
              Share the vehicle you are interested in and we will confirm its warranty, transfer, NOC, insurance and buyback terms in writing.
            </p>
          </div>
          <ContactRow dark />
        </li>
      </ul>

      {showPageLink && (
        <Link href="/warranty-ownership" className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:gap-2.5 transition-all">
          Read the full Warranty &amp; Ownership guide <ArrowRight className="w-4 h-4" aria-hidden />
        </Link>
      )}
    </section>
  );
}

/** Compact block for vehicle detail pages. */
export function VehiclePolicySummary({ items, vehicleName, recordedWarranty }: { items: PolicyItem[]; vehicleName: string; recordedWarranty?: string | null }) {
  return (
    <section aria-labelledby="vehicle-policy-title" className="rounded-3xl bg-tint border border-ink/10 p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 id="vehicle-policy-title" className="text-2xl md:text-3xl font-black text-forest">Warranty &amp; Ownership Support</h2>
          <p className="text-sm text-ink/80 mt-1">For the {vehicleName}. Our team confirms the exact terms before purchase.</p>
        </div>
        <Link href="/warranty-ownership" className="text-sm font-bold text-primary hover:underline shrink-0">Full guide</Link>
      </div>

      <dl className="mb-5 rounded-2xl bg-white border border-ink/10 p-4 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
        <dt className="text-xs font-bold uppercase tracking-wider text-ink/70 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-leaf" aria-hidden /> Warranty recorded for this vehicle
        </dt>
        <dd className="text-sm font-semibold text-forest">{recordedWarranty?.trim() ? recordedWarranty : "Not provided — contact us to confirm"}</dd>
      </dl>

      <FaqAccordion
        faqs={items.map((i) => ({ id: i.key, question: i.title, answer: i.answer }))}
        numbered={false}
        headingLevel="h3"
      />

      <div className="mt-6"><ContactRow /></div>
    </section>
  );
}
