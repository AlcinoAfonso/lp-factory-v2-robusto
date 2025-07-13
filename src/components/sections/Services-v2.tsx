import { SmartImage } from '@/components/ui/SmartImage';
import { cn } from '@/lib/utils';

interface ServicesPropsV2 {
  data: {
    id: string;
    type: 'services';
    backgroundColor?: string;
    textColor?: string;
    h2?: string;
    title?: string;
    items: Array<{
      icon: string;
      texto?: string;
      text?: string;
    }>;
    imagem_url?: string;
    image?: {
      src: string;
      alt: string;
    };
    botao_whatsapp?: {
      rotulo: string;
      numero: string;
      mensagem: string;
    };
    button?: {
      text: string;
      href: string;
      variant?: string;
    };
  };
}

function ServicesV2({ data }: ServicesPropsV2) {
  const sectionStyle = {
    ...(data.backgroundColor && { backgroundColor: data.backgroundColor }),
    ...(data.textColor && { color: data.textColor }),
  };

  // Compatibilidade entre formatos
  const title = data.h2 || data.title || '';
  const image = data.image || (data.imagem_url ? { src: data.imagem_url, alt: 'Services Image' } : null);
  const button = data.button || (data.botao_whatsapp ? {
    text: data.botao_whatsapp.rotulo,
    href: `https://wa.me/${data.botao_whatsapp.numero}?text=${encodeURIComponent(data.botao_whatsapp.mensagem)}`,
    variant: 'primary'
  } : null);

  return (
    <section id={data.id} className="py-12 md:py-16" style={sectionStyle}>
      <div className="container-lp">
        {/* Título centralizado */}
        <div className="text-center mb-12">
          <h2
            className="text-[2rem] font-bold leading-[1.2] tracking-tight font-inter mb-4"
            style={{ color: data.textColor }}
          >
            {title}
          </h2>
        </div>

        {/* Conteúdo: imagem à esquerda, textos à direita */}
        <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-center mb-12">
          {/* Container da imagem */}
          {image && (
            <div className="flex-1 w-full md:w-auto">
              <div className="relative w-full max-w-md mx-auto aspect-square rounded-2xl overflow-hidden shadow-xl">
                <SmartImage
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
            </div>
          )}

          {/* Container dos textos */}
          <div className="flex-1 space-y-6">
            {data.items.map((item, index) => (
              <div key={index} className="flex gap-4">
                {/* Ícone inline */}
                <span className="text-2xl flex-shrink-0 mt-1">{item.icon}</span>

                {/* Texto */}
                <p
                  className="text-base font-normal leading-[1.5] tracking-normal font-inter mb-0"
                  style={{ color: data.textColor }}
                  dangerouslySetInnerHTML={{
                    __html: (item.texto || item.text || '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                  }}
                />
              </div>
            ))}

            {/* Botão */}
            {button && (
              <div className="mt-8">
                <a
                  href={button.href}
                  className="inline-block text-base font-semibold leading-[1.4] tracking-tight font-inter px-8 py-4 rounded-[16px] transition-all duration-200 text-center bg-orange-500 text-white hover:bg-orange-600 shadow-lg hover:shadow-xl"
                  target={button.href.startsWith('http') ? '_blank' : undefined}
                  rel={button.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {button.text}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ServicesV2;
