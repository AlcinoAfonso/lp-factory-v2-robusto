import type { EditableConversion, SavedConversion } from '../types/editable-conversions';

// Tipos editáveis suportados pelo sistema
type EditableConversionType = 'whatsapp' | 'phone' | 'email' | 'form' | 'social';

// Helper para verificar se o tipo é editável
function isEditableType(type: string): type is EditableConversionType {
  return ['whatsapp', 'phone', 'email', 'form', 'social'].includes(type);
}

export async function loadEditableConversions(
  clientId: string,
  lpId: string
): Promise<EditableConversion[]> {
  try {
    // Tentar carregar tracking.json existente
    const trackingData = await loadTrackingData(clientId);

    if (trackingData?.detected_conversions) {
      // Converter conversões salvas para formato editável
      return Object.values(trackingData.detected_conversions).map(convertToEditableFormat);
    }

    // Se não tiver dados salvos, fazer detecção automática
    console.info(`🔍 Nenhum tracking salvo encontrado para ${clientId}, iniciando detecção...`);
    return await detectConversionsForLP(clientId, lpId);
  } catch (error) {
    console.error('❌ Erro ao carregar conversões:', error);
    // Fallback para detecção automática
    return await detectConversionsForLP(clientId, lpId);
  }
}

async function loadTrackingData(clientId: string): Promise<any> {
  try {
    // Tentar carregar via API primeiro
    const response = await fetch(`/api/tracking/${clientId}`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (response.ok) {
      return await response.json();
    }

    return null;
  } catch (error) {
    console.warn('⚠️ Erro ao carregar tracking.json via API:', error);
    return null;
  }
}

function convertToEditableFormat(savedConversion: any): EditableConversion {
  return {
    // Campos originais
    id: savedConversion.id,
    type: savedConversion.type,
    destination: savedConversion.destination, // Original
    label: savedConversion.label, // Original
    elements_count: savedConversion.elements_count || 1,
    locations: savedConversion.locations || [],

    // Configurações de tracking
    enabled: savedConversion.tracking_enabled || false,
    google_ads_id: savedConversion.google_ads_id || '',

    // Campos editáveis (se existirem)
    custom_label: savedConversion.custom_label || undefined,
    custom_destination: savedConversion.custom_destination || undefined,
    custom_message: savedConversion.custom_message || undefined,
    custom_subject: savedConversion.custom_subject || undefined,
  };
}

async function detectConversionsForLP(clientId: string, lpId: string): Promise<EditableConversion[]> {
  try {
    // Carregar dados da LP para detecção
    const lpData = await loadLPData(clientId, lpId);
    if (!lpData) {
      console.warn(`⚠️ Dados da LP não encontrados: ${clientId}/${lpId}`);
      return [];
    }

    // Usar engine de detecção existente
    const { detectConversionsFromLP } = await import('./detectionEngine');
    const detectedConversions = detectConversionsFromLP(lpData);

    // Filtrar apenas tipos editáveis e converter para formato correto
    return detectedConversions
      .filter((detected) => isEditableType(detected.type))
      .map((detected) => ({
        id: detected.id,
        type: detected.type as EditableConversionType,
        destination: detected.destination,
        label: detected.label,
        elements_count: detected.elements_count,
        locations: detected.locations,
        enabled: false, // Desabilitado por padrão
        google_ads_id: '',
        // Campos editáveis vazios inicialmente
        custom_label: undefined,
        custom_destination: undefined,
        custom_message: undefined,
        custom_subject: undefined,
      }));
  } catch (error) {
    console.error('❌ Erro na detecção automática:', error);
    return [];
  }
}

async function loadLPData(clientId: string, lpId: string): Promise<any> {
  try {
    // Carregar domain.json para encontrar a LP
    const domainResponse = await fetch(`/api/client/${clientId}/domain`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!domainResponse.ok) {
      throw new Error(`Domain config não encontrado: ${clientId}`);
    }

    const domainData = await domainResponse.json();
    const lpConfig = domainData.lps?.[lpId];

    if (!lpConfig) {
      throw new Error(`LP config não encontrada: ${lpId}`);
    }

    // Carregar lp.json
    const lpFolder = lpConfig.folder === '.' ? '' : lpConfig.folder;
    const lpJsonPath = lpFolder ? `${clientId}/${lpFolder}/lp.json` : `${clientId}/lp.json`;

    const lpResponse = await fetch(`/api/lp-data/${lpJsonPath}`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!lpResponse.ok) {
      throw new Error(`LP data não encontrada: ${lpJsonPath}`);
    }

    return await lpResponse.json();
  } catch (error) {
    console.error('❌ Erro ao carregar dados da LP:', error);
    return null;
  }
}

// Função auxiliar para salvar conversões
export async function saveEditableConversions(
  clientId: string,
  lpId: string,
  conversions: EditableConversion[],
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await fetch(`/api/dashboard/${clientId}/lp/${lpId}/conversions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversions }),
    });

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: result.message || 'Conversões salvas com sucesso!',
      };
    } else {
      return {
        success: false,
        error: result.error || 'Erro ao salvar conversões',
      };
    }
  } catch (error) {
    console.error('❌ Erro ao salvar conversões:', error);
    return {
      success: false,
      error: 'Erro de conexão. Tente novamente.',
    };
  }
}

// Função para validar conversões antes de salvar
export function validateEditableConversions(
  conversions: EditableConversion[],
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const conv of conversions) {
    // Validar label (original ou customizado)
    const effectiveLabel = conv.custom_label || conv.label;
    if (!effectiveLabel || effectiveLabel.trim().length === 0) {
      errors.push(`Conversão ${conv.id}: Label não pode estar vazio`);
    }

    // Validar destino (original ou customizado)
    const effectiveDestination = conv.custom_destination || conv.destination;
    if (!effectiveDestination) {
      errors.push(`Conversão ${conv.id}: Destino não pode estar vazio`);
    }

    // Validações específicas por tipo
    const typeValidation = validateByConversionType(conv);
    if (!typeValidation.valid) {
      errors.push(...typeValidation.errors);
    }

    // Validar Google Ads ID se fornecido
    if (conv.google_ads_id && conv.google_ads_id.trim().length > 0) {
      const { ConversionValidators } = require('../types/editable-conversions');
      if (!ConversionValidators.googleAdsId(conv.google_ads_id)) {
        errors.push(`Conversão ${conv.id}: Google Ads ID inválido`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function validateByConversionType(conv: EditableConversion): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const { ConversionValidators } = require('../types/editable-conversions');

  switch (conv.type) {
    case 'whatsapp':
      if (conv.custom_destination && !ConversionValidators.whatsapp.destination(conv.custom_destination)) {
        errors.push(`Conversão ${conv.id}: Número WhatsApp inválido`);
      }
      if (conv.custom_message && !ConversionValidators.whatsapp.message(conv.custom_message)) {
        errors.push(`Conversão ${conv.id}: Mensagem WhatsApp muito longa`);
      }
      break;

    case 'phone':
      if (conv.custom_destination && !ConversionValidators.phone.destination(conv.custom_destination)) {
        errors.push(`Conversão ${conv.id}: Número de telefone inválido`);
      }
      break;

    case 'email':
      if (conv.custom_destination && !ConversionValidators.email.destination(conv.custom_destination)) {
        errors.push(`Conversão ${conv.id}: Email inválido`);
      }
      if (conv.custom_subject && !ConversionValidators.email.subject(conv.custom_subject)) {
        errors.push(`Conversão ${conv.id}: Assunto do email muito longo`);
      }
      break;

    case 'social':
      if (conv.custom_destination && !ConversionValidators.social.destination(conv.custom_destination)) {
        errors.push(`Conversão ${conv.id}: URL de rede social inválida`);
      }
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

