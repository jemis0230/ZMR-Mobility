'use client';

import { useState, useRef, useEffect } from 'react';
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
}

const ICON_CLS = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };

export default function EVImage({
  src, alt, className = '', imgClassName = '', iconSize = 'md',
}: EVImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Handle cached images: the browser fires `load` before React attaches
  // onLoad, so naturalWidth > 0 but the handler never runs. Check on mount.
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    if (img.complete && img.naturalWidth > 0) setLoaded(true);
    if (img.complete && img.naturalWidth === 0) setError(true);
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
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

      <img
        ref={imgRef}
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
      />
    </div>
  );
}
