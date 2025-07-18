'use client';

import { useState, useEffect } from 'react';
import {
  validateGoogleAdsId,
  validateGoogleAdsConversion,
  validateMetaPixelId,
  validateGA4Id,
} from './utils/validation';
import type { TrackingConfig } from './types';

interface TrackingDashboardProps {
  clientName: string;
  onSave?: (config: TrackingConfig) => void;
}

const MAX_CONVERSIONS_LIGHT = 10;

export function TrackingDashboard({ clientName, onSave }: TrackingDashboardProps) {
  const [config, setConfig] = useState<TrackingConfig>({
    client: clientName,
    method: 'direct',
    configured: false,
  });

  const [activeTab, setActiveTab] = useState<'method' | 'gtm' | 'direct'>('method');
  const [searchTerm, setSearchTerm] = useState('');
  const [newConversionTag, setNewConversionTag] = useState('');
  const [newConversionId, setNewConversionId] = useState('');

  const conversions = config.direct_ids?.google_ads?.conversions || {};
  const conversionsCount = Object.keys(conversions).length;
  const canAddMore = conversionsCount < MAX_CONVERSIONS_LIGHT;

  const filteredConversions = Object.entries(conversions).filter(([tag]) =>
    tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function updateMethod(method: 'gtm' | 'direct' | 'both') {
    setConfig((prev) => ({ ...prev, method }));

    // Navegar para aba relevante
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

  function addConversion() {
    if (!newConversionTag || !newConversionId) return;
    if (!canAddMore) {
      alert(`Limite do plano Light atingido (${MAX_CONVERSIONS_LIGHT} conversões)`);
      return;
    }

    updateDirectId(`google_ads.conversions.${newConversionTag}`, newConversionId);
    setNewConversionTag('');
    setNewConversionId('');
  }

  function removeConversion(tag: string) {
    setConfig((prev) => {
      const newConfig = { ...prev } as any;
      if (newConfig.direct_ids?.google_ads?.conversions) {
        delete newConfig.direct_ids.google_ads.conversions[tag];
      }
      return newConfig;
    });
  }

  function saveConfig() {
    const configToSave = { ...config, configured: true };
    setConfig(configToSave);
    onSave?.(configToSave);
    console.info('💾 Configuração salva:', configToSave);
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">🎯 Configuração de Tracking - {clientName}</h2>

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
          IDs Diretos
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

            <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="method"
                value="direct"
                checked={config.method === 'direct'}
                onChange={() => updateMethod('direct')}
                className="w-4 h-4"
              />
              <div>
                <div className="font-medium">🎯 IDs Diretos</div>
                <div className="text-sm text-gray-600">Para quem quer simplicidade - cole os IDs e pronto</div>
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
                <div className="text-sm text-gray-600">GTM para casos avançados + IDs diretos para básico</div>
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

      {/* Aba: IDs Diretos */}
      {activeTab === 'direct' && (config.method === 'direct' || config.method === 'both') && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">🎯 Configuração de IDs Diretos</h3>

          {/* Google Ads */}
          <div className="space-y-3">
            <h4 className="font-medium">Google Ads:</h4>
            <div>
              <label className="block text-sm font-medium mb-1">Remarketing:</label>
              <input
                type="text"
                value={config.direct_ids?.google_ads?.remarketing || ''}
                onChange={(e) => updateDirectId('google_ads.remarketing', e.target.value)}
                placeholder="AW-123456789"
                className={`w-full p-2 border rounded ${
                  config.direct_ids?.google_ads?.remarketing &&
                  !validateGoogleAdsId(config.direct_ids.google_ads.remarketing)
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
            </div>
          </div>

          {/* Meta Pixel */}
          <div>
            <label className="block text-sm font-medium mb-1">Meta Pixel:</label>
            <input
              type="text"
              value={config.direct_ids?.meta_pixel || ''}
              onChange={(e) => updateDirectId('meta_pixel', e.target.value)}
              placeholder="123456789012345"
              className={`w-full p-2 border rounded ${
                config.direct_ids?.meta_pixel && !validateMetaPixelId(config.direct_ids.meta_pixel)
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
            />
          </div>

          {/* Google Analytics */}
          <div>
            <label className="block text-sm font-medium mb-1">Google Analytics 4:</label>
            <input
              type="text"
              value={config.direct_ids?.google_analytics || ''}
              onChange={(e) => updateDirectId('google_analytics', e.target.value)}
              placeholder="G-XXXXXXXXXX"
              className={`w-full p-2 border rounded ${
                config.direct_ids?.google_analytics && !validateGA4Id(config.direct_ids.google_analytics)
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
            />
          </div>

          {/* Conversões */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Conversões Configuradas:</h4>
              <span className="text-sm text-gray-600">
                {conversionsCount}/{MAX_CONVERSIONS_LIGHT} (Plano Light)
              </span>
            </div>

            {/* Busca */}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 Buscar conversão..."
              className="w-full p-2 border rounded"
            />

            {/* Lista de Conversões */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredConversions.map(([tag, id]) => (
                <div key={tag} className="flex items-center gap-3 p-3 border rounded">
                  <div className="flex-1">
                    <div className="font-medium">{tag}</div>
                    <div className="text-sm text-gray-600">{id}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {validateGoogleAdsConversion(id) ? (
                      <span className="text-green-600 text-sm">✅</span>
                    ) : (
                      <span className="text-red-600 text-sm">❌</span>
                    )}
                    <button
                      onClick={() => removeConversion(tag)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Adicionar Nova Conversão */}
            <div className="flex gap-3 p-4 bg-gray-50 rounded">
              <input
                type="text"
                value={newConversionTag}
                onChange={(e) => setNewConversionTag(e.target.value)}
                placeholder="Nome da tag (ex: whatsapp_premium)"
                className="flex-1 p-2 border rounded"
                disabled={!canAddMore}
              />
              <input
                type="text"
                value={newConversionId}
                onChange={(e) => setNewConversionId(e.target.value)}
                placeholder="AW-123/AbCdEf"
                className="flex-1 p-2 border rounded"
                disabled={!canAddMore}
              />
              <button
                onClick={addConversion}
                disabled={!canAddMore || !newConversionTag || !newConversionId}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
              >
                Adicionar
              </button>
            </div>

            {!canAddMore && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <span className="text-yellow-700">
                  ⚠️ Limite do plano Light atingido ({MAX_CONVERSIONS_LIGHT} conversões)
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Botões de Ação */}
      <div className="flex gap-4 pt-6 border-t">
        <button onClick={saveConfig} className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          💾 Salvar Configuração
        </button>
        <button
          onClick={() => console.info('🧪 Teste de tracking iniciado')}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          🧪 Testar
        </button>
      </div>
    </div>
  );
}
