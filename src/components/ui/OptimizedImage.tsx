'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  /**
   * Optionally tag the image with the section where it's used. This prop is
   * currently informational only and has no functional effect.
   */
  section?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  quality?: number;
}

export function OptimizedImage({
  src,
  alt,
  section: _section,
  className,
  priority = false,
  sizes = '100vw',
  fill = false,
  width,
  height,
  quality = 75,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Otimizar URLs do Unsplash
  const optimizedSrc = src.includes('unsplash.com') 
    ? `${src}&q=${quality}&auto=format&fit=crop`
    : src;

  // Placeholder blur enquanto carrega
  const shimmer = (w: number, h: number) => `
    <svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <linearGradient id="g">
          <stop stop-color="#f6f7f8" offset="20%" />
          <stop stop-color="#edeef1" offset="50%" />
          <stop stop-color="#f6f7f8" offset="70%" />
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="#f6f7f8" />
      <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
      <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
    </svg>`;

  const toBase64 = (str: string) =>
    typeof window === 'undefined'
      ? Buffer.from(str).toString('base64')
      : window.btoa(str);

  const dataUrl = `data:image/svg+xml;base64,${toBase64(
    shimmer(width || 700, height || 475)
  )}`;

  if (error) {
    return (
      <div className={cn(
        'bg-gray-200 flex items-center justify-center',
        className
      )}>
        <span className="text-gray-400 text-sm">Imagem não disponível</span>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {fill ? (
        <Image
          src={optimizedSrc}
          alt={alt}
          fill
          sizes={sizes}
          quality={quality}
          priority={priority}
          placeholder={priority ? 'empty' : 'blur'}
          blurDataURL={dataUrl}
          className={cn(
            'duration-700 ease-in-out',
            isLoading
              ? 'scale-110 blur-2xl grayscale'
              : 'scale-100 blur-0 grayscale-0',
            'object-cover'
          )}
          onLoadingComplete={() => setIsLoading(false)}
          onError={() => setError(true)}
        />
      ) : (
        <Image
          src={optimizedSrc}
          alt={alt}
          width={width!}
          height={height!}
          sizes={sizes}
          quality={quality}
          priority={priority}
          placeholder={priority ? 'empty' : 'blur'}
          blurDataURL={dataUrl}
          className={cn(
            'duration-700 ease-in-out',
            isLoading
              ? 'scale-110 blur-2xl grayscale'
              : 'scale-100 blur-0 grayscale-0'
          )}
          onLoadingComplete={() => setIsLoading(false)}
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}
