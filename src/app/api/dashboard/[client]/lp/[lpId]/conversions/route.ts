import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Tipos de conversão com campos editáveis
interface EditableConversion {
  id: string;
  type: 'whatsapp' | 'phone' | 'email' | 'form' | 'social';
  destination: string;
  label: string;
  elements_count: number;
  locations: string[];
  enabled: boolean;
  google_ads_id: string;
  custom_label?: string;
  custom_destination?: string;
  custom_message?: string;
  custom_subject?: string;
}

interface ConversionsPayload {
  conversions: EditableConversion[];
}

export async function POST(
  request: NextRequest,
  { params }: { params: { client: string; lpId: string } }
) {
  try {
    const { client: clientId, lpId } = params;
    const { conversions }: ConversionsPayload = await request.json();

    // Validação básica do payload
    if (!Array.isArray(conversions)) {
      return NextResponse.json(
        { success: false, error: 'Conversions deve ser um array' },
        { status: 400 }
      );
    }

    // Validar cada conversão
    const validationResult = validateConversions(conversions);
    if (!validationResult.valid) {
      return NextResponse.json(
        { success: false, error: validationResult.error },
        { status: 400 }
      );
    }

    const trackingPath = path.join(process.cwd(), 'src/app', clientId, 'tracking.json');

    let trackingData = {};
    if (fs.existsSync(trackingPath)) {
      trackingData = JSON.parse(fs.readFileSync(trackingPath, 'utf8'));
    }

    // Processar conversões com campos editáveis
    const processedConversions = conversions.reduce((acc: any, conv: EditableConversion) => {
      acc[conv.id] = {
        id: conv.id,
        type: conv.type,
        destination: conv.destination,
        label: conv.label,
        elements_count: conv.elements_count,
        locations: conv.locations,
        tracking_enabled: conv.enabled,
        google_ads_id: conv.google_ads_id || '',
        custom_label: conv.custom_label || null,
        custom_destination: conv.custom_destination || null,
        custom_message: conv.custom_message || null,
        custom_subject: conv.custom_subject || null,
        effective_label: conv.custom_label || conv.label,
        effective_destination: conv.custom_destination || conv.destination,
        last_updated: new Date().toISOString(),
        has_customizations: !!(
          conv.custom_label ||
          conv.custom_destination ||
          conv.custom_message ||
          conv.custom_subject
        )
      };
      return acc;
    }, {});

    const updatedTrackingData = {
      ...trackingData,
      client: clientId,
      method: (trackingData as any).method || 'direct',
      detected_conversions: processedConversions,
      configured: true,
      last_updated: new Date().toISOString()
    };

    fs.writeFileSync(trackingPath, JSON.stringify(updatedTrackingData, null, 2), 'utf8');

    console.info(
      `✅ Conversões salvas para ${clientId}/${lpId}:`,
      Object.keys(processedConversions).length
    );

    return NextResponse.json({
      success: true,
      message: 'Configurações de conversão salvas com sucesso!',
      data: {
        conversions_count: conversions.length,
        customized_count: conversions.filter(c =>
          c.custom_label ||
          c.custom_destination ||
          c.custom_message ||
          c.custom_subject
        ).length,
        enabled_count: conversions.filter(c => c.enabled).length
      }
    });
  } catch (error) {
    console.error('❌ Erro ao salvar conversões:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

// Função de validação das conversões
function validateConversions(conversions: EditableConversion[]): { valid: boolean; error?: string } {
  for (const conv of conversions) {
    if (!conv.id || !conv.type || !conv.destination) {
      return {
        valid: false,
        error: `Conversão inválida: campos obrigatórios ausentes (id: ${conv.id})`
      };
    }

    const allowedTypes = ['whatsapp', 'phone', 'email', 'form', 'social'];
    if (!allowedTypes.includes(conv.type)) {
      return {
        valid: false,
        error: `Tipo de conversão inválido: ${conv.type} (id: ${conv.id})`
      };
    }

    const typeValidation = validateConversionByType(conv);
    if (!typeValidation.valid) {
      return typeValidation;
    }

    if (conv.google_ads_id && !validateGoogleAdsConversionId(conv.google_ads_id)) {
      return {
        valid: false,
        error: `Google Ads Conversion ID inválido: ${conv.google_ads_id} (id: ${conv.id})`
      };
    }
  }

  return { valid: true };
}

function validateConversionByType(conv: EditableConversion): { valid: boolean; error?: string } {
  switch (conv.type) {
    case 'whatsapp':
      if (conv.custom_destination && !validateWhatsAppNumber(conv.custom_destination)) {
        return {
          valid: false,
          error: `Número WhatsApp inválido: ${conv.custom_destination} (deve seguir formato +5511999999999)`
        };
      }
      break;
    case 'phone':
      if (conv.custom_destination && !validatePhoneNumber(conv.custom_destination)) {
        return {
          valid: false,
          error: `Número de telefone inválido: ${conv.custom_destination} (deve seguir formato +5511999999999)`
        };
      }
      break;
    case 'email':
      if (conv.custom_destination && !validateEmail(conv.custom_destination)) {
        return { valid: false, error: `Email inválido: ${conv.custom_destination}` };
      }
      break;
    case 'social':
      if (conv.custom_destination && !validateSocialUrl(conv.custom_destination)) {
        return { valid: false, error: `URL social inválida: ${conv.custom_destination}` };
      }
      break;
    case 'form':
      if (conv.custom_destination) {
        return { valid: false, error: 'Conversões de formulário não permitem destino personalizado' };
      }
      break;
  }

  return { valid: true };
}

function validateWhatsAppNumber(number: string): boolean {
  return /^\+\d{11,15}$/.test(number);
}

function validatePhoneNumber(number: string): boolean {
  return /^\+\d{11,15}$/.test(number);
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateSocialUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const allowedHosts = [
      'instagram.com',
      'www.instagram.com',
      'facebook.com',
      'www.facebook.com',
      'fb.com',
      'twitter.com',
      'www.twitter.com',
      'x.com',
      'linkedin.com',
      'www.linkedin.com',
      'tiktok.com',
      'www.tiktok.com'
    ];
    return allowedHosts.some(host => urlObj.hostname === host);
  } catch {
    return false;
  }
}

function validateGoogleAdsConversionId(id: string): boolean {
  return /^AW-\d{9,11}\/[A-Za-z0-9_-]+$/.test(id);
}
