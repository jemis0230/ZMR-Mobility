'use client';

import { useState, useLayoutEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import EVImage from '@/presentation/components/EVImage';

interface ImageGalleryProps {
  images: string[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMainLoaded, setIsMainLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useLayoutEffect(() => {
    setIsMainLoaded(false);
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setIsMainLoaded(true);
    }
  }, [activeIdx]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div className="space-y-4">
      {/* Main Image View */}
      <div 
        className="relative aspect-video glass-card overflow-hidden cursor-zoom-in bg-white/5"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        {!isMainLoaded && (
          <div className="absolute inset-0 ev-shimmer-base z-10">
            <div className="ev-shimmer-sweep" />
          </div>
        )}
        <motion.img
          key={activeIdx}
          initial={{ opacity: 0 }}
          animate={{
            opacity: isMainLoaded ? 1 : 0,
            scale: isZoomed ? 2 : 1,
            x: isZoomed ? `${50 - mousePos.x}%` : 0,
            y: isZoomed ? `${50 - mousePos.y}%` : 0,
          }}
          transition={{ duration: isZoomed ? 0 : 0.3 }}
          ref={imgRef}
          src={images[activeIdx]}
          alt="Vehicle"
          onLoad={() => setIsMainLoaded(true)}
          onError={() => setIsMainLoaded(true)}
          className="w-full h-full object-contain pointer-events-none"
        />
        
        {!isZoomed && (
          <div className="absolute bottom-4 right-4 bg-background/60 backdrop-blur-md p-2 rounded-full border border-white/10 pointer-events-none">
            <Maximize2 className="w-4 h-4 text-white/60" />
          </div>
        )}
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-5 gap-4">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIdx(idx)}
            className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
              activeIdx === idx ? 'border-primary shadow-[0_0_15px_rgba(0,209,255,0.3)]' : 'border-white/5 hover:border-white/20'
            }`}
          >
            <EVImage
              src={img}
              alt={`Thumb ${idx}`}
              className="w-full h-full"
              imgClassName="w-full h-full object-cover"
              iconSize="sm"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
