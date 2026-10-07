'use client';

import { useId, useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface Faq {
  id: string;
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  faqs: Faq[];
  /** Number badges (01, 02 …) before each question */
  numbered?: boolean;
  /** Heading level used for questions (keeps the page outline valid) */
  headingLevel?: 'h3' | 'h4';
}

/**
 * Accessible single-open accordion. Answers stay in the HTML (good for search
 * engines) and expand with a CSS grid-rows transition — no animation library.
 */
export default function FaqAccordion({ faqs, numbered = true, headingLevel = 'h3' }: FaqAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const uid = useId();
  const Heading = headingLevel;

  return (
    <div className="w-full space-y-3">
      {faqs.map((faq, i) => {
        const isOpen = openId === faq.id;
        const panelId = `${uid}-panel-${i}`;
        const buttonId = `${uid}-button-${i}`;
        return (
          <div
            key={faq.id}
            className={`rounded-2xl bg-white border transition-colors ${isOpen ? 'border-primary/50 shadow-card' : 'border-ink/10'}`}
          >
            <Heading className="m-0">
              <button
                id={buttonId}
                type="button"
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="w-full px-5 md:px-6 py-5 flex items-center justify-between text-left gap-4 group rounded-2xl"
              >
                {numbered && (
                  <span
                    aria-hidden
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-colors ${
                      isOpen ? 'bg-lime text-forest' : 'bg-tint text-forest'
                    }`}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                )}
                <span className="flex-1 text-[15px] font-semibold leading-snug text-forest group-hover:text-primary transition-colors">
                  {faq.question}
                </span>
                <span className="flex-shrink-0" aria-hidden>
                  {isOpen ? <Minus className="w-4 h-4 text-primary" /> : <Plus className="w-4 h-4 text-ink/70 group-hover:text-primary" />}
                </span>
              </button>
            </Heading>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
            >
              <div className="overflow-hidden" aria-hidden={!isOpen}>
                <p className={`px-5 md:px-6 pb-5 pt-0 text-sm text-ink/80 leading-relaxed ${numbered ? 'md:pl-[4.25rem]' : ''}`}>
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
