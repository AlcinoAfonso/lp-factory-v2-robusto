import type { DetectedConversion, ConversionType } from '../types';
import type { LandingPageData } from '@/types/lp-config';
import {
  detectLinkType,
  normalizeLinkForGrouping,
  generateConversionId,
  generateLabel,
} from './conversionTypes';

export function detectConversionsFromLP(lpData: LandingPageData): DetectedConversion[] {
  const detectedLinks = new Map<string, DetectedConversion>();

  console.info('🔍 ConversionDetector: Iniciando detecção automática...');

  // Escanear cada seção
  lpData.sections.forEach((section) => {
    scanSection(section, detectedLinks);
  });

  const conversions = Array.from(detectedLinks.values());
  console.info(`✅ ConversionDetector: ${conversions.length} conversões únicas detectadas`);

  return conversions;
}

function scanSection(section: any, detected: Map<string, DetectedConversion>) {
  const sectionId = section.id;

  console.info(`🔍 Escaneando seção: ${sectionId}`);

  // Botões principais
  if (section.primaryButton?.href) {
    addDetectedLink(section.primaryButton.href, sectionId, detected);
  }
  if (section.secondaryButton?.href) {
    addDetectedLink(section.secondaryButton.href, sectionId, detected);
  }

  // Botão geral
  if (section.button?.href) {
    addDetectedLink(section.button.href, sectionId, detected);
  }

  // Botões em items (benefits, services, etc)
  if (section.items) {
    section.items.forEach((item: any) => {
      if (item.button?.href) {
        addDetectedLink(item.button.href, sectionId, detected);
      }
    });
  }

  // Plans (pricing)
  if (section.plans) {
    section.plans.forEach((plan: any) => {
      if (plan.button?.href) {
        addDetectedLink(plan.button.href, sectionId, detected);
      }
    });
  }

  // Formulários de contato
  if (section.type === 'contact' && section.formAction) {
    addDetectedLink(section.formAction, sectionId, detected, 'form');
  }

  // Links do header (telefone)
  if (section.type === 'header' && section.phone?.link) {
    addDetectedLink(section.phone.link, sectionId, detected);
  }

  // Links do footer
  if (section.type === 'footer') {
    if (section.instagram?.url) {
      addDetectedLink(section.instagram.url, sectionId, detected, 'social');
    }
    if (section.legalLink?.href) {
      addDetectedLink(section.legalLink.href, sectionId, detected);
    }
  }

  // Compatibilidade com formato V2 (WhatsApp buttons)
  if (section.botao_whatsapp) {
    const whatsappUrl = `https://wa.me/${section.botao_whatsapp.numero}?text=${encodeURIComponent(
      section.botao_whatsapp.mensagem,
    )}`;
    addDetectedLink(whatsappUrl, sectionId, detected, 'whatsapp');
  }
}

function addDetectedLink(
  href: string,
  sectionId: string,
  detected: Map<string, DetectedConversion>,
  forceType?: ConversionType,
) {
  if (!href || href === '#' || href === '' || href.startsWith('javascript:')) {
    return; // Ignorar links vazios ou perigosos
  }

  const conversionType = forceType || detectLinkType(href);
  const normalizedHref = normalizeLinkForGrouping(href, conversionType);
  const conversionId = generateConversionId(normalizedHref, conversionType);

  if (detected.has(conversionId)) {
    // Incrementar contador e adicionar localização
    const existing = detected.get(conversionId)!;
    existing.elements_count++;
    if (!existing.locations.includes(sectionId)) {
      existing.locations.push(sectionId);
    }
    console.info(
      `📊 ConversionDetector: +1 elemento para ${conversionId} (total: ${existing.elements_count})`,
    );
  } else {
    // Nova conversão detectada
    const newConversion: DetectedConversion = {
      id: conversionId,
      type: conversionType,
      destination: normalizedHref,
      label: generateLabel(normalizedHref, conversionType),
      elements_count: 1,
      tracking_enabled: false, // Desabilitado por padrão
      google_ads_id: '',
      locations: [sectionId],
    };

    detected.set(conversionId, newConversion);
    console.info(
      `✨ ConversionDetector: Nova conversão detectada - ${conversionId} (${conversionType})`,
    );
  }
}

export function getConversionPriority(conversion: DetectedConversion): number {
  // Sistema de prioridade para sugestões inteligentes
  switch (conversion.type) {
    case 'whatsapp':
      return 10; // Prioridade máxima
    case 'form':
      return 9; // Muito importante
    case 'phone':
      return 8; // Importante
    case 'email':
      return 7;
    case 'external':
      return 5;
    case 'social':
      return 3;
    default:
      return 1;
  }
}

export function getSuggestedConversions(conversions: DetectedConversion[]): DetectedConversion[] {
  return conversions
    .sort((a, b) => {
      // Ordenar por prioridade e depois por quantidade de elementos
      const priorityDiff = getConversionPriority(b) - getConversionPriority(a);
      if (priorityDiff !== 0) return priorityDiff;
      return b.elements_count - a.elements_count;
    })
    .slice(0, 3); // Top 3 sugestões
}
