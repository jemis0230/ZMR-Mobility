import FaqAccordion from '@/presentation/components/FaqAccordion';
import { getFaqs, type FaqItem } from '@/app/actions/faqActions';

const FALLBACK_FAQS: FaqItem[] = [
  {
    id: 'f1',
    question: 'What types of electric vehicles does ZMR Mobility offer?',
    answer: 'We offer a curated fleet across 5 categories: 2-wheelers (electric scooters & e-bikes), 3-wheeler cargo vehicles for last-mile logistics, 3-wheeler passenger auto-rickshaws, 4-wheeler passenger cars, and 4-wheeler cargo vans. All are pre-owned, fully refurbished, and IoT-enabled.',
    order: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'f2',
    question: 'How does the EV leasing process work?',
    answer: "It's a 4-step process: Browse our fleet and select your vehicle category → Submit your requirements (city, use-case, fleet size) → Complete a 100% paperless KYC in under 48 hours → Your IoT-enabled EV is delivered to your doorstep, fully serviced and ready to earn.",
    order: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'f3',
    question: 'What is included in the 24+ month warranty?',
    answer: "Every ZMR vehicle comes with 18 months OEM warranty plus 6 months ZMR extended warranty. The package also includes Roadside Assistance (RSA), free charging hours, and a buyback guarantee — so you're covered end to end.",
    order: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'f4',
    question: 'Can I track my EV in real-time?',
    answer: 'Yes. All ZMR vehicles are IoT-enabled with real-time GPS tracking, geo-fencing alerts, battery health monitoring, and remote mobilize/immobilize capability. You get full visibility from any device, 24/7.',
    order: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'f5',
    question: "Who can avail ZMR's EV leasing services?",
    answer: 'Our fleet is designed for gig workers (delivery partners, cab drivers), women entrepreneurs, small businesses, and large B2B fleets. We operate across Tier-1, Tier-2, and Tier-3 cities in India, with a focus on making clean mobility accessible to everyone.',
    order: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'f6',
    question: 'What financing options are available?',
    answer: "We offer flexible EMI plans with minimal down payment, tailored to your income and use-case. Our team works with you to find a plan that fits — whether you're an individual gig worker or managing a fleet of 50+ vehicles.",
    order: 6,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default async function FaqSection() {
  let faqs: FaqItem[] = FALLBACK_FAQS;
  try {
    const result = await getFaqs();
    if (result.success && result.data && result.data.length > 0) {
      faqs = result.data;
    }
  } catch {}
  return <FaqAccordion faqs={faqs} />;
}
