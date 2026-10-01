'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

interface Faq {
  id: string;
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  faqs: Faq[];
}

export default function FaqAccordion({ faqs }: FaqAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="w-full space-y-3">
      {faqs.map((faq, i) => {
        const isOpen = openId === faq.id;
        return (
          <motion.div
            key={faq.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4, ease: 'easeOut' }}
            className="glass-card overflow-hidden"
            style={{
              border: isOpen
                ? '1px solid rgba(26,115,232,0.25)'
                : '1px solid rgba(15,23,42,0.08)',
              boxShadow: isOpen ? '0 0 24px rgba(26,115,232,0.06)' : 'none',
              transition: 'border-color 0.3s, box-shadow 0.3s',
            }}
          >
            <button
              onClick={() => setOpenId(isOpen ? null : faq.id)}
              className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 group"
              aria-expanded={isOpen}
            >
              {/* Number badge */}
              <span
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-colors"
                style={{
                  background: isOpen ? 'rgba(26,115,232,0.15)' : 'rgba(15,23,42,0.04)',
                  color: isOpen ? '#1A73E8' : 'rgba(15,23,42,0.45)',
                  border: isOpen ? '1px solid rgba(26,115,232,0.3)' : '1px solid rgba(15,23,42,0.08)',
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>

              <span className="flex-1 text-[15px] font-semibold leading-snug text-ink group-hover:text-primary transition-colors">
                {faq.question}
              </span>

              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.25 }}
                className="flex-shrink-0"
              >
                {isOpen
                  ? <Minus className="w-4 h-4 text-primary" />
                  : <Plus className="w-4 h-4 text-ink/60 group-hover:text-primary transition-colors" />
                }
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="answer"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="px-6 pb-5 pt-1">
                    <div className="pl-11 text-sm text-ink/70 leading-relaxed border-l border-primary/20">
                      {faq.answer}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
