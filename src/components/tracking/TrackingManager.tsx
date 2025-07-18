// src/components/tracking/TrackingManager.tsx
'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

// Types
interface TrackingConfig {
  client: string;
  google_ads?: {
    remarketing?: string;
    conversions?: {
      [key: string]: string;
    };
  };
  meta_pixel?: string;
  google_analytics?: string;
  configured?: boolean;
}

interface TrackingManagerProps {
  clientName: string;
}

// Função para carregar configuração (com fallback)
function loadTrackingConfig(clientName: string): TrackingConfig | null {
  try {
    // Tenta carregar tracking.json do cliente
    const config = require(`@/app/${clientName}/tracking.json`);
    return config;
  } catch (error) {
    // Se não existe ou erro, retorna null (sem tracking)
    console.log(`No tracking config for ${clientName} - LP will work without tracking`);
    return null;
  }
}

// Validação simples de IDs
function isValidGoogleAdsId(id?: string): boolean {
  if (!id) return false;
  return /^AW-\d{9,11}$/.test(id);
}

function isValidMetaPixelId(id?: string): boolean {
  if (!id) return false;
  return /^\d{15,16}$/.test(id);
}

function isValidGA4Id(id?: string): boolean {
  if (!id) return false;
  return /^G-[A-Z0-9]{10}$/.test(id);
}

// Componente principal
export default function TrackingManager({ clientName }: TrackingManagerProps) {
  const [trackingConfig, setTrackingConfig] = useState<TrackingConfig | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Carrega configuração de tracking (se existir)
    const config = loadTrackingConfig(clientName);
    setTrackingConfig(config);
    setIsLoaded(true);
  }, [clientName]);

  // Se ainda está carregando, não renderiza nada
  if (!isLoaded) {
    return null;
  }

  // Se não tem configuração ou não está configurado, não injeta scripts
  if (!trackingConfig || !trackingConfig.configured) {
    console.log(`TrackingManager: No valid tracking config for ${clientName}`);
    return null;
  }

  // Valida IDs antes de injetar scripts
  const hasValidGoogleAds = isValidGoogleAdsId(trackingConfig.google_ads?.remarketing);
  const hasValidMetaPixel = isValidMetaPixelId(trackingConfig.meta_pixel);
  const hasValidGA4 = isValidGA4Id(trackingConfig.google_analytics);

  return (
    <>
      {/* Google Ads - Só carrega se ID for válido */}
      {hasValidGoogleAds && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${trackingConfig.google_ads?.remarketing}`}
            strategy="afterInteractive"
          />
          <Script id="google-ads-config" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${trackingConfig.google_ads?.remarketing}');
              
              // Event listeners automáticos para conversões
              document.addEventListener('DOMContentLoaded', function() {
                // Formulários
                document.querySelectorAll('form').forEach(form => {
                  form.addEventListener('submit', function() {
                    ${trackingConfig.google_ads?.conversions?.form_lead ? 
                      `gtag('event', 'conversion', {
                         'send_to': '${trackingConfig.google_ads.conversions.form_lead}'
                       });` : ''
                    }
                  });
                });
                
                // Links do WhatsApp
                document.querySelectorAll('a[href*="whatsapp"], a[href*="wa.me"]').forEach(link => {
                  link.addEventListener('click', function() {
                    ${trackingConfig.google_ads?.conversions?.whatsapp ? 
                      `gtag('event', 'conversion', {
                         'send_to': '${trackingConfig.google_ads.conversions.whatsapp}'
                       });` : ''
                    }
                  });
                });
                
                // Links de telefone
                document.querySelectorAll('a[href^="tel:"]').forEach(link => {
                  link.addEventListener('click', function() {
                    ${trackingConfig.google_ads?.conversions?.phone ? 
                      `gtag('event', 'conversion', {
                         'send_to': '${trackingConfig.google_ads.conversions.phone}'
                       });` : ''
                    }
                  });
                });
              });
            `}
          </Script>
        </>
      )}

      {/* Meta Pixel - Só carrega se ID for válido */}
      {hasValidMetaPixel && (
        <>
          <Script
            src="https://connect.facebook.net/en_US/fbevents.js"
            strategy="afterInteractive"
          />
          <Script id="meta-pixel-config" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              
              fbq('init', '${trackingConfig.meta_pixel}');
              fbq('track', 'PageView');
              
              // Event listeners para Meta Pixel
              document.addEventListener('DOMContentLoaded', function() {
                // Formulários
                document.querySelectorAll('form').forEach(form => {
                  form.addEventListener('submit', function() {
                    fbq('track', 'Lead');
                  });
                });
                
                // WhatsApp e telefone
                document.querySelectorAll('a[href*="whatsapp"], a[href*="wa.me"], a[href^="tel:"]').forEach(link => {
                  link.addEventListener('click', function() {
                    fbq('track', 'Contact');
                  });
                });
              });
            `}
          </Script>
        </>
      )}

      {/* Google Analytics - Só carrega se ID for válido */}
      {hasValidGA4 && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${trackingConfig.google_analytics}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics-config" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${trackingConfig.google_analytics}');
            `}
          </Script>
        </>
      )}

      {/* Debug info (só em desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && (
        <Script id="tracking-debug" strategy="afterInteractive">
          {`
            console.log('🎯 TrackingManager Debug for ${clientName}:');
            console.log('✅ Google Ads:', ${hasValidGoogleAds});
            console.log('✅ Meta Pixel:', ${hasValidMetaPixel});
            console.log('✅ Google Analytics:', ${hasValidGA4});
          `}
        </Script>
      )}
    </>
  );
}

// Função utilitária para criar tracking.json vazio
export function createEmptyTrackingConfig(clientName: string): TrackingConfig {
  return {
    client: clientName,
    google_ads: {
      remarketing: '',
      conversions: {
        form_lead: '',
        whatsapp: '',
        phone: ''
      }
    },
    meta_pixel: '',
    google_analytics: '',
    configured: false
  };
}

// Hook para usar no dashboard
export function useTrackingConfig(clientName: string) {
  const [config, setConfig] = useState<TrackingConfig | null>(null);
  const [hasConfig, setHasConfig] = useState(false);

  useEffect(() => {
    const trackingConfig = loadTrackingConfig(clientName);
    setConfig(trackingConfig);
    setHasConfig(!!trackingConfig);
  }, [clientName]);

  return { config, hasConfig };
}

// ===================================
// COMO USAR - EXEMPLOS PRÁTICOS
// ===================================

/*

1. Em src/app/layout.tsx (GLOBAL - todos os clientes):

```tsx
import TrackingManager from '@/components/tracking/TrackingManager';
import { headers } from 'next/headers';

export default function RootLayout({ children }) {
  const headersList = headers();
  const host = headersList.get('host') || '';
  
  // Detecta cliente pelo domínio ou URL
  const clientName = detectClientFromHost(host); // implementar função
  
  return (
    <html>
      <head>
        <TrackingManager clientName={clientName} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

2. Em src/app/[cliente]/layout.tsx (POR CLIENTE):

```tsx
import TrackingManager from '@/components/tracking/TrackingManager';

export default function ClientLayout({ children, params }) {
  return (
    <>
      <TrackingManager clientName={params.cliente} />
      {children}
    </>
  );
}
```

3. tracking.json Exemplo (src/app/fitnutri/tracking.json):

```json
{
  "client": "fitnutri",
  "google_ads": {
    "remarketing": "AW-123456789",
    "conversions": {
      "form_lead": "AW-123456789/AbC123",
      "whatsapp": "AW-123456789/XyZ789",
      "phone": "AW-123456789/DeF456"
    }
  },
  "meta_pixel": "987654321012345",
  "google_analytics": "G-XXXXXXXXXX",
  "configured": true
}
```

FUNCIONA PARA TODOS OS CENÁRIOS:
✅ Cliente SEM tracking.json → LP funciona normal
✅ Cliente COM tracking.json mas configured: false → LP funciona sem tracking
✅ Cliente COM tracking configurado → LP + tracking ativo
✅ IDs inválidos → Ignora e não quebra a LP
✅ Erro ao carregar arquivo → LP continua funcionando

*/
