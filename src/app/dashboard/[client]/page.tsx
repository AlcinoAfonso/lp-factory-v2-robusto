import Link from 'next/link';
import { getClientData, getClientLPs } from '../lib/dashboard-utils';
import { notFound } from 'next/navigation';

interface ClientDashboardProps {
  params: {
    client: string;
  };
}

export default async function ClientDashboard({ params }: ClientDashboardProps) {
  const clientId = params.client;

  const clientData = await getClientData(clientId);
  if (!clientData) {
    notFound();
  }

  const lps = await getClientLPs(clientId);

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Bem-vindo ao seu Dashboard! 👋
        </h2>
        <p className="text-gray-600">
          Gerencie suas Landing Pages e configurações de forma simples e intuitiva.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href={`/dashboard/${clientId}/lps`}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-medium text-gray-900">Minhas Landing Pages</h3>
              <p className="text-sm text-gray-500 mt-1">
                Gerencie suas {lps.length} LPs e defina qual é a principal
              </p>
              <p className="text-lg font-semibold text-blue-600 mt-2">
                {lps.length} LP{lps.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </Link>

        <Link
          href={`/dashboard/${clientId}/conta`}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-medium text-gray-900">Configurações da Conta</h3>
              <p className="text-sm text-gray-500 mt-1">Logo, cores, domínio e configurações globais</p>
              <p className="text-sm text-gray-600 mt-2">Domínio: {clientData.domain || 'Não configurado'}</p>
            </div>
          </div>
        </Link>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start">
            <div className="p-3 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H9z"
                />
              </svg>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-medium text-gray-900">Status Geral</h3>
              <p className="text-sm text-gray-500 mt-1">Resumo das suas configurações</p>
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Homepage:</span>
                  <span className="font-medium">{clientData.homepage || 'Não definida'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>LPs Ativas:</span>
                  <span className="font-medium">{lps.filter(lp => lp.active !== false).length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {lps.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Suas Landing Pages</h3>
            <Link href={`/dashboard/${clientId}/lps`} className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              Ver todas →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lps.slice(0, 2).map(lp => (
              <div key={lp.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{lp.title}</h4>
                  {lp.isHomepage && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">⭐ Principal</span>}
                </div>
                <p className="text-sm text-gray-500 mb-3">Slug: /{lp.slug || '(homepage)'}</p>
                <Link href={`/dashboard/${clientId}/lp/${lp.id}`} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Configurar →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
