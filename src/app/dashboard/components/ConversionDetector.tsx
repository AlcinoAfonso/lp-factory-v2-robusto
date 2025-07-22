'use client';

import { useState, useEffect, useCallback } from 'react';

interface DetectedConversion {
  id: string;
  type: 'whatsapp' | 'phone' | 'email' | 'form' | 'social';
  destination: string;
  label: string;
  elementsCount: number;
  locations: string[];
  enabled: boolean;
  googleAdsId: string;
}

interface ConversionDetectorProps {
  clientId: string;
  lpId: string;
  lpData: any;
}

export function ConversionDetector({ clientId, lpId, lpData }: ConversionDetectorProps) {
  const [conversions, setConversions] = useState<DetectedConversion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // ✅ CORREÇÃO: Usar useCallback para estabilizar a referência da função
  const detectConversions = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/dashboard/${clientId}/detect-conversions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lpId, lpData }),
      });

      if (response.ok) {
        const data = await response.json();
        setConversions(data.conversions || []);
      } else {
        const detected = mockDetectConversions(lpData);
        setConversions(detected);
      }
    } catch (error) {
      console.error('Erro ao detectar conversões:', error);
      const detected = mockDetectConversions(lpData);
      setConversions(detected);
    } finally {
      setIsLoading(false);
    }
  }, [clientId, lpId, lpData]); // ✅ Todas as dependências incluídas

  useEffect(() => {
    detectConversions();
  }, [detectConversions]); // ✅ Agora detectConversions está estabilizada

  const toggleConversion = (conversionId: string) => {
    setConversions(prev => 
      prev.map(conv => 
        conv.id === conversionId 
          ? { ...conv, enabled: !conv.enabled }
          : conv
      )
    );
  };

  const updateGoogleAdsId = (conversionId: string, googleAdsId: string) => {
    setConversions(prev => 
      prev.map(conv => 
        conv.id === conversionId 
          ? { ...conv, googleAdsId }
          : conv
      )
    );
  };

  const saveConversions = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/dashboard/${clientId}/lp/${lpId}/conversions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversions }),
      });

      if (response.ok) {
        alert('Configurações de conversão salvas com sucesso!');
      } else {
        alert('Erro ao salvar configurações. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao salvar conversões:', error);
      alert('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Detectando Conversões...</h2>
        <div className="animate-pulse">
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Conversões Detectadas</h2>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            {conversions.length} conversões encontradas
          </span>
          <button
            onClick={saveConversions}
            disabled={isSaving}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      {conversions.length > 0 ? (
        <div className="space-y-4">
          {conversions.map((conversion) => (
            <div key={conversion.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">
                      {getConversionIcon(conversion.type)}
                    </span>
                    <div>
                      <h3 className="font-medium text-gray-900">{conversion.label}</h3>
                      <p className="text-sm text-gray-500">
                        {conversion.elementsCount} elemento{conversion.elementsCount !== 1 ? 's' : ''} • 
                        Seções: {conversion.locations.join(', ')}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    <strong>Destino:</strong> {conversion.destination}
                  </p>
                  
                  {conversion.enabled && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Google Ads Conversion ID
                      </label>
                      <input
                        type="text"
                        value={conversion.googleAdsId}
                        onChange={(e) => updateGoogleAdsId(conversion.id, e.target.value)}
                        placeholder="AW-XXXXXXXXX/AbCdEfG"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>
                
                {/* Toggle */}
                <div className="ml-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={conversion.enabled}
                      onChange={() => toggleConversion(conversion.id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {conversion.enabled ? 'Habilitado' : 'Desabilitado'}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">🔍</div>
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

// Função mock para simular detecção
function mockDetectConversions(lpData: any): DetectedConversion[] {
  const conversions: DetectedConversion[] = [];
  
  if (!lpData?.sections) return conversions;
  
  const mockConversions = [
    {
      id: 'whatsapp_5511999999999',
      type: 'whatsapp' as const,
      destination: '+5511999999999',
      label: 'WhatsApp Principal',
      elementsCount: 5,
      locations: ['hero', 'services', 'ctaFinal'],
      enabled: false,
      googleAdsId: '',
    },
    {
      id: 'form_contact',
      type: 'form' as const,
      destination: '#contact-form',
      label: 'Formulário de Contato',
      elementsCount: 1,
      locations: ['contact'],
      enabled: false,
      googleAdsId: '',
    }
  ];
  
  return mockConversions;
}

function getConversionIcon(type: string): string {
  const icons: Record<string, string> = {
    whatsapp: '💬',
    phone: '📞',
    email: '📧',
    form: '📋',
    social: '📱',
  };
  return icons[type] || '🔗';
}
