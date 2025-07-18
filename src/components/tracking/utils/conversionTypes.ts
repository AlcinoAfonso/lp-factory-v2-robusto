import type { ConversionType } from '../types';

export function detectLinkType(href: string): ConversionType {
  if (href.includes('wa.me/') || href.includes('api.whatsapp.com/')) {
    return 'whatsapp';
  }
  if (href.startsWith('tel:')) {
    return 'phone';
  }
  if (href.startsWith('mailto:')) {
    return 'email';
  }
  if (href.startsWith('#') || href.includes('form') || href.includes('contact')) {
    return 'form';
  }
  if (
    href.includes('instagram.com') ||
    href.includes('facebook.com') ||
    href.includes('twitter.com')
  ) {
    return 'social';
  }
  if (href.startsWith('http')) {
    return 'external';
  }
  return 'internal';
}

export function normalizeLinkForGrouping(href: string, type: ConversionType): string {
  switch (type) {
    case 'whatsapp':
      // Extrair apenas o número: wa.me/5511999998888 → +5511999998888
      const match = href.match(/wa\.me\/(\d+)/);
      return match ? `+${match[1]}` : href;

    case 'phone':
      // Normalizar telefone: tel:+5511999998888 → +5511999998888
      return href.replace('tel:', '');

    case 'email':
      // Normalizar email: mailto:contato@empresa.com → contato@empresa.com
      return href.replace('mailto:', '');

    case 'social':
      // Manter URL base: https://instagram.com/empresa → https://instagram.com/empresa
      return href.split('?')[0]; // Remove query params

    default:
      return href;
  }
}

export function generateConversionId(normalizedHref: string, type: ConversionType): string {
  switch (type) {
    case 'whatsapp':
      return `whatsapp_${normalizedHref.replace(/\D/g, '')}`;
    case 'phone':
      return `phone_${normalizedHref.replace(/\D/g, '')}`;
    case 'email':
      return `email_${normalizedHref.replace(/[@.]/g, '_')}`;
    case 'form':
      return 'form_contact';
    case 'social':
      const domain =
        normalizedHref.match(/\/\/([^\/]+)/)?.[1]?.replace('www.', '') || 'social';
      return `social_${domain.replace(/[^a-zA-Z0-9]/g, '_')}`;
    default:
      return `external_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export function generateLabel(normalizedHref: string, type: ConversionType): string {
  switch (type) {
    case 'whatsapp':
      return `WhatsApp ${normalizedHref}`;
    case 'phone':
      return `Telefone ${normalizedHref}`;
    case 'email':
      return `Email ${normalizedHref}`;
    case 'form':
      return 'Formulário de Contato';
    case 'social':
      if (normalizedHref.includes('instagram.com')) {
        const username = normalizedHref.match(/instagram\.com\/([^\/\?]+)/)?.[1];
        return `Instagram @${username || 'perfil'}`;
      }
      if (normalizedHref.includes('facebook.com')) {
        return 'Facebook';
      }
      return 'Rede Social';
    default:
      return `Link Externo (${normalizedHref})`;
  }
}
