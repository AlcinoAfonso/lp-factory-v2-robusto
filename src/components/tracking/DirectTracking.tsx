'use client';

import { useEffect, useState, useCallback } from 'react';

interface DirectTrackingConfig {
  google_ads?: {
    remarketing?: string;
    conversions?: Record<string, string>;
  };
  meta_pixel?: string;
  google_analytics?: string;
}

interface DirectTrackingProps {
  config: DirectTrackingConfig;
}

export function DirectTracking({ config }: DirectTrackingProps) {
  const [scriptsLoaded, setScriptsLoaded] = useState({
    ga4: false,
    metaPixel: false,
    googleAds: false,
  });

  const loadRequiredScripts = useCallback(async () => {
    const promises: Promise<void>[] = [];

    // Carregar Google Analytics 4
    if (config.google_analytics) {
      promises.push(loadGA4Script(config.google_analytics));
    }

    // Carregar Meta Pixel
    if (config.meta_pixel) {
      promises.push(loadMetaPixelScript(config.meta_pixel));
    }

    // Carregar Google Ads (sempre se tiver remarketing)
    if (config.google_ads?.remarketing) {
      promises.push(loadGoogleAdsScript(config.google_ads.remarketing));
    }

    await Promise.all(promises);
    console.info('✅ DirectTracking: Todos os scripts carregados');
  }, [config.google_analytics, config.meta_pixel, config.google_ads?.remarketing]);

  const setupEventListeners = useCallback(() => {
    // Event listeners para tracking_tags
    document.addEventListener('click', handleTrackingClick);

    // Event listeners para formulários
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', handleFormSubmit);
    });

    console.info('✅ DirectTracking: Event listeners configurados');
  }, [handleTrackingClick, handleFormSubmit]);

  useEffect(() => {
    loadRequiredScripts();
    setupEventListeners();
  }, [loadRequiredScripts, setupEventListeners]);

  const handleTrackingClick = useCallback((event: Event) => {
    const target = event.target as HTMLElement;
    const trackingElement = target.closest('[data-tracking]') as HTMLElement;
    
    if (!trackingElement) return;

    const trackingTag = trackingElement.getAttribute('data-tracking');
    if (!trackingTag) return;

    const conversionId = config.google_ads?.conversions?.[trackingTag];
    if (!conversionId) {
      console.warn('⚠️ DirectTracking: ID de conversão não encontrado para tag:', trackingTag);
      return;
    }

    // Disparar conversão Google Ads
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', {
        'send_to': conversionId
      });
      console.info('🎯 Conversão disparada:', trackingTag, '→', conversionId);
    }

    // Disparar evento Meta Pixel
    if (typeof window.fbq === 'function' && config.meta_pixel) {
      window.fbq('track', 'Lead');
      console.info('📱 Meta Pixel: Lead event disparado');
    }
  }, [config]);

  const handleFormSubmit = useCallback((event: Event) => {
    const form = event.target as HTMLFormElement;
    const trackingTag = form.getAttribute('data-tracking') || 'formulario_contato';
    
    const conversionId = config.google_ads?.conversions?.[trackingTag];
    
    if (conversionId && typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', {
        'send_to': conversionId
      });
      console.info('📋 Formulário: Conversão disparada para', trackingTag);
    }

    if (typeof window.fbq === 'function' && config.meta_pixel) {
      window.fbq('track', 'Lead');
      console.info('📋 Formulário: Meta Pixel Lead disparado');
    }
  }, [config]);

  return null; // Componente só para efeitos colaterais
}

// Funções auxiliares para carregar scripts
async function loadGA4Script(gaId: string): Promise<void> {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src*="${gaId}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    script.onload = () => {
      // Inicializar gtag
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) {
        window.dataLayer.push(args);
      }
      window.gtag = gtag;
      
      gtag('js', new Date());
      gtag('config', gaId);
      
      console.info('✅ Google Analytics 4 carregado:', gaId);
      resolve();
    };
    document.head.appendChild(script);
  });
}

async function loadMetaPixelScript(pixelId: string): Promise<void> {
  return new Promise((resolve) => {
    // Verificar se Meta Pixel já foi carregado
    if (typeof window.fbq !== 'undefined' && (window.fbq as any).loaded) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    script.onload = () => {
      // Inicializar Meta Pixel
      if (typeof window.fbq === 'function') {
        window.fbq('init', pixelId);
        window.fbq('track', 'PageView');

        console.info('✅ Meta Pixel carregado:', pixelId);
      }
      resolve();
    };
    script.onerror = () => {
      console.warn('⚠️ Erro ao carregar Meta Pixel');
      resolve();
    };
    document.head.appendChild(script);
  });
}

async function loadGoogleAdsScript(remarketingId: string): Promise<void> {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src*="${remarketingId}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${remarketingId}`;
    script.onload = () => {
      // Inicializar Google Ads se gtag não existir
      if (!window.gtag) {
        window.dataLayer = window.dataLayer || [];
        function gtag(...args: any[]) {
          window.dataLayer.push(args);
        }
        window.gtag = gtag;
        gtag('js', new Date());
      }
      
      window.gtag('config', remarketingId);
      
      console.info('✅ Google Ads carregado:', remarketingId);
      resolve();
    };
    document.head.appendChild(script);
  });
}
