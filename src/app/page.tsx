import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import LandingPage from '@/components/LandingPage';
import { LandingPageData } from '@/types/lp-config';
import fs from 'fs';
import path from 'path';

// 🎯 FASE 1 - CORREÇÃO: Lógica diferente para domínios Vercel vs personalizados
export default async function HomePage() {
  const headersList = headers();
  const host = headersList.get('host') || '';
  
  console.log(`🔍 HomePage detectou domínio: ${host}`);
  
  // ✅ Se for domínio Vercel → Redirect para dashboard
  if (host.includes('.vercel.app')) {
    console.log(`📊 Domínio Vercel - redirecionando para dashboard`);
    redirect('/dashboard-lps');
  }
  
  // ✅ Se for domínio personalizado → Funcionar como [...slug] para homepage
  console.log(`🎯 Domínio personalizado - processando como LP`);
  
  // Buscar cliente que corresponde ao domínio
  const clientFolder = findClientByDomain(host);
  
  if (!clientFolder) {
    console.log(`❌ Nenhum cliente encontrado para domínio: ${host}`);
    return <div>Cliente não encontrado</div>;
  }

  console.log(`📁 Cliente: ${clientFolder}`);

  // Carregar configuração do cliente
  const clientConfig = loadClientConfig(clientFolder);
  
  if (!clientConfig) {
    console.log(`❌ Configuração inválida para cliente: ${clientFolder}`);
    return <div>Configuração inválida</div>;
  }

  console.log(`🎯 Homepage: ${clientConfig.homepage}`);

  // Homepage = slug vazio
  const lpToRender = clientConfig.lps[clientConfig.homepage];
  
  if (!lpToRender) {
    console.log(`❌ LP homepage não encontrada`);
    return <div>Homepage não configurada</div>;
  }

  console.log(`✅ Renderizando: /${clientFolder}/${lpToRender.folder}/`);

  // Carregar e renderizar a LP
  const lpData = await loadLPData(clientFolder, lpToRender.folder);
  
  if (!lpData) {
    console.log(`❌ Dados da LP não encontrados`);
    return <div>Dados da LP não encontrados</div>;
  }

  return <LandingPage data={lpData} />;
}

// 🔍 Encontrar cliente por domínio
function findClientByDomain(host: string): string | null {
  const appDir = path.join(process.cwd(), 'src/app');
  
  try {
    const folders = fs.readdirSync(appDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .filter(dirent => !['components', 'dashboard-lps', '[...slug]'].includes(dirent.name));

    for (const folder of folders) {
      const domainFile = path.join(appDir, folder.name, 'domain.json');
      
      if (fs.existsSync(domainFile)) {
        try {
          const config = JSON.parse(fs.readFileSync(domainFile, 'utf8'));
          if (config.active && (config.domain === host || `www.${config.domain}` === host)) {
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
