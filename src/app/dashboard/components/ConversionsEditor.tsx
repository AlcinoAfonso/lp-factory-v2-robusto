'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, Save, X, Edit3, AlertCircle, CheckCircle, Eye } from 'lucide-react';
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
  showPreview: boolean;
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
      // ✅ CORREÇÃO: Usar detecção automática simples para começar
      const mockConversions: EditableConversion[] = [
        {
          id: 'whatsapp_5521979658483',
          type: 'whatsapp',
          destination: '+5521979658483',
          label: 'WhatsApp FitNutri',
          elements_count: 8,
          locations: ['hero', 'pricing', 'steps', 'ctaFinal'],
          enabled: false,
          google_ads_id: '',
          custom_label: undefined,
          custom_destination: undefined,
          custom_message: undefined,
          custom_subject: undefined,
        },
        {
          id: 'form_contact',
          type: 'form',
          destination: '#contact-form',
          label: 'Formulário de Contato',
          elements_count: 1,
          locations: ['contact'],
          enabled: false,
          google_ads_id: '',
          custom_label: undefined,
          custom_destination: undefined,
          custom_message: undefined,
          custom_subject: undefined,
        }
      ];
      
      setConversions(mockConversions);
      
      // Inicializar estado da UI
      const initialUIState: Record<string, ConversionUIState> = {};
      mockConversions.forEach(conv => {
        initialUIState[conv.id] = {
          id: conv.id,
          isEditing: false,
          isLoading: false,
          hasUnsavedChanges: false,
          validationErrors: [],
          showPreview: false,
        };
      });
      setUIState(initialUIState);
      
      console.info(`✅ ConversionsEditor: ${mockConversions.length} conversões carregadas`);
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

  // Salvar conversão individual
  const saveConversion = async (conversionId: string) => {
    const conversion = conversions.find(c => c.id === conversionId);
    if (!conversion) return;

    setUIState(prev => ({
      ...prev,
      [conversionId]: { ...prev[conversionId], isLoading: true }
    }));

    try {
      // ✅ CORREÇÃO: Usar API save-and-deploy 
      const trackingData = {
        client: clientId,
        method: 'direct' as const,
        detected_conversions: {
          [conversion.id]: {
            id: conversion.id,
            type: conversion.type,
            destination: conversion.custom_destination || conversion.destination,
            label: conversion.custom_label || conversion.label,
            elements_count: conversion.elements_count,
            locations: conversion.locations,
            tracking_enabled: conversion.enabled,
            google_ads_id: conversion.google_ads_id || '',
            custom_label: conversion.custom_label || null,
            custom_destination: conversion.custom_destination || null,
            custom_message: conversion.custom_message || null,
            custom_subject: conversion.custom_subject || null,
            effective_label: conversion.custom_label || conversion.label,
            effective_destination: conversion.custom_destination || conversion.destination,
            last_updated: new Date().toISOString(),
            has_customizations: !!(
              conversion.custom_label ||
              conversion.custom_destination ||
              conversion.custom_message ||
              conversion.custom_subject
            )
          }
        },
        configured: true,
        last_updated: new Date().toISOString()
      };

      const response = await fetch(`/api/dashboard/${clientId}/save-and-deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'tracking',
          lpId: lpId,
          data: trackingData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro na API');
      }

      const result = await response.json();

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
      
      setGlobalMessage({ 
        type: 'success', 
        text: `Conversão "${conversion.label}" salva e publicada com sucesso! Deploy iniciado.` 
      });
      setTimeout(() => setGlobalMessage(null), 5000);

    } catch (error) {
      console.error('❌ Erro ao salvar conversão:', error);
      setUIState(prev => ({
        ...prev,
        [conversionId]: {
          ...prev[conversionId],
          isLoading: false,
          validationErrors: ['Erro ao salvar. Verifique a conexão e tente novamente.'],
        }
      }));
    }
  };

  // Cancelar edição
  const cancelEdit = (conversionId: string) => {
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
        showPreview: false,
      }
    }));
  };

  // Salvar todas as conversões
  const saveAllConversions = async () => {
    setIsSaving(true);
    try {
      // ✅ Salvar todas usando save-and-deploy
      const trackingData = {
        client: clientId,
        method: 'direct' as const,
        detected_conversions: conversions.reduce((acc, conv) => {
          acc[conv.id] = {
            id: conv.id,
            type: conv.type,
            destination: conv.custom_destination || conv.destination,
            label: conv.custom_label || conv.label,
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
        }, {} as Record<string, any>),
        configured: true,
        last_updated: new Date().toISOString()
      };

      const response = await fetch(`/api/dashboard/${clientId}/save-and-deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'tracking',
          lpId: lpId,
          data: trackingData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro na API');
      }

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
      
      setGlobalMessage({ 
        type: 'success', 
        text: `🚀 Todas as ${conversions.length} conversões foram salvas e publicadas! Deploy automático iniciado.` 
      });
      setTimeout(() => setGlobalMessage(null), 8000);
      
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
        <h2 className="text-lg font-medium text-gray-900 mb-4">🔍 Detectando Conversões...</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Analisando sua Landing Page para encontrar botões de WhatsApp, telefone, email e formulários...
        </p>
      </div>
    );
  }

  const hasUnsavedChanges = Object.values(uiState).some(state => state.hasUnsavedChanges);
  const enabledCount = conversions.filter(c => c.enabled).length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900">🎯 Conversões Detectadas</h2>
          <p className="text-sm text-gray-500 mt-1">
            {conversions.length} conversões encontradas • {enabledCount} habilitadas • Configure e personalize cada uma
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {hasUnsavedChanges && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-amber-600 font-medium">
                Alterações não salvas
              </span>
            </div>
          )}
          <button
            onClick={saveAllConversions}
            disabled={isSaving || !hasUnsavedChanges}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md transition-all duration-200',
              hasUnsavedChanges
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            )}
          >
            <div className="flex items-center space-x-2">
              {isSaving && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>}
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Publicando...' : 'Salvar e Publicar'}</span>
            </div>
          </button>
        </div>
      </div>

      {/* Mensagem global */}
      {globalMessage && (
        <div className={cn(
          'mb-6 p-4 rounded-lg border transition-all duration-300',
          globalMessage.type === 'success' 
            ? 'bg-green-50 text-green-800 border-green-200' 
            : 'bg-red-50 text-red-800 border-red-200'
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {globalMessage.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2" />
              )}
              {globalMessage.text}
            </div>
            <button 
              onClick={() => setGlobalMessage(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
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
                showPreview: false,
              }}
              onUpdate={(updates) => updateConversion(conversion.id, updates)}
              onSave={() => saveConversion(conversion.id)}
              onCancel={() => cancelEdit(conversion.id)}
              onToggleEdit={() => toggleEdit(conversion.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-gray-300 text-8xl mb-6">🔍</div>
          <h3 className="text-xl font-medium text-gray-900 mb-3">
            Nenhuma conversão detectada
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Não foram encontrados links de WhatsApp, telefone, email ou formulários nesta Landing Page. 
            Verifique se sua LP possui elementos de conversão.
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
  const hasCustomizations = !!(conversion.custom_label || conversion.custom_destination || conversion.custom_message || conversion.custom_subject);

  return (
    <div className={cn(
      'border rounded-lg transition-all duration-200',
      uiState.isEditing ? 'border-blue-300 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-300',
      uiState.hasUnsavedChanges && 'border-amber-300 bg-amber-50',
      conversion.enabled ? 'opacity-100' : 'opacity-60'
    )}>
      <div className="p-5">
        {/* Header da conversão */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <span className="text-3xl">{getConversionIcon(conversion.type)}</span>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-gray-900">{effectiveLabel}</h3>
                {hasCustomizations && (
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    Personalizado
                  </span>
                )}
                {conversion.enabled && conversion.google_ads_id && (
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    Tracking Ativo
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-2">
                {conversion.elements_count} elemento{conversion.elements_count !== 1 ? 's' : ''} • 
                Seções: {conversion.locations.join(', ')}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Destino:</strong> <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{effectiveDestination}</code>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Toggle de habilitação */}
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={conversion.enabled}
                onChange={(e) => onUpdate({ enabled: e.target.checked })}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 font-medium">
                {conversion.enabled ? 'Habilitado' : 'Desabilitado'}
              </span>
            </label>

            {/* Botão de edição */}
            <button
              onClick={onToggleEdit}
              className={cn(
                'p-2 rounded-md transition-all duration-200',
                uiState.isEditing 
                  ? 'bg-blue-100 text-blue-700 shadow-sm' 
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Label Personalizado
              </label>
              <input
                type="text"
                value={conversion.custom_label || ''}
                onChange={(e) => onUpdate({ custom_label: e.target.value || undefined })}
                placeholder={conversion.label}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Deixe vazio para usar: "{conversion.label}"
              </p>
            </div>

            {/* Google Ads Conversion ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Ads Conversion ID
                {conversion.enabled && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>
              <input
                type="text"
                value={conversion.google_ads_id}
                onChange={(e) => onUpdate({ google_ads_id: e.target.value })}
                placeholder="AW-XXXXXXXXX/AbCdEfG"
                className={cn(
                  "w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                  conversion.enabled && !conversion.google_ads_id 
                    ? "border-red-300 focus:border-red-500" 
                    : "border-gray-300 focus:border-blue-500"
                )}
              />
              <p className="text-xs text-gray-500 mt-1">
                {conversion.enabled 
                  ? "Obrigatório para conversões habilitadas" 
                  : "Será usado quando a conversão for habilitada"
                }
              </p>
            </div>

            {/* Erros de validação */}
            {uiState.validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Erros de validação:</h4>
                    <ul className="text-sm text-red-700 mt-1 space-y-1">
                      {uiState.validationErrors.map((error, index) => (
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
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={onCancel}
                disabled={uiState.isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={onSave}
                disabled={uiState.isLoading || uiState.validationErrors.length > 0}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <div className="flex items-center space-x-2">
                  {uiState.isLoading && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>}
                  <Save className="w-4 h-4" />
                  <span>{uiState.isLoading ? 'Publicando...' : 'Salvar e Publicar'}</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
