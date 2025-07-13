import fs from 'fs';
import path from 'path';

interface LP {
  name: string;
  path: string;
  url: string;
  type: 'principal' | 'secundaria';
  title?: string;
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
      // Ignora arquivos e pastas especiais
      if (!item.isDirectory() || 
          item.name.startsWith('.') || 
          ['components', 'dashboard-lps', '[...slug]'].includes(item.name)) {
        continue;
      }

      // 🎯 SISTEMA ÚNICO: Todo cliente deve ter domain.json expandido
      const domainConfig = loadDomainConfig(item.name);
      
      if (!domainConfig || !hasValidConfig(domainConfig)) {
        console.warn(`⚠️ Cliente ${item.name} sem domain.json válido - ignorado`);
        continue;
      }

      const cliente: Cliente = {
        name: item.name,
        lps: scanClientLPs(item.name, domainConfig)
      };

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

// Carregar configuração domain.json
function loadDomainConfig(clientName: string) {
  const domainFile = path.join(process.cwd(), 'src/app', clientName, 'domain.json');
  
  try {
    if (fs.existsSync(domainFile)) {
      return JSON.parse(fs.readFileSync(domainFile, 'utf8'));
    }
  } catch (error) {
    console.warn(`Erro ao ler domain.json de ${clientName}:`, error);
  }
  
  return null;
}

// Verificar se configuração é válida
function hasValidConfig(config: any): boolean {
  return config && config.lps && typeof config.lps === 'object' && config.homepage;
}

// 🎯 SISTEMA CORRIGIDO: Escanear LPs baseado apenas no domain.json
function scanClientLPs(clientName: string, domainConfig: any): LP[] {
  const lps: LP[] = [];
  
  try {
    const lpsConfig = domainConfig.lps || {};
    const homepage = domainConfig.homepage;
    
    console.log(`🔍 Escaneando ${clientName}:`, Object.keys(lpsConfig));
    
    for (const [lpKey, lpData] of Object.entries(lpsConfig)) {
      const lpConfig = lpData as any;
      
      // ✅ CORREÇÃO: Verificar apenas se lp.json existe
      const lpFolder = lpConfig.folder === '.' ? '' : lpConfig.folder;
      const lpJsonPath = lpFolder 
        ? path.join(process.cwd(), 'src/app', clientName, lpFolder, 'lp.json')
        : path.join(process.cwd(), 'src/app', clientName, 'lp.json');
      
      if (fs.existsSync(lpJsonPath)) {
        // Determinar URL baseada no slug
        const slug = lpConfig.slug || '';
        const isHomepage = lpKey === homepage;
        const lpUrl = slug ? `/${clientName}/${slug}` : `/${clientName}`;
        
        const newLP: LP = {
          name: lpConfig.title || lpKey,
          path: lpFolder ? `${clientName}/${lpFolder}` : clientName,
          url: lpUrl,
          type: isHomepage ? 'principal' : 'secundaria',
          title: lpConfig.title
        };
        
        lps.push(newLP);
      } else {
        console.warn(`❌ lp.json não encontrado para ${clientName}/${lpKey} em ${lpJsonPath}`);
      }
    }
    
    console.log(`📊 Total LPs encontradas para ${clientName}:`, lps.length);
  } catch (error) {
    console.warn(`❌ Erro ao escanear LPs de ${clientName}:`, error);
  }
  
  return lps;
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
  const principaisCount = clientes.filter(c => c.lps.some(lp => lp.type === 'principal')).length;
  const secundariasCount = totalLPs - principaisCount;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 Dashboard LPs
          </h1>
          <p className="text-gray-600">
            Sistema universal de landing pages configuráveis
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Total: {clientes.length} cliente{clientes.length !== 1 ? 's' : ''} • {' '}
            {totalLPs} LPs ({principaisCount} principais + {secundariasCount} secundárias)
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
              Nenhum cliente encontrado
            </h3>
            <p className="text-gray-500">
              Clientes precisam ter domain.json com configuração de LPs válida
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
              📋 <strong>Requisito:</strong> Todo cliente deve ter domain.json com configuração de LPs
            </p>
            <p className="mt-2">
              🏠 <strong>LP Principal:</strong> homepage do cliente • 
              🔗 <strong>LPs Secundárias:</strong> páginas específicas/campanhas
            </p>
            <p className="mt-2">
              ✅ <strong>Sistema Universal:</strong> Detecta LPs através do domain.json (não requer page.tsx individual)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
