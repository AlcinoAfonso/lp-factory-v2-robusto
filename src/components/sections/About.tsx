import React from 'react';
import Image from 'next/image';
import { AboutData } from '@/types/lp-config';

interface AboutProps {
  data: AboutData;
}

const About: React.FC<AboutProps> = ({ data }) => {
  const hasImage = data.image !== undefined;

  const optimizedImageSrc = hasImage && data.image!.src.includes('unsplash.com')
    ? `${data.image!.src.split('?')[0]}?w=600&q=80&auto=format&fit=crop`
    : data.image?.src;
  
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
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {hasImage && optimizedImageSrc && (
            <div className="relative w-full max-w-md mx-auto aspect-square rounded-2xl overflow-hidden shadow-xl">
              <Image
                src={optimizedImageSrc}
                alt={data.image!.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
          )}
          
          <div className={hasImage ? '' : 'md:col-span-2 max-w-3xl mx-auto text-center'}>
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              {data.title}
            </h2>

            <div className="prose prose-lg max-w-none">
              <p className="whitespace-pre-line text-lg leading-relaxed">
                {data.description}
              </p>
            </div>

            {data.button && (
              <div className="mt-8">
                <a
                  href={data.button.href}
                  className="inline-block px-6 py-3 rounded-lg font-semibold transition-all bg-orange-500 text-white hover:bg-orange-600"
                >
                  {data.button.text}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
