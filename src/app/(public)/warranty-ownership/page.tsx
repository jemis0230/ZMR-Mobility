import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import PolicySection from "@/presentation/components/PolicySection";
import FaqAccordion from "@/presentation/components/FaqAccordion";
import { getPolicyItems } from "@/app/actions/faqActions";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Warranty & Ownership Support | ZMR Mobility",
  description:
    "Warranty confirmation, ownership (RC) transfer, NOC assistance, insurance and vehicle buyback — what to check when you buy a pre-owned EV from ZMR Mobility.",
  alternates: { canonical: "/warranty-ownership" },
};

export default async function WarrantyOwnershipPage() {
  const items = await getPolicyItems();

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.question,
      acceptedAnswer: { "@type": "Answer", text: i.answer },
    })),
  };

  return (
    <main className="min-h-screen bg-cream">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <div className="pt-24 lg:pt-40 pb-20 px-4 md:px-6 max-w-7xl mx-auto">
        <nav className="flex items-center gap-1.5 text-xs font-semibold text-ink/70 mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="w-3 h-3" aria-hidden />
          <span aria-current="page" className="text-forest">Warranty &amp; Ownership</span>
        </nav>

        <PolicySection items={items} headingLevel="h1" id="policies" />

        <section aria-labelledby="policy-faq-title" className="mt-16 rounded-3xl bg-white border border-ink/10 p-6 md:p-10">
          <h2 id="policy-faq-title" className="text-2xl md:text-3xl font-black text-forest mb-6">Common questions</h2>
          <FaqAccordion faqs={items.map((i) => ({ id: i.key, question: i.question, answer: i.answer }))} />
        </section>
      </div>
    </main>
  );
}
