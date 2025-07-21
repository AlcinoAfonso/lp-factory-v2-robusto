import { notFound } from 'next/navigation';
import { Sidebar } from '../components/Sidebar';
import { getClientData } from '../lib/dashboard-utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: {
    client: string;
  };
}

export default async function DashboardLayout({ 
  children, 
  params 
}: DashboardLayoutProps) {
  const clientId = params.client;

  // Validar se cliente existe (usando apenas dados locais)
  const clientData = await getClientData(clientId);
  if (!clientData) {
    notFound();
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar fixa */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200">
        <Sidebar clientId={clientId} clientData={clientData} />
      </div>
      
      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Dashboard - {clientData.name || clientId}
            </h1>
            <div className="text-sm text-gray-500">
              {clientData.domain && (
                <span className={`px-2 py-1 rounded-full text-xs ${
                  clientData.active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {clientData.active ? '🟢 Ativo' : '⚫ Inativo'}: {clientData.domain}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Área de conteúdo com scroll */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
