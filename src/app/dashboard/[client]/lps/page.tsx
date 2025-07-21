import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getClientData, getClientLPs } from '../../lib/dashboard-utils';

interface LPsPageProps {
  params: {
    client: string;
  };
}

export default async function LPsPage({ params }: LPsPageProps) {
  const clientId = params.client;
  
  const clientData = await getClientData(clientId);
  if (!clientData) {
    notFound();
  }

  const lps = await getClientLPs(clientId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Minhas Landing Pages</h1>
          <p className="text-gray-600 mt-1">
            Gerencie suas LPs, defina qual é a principal e configure o tracking
          </p>
        </div>
        
        <div className="text-sm text-gray-500">
          Total: {lps.length} LP{lps.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Informações da homepage atual */}
      {clientData.homepage && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Homepage Atual: {clientData.lps?.[clientData.homepage]?.title || clientData.homepage}
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Esta é a LP que aparece quando visitantes acessam seu domínio principal
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de LPs */}
      {lps.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {lps.map((lp) => (
            <div key={lp.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {lp.title}
                      </h3>
                      
                      {/* Badges de status */}
                      <div className="flex space-x-2">
                        {lp.isHomepage && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            ⭐ Homepage
                          </span>
                        )}
                        
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          lp.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {lp.active ? '🟢 Ativa' : '🔴 Inativa'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span>ID: {lp.id}</span>
                      <span>Pasta: {lp.folder}</span>
                      <span>URL: /{lp.slug || '(homepage)'}</span>
                    </div>
                    
                    {/* URL completa */}
                    <div className="mt-3">
                      <p className="text-sm text-gray-600">
                        <strong>URL de acesso:</strong>{' '}
                        {clientData.active && clientData.domain ? (
                          <a
                            href={`https://${clientData.domain}${lp.slug ? `/${lp.slug}` : ''}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 underline"
                          >
                            https://{clientData.domain}{lp.slug ? `/${lp.slug}` : ''}
                          </a>
                        ) : (
                          <span className="text-gray-400">
                            Domínio não configurado ou inativo
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  {/* Ações */}
                  <div className="flex flex-col space-y-2 ml-6">
                    <Link
                      href={`/dashboard/${clientId}/lp/${lp.id}`}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      ⚙️ Configurar
                    </Link>
                    
                    {!lp.isHomepage && (
                      <button
                        className="inline-flex items-center px-3 py-2 border border-yellow-300 shadow-sm text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                        title="Definir como homepage"
                      >
                        ⭐ Tornar Principal
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Estado vazio */
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhuma Landing Page encontrada</h3>
          <p className="mt-2 text-gray-500">
            Parece que ainda não há LPs configuradas para este cliente.
          </p>
        </div>
      )}
    </div>
  );
}

