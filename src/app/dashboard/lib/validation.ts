/**
 * Validar formato de IDs de tracking
 */
export const trackingValidation = {
  googleAds: (id: string): boolean => {
    return /^AW-\d{9,11}$/.test(id);
  },
  
  googleAdsConversion: (id: string): boolean => {
    return /^AW-\d{9,11}\/[A-Za-z0-9_-]+$/.test(id);
  },
  
  metaPixel: (id: string): boolean => {
    return /^\d{15,16}$/.test(id);
  },
  
  googleAnalytics: (id: string): boolean => {
    return /^G-[A-Z0-9]{10}$/.test(id);
  },
  
  gtmId: (id: string): boolean => {
    return /^GTM-[A-Z0-9]{7}$/.test(id);
  },
};

/**
 * Validar URL de imagem
 */
export function validateImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const validProtocols = ['http:', 'https:'];
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    
    if (!validProtocols.includes(parsed.protocol)) {
      return false;
    }
    
    const hasValidExtension = validExtensions.some(ext => 
      parsed.pathname.toLowerCase().endsWith(ext)
    );
    
    return hasValidExtension;
  } catch {
    return false;
  }
}

/**
 * Validar domínio
 */
export function validateDomain(domain: string): boolean {
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return domainRegex.test(domain);
}

/**
 * Sanitizar input do usuário
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}
