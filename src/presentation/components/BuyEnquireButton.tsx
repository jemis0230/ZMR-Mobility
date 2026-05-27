'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import EVConsultationModal from './EVConsultationModal';

interface BuyEnquireButtonProps {
  vehicleId: string;
  vehicleName: string;
  label?: string;
}

export default function BuyEnquireButton({ vehicleId, vehicleName, label = 'Enquire to Buy' }: BuyEnquireButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative w-full overflow-hidden rounded-2xl py-4 text-base font-extrabold tracking-wide flex items-center justify-center gap-2 transition-all duration-200"
        style={{
          background: 'linear-gradient(135deg, #00FF85 0%, #00d46e 100%)',
          color: '#050d0a',
          boxShadow: '0 0 40px rgba(0,255,133,0.40), 0 6px 24px rgba(0,0,0,0.35)',
        }}
      >
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
          className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 pointer-events-none"
        />
        <span className="relative">{label}</span>
        <ChevronRight className="relative w-5 h-5" />
      </motion.button>

      <EVConsultationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        vehicleId={vehicleId}
        vehicleName={vehicleName}
      />
    </>
  );
}
