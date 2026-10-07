'use client';

import { useState, useLayoutEffect, useRef } from 'react';
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
        className="relative aspect-video glass-card overflow-hidden cursor-zoom-in bg-ink/5"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        {!isMainLoaded && (
          <div className="absolute inset-0 ev-shimmer-base">
            <div className="ev-shimmer-sweep" />
          </div>
        )}
        <img
          key={activeIdx}
          ref={imgRef}
          src={images[activeIdx]}
          alt="Vehicle"
          decoding="async"
          fetchPriority={activeIdx === 0 ? 'high' : 'auto'}
          onLoad={() => setIsMainLoaded(true)}
          onError={() => setIsMainLoaded(true)}
          className="relative w-full h-full object-contain pointer-events-none"
          style={{
            transform: isZoomed ? `scale(2) translate(${(50 - mousePos.x) / 2}%, ${(50 - mousePos.y) / 2}%)` : 'none',
            transition: isZoomed ? 'none' : 'transform 0.3s',
          }}
        />
        
        {!isZoomed && (
          <div className="absolute bottom-4 right-4 bg-background/60 backdrop-blur-md p-2 rounded-full border border-ink/10 pointer-events-none">
            <Maximize2 className="w-4 h-4 text-ink/70" />
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
              activeIdx === idx ? 'border-primary shadow-[0_0_15px_rgba(87,116,64,0.3)]' : 'border-ink/[0.08] hover:border-ink/15'
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
