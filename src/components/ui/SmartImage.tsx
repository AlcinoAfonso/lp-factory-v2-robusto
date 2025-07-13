'use client';

import Image from 'next/image';
import { useState } from 'react';

interface SmartImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  fill?: boolean;
  sizes?: string;
}

export function SmartImage({ 
  src, 
  alt, 
  width = 800, 
  height = 600,
  priority = false,
  className = "",
  fill = false,
  sizes = "(max-width: 768px) 100vw, 50vw"
}: SmartImageProps) {
  const [error, setError] = useState(false);
  
  // Processamento universal de URLs
  let optimizedSrc = src;
  
  // Otimização para Unsplash
  if (src.includes('unsplash.com') && !src.includes('?')) {
    optimizedSrc = `${src}?w=${width}&q=75&auto=format&fit=crop`;
  }
  // Otimização para Google Drive
  else if (src.includes('drive.google.com')) {
    const fileId = src.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
    if (fileId) {
      optimizedSrc = `https://drive.google.com/thumbnail?id=${fileId}&sz=w${width}`;
    }
  }
  // Cloudinary para outras origens (quando implementar)
  // else if (src.startsWith('http') && !src.startsWith('/')) {
  //   optimizedSrc = `https://res.cloudinary.com/lpfactory/image/fetch/w_${width},q_auto,f_auto/${src}`;
  // }
  
  // Se houver erro, mostra placeholder
  if (error) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-sm">Imagem não disponível</span>
      </div>
    );
  }

  // Renderiza com base em fill ou dimensões fixas
  if (fill) {
    return (
      <Image
        src={optimizedSrc}
        alt={alt}
        fill
        priority={priority}
        className={className}
        sizes={sizes}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <Image
      src={optimizedSrc}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={className}
      sizes={sizes}
      onError={() => setError(true)}
    />
  );
}
