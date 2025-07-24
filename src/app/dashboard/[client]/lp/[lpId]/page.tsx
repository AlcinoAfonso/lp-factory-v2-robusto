import { notFound } from 'next/navigation';
import { getClientData, getLPData, validateLP } from '../../../lib/dashboard-utils';
import { LPConfigForm } from '../../../components/forms/LPConfigForm';

interface LPConfigPageProps {
  params: {
    client: string;
    lpId: string;
  };
}

export default async function LPConfigPage({ params }: LPConfigPageProps) {
  const { client: clientId, lpId } = params;
  
  // Validar cliente e LP
  const clientData = await getClientData(clientId);
  if (!clientData) {
    notFound();
  }

  const isValidLP = await validateLP(clientId, lpId);
  if (!isValidLP) {
    notFound();
  }

  const lpData = await getLPData(clientId, lpId);
  const lpConfig = clientData.lps?.[lpId];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-4">
          <li>
            <div>
              <a href={`/dashboard/${clientId}`} className="text-gray-400 hover:text-gray-500">
                Dashboard
              </a>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <a href={`/dashboard/${clientId}/lps`} className="ml-4 text-gray-400 hover:text-gray-500">
                Minhas LPs
              </a>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="ml-4 text-gray-500 font-medium">
                {lpConfig?.title || lpId}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Configurar LP: {lpConfig?.title || lpId}
          </h1>
          <p className="text-gray-600 mt-1">
            Configure tracking e conversões para esta Landing Page
          </p>
        </div>
        
        {/* Status da LP */}
        <div className="flex items-center space-x-2">
          {lpConfig?.active !== false && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              🟢 Ativa
            </span>
          )}
          {lpId === clientData.homepage && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              ⭐ Homepage
            </span>
          )}
        </div>
      </div>

      {/* Informações da LP */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Informações da LP</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">ID:</span>
              <span className="text-sm text-gray-900">{lpId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Título:</span>
              <span className="text-sm text-gray-900">{lpConfig?.title || 'Não definido'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Pasta:</span>
              <span className="text-sm text-gray-900">{lpConfig?.folder || 'raiz'}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Slug:</span>
              <span className="text-sm text-gray-900">/{lpConfig?.slug || '(homepage)'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Status:</span>
              <span className={`text-sm font-medium ${
                lpConfig?.active !== false ? 'text-green-600' : 'text-red-600'
              }`}>
                {lpConfig?.active !== false ? 'Ativa' : 'Inativa'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">URL:</span>
              <span className="text-sm text-gray-900">
                {clientData.active && clientData.domain 
                  ? `${clientData.domain}${lpConfig?.slug ? `/${lpConfig.slug}` : ''}`
                  : 'Domínio não configurado'
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário de Configuração */}
      <LPConfigForm
        clientId={clientId}
        lpId={lpId}
        lpConfig={lpConfig}
      />
    </div>
  );
}
