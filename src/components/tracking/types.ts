export interface TrackingConfig {
  client: string;
  method: 'gtm' | 'direct' | 'both';
  gtm_snippet?: {
    head: string;
    body: string;
  };
  direct_ids?: {
    google_ads?: {
      remarketing?: string;
      conversions?: Record<string, string>;
    };
    meta_pixel?: string;
    google_analytics?: string;
  };
  configured: boolean;
}

// Declarações globais para TypeScript
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void;
  }
}
