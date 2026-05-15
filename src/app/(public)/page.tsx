import Hero from "@/presentation/components/Hero";
import LeasingContactForm from "@/presentation/components/LeasingContactForm";
import FaqAccordion from "@/presentation/components/FaqAccordion";
import { getFaqs } from "@/app/actions/faqActions";

export const metadata = {
  title: "ZMR Mobility | India's Technology-First EV Asset Management Company",
  description: "ZMR Mobility offers affordable, reliable electric vehicle leasing, IoT monitoring, and comprehensive aftersales support for individuals, gig workers, and B2B fleets across India.",
};

const FALLBACK_FAQS = [
  {
    id: 'f1',
    question: 'What types of electric vehicles does ZMR Mobility offer?',
    answer: 'We offer a curated fleet across 5 categories: 2-wheelers (electric scooters & e-bikes), 3-wheeler cargo vehicles for last-mile logistics, 3-wheeler passenger auto-rickshaws, 4-wheeler passenger cars, and 4-wheeler cargo vans. All are pre-owned, fully refurbished, and IoT-enabled.',
  },
  {
    id: 'f2',
    question: 'How does the EV leasing process work?',
    answer: 'It\'s a 4-step process: Browse our fleet and select your vehicle category → Submit your requirements (city, use-case, fleet size) → Complete a 100% paperless KYC in under 48 hours → Your IoT-enabled EV is delivered to your doorstep, fully serviced and ready to earn.',
  },
  {
    id: 'f3',
    question: 'What is included in the 24+ month warranty?',
    answer: 'Every ZMR vehicle comes with 18 months OEM warranty plus 6 months ZMR extended warranty. The package also includes Roadside Assistance (RSA), free charging hours, and a buyback guarantee — so you\'re covered end to end.',
  },
  {
    id: 'f4',
    question: 'Can I track my EV in real-time?',
    answer: 'Yes. All ZMR vehicles are IoT-enabled with real-time GPS tracking, geo-fencing alerts, battery health monitoring, and remote mobilize/immobilize capability. You get full visibility from any device, 24/7.',
  },
  {
    id: 'f5',
    question: 'Who can avail ZMR\'s EV leasing services?',
    answer: 'Our fleet is designed for gig workers (delivery partners, cab drivers), women entrepreneurs, small businesses, and large B2B fleets. We operate across Tier-1, Tier-2, and Tier-3 cities in India, with a focus on making clean mobility accessible to everyone.',
  },
  {
    id: 'f6',
    question: 'What financing options are available?',
    answer: 'We offer flexible EMI plans with minimal down payment, tailored to your income and use-case. Our team works with you to find a plan that fits — whether you\'re an individual gig worker or managing a fleet of 50+ vehicles.',
  },
];

export default async function Home() {
  let faqs: any[] = [];

  try {
    const result = await getFaqs();
    if (result.success && result.data) {
      faqs = result.data;
    }
  } catch (error) {
    console.error("Home Page Fetch FAQs Error:", error);
  }

  const displayFaqs = faqs.length > 0 ? faqs : FALLBACK_FAQS;

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
                <FaqAccordion faqs={displayFaqs} />
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
