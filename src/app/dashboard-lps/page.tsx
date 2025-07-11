import fs from 'fs';
import path from 'path';

interface LP {
  name: string;
  path: string;
  url: string;
  type: 'principal' | 'secundaria';
}

interface Cliente {
  name: string;
  lps: LP[];
}

// Função para escanear diretórios e encontrar LPs
function scanLPs(): Cliente[] {
  const appDir = path.join(process.cwd(), 'src/app');
  const clientes: Cliente[] = [];

  try {
    // Lista todas as pastas em src/app
    const items = fs.readdirSync(appDir, { withFileTypes: true });
    
    for (const item of items) {
      // ✅ CORREÇÃO: Ignora arquivos e pastas especiais (incluindo [...slug])
      if (!item.isDirectory() || 
          item.name.startsWith('.') || 
          ['components', 'dashboard-lps', '[...slug]'].includes(item.name)) {
        continue;
      }

      const clientePath = path.join(appDir, item.name);
      const cliente: Cliente = {
        name: item.name,
        lps: []
      };

      // 1. Verificar se existe LP principal (page.tsx na raiz do cliente)
      const principalPageFile = path.join(clientePath, 'page.tsx');
      if (fs.existsSync(principalPageFile)) {
        cliente.lps.push({
          name: 'principal',
          path: item.name,
          url: `/${item.name}`,
          type: 'principal'
        });
      }

      // 2. Escanear subpastas para encontrar LPs secundárias
      try {
        const subItems = fs.readdirSync(clientePath, { withFileTypes: true });
        
        for (const subItem of subItems) {
          if (subItem.isDirectory()) {
            const lpPath = path.join(clientePath, subItem.name);
            const pageFile = path.join(lpPath, 'page.tsx');
            
            // Verifica se existe page.tsx (confirma que é uma LP)
            if (fs.existsSync(pageFile)) {
              cliente.lps.push({
                name: subItem.name,
                path: `${item.name}/${subItem.name}`,
                url: `/${item.name}/${subItem.name}`,
                type: 'secundaria'
              });
            }
          }
        }
      } catch (error) {
        console.warn(`Erro ao escanear subpastas do cliente ${item.name}:`, error);
      }

      // Só adiciona cliente se tiver pelo menos uma LP
      if (cliente.lps.length > 0) {
        clientes.push(cliente);
      }
    }
  } catch (error) {
    console.error('Erro ao escanear diretório:', error);
  }

  return clientes.sort((a, b) => a.name.localeCompare(b.name));
}

// Componente para renderizar um cliente e suas LPs
function ClienteItem({ cliente }: { cliente: Cliente }) {
  const totalLPs = cliente.lps.length;
  const principalLP = cliente.lps.find(lp => lp.type === 'principal');
  const secundariasLPs = cliente.lps.filter(lp => lp.type === 'secundaria');

  return (
    <details className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
      <summary className="bg-gray-50 px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors">
        <span className="font-semibold text-gray-800">
          📁 {cliente.name}
        </span>
        <span className="ml-2 text-sm text-gray-500">
          ({totalLPs} LP{totalLPs !== 1 ? 's' : ''})
        </span>
      </summary>
      <div className="bg-white">
        {/* LP Principal (se existir) */}
        {principalLP && (
          <div className="border-b border-gray-100">
            <a 
              href={principalLP.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-6 py-3 hover:bg-blue-50 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-700 group-hover:text-blue-700 font-medium">
                  🏠 {principalLP.name} (principal)
                </span>
                <span className="text-xs text-gray-400 group-hover:text-blue-500">
                  {principalLP.url}
                </span>
              </div>
            </a>
          </div>
        )}

        {/* LPs Secundárias */}
        {secundariasLPs.map((lp) => (
          <div key={lp.path} className="border-t border-gray-100 first:border-t-0">
            <a 
              href={lp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-6 py-3 hover:bg-blue-50 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-700 group-hover:text-blue-700">
                  🔗 {lp.name}
                </span>
                <span className="text-xs text-gray-400 group-hover:text-blue-500">
                  {lp.url}
                </span>
              </div>
            </a>
          </div>
        ))}
      </div>
    </details>
  );
}

// Página principal do dashboard
export default function DashboardLPs() {
  const clientes = scanLPs();
  const totalLPs = clientes.reduce((total, cliente) => total + cliente.lps.length, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 Dashboard LPs
          </h1>
          <p className="text-gray-600">
            Lista completa de todos os clientes e suas landing pages
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Total: {clientes.length} cliente{clientes.length !== 1 ? 's' : ''} • {' '}
            {totalLPs} LPs ({clientes.filter(c => c.lps.some(lp => lp.type === 'principal')).length} principais + {totalLPs - clientes.filter(c => c.lps.some(lp => lp.type === 'principal')).length} secundárias)
          </div>
        </div>

        {/* Lista de Clientes */}
        {clientes.length > 0 ? (
          <div className="space-y-2">
            {clientes.map((cliente) => (
              <ClienteItem key={cliente.name} cliente={cliente} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma LP encontrada
            </h3>
            <p className="text-gray-500">
              Adicione clientes e LPs na estrutura src/app/ para vê-los aqui
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center text-sm text-gray-500">
            <p>
              💡 <strong>Como usar:</strong> Clique em um cliente para expandir suas LPs, 
              depois clique no link da LP para abrir em nova aba
            </p>
            <p className="mt-2">
              🔄 Esta lista é atualizada automaticamente a cada deploy
            </p>
            <p className="mt-2">
              🏠 <strong>LP Principal:</strong> página inicial do cliente • 
              🔗 <strong>LPs Secundárias:</strong> páginas específicas/campanhas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
