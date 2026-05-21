'use client';

import { useState } from 'react';
import { Zap } from 'lucide-react';

interface EVImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  iconSize?: 'sm' | 'md' | 'lg';
  /** Kept for API compatibility — no longer used since we render a plain <img> */
  sizes?: string;
}

const ICON_CLS = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };

export default function EVImage({
  src, alt, className = '', imgClassName = '', iconSize = 'md',
}: EVImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

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

      {/*
        Use a plain <img> instead of next/image because uploaded vehicle images
        are served directly by the reverse proxy (Caddy) without going through
        the Next.js image optimisation endpoint. next/image's onLoad would never
        fire for those paths, leaving the shimmer visible permanently.
      */}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-full transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
      />
    </div>
  );
}
