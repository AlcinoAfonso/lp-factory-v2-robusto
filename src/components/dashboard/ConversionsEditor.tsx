import { useState, useEffect, useCallback } from 'react';
import { saveAndDeploy } from '@/lib/dashboard-api';

interface Conversion {
  id: string;
  type: 'whatsapp' | 'phone' | 'email' | 'form' | 'social';
  label: string;
  destination: string;
  enabled: boolean;
  message?: string; // Para WhatsApp
  subject?: string; // Para Email
}

interface ConversionsEditorProps {
  clientId: string;
  lpId: string;
  initialConversions: Conversion[];
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'publishing' | 'published' | 'error';

export default function ConversionsEditor({ 
  clientId, 
  lpId, 
  initialConversions 
}: ConversionsEditorProps) {
  const [conversions, setConversions] = useState<Conversion[]>(initialConversions);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [saveTimeoutId, setSaveTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Debounced save function (3 segundos)
  const debouncedSave = useCallback(async (updatedConversions: Conversion[]) => {
    // Limpar timeout anterior
    if (saveTimeoutId) {
      clearTimeout(saveTimeoutId);
    }

    // Status: salvando localmente
    setSaveStatus('saving');
    setErrorMessage('');

    // Novo timeout para save
    const timeoutId = setTimeout(async () => {
      try {
        setSaveStatus('publishing');
        
        // Preparar dados para tracking.json
        const trackingData = {
          conversions: updatedConversions.reduce((acc, conv) => {
            acc[conv.id] = {
              type: conv.type,
              label: conv.label,
              destination: conv.destination,
              enabled: conv.enabled,
              ...(conv.message && { message: conv.message }),
              ...(conv.subject && { subject: conv.subject })
            };
            return acc;
          }, {} as Record<string, any>)
        };

        // Chamar nossa API save-and-deploy
        const result = await saveAndDeploy({
          client: clientId,
          type: 'tracking',
          lpId: lpId,
          data: trackingData
        });

        setSaveStatus('published');
        
        // Voltar ao estado idle após 2 segundos
        setTimeout(() => setSaveStatus('idle'), 2000);

      } catch (error) {
        console.error('Save and deploy error:', error);
        setSaveStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Erro ao publicar alterações');
        
        // Voltar ao estado idle após 5 segundos
        setTimeout(() => setSaveStatus('idle'), 5000);
      }
    }, 3000);

    setSaveTimeoutId(timeoutId);
  }, [clientId, lpId, saveTimeoutId]);

  // Função para atualizar conversão
  const updateConversion = (id: string, updates: Partial<Conversion>) => {
    const updatedConversions = conversions.map(conv =>
      conv.id === id ? { ...conv, ...updates } : conv
    );
    
    setConversions(updatedConversions);
    debouncedSave(updatedConversions);
  };

  // Função para toggle enabled/disabled
  const toggleConversion = (id: string) => {
    updateConversion(id, { enabled: !conversions.find(c => c.id === id)?.enabled });
  };

  // Status visual components
  const StatusIndicator = () => {
    const statusConfig = {
      idle: { color: 'text-gray-500', text: '' },
      saving: { color: 'text-blue-500', text: 'Salvando...' },
      saved: { color: 'text-green-500', text: 'Salvo' },
      publishing: { color: 'text-orange-500', text: 'Publicando...' },
      published: { color: 'text-green-600', text: 'Publicado!' },
      error: { color: 'text-red-500', text: 'Erro ao publicar' }
    };

    const { color, text } = statusConfig[saveStatus];
    
    if (!text) return null;

    return (
      <div className={`flex items-center gap-2 ${color} text-sm font-medium`}>
        {(saveStatus === 'saving' || saveStatus === 'publishing') && (
          <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
        )}
        {saveStatus === 'published' && (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
        {saveStatus === 'error' && (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )}
        <span>{text}</span>
      </div>
    );
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutId) {
        clearTimeout(saveTimeoutId);
      }
    };
  }, [saveTimeoutId]);

  return (
    <div className="space-y-6">
      {/* Header com status */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Conversões Detectadas
        </h3>
        <StatusIndicator />
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de conversões */}
      <div className="space-y-4">
        {conversions.map((conversion) => (
          <div
            key={conversion.id}
            className={`p-4 border rounded-lg transition-all ${
              conversion.enabled 
                ? 'border-green-200 bg-green-50' 
                : 'border-gray-200 bg-gray-50'
            } ${saveStatus === 'saving' || saveStatus === 'publishing' ? 'opacity-70' : ''}`}
          >
            <div className="flex items-start justify-between">
              {/* Informações da conversão */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    conversion.enabled ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                  <span className="font-medium text-gray-900 capitalize">
                    {conversion.type}
                  </span>
                </div>

                {/* Label personalizado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label Personalizado
                  </label>
                  <input
                    type="text"
                    value={conversion.label}
                    onChange={(e) => updateConversion(conversion.id, { label: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Começe Agora"
                    disabled={saveStatus === 'publishing'}
                  />
                </div>

                {/* Destino */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destino
                  </label>
                  <input
                    type="text"
                    value={conversion.destination}
                    onChange={(e) => updateConversion(conversion.id, { destination: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={saveStatus === 'publishing'}
                  />
                </div>

                {/* Campos específicos por tipo */}
                {conversion.type === 'whatsapp' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mensagem Personalizada
                    </label>
                    <textarea
                      value={conversion.message || ''}
                      onChange={(e) => updateConversion(conversion.id, { message: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Olá! Gostaria de saber mais..."
                      disabled={saveStatus === 'publishing'}
                    />
                  </div>
                )}

                {conversion.type === 'email' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assunto do Email
                    </label>
                    <input
                      type="text"
                      value={conversion.subject || ''}
                      onChange={(e) => updateConversion(conversion.id, { subject: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Assunto do email"
                      disabled={saveStatus === 'publishing'}
                    />
                  </div>
                )}
              </div>

              {/* Toggle enabled/disabled */}
              <div className="ml-4">
                <button
                  onClick={() => toggleConversion(conversion.id)}
                  disabled={saveStatus === 'publishing'}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    conversion.enabled ? 'bg-green-600' : 'bg-gray-200'
                  } ${saveStatus === 'publishing' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      conversion.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info footer */}
      <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-md">
        <p className="font-medium text-blue-700 mb-1">💡 Como funciona:</p>
        <p>As alterações são salvas automaticamente após 3 segundos de inatividade e publicadas diretamente na LP.</p>
      </div>
    </div>
  );
}
