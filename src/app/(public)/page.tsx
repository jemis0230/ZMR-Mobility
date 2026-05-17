import { Suspense } from 'react';
import Hero from "@/presentation/components/Hero";
import LeasingContactForm from "@/presentation/components/LeasingContactForm";
import FaqSection from "./_components/FaqSection";

export const revalidate = 3600;

export const metadata = {
  title: "ZMR Mobility | India's Technology-First EV Asset Management Company",
  description: "ZMR Mobility offers affordable, reliable electric vehicle leasing, IoT monitoring, and comprehensive aftersales support for individuals, gig workers, and B2B fleets across India.",
};

function FaqSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="h-14 rounded-xl bg-white/5" />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Hero />

      {/* FAQ */}
      <section className="py-24 px-6 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-12 gap-16 items-start">
              {/* Left Column */}
              <div className="lg:col-span-5">
                <span className="text-primary text-xs font-bold uppercase tracking-widest">Support Center</span>
                <h2 className="text-4xl md:text-5xl font-black mt-3 mb-6 leading-tight text-white">
                  Frequently Asked <span className="text-primary">Questions</span>
                </h2>
                <p className="text-white/50 text-lg leading-relaxed mb-8">
                  Got questions about EV leasing, IoT tracking, or our refurbishment process?
                  We've compiled answers to the most common queries to help you make
                  an informed decision for your mobility needs.
                </p>
                <div className="glass-card p-6 border-white/5 bg-white/[0.02]">
                  <h4 className="font-bold text-white mb-2">Still have questions?</h4>
                  <p className="text-sm text-white/40 mb-4">Our team is here to help you drive into the future.</p>
                  <a href="mailto:info@zmrmobility.in" className="text-primary font-bold text-sm hover:underline flex items-center gap-2">
                    Contact our experts <span>→</span>
                  </a>
                </div>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-7">
                <Suspense fallback={<FaqSkeleton />}>
                  <FaqSection />
                </Suspense>
              </div>
            </div>
          </div>
        </section>

      {/* Sell Your EV */}
      <section id="procurement" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-10 md:p-14 text-center" style={{ border: '1px solid rgba(0,255,133,0.1)', boxShadow: '0 0 60px rgba(0,255,133,0.04)' }}>
            <span className="text-primary text-xs font-bold uppercase tracking-widest">Used EV Procurement</span>
            <h2 className="text-3xl md:text-4xl font-black mt-3 mb-4 text-white leading-tight">
              Ready to Sell Your <span className="text-primary">Electric Vehicle?</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto mb-8 text-lg">
              Get the best valuation for your used EV. Answer a few quick questions and our team will contact you with an offer.
            </p>
            <a
              href="/sell-ev"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-background transition-all"
              style={{ background: 'linear-gradient(135deg,#00FF85,#00d46e)', boxShadow: '0 0 30px rgba(0,255,133,0.35)' }}
            >
              Start Selling My EV
            </a>
          </div>
        </div>
      </section>

      {/* Contact Form — above footer */}
      <section id="contact" className="py-24 px-6 bg-white/[0.02] border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-primary text-xs font-bold uppercase tracking-widest">Get in Touch</span>
            <h2 className="text-4xl font-black mt-3 mb-4">Have a Question? <span className="text-primary">Let's Talk.</span></h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Whether you're exploring EVs, need a fleet solution, or just want to know more — fill in your details and our team will reach out to you.
            </p>
          </div>
          <LeasingContactForm />
        </div>
      </section>
    </main>
  );
}
