'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Save,
  X,
  Edit3,
  AlertCircle,
  CheckCircle,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/* ⬇️  TIPOS                                                                  */
/* -------------------------------------------------------------------------- */
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

/* -------------------------------------------------------------------------- */
/* ⬇️  COMPONENTE PRINCIPAL                                                   */
/* -------------------------------------------------------------------------- */
export function ConversionsEditor({
  clientId,
  lpId,
  lpData
}: ConversionsEditorProps) {
  const [conversions, setConversions] = useState<EditableConversion[]>([]);
  const [uiState, setUIState] = useState<Record<string, ConversionUIState>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [globalMessage, setGlobalMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  /* ---------------------- DETECÇÃO AUTOMÁTICA SIMPLIFICADA ---------------------- */
  const detectConversionsFromLP = useCallback((lpData: any): EditableConversion[] => {
    const mockConversions: EditableConversion[] = [
      {
        id: 'whatsapp_5521999998888',
        type: 'whatsapp',
        destination: '+5521999998888',
        label: 'WhatsApp Principal',
        elements_count: 8,
        locations: ['hero', 'services', 'steps', 'ctaFinal'],
        enabled: false,
        google_ads_id: ''
      },
      {
        id: 'form_contact',
        type: 'form',
        destination: '#contact-form',
        label: 'Formulário de Contato',
        elements_count: 1,
        locations: ['contact'],
        enabled: false,
        google_ads_id: ''
      }
    ];

    return mockConversions;
  }, []);

  /* ----------------------------- CARREGAR CONVERSÕES ---------------------------- */
  const loadConversions = useCallback(async () => {
    setIsLoading(true);
    try {
      const detected = detectConversionsFromLP(lpData);
      setConversions(detected);

      /* estado da UI */
      const initial: Record<string, ConversionUIState> = {};
      detected.forEach((conv) => {
        initial[conv.id] = {
          id: conv.id,
          isEditing: false,
          isLoading: false,
          hasUnsavedChanges: false,
          validationErrors: [],
          showPreview: false
        };
      });
      setUIState(initial);
    } catch (err) {
      console.error('Erro ao carregar conversões', err);
      setGlobalMessage({ type: 'error', text: 'Erro ao carregar conversões' });
    } finally {
      setIsLoading(false);
    }
  }, [lpData, detectConversionsFromLP]);

  useEffect(() => {
    loadConversions();
  }, [loadConversions]);

  /* --------------------------- ATUALIZAR CONVERSÃO --------------------------- */
  const updateConversion = (id: string, updates: Partial<EditableConversion>) => {
    setConversions((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    setUIState((prev) => ({
      ...prev,
      [id]: { ...prev[id], hasUnsavedChanges: true, validationErrors: [] }
    }));
  };

  /* ---------------------------- SALVAR INDIVIDUAL ---------------------------- */
  const saveConversion = async (id: string) => {
    const conv = conversions.find((c) => c.id === id);
    if (!conv) return;

    setUIState((prev) => ({ ...prev, [id]: { ...prev[id], isLoading: true } }));
    try {
      const body = {};
      const res = await fetch(`/api/dashboard/${clientId}/save-and-deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'tracking', lpId, data: body })
      });
      if (!res.ok) throw new Error('Erro na API');

      setUIState((prev) => ({
        ...prev,
        [id]: { ...prev[id], isEditing: false, hasUnsavedChanges: false, isLoading: false }
      }));
      setGlobalMessage({ type: 'success', text: `Conversão "${conv.label}" salva!` });
      setTimeout(() => setGlobalMessage(null), 5000);
    } catch (err) {
      console.error(err);
      setUIState((prev) => ({
        ...prev,
        [id]: { ...prev[id], isLoading: false, validationErrors: ['Erro ao salvar'] }
      }));
    }
  };

  /* ------------------------- CANCELAR / TOGGLE EDIÇÃO ------------------------- */
  const cancelEdit = (id: string) => loadConversions();
  const toggleEdit = (id: string) =>
    setUIState((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        isEditing: !prev[id].isEditing,
        validationErrors: [],
        showPreview: false
      }
    }));

  /* ---------------------------- SALVAR TODAS NA LP --------------------------- */
  const saveAllConversions = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const body = {};
      const res = await fetch(`/api/dashboard/${clientId}/save-and-deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'tracking', lpId, data: body })
      });
      if (!res.ok) throw new Error('Erro na API');

      setUIState((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((k) => {
          next[k] = { ...next[k], isEditing: false, hasUnsavedChanges: false };
        });
        return next;
      });
      setGlobalMessage({ type: 'success', text: 'Todas as conversões foram publicadas!' });
      setTimeout(() => setGlobalMessage(null), 8000);
    } catch (err) {
      console.error(err);
      setGlobalMessage({ type: 'error', text: 'Erro ao salvar' });
    } finally {
      setIsSaving(false);
    }
  };

  /* ----------------------------- RENDERIZAÇÃO UI ----------------------------- */
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-medium">🔍 Detectando Conversões…</h2>
      </div>
    );
  }

  const hasUnsaved = Object.values(uiState).some((u) => u.hasUnsavedChanges);
  const enabledCount = conversions.filter((c) => c.enabled).length;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {conversions.length ? (
        <div className="space-y-4">
          {conversions.map((conv) => (
            <ConversionCard
              key={conv.id}
              conversion={conv}
              uiState={uiState[conv.id]}
              onUpdate={(updates) => updateConversion(conv.id, updates)}
              onSave={() => saveConversion(conv.id)}
              onCancel={() => cancelEdit(conv.id)}
              onToggleEdit={() => toggleEdit(conv.id)}
            />
          ))}
        </div>
      ) : (
        <p>Nenhuma conversão detectada.</p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ⬇️  CONVERSION CARD                                                        */
/* -------------------------------------------------------------------------- */
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
  const getIcon = (t: string) =>
    ({ whatsapp: '💬', phone: '📞', email: '📧', form: '📋', social: '📱' }[t] || '🔗');

  const effectiveLabel = conversion.custom_label || conversion.label;
  const effectiveDest = conversion.custom_destination || conversion.destination;
  const customized = !!(
    conversion.custom_label ||
    conversion.custom_destination ||
    conversion.custom_message ||
    conversion.custom_subject
  );

  return (
    <div
      className={cn(
        'border rounded-lg transition',
        uiState.isEditing ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300',
        uiState.hasUnsavedChanges && 'border-amber-300 bg-amber-50',
        conversion.enabled ? 'opacity-100' : 'opacity-60'
      )}
    >
      <div className="p-5">
        {uiState.isEditing && (
          <div className="space-y-4 pt-4 border-t border-blue-200">
            <ConversionTypeSpecificFields conversion={conversion} onUpdate={onUpdate} />
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
                disabled={uiState.isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <div className="flex items-center space-x-2">
                  {uiState.isLoading && (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  )}
                  <Save className="w-4 h-4" />
                  <span>Salvar</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ⬇️  CAMPOS ESPECÍFICOS POR TIPO                                            */
/* -------------------------------------------------------------------------- */
interface ConversionTypeSpecificFieldsProps {
  conversion: EditableConversion;
  onUpdate: (updates: Partial<EditableConversion>) => void;
}

function ConversionTypeSpecificFields({
  conversion,
  onUpdate
}: ConversionTypeSpecificFieldsProps) {
  switch (conversion.type) {
    case 'whatsapp':
      return (
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Configurações WhatsApp</h4>
          <div>
            <label className="block text-sm font-medium mb-2">Número WhatsApp Personalizado</label>
            <input
              type="text"
              value={conversion.custom_destination || ''}
              onChange={(e) =>
                onUpdate({ custom_destination: e.target.value || undefined })
              }
              placeholder={conversion.destination}
              className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Mensagem Personalizada</label>
            <textarea
              value={conversion.custom_message || ''}
              onChange={(e) =>
                onUpdate({ custom_message: e.target.value || undefined })
              }
              placeholder="Olá! Gostaria de saber mais..."
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      );

    case 'phone':
      return (
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Configurações Telefone</h4>
          <div>
            <label className="block text-sm font-medium mb-2">Número de Telefone Personalizado</label>
            <input
              type="text"
              value={conversion.custom_destination || ''}
              onChange={(e) =>
                onUpdate({ custom_destination: e.target.value || undefined })
              }
              placeholder={conversion.destination}
              className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      );

    case 'email':
      return (
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Configurações Email</h4>
          <div>
            <label className="block text-sm font-medium mb-2">Email Personalizado</label>
            <input
              type="email"
              value={conversion.custom_destination || ''}
              onChange={(e) =>
                onUpdate({ custom_destination: e.target.value || undefined })
              }
              placeholder={conversion.destination}
              className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Assunto Personalizado</label>
            <input
              type="text"
              value={conversion.custom_subject || ''}
              onChange={(e) =>
                onUpdate({ custom_subject: e.target.value || undefined })
              }
              placeholder="Assunto do email..."
              maxLength={200}
              className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      );

    case 'social':
      return (
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Configurações Rede Social</h4>
          <div>
            <label className="block text-sm font-medium mb-2">
              URL da Rede Social Personalizada
            </label>
            <input
              type="url"
              value={conversion.custom_destination || ''}
              onChange={(e) =>
                onUpdate({ custom_destination: e.target.value || undefined })
              }
              placeholder={conversion.destination}
              className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      );

    case 'form':
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            Conversões de formulário não permitem personalização de destino.
          </p>
          <p className="text-xs text-blue-600 mt-2">Destino: {conversion.destination}</p>
        </div>
      );

    default:
      return <p>Tipo não suportado.</p>;
  }
}

export default ConversionsEditor;
