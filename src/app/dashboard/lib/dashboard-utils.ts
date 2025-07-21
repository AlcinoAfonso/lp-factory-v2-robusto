import fs from 'fs';
import path from 'path';

export interface ClientData {
  name?: string;
  domain?: string;
  active?: boolean;
  homepage?: string;
  lps?: Record<string, any>;
}

export interface ClientLP {
  id: string;
  title: string;
  folder: string;
  slug: string;
  active: boolean;
  isHomepage: boolean;
}

export async function validateClient(clientId: string): Promise<boolean> {
  const clientPath = path.join(process.cwd(), 'src/app', clientId);
  return fs.existsSync(clientPath);
}

export async function getClientData(clientId: string): Promise<ClientData | null> {
  try {
    const domainPath = path.join(process.cwd(), 'src/app', clientId, 'domain.json');

    if (!fs.existsSync(domainPath)) {
      return null;
    }

    const domainData = JSON.parse(fs.readFileSync(domainPath, 'utf8'));

    return {
      name: clientId,
      domain: domainData.domain,
      active: domainData.active,
      homepage: domainData.homepage,
      lps: domainData.lps,
    };
  } catch (error) {
    console.error(`Erro ao carregar dados do cliente ${clientId}:`, error);
    return null;
  }
}

export async function getClientLPs(clientId: string): Promise<ClientLP[]> {
  try {
    const clientData = await getClientData(clientId);
    if (!clientData || !clientData.lps) {
      return [];
    }

    const lps: ClientLP[] = [];

    for (const [lpId, lpConfig] of Object.entries(clientData.lps)) {
      const lpData = lpConfig as any;

      lps.push({
        id: lpId,
        title: lpData.title || lpId,
        folder: lpData.folder || '.',
        slug: lpData.slug || '',
        active: lpData.active !== false,
        isHomepage: lpId === clientData.homepage,
      });
    }

    return lps.sort((a, b) => {
      if (a.isHomepage) return -1;
      if (b.isHomepage) return 1;
      return a.title.localeCompare(b.title);
    });
  } catch (error) {
    console.error(`Erro ao listar LPs do cliente ${clientId}:`, error);
    return [];
  }
}

export async function validateLP(clientId: string, lpId: string): Promise<boolean> {
  const clientData = await getClientData(clientId);
  return clientData?.lps?.[lpId] !== undefined;
}

export async function getLPData(clientId: string, lpId: string): Promise<any | null> {
  try {
    const clientData = await getClientData(clientId);
    if (!clientData?.lps?.[lpId]) {
      return null;
    }

    const lpConfig = clientData.lps[lpId];
    const lpFolder = lpConfig.folder === '.' ? '' : lpConfig.folder;

    const lpJsonPath = lpFolder
      ? path.join(process.cwd(), 'src/app', clientId, lpFolder, 'lp.json')
      : path.join(process.cwd(), 'src/app', clientId, 'lp.json');

    if (!fs.existsSync(lpJsonPath)) {
      return null;
    }

    return JSON.parse(fs.readFileSync(lpJsonPath, 'utf8'));
  } catch (error) {
    console.error(`Erro ao carregar dados da LP ${clientId}/${lpId}:`, error);
    return null;
  }
}

export function formatClientName(clientId: string): string {
  return clientId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
