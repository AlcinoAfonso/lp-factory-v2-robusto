'use client';

import { useState } from 'react';

interface LPConfigFormProps {
  clientId: string;
  lpId: string;
  lpConfig: any;
}

export function LPConfigForm({ clientId, lpId, lpConfig }: LPConfigFormProps) {
  const [formData, setFormData] = useState({
    title: lpConfig?.title || '',
    active: lpConfig?.active !== false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/dashboard/${clientId}/lp/${lpId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: formData.title, active: formData.active }),
      });

      if (!response.ok) throw new Error('Erro ao salvar');
      
      setMessage({ type: 'success', text: 'Configurações da LP salvas com sucesso!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar configurações. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Configurações da LP</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mensagem de feedback */}
        {message && (
          <div className={`p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Configurações Básicas */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Configurações Básicas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título da LP
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">LP Ativa</span>
              </label>
            </div>
          </div>
        </div>



        {/* Botões */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </form>
    </div>
  );
}
