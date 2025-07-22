export interface EditableConversion {
  // Campos originais (detectados automaticamente)
  id: string;
  type: 'whatsapp' | 'phone' | 'email' | 'form' | 'social';
  destination: string; // Original detectado
  label: string; // Original detectado
  elements_count: number;
  locations: string[];
  
  // Configurações de tracking
  enabled: boolean;
  google_ads_id: string;
  
  // NOVOS - Campos editáveis pelo usuário
  custom_label?: string; // Label personalizado
  custom_destination?: string; // Link personalizado
  custom_message?: string; // Mensagem WhatsApp personalizada
  custom_subject?: string; // Assunto email personalizado
}

export interface SavedConversion extends EditableConversion {
  // Campos computados (salvos na API)
  effective_label: string; // custom_label || label
  effective_destination: string; // custom_destination || destination
  
  // Metadados
  tracking_enabled: boolean; // enabled
  last_updated: string;
  has_customizations: boolean;
}

export interface ConversionFormData {
  // Dados do formulário de edição
  label: string;
  destination: string;
  message?: string; // Para WhatsApp
  subject?: string; // Para Email
  google_ads_id: string;
  enabled: boolean;
}

export interface ConversionValidationResult {
  valid: boolean;
  errors: ConversionFieldError[];
}

export interface ConversionFieldError {
  field: keyof EditableConversion;
  message: string;
}

// Tipos para diferentes estados da UI
export interface ConversionUIState {
  id: string;
  isEditing: boolean;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  validationErrors: ConversionFieldError[];
}

// Payload para a API
export interface SaveConversionsPayload {
  conversions: EditableConversion[];
}

export interface SaveConversionsResponse {
  success: boolean;
  message: string;
  data?: {
    conversions_count: number;
    customized_count: number;
    enabled_count: number;
  };
  error?: string;
  details?: string;
}

// Helpers para validação client-side
export const ConversionValidators = {
  whatsapp: {
    destination: (value: string) => /^\+\d{11,15}$/.test(value),
    message: (value: string) => value.length <= 500,
  },
  phone: {
    destination: (value: string) => /^\+\d{11,15}$/.test(value),
  },
  email: {
    destination: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    subject: (value: string) => value.length <= 200,
  },
  social: {
    destination: (value: string) => {
      try {
        const url = new URL(value);
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
          'www.tiktok.com',
        ];
        return allowedHosts.some((host) => url.hostname === host);
      } catch {
        return false;
      }
    },
  },
  googleAdsId: (value: string) => /^AW-\d{9,11}\/[A-Za-z0-9_-]+$/.test(value),
};

// Mensagens de erro padronizadas
export const ValidationMessages = {
  whatsapp: {
    destination: 'Número deve seguir o formato +5511999999999',
    message: 'Mensagem deve ter no máximo 500 caracteres',
  },
  phone: {
    destination: 'Telefone deve seguir o formato +5511999999999',
  },
  email: {
    destination: 'Email deve ser um endereço válido',
    subject: 'Assunto deve ter no máximo 200 caracteres',
  },
  social: {
    destination: 'URL deve ser de uma rede social válida (Instagram, Facebook, etc.)',
  },
  googleAdsId: 'ID deve seguir o formato AW-123456789/AbC123',
  label: 'Label é obrigatório',
};
