'use client';

import { useEffect, useState, useCallback } from 'react';
import type { DetectedConversion } from './types';

interface DynamicTrackingConfig {
  google_ads?: {
    remarketing?: string;
  };
  meta_pixel?: string;
  google_analytics?: string;
  detected_conversions?: Record<string, DetectedConversion>;
}

interface DynamicTrackingProps {
  config: DynamicTrackingConfig;
}

export function DynamicTracking({ config }: DynamicTrackingProps) {
  const [scriptsLoaded, setScriptsLoaded] = useState({
    ga4: false,
    metaPixel: false,
    googleAds: false,
  });

  const enabledConversions = Object.values(config.detected_conversions || {}).filter(
    (conv) => conv.tracking_enabled && conv.google_ads_id,
  );

  const handleDynamicClick = useCallback(
    (event: Event) => {
      const target = event.target as HTMLElement;
      const clickedElement = target.closest('a, button') as HTMLElement;

      if (!clickedElement) return;

      const href = clickedElement.getAttribute('href') || '';
      if (!href) return;

      // Encontrar conversão correspondente baseada no href
      const matchingConversion = enabledConversions.find((conv) => {
        switch (conv.type) {
          case 'whatsapp':
            return href.includes('wa.me') && href.includes(conv.destination.replace('+', ''));
          case 'phone':
            return href.startsWith('tel:') && href.includes(conv.destination.replace('+', ''));
          case 'email':
            return href.includes('mailto:') && href.includes(conv.destination);
          case 'social':
            return href.includes(conv.destination.split('//')[1]);
          default:
            return href === conv.destination;
        }
      });

      if (!matchingConversion) return;

      // Disparar conversão Google Ads
      if (typeof window.gtag === 'function' && matchingConversion.google_ads_id) {
        window.gtag('event', 'conversion', {
          send_to: matchingConversion.google_ads_id,
        });
        console.info(
          '🎯 DynamicTracking: Conversão disparada -',
          matchingConversion.label,
          '→',
          matchingConversion.google_ads_id,
        );
      }

      // Disparar evento Meta Pixel
      if (typeof window.fbq === 'function' && config.meta_pixel) {
        window.fbq('track', 'Lead');
        console.info('📱 DynamicTracking: Meta Pixel Lead disparado para', matchingConversion.label);
      }

      // Disparar Google Analytics
      if (typeof window.gtag === 'function' && config.google_analytics) {
        window.gtag('event', 'dynamic_conversion', {
          conversion_type: matchingConversion.type,
          conversion_label: matchingConversion.label,
          conversion_destination: matchingConversion.destination,
        });
        console.info('📊 DynamicTracking: GA4 event disparado para', matchingConversion.label);
      }
    },
    [enabledConversions, config],
  );

  const handleFormSubmit = useCallback(
    (event: Event) => {
      const form = event.target as HTMLFormElement;

      // Encontrar conversão de formulário
      const formConversion = enabledConversions.find((conv) => conv.type === 'form');

      if (!formConversion) return;

      // Disparar conversão Google Ads
      if (typeof window.gtag === 'function' && formConversion.google_ads_id) {
        window.gtag('event', 'conversion', {
          send_to: formConversion.google_ads_id,
        });
        console.info('📋 DynamicTracking: Conversão de formulário disparada -', formConversion.google_ads_id);
      }

      // Disparar evento Meta Pixel
      if (typeof window.fbq === 'function' && config.meta_pixel) {
        window.fbq('track', 'Lead');
        console.info('📋 DynamicTracking: Meta Pixel Lead disparado para formulário');
      }
    },
    [enabledConversions, config],
  );

  const setupDynamicEventListeners = useCallback(() => {
    // Event listeners para cliques dinâmicos
    document.addEventListener('click', handleDynamicClick, true);

    // Event listeners para formulários
    document.querySelectorAll('form').forEach((form) => {
      form.addEventListener('submit', handleFormSubmit);
    });

    console.info('✅ DynamicTracking: Event listeners dinâmicos configurados para', enabledConversions.length, 'conversões');
  }, [handleDynamicClick, handleFormSubmit, enabledConversions.length]);

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
    console.info('✅ DynamicTracking: Todos os scripts carregados');
  }, [config]);

  useEffect(() => {
    if (enabledConversions.length === 0) {
      console.info('ℹ️ DynamicTracking: Nenhuma conversão habilitada');
      return;
    }

    loadRequiredScripts();
    setupDynamicEventListeners();

    // Cleanup
    return () => {
      document.removeEventListener('click', handleDynamicClick, true);
      document.querySelectorAll('form').forEach((form) => {
        form.removeEventListener('submit', handleFormSubmit);
      });
    };
  }, [loadRequiredScripts, setupDynamicEventListeners, handleDynamicClick, handleFormSubmit, enabledConversions.length]);

  return null; // Componente só para efeitos colaterais
}

// Funções auxiliares para carregar scripts (reutilizadas do DirectTracking)
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
    if (typeof window.fbq !== 'undefined') {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    script.onload = () => {
      window.fbq = window.fbq || function (...args: any[]) {
        (window.fbq.q = window.fbq.q || []).push(args);
      };
      window.fbq.push = window.fbq;
      window.fbq.loaded = true;
      window.fbq.version = '2.0';
      window.fbq.q = [];

      window.fbq('init', pixelId);
      window.fbq('track', 'PageView');

      console.info('✅ Meta Pixel carregado:', pixelId);
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

export default DynamicTracking;
