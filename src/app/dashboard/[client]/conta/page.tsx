import { notFound } from 'next/navigation';
import { getClientData } from '../../lib/dashboard-utils';
import { ContaForm } from '../../components/forms/ContaForm';

interface ContaPageProps {
  params: {
    client: string;
  };
}

export default async function ContaPage({ params }: ContaPageProps) {
  const clientId = params.client;
  
  const clientData = await getClientData(clientId);
  if (!clientData) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações da Conta</h1>
        <p className="text-gray-600 mt-1">
          Configure informações globais, domínio personalizado e tags de remarketing
        </p>
      </div>

      {/* Informações atuais */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Configurações Atuais</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Domínio e Acesso
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Domínio:</span>
                <span className="text-sm font-medium text-gray-900">
                  {clientData.domain || 'Não configurado'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`text-sm font-medium ${
                  clientData.active ? 'text-green-600' : 'text-red-600'
                }`}>
                  {clientData.active ? '🟢 Ativo' : '🔴 Inativo'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Homepage:</span>
                <span className="text-sm font-medium text-gray-900">
                  {clientData.homepage || 'Não definida'}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Landing Pages
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total de LPs:</span>
                <span className="text-sm font-medium text-gray-900">
                  {clientData.lps ? Object.keys(clientData.lps).length : 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">LPs Ativas:</span>
                <span className="text-sm font-medium text-gray-900">
                  {clientData.lps 
                    ? Object.values(clientData.lps).filter((lp: any) => lp.active !== false).length 
                    : 0
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário de edição */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Editar Configurações</h2>
        <ContaForm clientId={clientId} initialData={clientData} />
      </div>
    </div>
  );
}

