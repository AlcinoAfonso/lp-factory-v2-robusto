'use client';

import { useState } from 'react';
import { ClientData } from '../../lib/dashboard-utils';

interface ContaFormProps {
  clientId: string;
  initialData: ClientData;
}

export function ContaForm({ clientId, initialData }: ContaFormProps) {
  const [formData, setFormData] = useState({
    domain: initialData.domain || '',
    active: initialData.active ?? false,
    homepage: initialData.homepage || '',
    // Campos adicionais para futuras implementações
    logoUrl: '',
    colors: ['#FF6600', '#333333', '#007BFF'],
    googleAdsId: '',
    metaPixelId: '',
    googleAnalyticsId: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Aqui será implementada a chamada para API
      console.log('Salvando configurações:', formData);
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar configurações. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
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

      {/* Seção: Domínio */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Domínio Personalizado</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-1">
              Domínio (sem https://)
            </label>
            <input
              type="text"
              id="domain"
              value={formData.domain}
              onChange={(e) => handleInputChange('domain', e.target.value)}
              placeholder="exemplo: meudominio.com.br"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => handleInputChange('active', e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Domínio ativo (habilitar redirecionamento)
              </span>
            </label>
          </div>
        </div>
        
        <p className="text-sm text-gray-500">
          Configure seu domínio personalizado. Certifique-se de que o DNS aponta para os servidores da Vercel.
        </p>
      </div>

      {/* Seção: Configurações Visuais */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Configurações Visuais</h3>
        
        <div>
          <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 mb-1">
            URL da Logo
          </label>
          <input
            type="url"
            id="logoUrl"
            value={formData.logoUrl}
            onChange={(e) => handleInputChange('logoUrl', e.target.value)}
            placeholder="https://exemplo.com/logo.png"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Paleta de Cores
          </label>
          <div className="grid grid-cols-3 gap-2">
            {formData.colors.map((color, index) => (
              <input
                key={index}
                type="color"
                value={color}
                onChange={(e) => {
                  const newColors = [...formData.colors];
                  newColors[index] = e.target.value;
                  setFormData(prev => ({ ...prev, colors: newColors }));
                }}
                className="h-10 w-full border border-gray-300 rounded-md"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Seção: Tags de Remarketing */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Tags de Remarketing</h3>
        <p className="text-sm text-gray-500">
          Configure IDs globais de remarketing que serão aplicados a todas as LPs.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="googleAdsId" className="block text-sm font-medium text-gray-700 mb-1">
              Google Ads ID
            </label>
            <input
              type="text"
              id="googleAdsId"
              value={formData.googleAdsId}
              onChange={(e) => handleInputChange('googleAdsId', e.target.value)}
              placeholder="AW-XXXXXXXXX"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="metaPixelId" className="block text-sm font-medium text-gray-700 mb-1">
              Meta Pixel ID
            </label>
            <input
              type="text"
              id="metaPixelId"
              value={formData.metaPixelId}
              onChange={(e) => handleInputChange('metaPixelId', e.target.value)}
              placeholder="123456789012345"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="googleAnalyticsId" className="block text-sm font-medium text-gray-700 mb-1">
              Google Analytics 4 ID
            </label>
            <input
              type="text"
              id="googleAnalyticsId"
              value={formData.googleAnalyticsId}
              onChange={(e) => handleInputChange('googleAnalyticsId', e.target.value)}
              placeholder="G-XXXXXXXXXX"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Botões */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </div>
    </form>
  );
}

