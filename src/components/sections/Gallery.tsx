import React from 'react';
import { SmartImage } from '@/components/ui/SmartImage';
import { GalleryData } from '@/types/lp-config';

interface GalleryProps {
  data: GalleryData;
}

const Gallery: React.FC<GalleryProps> = ({ data }) => {
  return (
    <section
      id={data.id}
      className="py-16 lg:py-24"
      style={{
        backgroundColor: data.backgroundColor,
        color: data.textColor,
      }}
    >
      <div className="container mx-auto px-4">
        {data.title && (
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-4">
            {data.title}
          </h2>
        )}
        
        {data.subtitle && (
          <p className="text-xl text-center mb-12 opacity-90">
            {data.subtitle}
          </p>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.images.map((image, index) => (
            <div
              key={index}
              className="relative aspect-video rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              <SmartImage
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
