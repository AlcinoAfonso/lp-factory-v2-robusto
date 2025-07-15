'use client';

import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { TestimonialsData } from '@/types/lp-config';
import { sectionDefaults } from '@/config/sections';
import { typography } from '@/config/typography';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LiteYoutubeEmbed } from '@/components/ui/LiteYoutubeEmbed';

interface TestimonialsProps {
  data: TestimonialsData;
}

function Testimonials({ data }: TestimonialsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const sectionStyle = {
    ...(data.backgroundColor && { backgroundColor: data.backgroundColor }),
    ...(data.textColor && { color: data.textColor }),
  } as React.CSSProperties;

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
    <section id={data.id} className={sectionDefaults.testimonials.classes} style={sectionStyle}>
      <div className={sectionDefaults.testimonials.container}>
        <div className={sectionDefaults.testimonials.titleContainer}>
          <h2
            className={cn(typography.sectionTitle.classes)}
            style={{ color: data.textColor }}
          >
            {data.title}
          </h2>
        </div>

        <div className={sectionDefaults.testimonials.carouselContainer}>
          <div
            ref={scrollRef}
            className={sectionDefaults.testimonials.carouselTrack}
            onScroll={checkScroll}
          >
            {data.videos.map((video, index) => (
              <div key={index} className={sectionDefaults.testimonials.videoCard}>
                <LiteYoutubeEmbed
                  embedUrl={video.embedUrl}
                  title={video.title || `Depoimento ${index + 1}`}
                  className="shadow-lg"
                />
              </div>
            ))}
          </div>

          <div className={sectionDefaults.testimonials.navigationContainer}>
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={cn(
                sectionDefaults.testimonials.arrowButton,
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
                sectionDefaults.testimonials.arrowButton,
                !canScrollRight && 'opacity-50 cursor-not-allowed'
              )}
              aria-label="Próximo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
