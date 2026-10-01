import type { Metadata } from 'next';
import SellWizard from './SellWizard';

export const metadata: Metadata = {
  title: 'Sell Your EV | ZMR Mobility',
  description: 'Get the best value for your used electric vehicle. Submit your EV details and our team will reach out with a valuation.',
};

export default function SellEvPage() {
  return (
    <main className="min-h-screen bg-background pt-24 lg:pt-36 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-primary text-xs font-bold uppercase tracking-widest">Used EV Procurement</span>
          <h1 className="text-4xl md:text-5xl font-black mt-3 mb-4 text-ink leading-tight">
            Sell Your <span className="text-primary">Electric Vehicle</span>
          </h1>
          <p className="text-ink/65 text-lg max-w-lg mx-auto">
            Answer a few quick questions and our team will contact you with the best offer for your EV.
          </p>
        </div>
        <SellWizard />
      </div>
    </main>
  );
}
