export interface TrackingConfig {
  client: string;
  method: 'gtm' | 'direct' | 'both';
  gtm_snippet?: {
    head: string;
    body: string;
  };
  detected_conversions?: Record<string, DetectedConversion>;
  direct_ids?: {
    google_ads?: {
      remarketing?: string;
      // ✅ CORREÇÃO: Manter conversions para compatibilidade com sistema antigo
      conversions?: Record<string, string>;
    };
    meta_pixel?: string;
    google_analytics?: string;
  };
  configured: boolean;
}

export interface DetectedConversion {
  id: string;
  type: ConversionType;
  destination: string;
  label: string;
  elements_count: number;
  tracking_enabled: boolean;
  google_ads_id: string;
  locations: string[];
}

export type ConversionType = 'whatsapp' | 'phone' | 'email' | 'form' | 'social' | 'external' | 'internal';

// Declarações globais para TypeScript
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    fbq: {
      (...args: any[]): void;
      q?: any[];
      loaded?: boolean;
      version?: string;
      push?: any;
    };
  }
}
