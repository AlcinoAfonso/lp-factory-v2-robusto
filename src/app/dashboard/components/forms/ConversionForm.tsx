'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle, Save, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EditableConversion } from '../../../../components/tracking/types/editable-conversions';
import { ConversionValidators, ValidationMessages } from '../../../../components/tracking/types/editable-conversions';

interface ConversionFormProps {
  conversion: EditableConversion;
  onSave: (updatedConversion: EditableConversion) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConversionForm({ conversion, onSave, onCancel, isLoading = false }: ConversionFormProps) {
  const [formData, setFormData] = useState<EditableConversion>({ ...conversion });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Detectar se há mudanças
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(conversion);

  // Validar formulário
  const validateForm = (): boolean => {
    const errors: string[] = [];

    // Label obrigatório
    const effectiveLabel = formData.custom_label || formData.label;
    if (!effectiveLabel?.trim()) {
      errors.push('Label não pode estar vazio');
    }

    // Validações específicas por tipo
    switch (formData.type) {
      case 'whatsapp':
        if (formData.custom_destination && !ConversionValidators.whatsapp.destination(formData.custom_destination)) {
          errors.push(ValidationMessages.whatsapp.destination);
        }
        if (formData.custom_message && !ConversionValidators.whatsapp.message(formData.custom_message)) {
          errors.push(ValidationMessages.whatsapp.message);
        }
        break;

      case 'phone':
        if (formData.custom_destination && !ConversionValidators.phone.destination(formData.custom_destination)) {
          errors.push(ValidationMessages.phone.destination);
        }
        break;

      case 'email':
        if (formData.custom_destination && !ConversionValidators.email.destination(formData.custom_destination)) {
          errors.push(ValidationMessages.email.destination);
        }
        if (formData.custom_subject && !ConversionValidators.email.subject(formData.custom_subject)) {
          errors.push(ValidationMessages.email.subject);
        }
        break;

      case 'social':
        if (formData.custom_destination && !ConversionValidators.social.destination(formData.custom_destination)) {
          errors.push(ValidationMessages.social.destination);
        }
        break;
    }

    // Google Ads ID
    if (formData.google_ads_id && !ConversionValidators.googleAdsId(formData.google_ads_id)) {
      errors.push(ValidationMessages.googleAdsId);
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Erro ao salvar conversão:', error);
      setValidationErrors(['Erro ao salvar. Tente novamente.']);
    } finally {
      setIsSaving(false);
    }
  };

  // Resetar formulário
  const handleReset = () => {
    setFormData({ ...conversion });
    setValidationErrors([]);
  };

  // Atualizar campo
  const updateField = (field: keyof EditableConversion, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erros de validação ao editar
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Editar Conversão: {formData.label}
          </h3>
          <p className="text-sm text-gray-500">
            Tipo: {formData.type} • {formData.elements_count} elemento{formData.elements_count !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={cn(
            'px-2 py-1 text-xs font-medium rounded-full',
            formData.enabled 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-600'
          )}>
            {formData.enabled ? 'Habilitado' : 'Desabilitado'}
          </span>
        </div>
      </div>

      {/* Configuração básica */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Toggle de habilitação */}
        <div className="md:col-span-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) => updateField('enabled', e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-3 text-sm font-medium text-gray-700">
              Habilitar tracking para esta conversão
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Apenas conversões habilitadas serão rastreadas nas campanhas
          </p>
        </div>

        {/* Label personalizado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Label Personalizado
          </label>
          <input
            type="text"
            value={formData.custom_label || ''}
            onChange={(e) => updateField('custom_label', e.target.value || undefined)}
            placeholder={formData.label}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Deixe vazio para usar o label original: "{formData.label}"
          </p>
        </div>

        {/* Google Ads Conversion ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Google Ads Conversion ID
          </label>
          <input
            type="text"
            value={formData.google_ads_id}
            onChange={(e) => updateField('google_ads_id', e.target.value)}
            placeholder="AW-XXXXXXXXX/AbCdEfG"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Obrigatório para rastreamento de conversões no Google Ads
          </p>
        </div>
      </div>

      {/* Campos específicos por tipo */}
      <ConversionTypeSpecificFields 
        conversion={formData}
        onUpdate={updateField}
      />

      {/* Preview das configurações */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Preview da Configuração</h4>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="font-medium text-gray-700">Label Efetivo:</dt>
            <dd className="text-gray-600">{formData.custom_label || formData.label}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">Destino Efetivo:</dt>
            <dd className="text-gray-600 truncate">{formData.custom_destination || formData.destination}</dd>
          </div>
          {formData.custom_message && (
            <div className="md:col-span-2">
              <dt className="font-medium text-gray-700">Mensagem:</dt>
              <dd className="text-gray-600">{formData.custom_message}</dd>
            </div>
          )}
          {formData.custom_subject && (
            <div className="md:col-span-2">
              <dt className="font-medium text-gray-700">Assunto:</dt>
              <dd className="text-gray-600">{formData.custom_subject}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Erros de validação */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Erros de validação:</h4>
              <ul className="text-sm text-red-700 mt-2 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-1 h-1 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Botões de ação */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={handleReset}
          disabled={!hasChanges || isSaving || isLoading}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Resetar
        </button>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving || isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={!hasChanges || isSaving || isLoading || validationErrors.length > 0}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving || isLoading ? (
              <>
                <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

// Campos específicos por tipo de conversão
interface ConversionTypeSpecificFieldsProps {
  conversion: EditableConversion;
  onUpdate: (field: keyof EditableConversion, value: any) => void;
}

function ConversionTypeSpecificFields({ conversion, onUpdate }: ConversionTypeSpecificFieldsProps) {
  switch (conversion.type) {
    case 'whatsapp':
      return (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Configurações WhatsApp</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número WhatsApp Personalizado
            </label>
            <input
              type="text"
              value={conversion.custom_destination || ''}
              onChange={(e) => onUpdate('custom_destination', e.target.value || undefined)}
              placeholder={conversion.destination}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Formato: +5511999999999 (deixe vazio para usar o original: {conversion.destination})
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensagem Personalizada
            </label>
            <textarea
              value={conversion.custom_message || ''}
              onChange={(e) => onUpdate('custom_message', e.target.value || undefined)}
              placeholder="Olá! Gostaria de saber mais sobre..."
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {(conversion.custom_message || '').length}/500 caracteres • Mensagem que aparecerá no WhatsApp
            </p>
          </div>
        </div>
      );

    case 'phone':
      return (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Configurações Telefone</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Telefone Personalizado
            </label>
            <input
              type="text"
              value={conversion.custom_destination || ''}
              onChange={(e) => onUpdate('custom_destination', e.target.value || undefined)}
              placeholder={conversion.destination}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Formato: +5511999999999 (deixe vazio para usar o original: {conversion.destination})
            </p>
          </div>
        </div>
      );

    case 'email':
      return (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Configurações Email</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Personalizado
            </label>
            <input
              type="email"
              value={conversion.custom_destination || ''}
              onChange={(e) => onUpdate('custom_destination', e.target.value || undefined)}
              placeholder={conversion.destination}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Deixe vazio para usar o original: {conversion.destination}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assunto Personalizado
            </label>
            <input
              type="text"
              value={conversion.custom_subject || ''}
              onChange={(e) => onUpdate('custom_subject', e.target.value || undefined)}
              placeholder="Assunto do email..."
              maxLength={200}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {(conversion.custom_subject || '').length}/200 caracteres • Assunto que aparecerá no email
            </p>
          </div>
        </div>
      );

    case 'social':
      return (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Configurações Rede Social</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL da Rede Social Personalizada
            </label>
            <input
              type="url"
              value={conversion.custom_destination || ''}
              onChange={(e) => onUpdate('custom_destination', e.target.value || undefined)}
              placeholder={conversion.destination}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              URLs permitidas: Instagram, Facebook, Twitter, LinkedIn, TikTok
            </p>
            <p className="text-xs text-gray-500">
              Original: {conversion.destination}
            </p>
          </div>
        </div>
      );

    case 'form':
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="text-blue-400 text-xl mr-3">📋</div>
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                Conversão de Formulário
              </h4>
              <p className="text-sm text-blue-700">
                Conversões de formulário não permitem personalização de destino. 
                Apenas o Google Ads Conversion ID e o status de habilitação podem ser configurados.
              </p>
              <p className="text-xs text-blue-600 mt-2">
                Destino: {conversion.destination}
              </p>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            Tipo de conversão "{conversion.type}" não possui configurações específicas.
          </p>
        </div>
      );
  }
}

