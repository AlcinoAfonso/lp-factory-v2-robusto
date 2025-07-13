import { SmartImage } from '@/components/ui/SmartImage';
import { cn } from '@/lib/utils';
import { HeroData } from '@/types/lp-config';
import { Button } from '@/components/ui/Button';
import { sectionDefaults } from '@/config/sections';
import { typography } from '@/config/typography';

interface HeroProps {
  data: HeroData;
}

function Hero({ data }: HeroProps) {
  const sectionStyle = {
    ...(data.backgroundColor && { backgroundColor: data.backgroundColor }),
    ...(data.textColor && { color: data.textColor }),
  };


  return (
    <section id={data.id} className={sectionDefaults.hero.classes} style={sectionStyle}>
      <div className={sectionDefaults.hero.container}>
        <div className={sectionDefaults.hero.layout}>
          {/* Container 1: Texto (vertical com espaçamento entre elementos) */}
          <div className={sectionDefaults.hero.textContainer}>
            {/* Título (h1) */}
            <h1 
              className={cn(typography.heroTitle.classes)}
              style={{ color: data.textColor }}
            >
              {data.title}
            </h1>
            
            {/* Texto/Descrição (p) */}
            <p 
              className={cn(typography.heroDescription.classes)}
              style={{ color: data.textColor }}
            >
              {data.description}
            </p>
            
            {/* Botão (a) */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button {...data.primaryButton} />
              {data.secondaryButton && (
                <Button {...data.secondaryButton} />
              )}
            </div>
          </div>

          {/* Container 2: Imagem */}
          <div className={sectionDefaults.hero.imageContainer}>
            <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-xl">
              <SmartImage
                src={data.image.src}
                alt={data.image.alt}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
