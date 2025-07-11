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

// 🎯 FASE 1 - TAREFA 2: Roteador dinâmico para domínios personalizados
export default async function DynamicRouter({ params }: PageProps) {
  const headersList = headers();
  const host = headersList.get('host') || '';
  const slug = params.slug || [];
  
  console.log(`🔍 Domínio detectado: ${host}`);
  console.log(`📄 Slug: /${slug.join('/')}`);

  // Buscar cliente que corresponde ao domínio
  const clientFolder = findClientByDomain(host);
  
  if (!clientFolder) {
    console.log(`❌ Nenhum cliente encontrado para domínio: ${host}`);
    notFound();
  }

  console.log(`📁 Cliente: ${clientFolder}`);

  // Carregar configuração do cliente
  const clientConfig = loadClientConfig(clientFolder);
  
  if (!clientConfig) {
    console.log(`❌ Configuração inválida para cliente: ${clientFolder}`);
    notFound();
  }

  console.log(`🎯 Homepage: ${clientConfig.homepage}`);

  // Determinar qual LP renderizar baseado no slug
  const lpToRender = determineLPFromSlug(slug, clientConfig);
  
  if (!lpToRender) {
    console.log(`❌ LP não encontrada para slug: /${slug.join('/')}`);
    notFound();
  }

  console.log(`✅ Renderizando: /${clientFolder}/${lpToRender.folder}/page.tsx`);

  // Carregar e renderizar a LP
  const lpData = await loadLPData(clientFolder, lpToRender.folder);
  
  if (!lpData) {
    console.log(`❌ Dados da LP não encontrados`);
    notFound();
  }

  return <LandingPage data={lpData} />;
}

// 🔍 Encontrar cliente por domínio
function findClientByDomain(host: string): string | null {
  const appDir = path.join(process.cwd(), 'src/app');
  
  try {
    const folders = fs.readdirSync(appDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .filter(dirent => !['components', 'dashboard-lps'].includes(dirent.name));

    for (const folder of folders) {
      const domainFile = path.join(appDir, folder.name, 'domain.json');
      
      if (fs.existsSync(domainFile)) {
        try {
          const config = JSON.parse(fs.readFileSync(domainFile, 'utf8'));
          if (config.active && config.domain === host) {
            return folder.name;
          }
        } catch (error) {
          console.warn(`⚠️ Erro ao ler ${domainFile}:`, error);
        }
      }
    }
  } catch (error) {
    console.warn(`⚠️ Erro ao escanear pastas:`, error);
  }

  return null;
}

// 📋 Carregar configuração do cliente
function loadClientConfig(clientFolder: string) {
  const domainFile = path.join(process.cwd(), 'src/app', clientFolder, 'domain.json');
  
  try {
    const config = JSON.parse(fs.readFileSync(domainFile, 'utf8'));
    return config;
  } catch (error) {
    console.warn(`⚠️ Erro ao carregar configuração de ${clientFolder}:`, error);
    return null;
  }
}

// 🎯 Determinar qual LP renderizar baseado no slug
function determineLPFromSlug(slug: string[], clientConfig: any) {
  const slugPath = slug.join('/');
  
  // Se não há slug ou slug vazio, usar homepage
  if (slug.length === 0 || slugPath === '') {
    const homepageLP = clientConfig.lps[clientConfig.homepage];
    return homepageLP || null;
  }

  // Buscar LP que corresponde ao slug
  for (const [lpKey, lpConfig] of Object.entries(clientConfig.lps)) {
    if ((lpConfig as any).slug === slugPath) {
      return lpConfig;
    }
  }

  return null;
}

// 📄 Carregar dados da LP
async function loadLPData(clientFolder: string, lpFolder: string): Promise<LandingPageData | null> {
  const lpPath = lpFolder === '.' 
    ? path.join(process.cwd(), 'src/app', clientFolder, 'lp.json')
    : path.join(process.cwd(), 'src/app', clientFolder, lpFolder, 'lp.json');
  
  try {
    const lpData = JSON.parse(fs.readFileSync(lpPath, 'utf8'));
    return lpData as LandingPageData;
  } catch (error) {
    console.warn(`⚠️ Erro ao carregar dados da LP:`, error);
    return null;
  }
}
