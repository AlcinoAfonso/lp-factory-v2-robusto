'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, Save, X, Edit3, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EditableConversion, ConversionValidationResult } from '../../../components/tracking/types/editable-conversions';
import { ConversionValidators, ValidationMessages } from '../../../components/tracking/types/editable-conversions';

interface ConversionsEditorProps {
  clientId: string;
  lpId: string;
  lpData: any;
}

interface ConversionUIState {
  id: string;
  isEditing: boolean;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  validationErrors: string[];
}

export function ConversionsEditor({ clientId, lpId, lpData }: ConversionsEditorProps) {
  const [conversions, setConversions] = useState<EditableConversion[]>([]);
  const [uiState, setUIState] = useState<Record<string, ConversionUIState>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [globalMessage, setGlobalMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Carregar conversões detectadas
  const loadConversions = useCallback(async () => {
    setIsLoading(true);
    try {
      const { loadEditableConversions } = await import('../../../components/tracking/utils/conversionLoader');
      const detected = await loadEditableConversions(clientId, lpId);
      
      setConversions(detected);
      
      // Inicializar estado da UI
      const initialUIState: Record<string, ConversionUIState> = {};
      detected.forEach(conv => {
        initialUIState[conv.id] = {
          id: conv.id,
          isEditing: false,
          isLoading: false,
          hasUnsavedChanges: false,
          validationErrors: [],
        };
      });
      setUIState(initialUIState);
      
      console.info(`✅ ConversionsEditor: ${detected.length} conversões carregadas`);
    } catch (error) {
      console.error('❌ Erro ao carregar conversões:', error);
      setGlobalMessage({ type: 'error', text: 'Erro ao carregar conversões. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  }, [clientId, lpId]);

  useEffect(() => {
    loadConversions();
  }, [loadConversions]);

  // Atualizar conversão
  const updateConversion = (conversionId: string, updates: Partial<EditableConversion>) => {
    setConversions(prev => prev.map(conv => 
      conv.id === conversionId ? { ...conv, ...updates } : conv
    ));
    
    setUIState(prev => ({
      ...prev,
      [conversionId]: {
        ...prev[conversionId],
        hasUnsavedChanges: true,
        validationErrors: [],
      }
    }));
  };

  // Validar conversão
  const validateConversion = (conversion: EditableConversion): string[] => {
    const errors: string[] = [];

    // Label obrigatório
    const effectiveLabel = conversion.custom_label || conversion.label;
    if (!effectiveLabel?.trim()) {
      errors.push('Label não pode estar vazio');
    }

    // Validações específicas por tipo
    switch (conversion.type) {
      case 'whatsapp':
        if (conversion.custom_destination && !ConversionValidators.whatsapp.destination(conversion.custom_destination)) {
          errors.push(ValidationMessages.whatsapp.destination);
        }
        if (conversion.custom_message && !ConversionValidators.whatsapp.message(conversion.custom_message)) {
          errors.push(ValidationMessages.whatsapp.message);
        }
        break;

      case 'phone':
        if (conversion.custom_destination && !ConversionValidators.phone.destination(conversion.custom_destination)) {
          errors.push(ValidationMessages.phone.destination);
        }
        break;

      case 'email':
        if (conversion.custom_destination && !ConversionValidators.email.destination(conversion.custom_destination)) {
          errors.push(ValidationMessages.email.destination);
        }
        if (conversion.custom_subject && !ConversionValidators.email.subject(conversion.custom_subject)) {
          errors.push(ValidationMessages.email.subject);
        }
        break;

      case 'social':
        if (conversion.custom_destination && !ConversionValidators.social.destination(conversion.custom_destination)) {
          errors.push(ValidationMessages.social.destination);
        }
        break;
    }

    // Google Ads ID
    if (conversion.google_ads_id && !ConversionValidators.googleAdsId(conversion.google_ads_id)) {
      errors.push(ValidationMessages.googleAdsId);
    }

    return errors;
  };

  // Salvar conversão individual
  const saveConversion = async (conversionId: string) => {
    const conversion = conversions.find(c => c.id === conversionId);
    if (!conversion) return;

    // Validar antes de salvar
    const errors = validateConversion(conversion);
    if (errors.length > 0) {
      setUIState(prev => ({
        ...prev,
        [conversionId]: {
          ...prev[conversionId],
          validationErrors: errors,
        }
      }));
      return;
    }

    setUIState(prev => ({
      ...prev,
      [conversionId]: { ...prev[conversionId], isLoading: true }
    }));

    try {
      const { saveEditableConversions } = await import('../../../components/tracking/utils/conversionLoader');
      const result = await saveEditableConversions(clientId, lpId, [conversion]);

      if (result.success) {
        setUIState(prev => ({
          ...prev,
          [conversionId]: {
            ...prev[conversionId],
            isEditing: false,
            hasUnsavedChanges: false,
            validationErrors: [],
            isLoading: false,
          }
        }));
        setGlobalMessage({ type: 'success', text: 'Conversão salva com sucesso!' });
      } else {
        throw new Error(result.error || 'Erro ao salvar');
      }
    } catch (error) {
      console.error('❌ Erro ao salvar conversão:', error);
      setUIState(prev => ({
        ...prev,
        [conversionId]: {
          ...prev[conversionId],
          isLoading: false,
          validationErrors: ['Erro ao salvar. Tente novamente.'],
        }
      }));
    }
  };

  // Cancelar edição
  const cancelEdit = (conversionId: string) => {
    // Recarregar dados originais (simplificado - em produção, manter backup)
    loadConversions();
  };

  // Alternar modo de edição
  const toggleEdit = (conversionId: string) => {
    setUIState(prev => ({
      ...prev,
      [conversionId]: {
        ...prev[conversionId],
        isEditing: !prev[conversionId]?.isEditing,
        validationErrors: [],
      }
    }));
  };

  // Salvar todas as conversões
  const saveAllConversions = async () => {
    setIsSaving(true);
    try {
      const { saveEditableConversions } = await import('../../../components/tracking/utils/conversionLoader');
      const result = await saveEditableConversions(clientId, lpId, conversions);

      if (result.success) {
        // Resetar todos os estados para não-editando
        const newUIState = { ...uiState };
        Object.keys(newUIState).forEach(id => {
          newUIState[id] = {
            ...newUIState[id],
            isEditing: false,
            hasUnsavedChanges: false,
            validationErrors: [],
          };
        });
        setUIState(newUIState);
        setGlobalMessage({ type: 'success', text: 'Todas as conversões foram salvas com sucesso!' });
      } else {
        throw new Error(result.error || 'Erro ao salvar conversões');
      }
    } catch (error) {
      console.error('❌ Erro ao salvar todas as conversões:', error);
      setGlobalMessage({ type: 'error', text: 'Erro ao salvar conversões. Tente novamente.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Detectando Conversões...</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const hasUnsavedChanges = Object.values(uiState).some(state => state.hasUnsavedChanges);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Conversões Detectadas</h2>
          <p className="text-sm text-gray-500 mt-1">
            {conversions.length} conversões encontradas • Configure e personalize cada uma
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {hasUnsavedChanges && (
            <span className="text-sm text-amber-600 font-medium">
              Alterações não salvas
            </span>
          )}
          <button
            onClick={saveAllConversions}
            disabled={isSaving || !hasUnsavedChanges}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md transition-colors',
              hasUnsavedChanges
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            )}
          >
            {isSaving ? 'Salvando...' : 'Salvar Todas'}
          </button>
        </div>
      </div>

      {/* Mensagem global */}
      {globalMessage && (
        <div className={cn(
          'mb-6 p-4 rounded-md border',
          globalMessage.type === 'success' 
            ? 'bg-green-50 text-green-800 border-green-200' 
            : 'bg-red-50 text-red-800 border-red-200'
        )}>
          <div className="flex items-center">
            {globalMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            {globalMessage.text}
          </div>
        </div>
      )}

      {conversions.length > 0 ? (
        <div className="space-y-4">
          {conversions.map((conversion) => (
            <ConversionCard
              key={conversion.id}
              conversion={conversion}
              uiState={uiState[conversion.id] || {
                id: conversion.id,
                isEditing: false,
                isLoading: false,
                hasUnsavedChanges: false,
                validationErrors: [],
              }}
              onUpdate={(updates) => updateConversion(conversion.id, updates)}
              onSave={() => saveConversion(conversion.id)}
              onCancel={() => cancelEdit(conversion.id)}
              onToggleEdit={() => toggleEdit(conversion.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma conversão detectada
          </h3>
          <p className="text-gray-500">
            Não foram encontrados links de WhatsApp, telefone, email ou formulários nesta LP.
          </p>
        </div>
      )}
    </div>
  );
}

// Componente individual de conversão
interface ConversionCardProps {
  conversion: EditableConversion;
  uiState: ConversionUIState;
  onUpdate: (updates: Partial<EditableConversion>) => void;
  onSave: () => void;
  onCancel: () => void;
  onToggleEdit: () => void;
}

function ConversionCard({ 
  conversion, 
  uiState, 
  onUpdate, 
  onSave, 
  onCancel, 
  onToggleEdit 
}: ConversionCardProps) {
  const getConversionIcon = (type: string): string => {
    const icons: Record<string, string> = {
      whatsapp: '💬',
      phone: '📞',
      email: '📧',
      form: '📋',
      social: '📱',
    };
    return icons[type] || '🔗';
  };

  const effectiveLabel = conversion.custom_label || conversion.label;
  const effectiveDestination = conversion.custom_destination || conversion.destination;

  return (
    <div className={cn(
      'border rounded-lg transition-all',
      uiState.isEditing ? 'border-blue-300 bg-blue-50' : 'border-gray-200',
      uiState.hasUnsavedChanges && 'border-amber-300 bg-amber-50'
    )}>
      <div className="p-4">
        {/* Header da conversão */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">{getConversionIcon(conversion.type)}</span>
            <div>
              <h3 className="font-medium text-gray-900">{effectiveLabel}</h3>
              <p className="text-sm text-gray-500">
                {conversion.elements_count} elemento{conversion.elements_count !== 1 ? 's' : ''} • 
                Seções: {conversion.locations.join(', ')}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Destino:</strong> {effectiveDestination}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Toggle de habilitação */}
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={conversion.enabled}
                onChange={(e) => onUpdate({ enabled: e.target.checked })}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                {conversion.enabled ? 'Habilitado' : 'Desabilitado'}
              </span>
            </label>

            {/* Botão de edição */}
            <button
              onClick={onToggleEdit}
              className={cn(
                'p-2 rounded-md transition-colors',
                uiState.isEditing 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
              title={uiState.isEditing ? 'Cancelar edição' : 'Editar conversão'}
            >
              {uiState.isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Campos de edição */}
        {uiState.isEditing && (
          <div className="space-y-4 pt-4 border-t border-blue-200">
            {/* Label personalizado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Label Personalizado
              </label>
              <input
                type="text"
                value={conversion.custom_label || ''}
                onChange={(e) => onUpdate({ custom_label: e.target.value || undefined })}
                placeholder={conversion.label}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Campos específicos por tipo */}
            <ConversionTypeFields 
              conversion={conversion} 
              onUpdate={onUpdate} 
            />

            {/* Google Ads Conversion ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Google Ads Conversion ID
              </label>
              <input
                type="text"
                value={conversion.google_ads_id}
                onChange={(e) => onUpdate({ google_ads_id: e.target.value })}
                placeholder="AW-XXXXXXXXX/AbCdEfG"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Erros de validação */}
            {uiState.validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-2" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Erros de validação:</h4>
                    <ul className="text-sm text-red-700 mt-1 list-disc list-inside">
                      {uiState.validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Botões de ação */}
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={onCancel}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={onSave}
                disabled={uiState.isLoading}
                className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uiState.isLoading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Campos específicos por tipo de conversão
interface ConversionTypeFieldsProps {
  conversion: EditableConversion;
  onUpdate: (updates: Partial<EditableConversion>) => void;
}

function ConversionTypeFields({ conversion, onUpdate }: ConversionTypeFieldsProps) {
  switch (conversion.type) {
    case 'whatsapp':
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número WhatsApp Personalizado
            </label>
            <input
              type="text"
              value={conversion.custom_destination || ''}
              onChange={(e) => onUpdate({ custom_destination: e.target.value || undefined })}
              placeholder={conversion.destination}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Formato: +5511999999999</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mensagem Personalizada
            </label>
            <textarea
              value={conversion.custom_message || ''}
              onChange={(e) => onUpdate({ custom_message: e.target.value || undefined })}
              placeholder="Olá! Gostaria de saber mais..."
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {(conversion.custom_message || '').length}/500 caracteres
            </p>
          </div>
        </>
      );

    case 'phone':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de Telefone Personalizado
          </label>
          <input
            type="text"
            value={conversion.custom_destination || ''}
            onChange={(e) => onUpdate({ custom_destination: e.target.value || undefined })}
            placeholder={conversion.destination}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Formato: +5511999999999</p>
        </div>
      );

    case 'email':
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Personalizado
            </label>
            <input
              type="email"
              value={conversion.custom_destination || ''}
              onChange={(e) => onUpdate({ custom_destination: e.target.value || undefined })}
              placeholder={conversion.destination}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assunto Personalizado
            </label>
            <input
              type="text"
              value={conversion.custom_subject || ''}
              onChange={(e) => onUpdate({ custom_subject: e.target.value || undefined })}
              placeholder="Assunto do email..."
              maxLength={200}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {(conversion.custom_subject || '').length}/200 caracteres
            </p>
          </div>
        </>
      );

    case 'social':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL da Rede Social Personalizada
          </label>
          <input
            type="url"
            value={conversion.custom_destination || ''}
            onChange={(e) => onUpdate({ custom_destination: e.target.value || undefined })}
            placeholder={conversion.destination}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            URLs permitidas: Instagram, Facebook, Twitter, LinkedIn, TikTok
          </p>
        </div>
      );

    case 'form':
      return (
        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-sm text-gray-600">
            📋 <strong>Conversões de formulário</strong> não permitem personalização de destino.
            Apenas o Google Ads Conversion ID pode ser configurado.
          </p>
        </div>
      );

    default:
      return null;
  }
}

