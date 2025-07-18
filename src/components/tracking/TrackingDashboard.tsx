'use client';

import { useState, useEffect } from 'react';
import {
  validateGoogleAdsId,
  validateGoogleAdsConversion,
  validateMetaPixelId,
  validateGA4Id,
} from './utils/validation';
import { getSuggestedConversions } from './utils/detectionEngine';
import type { TrackingConfig, DetectedConversion } from './types';

interface TrackingDashboardProps {
  clientName: string;
  detectedConversions?: DetectedConversion[];
  onSave?: (config: TrackingConfig) => void;
  onRescan?: () => void;
}

const MAX_CONVERSIONS_LIGHT = 10;

export function TrackingDashboard({
  clientName,
  detectedConversions = [],
  onSave,
  onRescan,
}: TrackingDashboardProps) {
  const [config, setConfig] = useState<TrackingConfig>({
    client: clientName,
    method: 'direct',
    configured: false,
  });

  const [activeTab, setActiveTab] = useState<'method' | 'gtm' | 'direct'>('method');
  const [searchTerm, setSearchTerm] = useState('');

  // Conversões do estado atual
  const conversions = config.detected_conversions
    ? Object.values(config.detected_conversions)
    : detectedConversions;
  const activeConversions = conversions.filter((c) => c.tracking_enabled);
  const activeCount = activeConversions.length;
  const canEnableMore = activeCount < MAX_CONVERSIONS_LIGHT;

  const filteredConversions = conversions.filter(
    (conv) =>
      conv.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.destination.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const suggestedConversions = getSuggestedConversions(conversions);

  useEffect(() => {
    // Atualizar config quando detectedConversions mudar
    if (detectedConversions.length > 0) {
      setConfig((prev) => ({
        ...prev,
        detected_conversions: detectedConversions.reduce((acc, conv) => {
          // Manter configurações existentes se já existirem
          const existing = prev.detected_conversions?.[conv.id];
          acc[conv.id] = existing ? { ...conv, ...existing } : conv;
          return acc;
        }, {} as Record<string, DetectedConversion>),
      }));
    }
  }, [detectedConversions]);

  function updateMethod(method: 'gtm' | 'direct' | 'both') {
    setConfig((prev) => ({ ...prev, method }));
    if (method === 'gtm') setActiveTab('gtm');
    else if (method === 'direct') setActiveTab('direct');
  }

  function updateGTMSnippet(field: 'head' | 'body', value: string) {
    setConfig((prev) => ({
      ...prev,
      gtm_snippet: {
        head: prev.gtm_snippet?.head || '',
        body: prev.gtm_snippet?.body || '',
        [field]: value,
      },
    }));
  }

  function updateDirectId(path: string, value: string) {
    setConfig((prev) => {
      const newConfig = { ...prev } as any;
      if (!newConfig.direct_ids) newConfig.direct_ids = {};

      const keys = path.split('.');
      let current: any = newConfig.direct_ids;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  }

  function toggleConversionTracking(conversionId: string, enabled: boolean) {
    if (enabled && !canEnableMore) {
      alert(`❌ Limite do plano Light atingido: ${MAX_CONVERSIONS_LIGHT} conversões máximas`);
      return;
    }

    setConfig((prev) => ({
      ...prev,
      detected_conversions: {
        ...prev.detected_conversions,
        [conversionId]: {
          ...prev.detected_conversions![conversionId],
          tracking_enabled: enabled,
        },
      },
    }));
  }

  function updateConversionGoogleAdsId(conversionId: string, googleAdsId: string) {
    setConfig((prev) => ({
      ...prev,
      detected_conversions: {
        ...prev.detected_conversions,
        [conversionId]: {
          ...prev.detected_conversions![conversionId],
          google_ads_id: googleAdsId,
        },
      },
    }));
  }

  function saveConfig() {
    const configToSave = { ...config, configured: true };
    setConfig(configToSave);
    onSave?.(configToSave);
    console.info('💾 Configuração dinâmica salva:', configToSave);
  }

  function getConversionIcon(type: string): string {
    switch (type) {
      case 'whatsapp':
        return '📱';
      case 'phone':
        return '☎️';
      case 'email':
        return '📧';
      case 'form':
        return '📋';
      case 'social':
        return '📷';
      default:
        return '🔗';
    }
  }

  function getConversionTypeLabel(type: string): string {
    switch (type) {
      case 'whatsapp':
        return 'WhatsApp';
      case 'phone':
        return 'Telefone';
      case 'email':
        return 'Email';
      case 'form':
        return 'Formulário';
      case 'social':
        return 'Rede Social';
      case 'external':
        return 'Link Externo';
      default:
        return 'Outro';
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">🎯 Sistema de Tracking Dinâmico - {clientName}</h2>
        <button onClick={onRescan} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          🔄 Re-escanear LP
        </button>
      </div>

      {/* Sugestões Inteligentes */}
      {suggestedConversions.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">💡 Sugestões Inteligentes</h3>
          <p className="text-blue-700 text-sm mb-3">
            Baseado na sua LP, recomendamos rastrear essas conversões prioritárias:
          </p>
          <div className="flex gap-2 flex-wrap">
            {suggestedConversions.map((conv) => (
              <button
                key={conv.id}
                onClick={() => !conv.tracking_enabled && toggleConversionTracking(conv.id, true)}
                className={`px-3 py-1 rounded-full text-sm ${
                  conv.tracking_enabled
                    ? 'bg-green-100 text-green-700 cursor-default'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer'
                }`}
                disabled={conv.tracking_enabled}
              >
                {getConversionIcon(conv.type)} {conv.label}
                {conv.tracking_enabled && ' ✅'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navegação */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('method')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'method' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'
          }`}
        >
          Método
        </button>
        <button
          onClick={() => setActiveTab('gtm')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'gtm' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'
          }`}
          disabled={config.method === 'direct'}
        >
          Snippet GTM
        </button>
        <button
          onClick={() => setActiveTab('direct')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'direct' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'
          }`}
          disabled={config.method === 'gtm'}
        >
          Conversões Detectadas
        </button>
      </div>

      {/* Aba: Método */}
      {activeTab === 'method' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Escolha o Método de Tracking</h3>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="method"
                value="gtm"
                checked={config.method === 'gtm'}
                onChange={() => updateMethod('gtm')}
                className="w-4 h-4"
              />
              <div>
                <div className="font-medium">📋 Snippet GTM</div>
                <div className="text-sm text-gray-600">Para quem entende de técnico e já tem GTM configurado</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 bg-blue-50 border-blue-200">
              <input
                type="radio"
                name="method"
                value="direct"
                checked={config.method === 'direct'}
                onChange={() => updateMethod('direct')}
                className="w-4 h-4"
              />
              <div>
                <div className="font-medium">🎯 Detecção Automática (RECOMENDADO)</div>
                <div className="text-sm text-gray-600">Sistema escaneia e sugere conversões automaticamente</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="method"
                value="both"
                checked={config.method === 'both'}
                onChange={() => updateMethod('both')}
                className="w-4 h-4"
              />
              <div>
                <div className="font-medium">🚀 Ambos Juntos</div>
                <div className="text-sm text-gray-600">GTM para casos avançados + Detecção automática</div>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Aba: GTM */}
      {activeTab === 'gtm' && (config.method === 'gtm' || config.method === 'both') && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">📋 Configuração GTM</h3>

          <div>
            <label className="block font-medium mb-2">Snippet Head:</label>
            <textarea
              value={config.gtm_snippet?.head || ''}
              onChange={(e) => updateGTMSnippet('head', e.target.value)}
              placeholder="Cole aqui o código do GTM para o <head>"
              className="w-full h-32 p-3 border rounded-lg font-mono text-sm"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Snippet Body:</label>
            <textarea
              value={config.gtm_snippet?.body || ''}
              onChange={(e) => updateGTMSnippet('body', e.target.value)}
              placeholder="Cole aqui o código do GTM para o <body>"
              className="w-full h-32 p-3 border rounded-lg font-mono text-sm"
            />
          </div>
        </div>
      )}

      {/* Aba: Conversões Detectadas */}
      {activeTab === 'direct' && (config.method === 'direct' || config.method === 'both') && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">🔍 Conversões Detectadas Automaticamente</h3>
            <div className="text-sm text-gray-600">
              📊 Ativas: {activeCount}/{MAX_CONVERSIONS_LIGHT} (Plano Light)
            </div>
          </div>

          {conversions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🔍</div>
              <p>Nenhuma conversão detectada ainda.</p>
              <button
                onClick={onRescan}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                🔄 Escanear LP
              </button>
            </div>
          )}

          {conversions.length > 0 && (
            <>
              {/* Configurações Globais */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium mb-1">Google Ads Remarketing:</label>
                  <input
                    type="text"
                    value={config.direct_ids?.google_ads?.remarketing || ''}
                    onChange={(e) => updateDirectId('google_ads.remarketing', e.target.value)}
                    placeholder="AW-123456789"
                    className={`w-full p-2 border rounded text-sm ${
                      config.direct_ids?.google_ads?.remarketing &&
                      !validateGoogleAdsId(config.direct_ids.google_ads.remarketing)
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Meta Pixel:</label>
                  <input
                    type="text"
                    value={config.direct_ids?.meta_pixel || ''}
                    onChange={(e) => updateDirectId('meta_pixel', e.target.value)}
                    placeholder="123456789012345"
                    className={`w-full p-2 border rounded text-sm ${
                      config.direct_ids?.meta_pixel && !validateMetaPixelId(config.direct_ids.meta_pixel)
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Google Analytics 4:</label>
                  <input
                    type="text"
                    value={config.direct_ids?.google_analytics || ''}
                    onChange={(e) => updateDirectId('google_analytics', e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                    className={`w-full p-2 border rounded text-sm ${
                      config.direct_ids?.google_analytics && !validateGA4Id(config.direct_ids.google_analytics)
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>

              {/* Busca */}
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="🔍 Buscar conversão..."
                className="w-full p-3 border rounded-lg"
              />

              {/* Lista de Conversões Detectadas */}
              <div className="space-y-3">
                {filteredConversions.map((conversion) => (
                  <div
                    key={conversion.id}
                    className={`p-4 border rounded-lg ${
                      conversion.tracking_enabled
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{getConversionIcon(conversion.type)}</span>
                          <div>
                            <h4 className="font-semibold">{conversion.label}</h4>
                            <div className="text-sm text-gray-600">
                              {getConversionTypeLabel(conversion.type)} • {conversion.elements_count} elemento{conversion.elements_count !== 1 ? 's' : ''} •
                              Seções: {conversion.locations.join(', ')}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Destino: {conversion.destination}</div>
                          </div>
                        </div>

                        {conversion.tracking_enabled && (
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={conversion.google_ads_id}
                              onChange={(e) => updateConversionGoogleAdsId(conversion.id, e.target.value)}
                              placeholder="AW-123/AbCdEf"
                              className={`flex-1 p-2 border rounded text-sm ${
                                conversion.google_ads_id && !validateGoogleAdsConversion(conversion.google_ads_id)
                                  ? 'border-red-500'
                                  : 'border-gray-300'
                              }`}
                            />
                            {conversion.google_ads_id && validateGoogleAdsConversion(conversion.google_ads_id) && (
                              <span className="text-green-600 text-sm">✅</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={conversion.tracking_enabled}
                            onChange={(e) => toggleConversionTracking(conversion.id, e.target.checked)}
                            disabled={!conversion.tracking_enabled && !canEnableMore}
                            className="w-4 h-4"
                          />
                          <span className="text-sm font-medium">
                            {conversion.tracking_enabled ? 'Rastreando' : 'Rastrear'}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {!canEnableMore && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <span className="text-yellow-700">
                    ⚠️ Limite do plano Light atingido ({MAX_CONVERSIONS_LIGHT} conversões ativas)
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Botões de Ação */}
      <div className="flex gap-4 pt-6 border-t">
        <button onClick={saveConfig} className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          💾 Salvar Configuração
        </button>
        <button
          onClick={() => console.info('🧪 Teste de tracking dinâmico iniciado')}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          🧪 Testar
        </button>
      </div>
    </div>
  );
}

export default TrackingDashboard;

