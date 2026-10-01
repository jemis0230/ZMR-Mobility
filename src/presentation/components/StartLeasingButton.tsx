'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import EVConsultationModal from './EVConsultationModal';

interface StartLeasingButtonProps {
  vehicleId: string;
  vehicleName: string;
}

export default function StartLeasingButton({ vehicleId, vehicleName }: StartLeasingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative w-full overflow-hidden rounded-2xl py-4 text-base font-extrabold tracking-wide flex items-center justify-center gap-2 transition-all duration-200"
        style={{
          background: 'linear-gradient(135deg, #1A73E8 0%, #1557B0 100%)',
          color: '#ffffff',
          boxShadow: '0 0 40px rgba(26,115,232,0.40), 0 6px 24px rgba(0,0,0,0.35)',
        }}
        id="start-leasing-btn"
      >
        {/* Shimmer sweep */}
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
          className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-ink/25 to-transparent skew-x-12 pointer-events-none"
        />
        <span className="relative">Start Leasing</span>
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
