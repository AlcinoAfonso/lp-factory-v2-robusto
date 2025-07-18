import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import LandingPage from '@/components/LandingPage';
import { LandingPageData } from '@/types/lp-config';
import fs from 'fs';
import path from 'path';

interface PageProps {
  params: {
    slug: string[];
  };
}

// 🎯 SISTEMA ÚNICO: Todos os clientes usam domain.json expandido
export default async function UniversalRouter({ params }: PageProps) {
  const headersList = headers();
  const host = headersList.get('host') || '';
  const slug = params.slug || [];
  
  console.log(`🔍 Domínio: ${host}`);
  console.log(`📄 Slug: /${slug.join('/')}`);

  // Encontrar cliente por domínio personalizado OU acesso direto
  const { clientFolder, isDirectAccess } = findClient(host, slug);
  
  if (!clientFolder) {
    console.log(`❌ Cliente não encontrado`);
    notFound();
  }

  console.log(`📁 Cliente: ${clientFolder}`);

  // 🎯 SISTEMA ÚNICO: Todo cliente DEVE ter domain.json expandido
  const clientConfig = loadClientConfig(clientFolder);
  
  if (!clientConfig || !hasValidConfig(clientConfig)) {
    console.log(`❌ Cliente ${clientFolder} sem domain.json válido`);
    notFound();
  }

  console.log(`🎯 Homepage: ${clientConfig.homepage}`);

  // Determinar qual LP renderizar
  const { lpToRender, adjustedSlug } = determineLPFromSlug(slug, clientConfig, isDirectAccess);
  
  if (!lpToRender) {
    console.log(`❌ LP não encontrada: /${slug.join('/')}`);
    notFound();
  }

  console.log(`✅ Renderizando: /${clientFolder}/${lpToRender.folder}/`);

  // Carregar e renderizar a LP
  const lpData = await loadLPData(clientFolder, lpToRender.folder);
  
  if (!lpData) {
    console.log(`❌ Dados da LP não encontrados`);
    notFound();
  }

  return <LandingPage data={lpData} clientName={clientFolder} />;
}

// Encontrar cliente por domínio personalizado OU acesso direto
function findClient(host: string, slug: string[]): { clientFolder: string | null; isDirectAccess: boolean } {
  const appDir = path.join(process.cwd(), 'src/app');
  
  try {
    const folders = fs.readdirSync(appDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .filter(dirent => !['components', 'dashboard-lps', '[...slug]'].includes(dirent.name));

    // 1. PRIORIDADE: Domínio personalizado
    for (const folder of folders) {
      const domainFile = path.join(appDir, folder.name, 'domain.json');
      
      if (fs.existsSync(domainFile)) {
        try {
          const config = JSON.parse(fs.readFileSync(domainFile, 'utf8'));
          if (config.active && config.domain && 
              (config.domain === host || `www.${config.domain}` === host)) {
            return { clientFolder: folder.name, isDirectAccess: false };
          }
        } catch (error) {
          console.warn(`⚠️ Erro ao ler ${domainFile}:`, error);
        }
      }
    }

    // 2. FALLBACK: Acesso direto (.vercel.app/cliente/)
    if (host.includes('.vercel.app') && slug.length > 0) {
      const possibleClient = slug[0];
      const clientPath = path.join(appDir, possibleClient);
      const domainFile = path.join(clientPath, 'domain.json');
      
      if (fs.existsSync(clientPath) && fs.existsSync(domainFile)) {
        return { clientFolder: possibleClient, isDirectAccess: true };
      }
    }

  } catch (error) {
    console.warn(`⚠️ Erro ao escanear pastas:`, error);
  }

  return { clientFolder: null, isDirectAccess: false };
}

// Carregar configuração do cliente
function loadClientConfig(clientFolder: string) {
  const domainFile = path.join(process.cwd(), 'src/app', clientFolder, 'domain.json');
  
  try {
    const config = JSON.parse(fs.readFileSync(domainFile, 'utf8'));
    return config;
  } catch (error) {
    console.warn(`⚠️ Erro ao carregar ${clientFolder}/domain.json:`, error);
    return null;
  }
}

// Verificar se configuração é válida (SISTEMA ÚNICO)
function hasValidConfig(config: any): boolean {
  return config && config.lps && typeof config.lps === 'object' && config.homepage;
}

// Determinar qual LP renderizar baseado no slug
function determineLPFromSlug(slug: string[], clientConfig: any, isDirectAccess: boolean) {
  // Se acesso direto, remove nome do cliente do slug
  const adjustedSlug = isDirectAccess ? slug.slice(1) : slug;
  const slugPath = adjustedSlug.join('/');
  
  console.log(`🎯 Slug processado: "${slugPath}" (direto: ${isDirectAccess})`);

  // Homepage: slug vazio ou "homepage"
  if (adjustedSlug.length === 0 || slugPath === '' || slugPath === 'homepage') {
    const homepageLP = clientConfig.lps[clientConfig.homepage];
    return { lpToRender: homepageLP || null, adjustedSlug };
  }

  // Buscar LP que corresponde ao slug
  for (const [lpKey, lpConfig] of Object.entries(clientConfig.lps)) {
    if ((lpConfig as any).slug === slugPath) {
      return { lpToRender: lpConfig, adjustedSlug };
    }
  }

  return { lpToRender: null, adjustedSlug };
}

// Carregar dados da LP
async function loadLPData(clientFolder: string, lpFolder: string): Promise<LandingPageData | null> {
  const lpPath = lpFolder === '.' 
    ? path.join(process.cwd(), 'src/app', clientFolder, 'lp.json')
    : path.join(process.cwd(), 'src/app', clientFolder, lpFolder, 'lp.json');
  
  try {
    const lpData = JSON.parse(fs.readFileSync(lpPath, 'utf8'));
    return lpData as LandingPageData;
  } catch (error) {
    console.warn(`⚠️ Erro ao carregar LP de ${clientFolder}/${lpFolder}:`, error);
    return null;
  }
}
