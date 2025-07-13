import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ServicesData } from '@/types/lp-config';
import { Button } from '@/components/ui/Button';
import { sectionDefaults } from '@/config/sections';
import { typography } from '@/config/typography';

interface ServicesProps {
  data: ServicesData;
}

function Services({ data }: ServicesProps) {
  const sectionStyle = {
    ...(data.backgroundColor && { backgroundColor: data.backgroundColor }),
    ...(data.textColor && { color: data.textColor }),
  } as React.CSSProperties;

  const optimizedImageSrc = data.image.src.includes('unsplash.com')
    ? `${data.image.src.split('?')[0]}?w=600&q=80&auto=format&fit=crop`
    : data.image.src;

  return (
    <section id={data.id} className={sectionDefaults.services.classes} style={sectionStyle}>
      <div className={sectionDefaults.services.container}>
        {/* Título centralizado */}
        <div className={sectionDefaults.services.titleContainer}>
          <h2
            className={cn(typography.sectionTitle.classes)}
            style={{ color: data.textColor }}
          >
            {data.title}
          </h2>
        </div>

        {/* Conteúdo: imagem à esquerda, textos à direita */}
        <div className={sectionDefaults.services.contentLayout}>
          {/* Container da imagem */}
          <div className={sectionDefaults.services.imageContainer}>
            <div className="relative w-full max-w-md mx-auto aspect-square rounded-2xl overflow-hidden shadow-xl">
              <Image
                src={optimizedImageSrc}
                alt={data.image.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
          </div>

          {/* Container dos textos */}
          <div className={sectionDefaults.services.textContainer}>
            {data.items.map((item, index) => (
              <div key={index} className={sectionDefaults.services.textItem}>
                {/* Ícone inline */}
                <span className={sectionDefaults.services.iconInline}>{item.icon}</span>

                {/* Texto */}
                <p
                  className={cn(typography.bodyText.classes, 'mb-0')}
                  style={{ color: data.textColor }}
                  dangerouslySetInnerHTML={{
                    __html: item.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                  }}
                />
              </div>
            ))}

            {/* Botão */}
            {data.button && (
              <div className={sectionDefaults.services.buttonContainer}>
                <Button {...data.button} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Services;
