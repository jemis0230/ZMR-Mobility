"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Zap, Package, Users, Car } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const categories = [
  {
    name: "2 Wheeler",
    slug: "2-wheeler",
    icon: Zap,
    image: "/category-images/2-wheeler.webp",
    fallbackImage: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=400",
    description: "Electric Scooters & E-Bikes for personal & delivery use."
  },
  {
    name: "3 Wheeler (Cargo)",
    slug: "3-wheeler-cargo",
    icon: Package,
    image: "/category-images/3-wheeler-cargo.webp",
    fallbackImage: "https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?auto=format&fit=crop&q=80&w=400",
    description: "Reliable electric loaders for last-mile logistics."
  },
  {
    name: "3 Wheeler (Passenger)",
    slug: "3-wheeler-passenger",
    icon: Users,
    image: "/category-images/3-wheeler-passenger.webp",
    fallbackImage: "https://images.unsplash.com/photo-1567113463300-102a7eb3cb26?auto=format&fit=crop&q=80&w=400",
    description: "Eco-friendly auto-rickshaws for urban transport."
  },
  {
    name: "4 Wheeler (Passenger)",
    slug: "4-wheeler-passenger",
    icon: Car,
    image: "/category-images/4-wheeler-passenger.webp",
    fallbackImage: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=400",
    description: "Premium electric cars for personal & fleet use."
  },
  {
    name: "4 Wheeler (Cargo)",
    slug: "4-wheeler-cargo",
    icon: Package,
    image: "/category-images/4-wheeler-cargo.webp",
    fallbackImage: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=400",
    description: "Heavy-duty electric cargo vans for logistics."
  }
];

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'leasing' | 'buying' | 'rent';
}

function CategoryCardImage({
  image,
  fallbackImage,
  alt,
}: {
  image: string;
  fallbackImage: string;
  alt: string;
}) {
  const [src, setSrc] = useState(image);

  return (
    <Image
      src={src}
      alt={alt}
      fill
      loading="eager"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      onError={() => {
        if (src !== fallbackImage) {
          setSrc(fallbackImage);
        }
      }}
      className="object-contain transition-transform duration-500 group-hover:scale-110"
    />
  );
}

export default function CategoryModal({ isOpen, onClose, mode = 'leasing' }: CategoryModalProps) {
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/75 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{ willChange: 'transform, opacity' }}
            className="relative w-[96vw] max-w-[1400px] bg-secondary/95 border border-ink/10 rounded-[2rem] overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 md:p-10 lg:p-12">
              <div className="flex justify-between items-start md:items-center mb-8 md:mb-12">
                <div>
                  <h2 className="text-2xl md:text-4xl font-bold tracking-tight">
                    Select <span className="text-primary">{mode === 'buying' ? 'Buying' : mode === 'rent' ? 'Rental' : 'Leasing'} Category</span>
                  </h2>
                  <p className="text-ink/60 mt-2 text-sm md:text-base">
                    {mode === 'buying'
                      ? 'Choose the type of EV you would like to purchase.'
                      : mode === 'rent'
                      ? 'Choose the type of EV you would like to rent.'
                      : 'Choose the type of EV you are interested in leasing.'}
                  </p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 md:p-3 rounded-full hover:bg-ink/10 text-ink/60 hover:text-ink transition-all bg-ink/5"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>

              {/* Responsive Container: Vertical list on mobile, 5-column grid on desktop */}
              <div className="flex flex-col lg:grid lg:grid-cols-5 gap-3 md:gap-5 w-full">
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={mode === 'buying' ? `/buying/vehicles/${cat.slug}` : mode === 'rent' ? `/rent/vehicles/${cat.slug}` : `/leasing/vehicles/${cat.slug}`}
                    onClick={onClose}
                    className="group relative flex flex-row lg:flex-col h-[90px] lg:h-[340px] rounded-2xl lg:rounded-[2rem] glass-card overflow-hidden border border-ink/[0.08] hover:border-primary/40 transition-all duration-500 lg:hover:-translate-y-2 lg:hover:shadow-[0_15px_40px_-10px_rgba(var(--primary),0.3)] bg-ink/5 hover:bg-ink/10"
                  >
                    {/* Desktop Image (Top) & Mobile Image (Right) */}
                    <div className="absolute lg:inset-x-0 lg:top-0 inset-y-0 right-0 w-[45%] lg:w-full lg:h-[60%] p-2 lg:p-8 flex items-center justify-center">
                      <div className="relative w-full h-full opacity-80 group-hover:opacity-100 transition-opacity">
                        <CategoryCardImage
                          image={cat.image}
                          fallbackImage={cat.fallbackImage}
                          alt={cat.name}
                        />
                      </div>
                    </div>

                    {/* Background Gradient for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-r lg:bg-gradient-to-t from-background/95 lg:from-background via-background/80 lg:via-background/20 to-transparent lg:to-transparent z-10" />

                    {/* Content */}
                    <div className="absolute inset-0 z-20 flex flex-col justify-center lg:justify-end p-5 lg:p-6 w-[75%] lg:w-full">
                      <div className="flex items-center gap-2 mb-1 lg:mb-3 opacity-80 lg:opacity-100">
                        <div className="p-1.5 lg:p-2 rounded-lg bg-primary/20 lg:bg-ink/5 backdrop-blur-sm border border-primary/20 lg:border-ink/10 lg:group-hover:border-primary/30 lg:group-hover:bg-primary/20 transition-colors">
                          <cat.icon className="w-3.5 h-3.5 lg:w-5 lg:h-5 text-primary lg:text-ink lg:group-hover:text-primary transition-colors" />
                        </div>
                        <span className="hidden lg:inline text-[11px] uppercase tracking-widest text-primary font-bold">Category</span>
                      </div>
                      
                      <h3 className="text-[15px] md:text-lg lg:text-xl font-bold text-ink leading-tight drop-shadow-md">
                        {cat.name}
                      </h3>
                      
                      <p className="hidden lg:block text-xs text-ink/65 mt-3 line-clamp-2 leading-relaxed">
                        {cat.description}
                      </p>

                      <div className="hidden lg:flex mt-5 items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 duration-500 ease-out">
                        Explore Fleet <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                    
                    {/* Mobile Arrow */}
                    <div className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-ink/5 group-hover:bg-primary text-ink/65 group-hover:text-white transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </Link>
                ))}
              </div>
              
              <div className="mt-8 md:mt-10 p-4 md:p-6 rounded-2xl bg-ink/5 border border-ink/[0.08] text-center flex flex-col sm:flex-row items-center justify-center gap-4">
                <p className="text-sm text-ink/70">
                  Not sure which electric vehicle suits your business needs?
                </p>
                <button className="text-sm text-white bg-primary hover:bg-primary-dark px-6 py-2.5 rounded-full font-bold transition-all hover:scale-105 electric-glow">
                  Consult our Experts
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
