'use client';

import { useState } from 'react';
import Image from 'next/image';

interface LiteYoutubeEmbedProps {
  embedUrl: string;
  title?: string;
  className?: string;
}

export function LiteYoutubeEmbed({
  embedUrl,
  title = 'Vídeo YouTube',
  className = '',
}: LiteYoutubeEmbedProps) {
  const [activated, setActivated] = useState(false);
  
  // Extrair videoId de diferentes formatos de URL
  const extractVideoId = (url: string): string | null => {
    // Formato embed: https://www.youtube.com/embed/VIDEO_ID
    let match = url.match(/embed\/([^?]+)/);
    if (match) return match[1];
    
    // Formato watch: https://www.youtube.com/watch?v=VIDEO_ID
    match = url.match(/[?&]v=([^&]+)/);
    if (match) return match[1];
    
    // Formato curto: https://youtu.be/VIDEO_ID
    match = url.match(/youtu\.be\/([^?]+)/);
    if (match) return match[1];
    
    return null;
  };

  const videoId = extractVideoId(embedUrl);
  
  if (!videoId) {
    console.warn('ID do vídeo não encontrado:', embedUrl);
    return null;
  }

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const thumbnailFallback = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div className={`relative w-full pt-[56.25%] bg-black rounded-lg overflow-hidden ${className}`}>
      {!activated ? (
        <>
          {/* Thumbnail com fallback */}
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              // Fallback para qualidade menor se maxresdefault não existir
              const target = e.target as HTMLImageElement;
              if (target.src !== thumbnailFallback) {
                target.src = thumbnailFallback;
              }
            }}
          />
          
          {/* Overlay escuro */}
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Botão Play centralizado */}
          <button
            onClick={() => setActivated(true)}
            className="absolute inset-0 w-full h-full flex items-center justify-center group"
            aria-label={`Assistir: ${title}`}
          >
            <div className="bg-red-600 w-20 h-14 rounded-xl flex items-center justify-center shadow-2xl group-hover:bg-red-700 transition-colors">
              <svg
                className="w-8 h-8 text-white ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </button>
        </>
      ) : (
        <iframe
          src={`${embedUrl}?autoplay=1`}
          title={title}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
  );
}

