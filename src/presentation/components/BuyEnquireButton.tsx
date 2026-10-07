'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ChevronRight } from 'lucide-react';
// Enquiry modal (and its animation library) loads only when opened.
const EVConsultationModal = dynamic(() => import('./EVConsultationModal'), { ssr: false });

interface BuyEnquireButtonProps {
  vehicleId: string;
  vehicleName: string;
  label?: string;
}

export default function BuyEnquireButton({ vehicleId, vehicleName, label = 'Enquire to Buy' }: BuyEnquireButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full rounded-2xl py-4 text-base font-extrabold tracking-wide flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark active:scale-[0.99] text-white transition-colors electric-glow"
      >
        <span>{label}</span>
        <ChevronRight className="w-5 h-5" aria-hidden />
      </button>

      {isOpen && (
        <EVConsultationModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          vehicleId={vehicleId}
          vehicleName={vehicleName}
        />
      )}
    </>
  );
}
