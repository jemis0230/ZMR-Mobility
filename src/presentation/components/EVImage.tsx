'use client';

import { useState, useEffect, useRef } from 'react';
import { Zap } from 'lucide-react';

interface EVImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  iconSize?: 'sm' | 'md' | 'lg';
  sizes?: string;
}

const ICON_CLS = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };

export default function EVImage({
  src, alt, className = '', imgClassName = '', iconSize = 'md',
}: EVImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Handle images already in the browser cache — onLoad won't fire for those
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    if (img.complete && img.naturalWidth > 0) setLoaded(true);
    else if (img.complete && img.naturalWidth === 0) setError(true);
  }, []);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && !error && (
        <div className="absolute inset-0 ev-shimmer-base">
          <div className="ev-shimmer-sweep" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className={`${ICON_CLS[iconSize]} text-[#00FF85]/20 animate-pulse`} />
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 ev-shimmer-base flex items-center justify-center">
          <Zap className={`${ICON_CLS[iconSize]} text-[#00FF85]/10`} />
        </div>
      )}

      {/*
        Plain <img> instead of next/image — uploaded vehicle images are served
        directly by Caddy and bypass the Next.js optimisation endpoint, so
        next/image's onLoad never fires, leaving the shimmer permanently visible.
      */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-full transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
      />
    </div>
  );
}
