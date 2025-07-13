import { SmartImage } from '@/components/ui/SmartImage';

interface AboutPropsV2 {
  data: {
    id: string;
    type: 'about';
    backgroundColor?: string;
    textColor?: string;
    h2?: string;
    title?: string;
    texto?: string;
    description?: string;
    imagem_url?: string;
    image?: {
      src: string;
      alt: string;
    };
    button?: {
      text: string;
      href: string;
      variant?: string;
    };
  };
}

function AboutV2({ data }: AboutPropsV2) {
  const sectionStyle = {
    ...(data.backgroundColor && { backgroundColor: data.backgroundColor }),
    ...(data.textColor && { color: data.textColor }),
  };

  // Compatibilidade entre formatos
  const title = data.h2 || data.title || '';
  const description = data.texto || data.description || '';
  const image = data.image || (data.imagem_url ? { src: data.imagem_url, alt: 'About Image' } : null);
  const hasImage = image !== null;

  return (
    <section id={data.id} className="py-12 md:py-16" style={sectionStyle}>
      <div className="container-lp">
        <div className={`grid gap-12 items-center ${hasImage ? 'md:grid-cols-2' : 'max-w-3xl mx-auto text-center'}`}>
          {hasImage && (
            <div className="relative w-full max-w-md mx-auto aspect-square rounded-2xl overflow-hidden shadow-xl">
              <SmartImage
                src={image!.src}
                alt={image!.alt}
                fill
                className="object-cover"
              />
            </div>
          )}
          
          <div className={hasImage ? '' : ''}>
            <h2 
              className="text-3xl lg:text-4xl font-bold mb-6"
              style={{ color: data.textColor }}
            >
              {title}
            </h2>

            <div className="prose prose-lg max-w-none">
              <p 
                className="whitespace-pre-line text-lg leading-relaxed"
                style={{ color: data.textColor }}
              >
                {description}
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
}

export default AboutV2;
