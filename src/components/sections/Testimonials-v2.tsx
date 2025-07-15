'use client';

import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LiteYoutubeEmbed } from '@/components/ui/LiteYoutubeEmbed';

interface TestimonialsPropsV2 {
  data: {
    id: string;
    type: 'testimonials';
    backgroundColor?: string;
    textColor?: string;
    h2?: string;
    title?: string;
    youtube_links?: string[];
    videos?: Array<{
      embedUrl: string;
      title?: string;
    }>;
    botao_whatsapp?: {
      rotulo: string;
      numero: string;
      mensagem: string;
    };
  };
}

function TestimonialsV2({ data }: TestimonialsPropsV2) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const sectionStyle = {
    ...(data.backgroundColor && { backgroundColor: data.backgroundColor }),
    ...(data.textColor && { color: data.textColor }),
  };

  // Compatibilidade entre formatos
  const title = data.h2 || data.title || '';
  const videos = data.videos || (data.youtube_links?.map((link, index) => {
    const videoId = link.match(/v=([^&]+)/)?.[1];
    return {
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      title: `Depoimento ${index + 1}`
    };
  }) || []);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth / 3;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <section id={data.id} className="py-12 md:py-16" style={sectionStyle}>
      <div className="container-lp">
        <div className="text-center mb-12">
          <h2
            className="text-[2rem] font-bold leading-[1.2] tracking-tight font-inter mb-4"
            style={{ color: data.textColor }}
          >
            {title}
          </h2>
        </div>

        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            onScroll={checkScroll}
          >
            {videos.map((video, index) => (
              <div key={index} className="flex-none w-full md:w-[calc(33.333%-1rem)] snap-center">
                <LiteYoutubeEmbed
                  embedUrl={video.embedUrl}
                  title={video.title || `Depoimento ${index + 1}`}
                  className="shadow-lg"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={cn(
                'p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors',
                !canScrollLeft && 'opacity-50 cursor-not-allowed'
              )}
              aria-label="Anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={cn(
                'p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors',
                !canScrollRight && 'opacity-50 cursor-not-allowed'
              )}
              aria-label="Próximo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Botão WhatsApp adicional se existir */}
        {data.botao_whatsapp && (
          <div className="text-center mt-8">
            <a
              href={`https://wa.me/${data.botao_whatsapp.numero}?text=${encodeURIComponent(data.botao_whatsapp.mensagem)}`}
              className="inline-block text-base font-semibold leading-[1.4] tracking-tight font-inter px-8 py-4 rounded-[16px] transition-all duration-200 text-center bg-orange-500 text-white hover:bg-orange-600 shadow-lg hover:shadow-xl"
              target="_blank"
              rel="noopener noreferrer"
            >
              {data.botao_whatsapp.rotulo}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

export default TestimonialsV2;
