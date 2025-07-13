import { cn } from '@/lib/utils';
import { TechnologyData } from '@/types/lp-config';
import { Button } from '@/components/ui/Button';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { sectionDefaults } from '@/config/sections';
import { typography } from '@/config/typography';

interface TechnologyProps {
  data: TechnologyData;
}

function Technology({ data }: TechnologyProps) {
  const sectionStyle = {
    ...(data.backgroundColor && { backgroundColor: data.backgroundColor }),
    ...(data.textColor && { color: data.textColor }),
  } as React.CSSProperties;

  return (
    <section id={data.id} className={sectionDefaults.technology.classes} style={sectionStyle}>
      <div className={sectionDefaults.technology.container}>
        <div className={sectionDefaults.technology.titleContainer}>
          <h2
            className={cn(typography.sectionTitle.classes)}
            style={{ color: data.textColor }}
          >
            {data.title}
          </h2>
        </div>

        <div className={sectionDefaults.technology.contentLayout}>
          <div className={sectionDefaults.technology.itemsContainer}>
            {data.items.map((item, index) => (
              <div key={index} className={sectionDefaults.technology.item}>
                <span className={sectionDefaults.technology.iconContainer}>
                  {item.icon}
                </span>
                <div className={sectionDefaults.technology.textContainer}>
                  <h3
                    className={cn(typography.sectionSubtitle.classes, 'mb-2')}
                    style={{ color: data.textColor }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={cn(typography.bodyText.classes, 'mb-0')}
                    style={{ color: data.textColor }}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className={sectionDefaults.technology.imageContainer}>
            <OptimizedImage
              src={data.image.src}
              alt={data.image.alt}
              width={400}
              height={400}
              section="other"
              className="w-full max-w-md mx-auto aspect-square rounded-2xl shadow-xl"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
        </div>

        <div className={sectionDefaults.technology.buttonContainer}>
          <Button {...data.button} />
        </div>
      </div>
    </section>
  );
}

export default Technology;
