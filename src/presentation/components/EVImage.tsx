'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { Zap } from 'lucide-react';

interface EVImageProps {
  src: string;
  alt: string;
  /** Classes applied to the outer wrapper div */
  className?: string;
  /** Classes applied to the <img> element itself (e.g. object-contain, hover effects) */
  imgClassName?: string;
  /** Size of the Zap icon shown while loading. Defaults to 'md'. */
  iconSize?: 'sm' | 'md' | 'lg';
  /** next/image sizes hint for responsive images */
  sizes?: string;
}

const ICON_CLS = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };

export default function EVImage({
  src, alt, className = '', imgClassName = '', iconSize = 'md',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
}: EVImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // next/image renders its own internal <img> — we can't ref it directly.
  // This callback ref fires after the wrapper mounts, at which point we can
  // querySelector for the inner <img> and check .complete to handle images
  // that were already cached by the browser before React's onLoad could fire.
  const wrapperRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const img = node.querySelector('img');
    if (!img) return;
    if (img.complete && img.naturalWidth > 0) setLoaded(true);
    if (img.complete && img.naturalWidth === 0) setError(true);
  }, []);

  return (
    <div ref={wrapperRef} className={`relative overflow-hidden ${className}`}>
      {/* Shimmer — visible while image is loading */}
      {!loaded && !error && (
        <div className="absolute inset-0 ev-shimmer-base">
          <div className="ev-shimmer-sweep" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className={`${ICON_CLS[iconSize]} text-[#00FF85]/20 animate-pulse`} />
          </div>
        </div>
      )}

      {/* Error fallback */}
      {error && (
        <div className="absolute inset-0 ev-shimmer-base flex items-center justify-center">
          <Zap className={`${ICON_CLS[iconSize]} text-[#00FF85]/10`} />
        </div>
      )}

      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
      />
    </div>
  );
}
