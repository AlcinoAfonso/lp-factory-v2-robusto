import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

// Interface para credenciais de cliente
interface ClientCredentials {
  clientId: string;
  passwordHash: string;
  active: boolean;
  lastLogin?: string;
}

// Interface para configuração de autenticação
interface AuthConfig {
  clients: Record<string, ClientCredentials>;
}

/**
 * Carregar configuração de autenticação
 */
function loadAuthConfig(): AuthConfig {
  try {
    const authPath = path.join(process.cwd(), 'src/dashboard-auth.json');
    
    if (!fs.existsSync(authPath)) {
      // Criar arquivo padrão se não existir
      const defaultConfig: AuthConfig = {
        clients: {
          'fitnutri': {
            clientId: 'fitnutri',
            passwordHash: 'demo123', // Em produção seria hash bcrypt
            active: true,
          },
          'unico-digital': {
            clientId: 'unico-digital',
            passwordHash: 'demo123', // Em produção seria hash bcrypt
            active: true,
          }
        }
      };
      
      fs.writeFileSync(authPath, JSON.stringify(defaultConfig, null, 2));
      return defaultConfig;
    }
    
    return JSON.parse(fs.readFileSync(authPath, 'utf8'));
  } catch (error) {
    console.error('Erro ao carregar configuração de auth:', error);
    return { clients: {} };
  }
}

/**
 * Fazer login do cliente
 */
export async function loginClient(clientId: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const authConfig = loadAuthConfig();
    const client = authConfig.clients[clientId];
    
    if (!client || !client.active) {
      return { success: false, error: 'Cliente não encontrado ou inativo' };
    }
    
    // Em produção usar bcrypt.compare()
    if (client.passwordHash !== password) {
      return { success: false, error: 'Senha incorreta' };
    }
    
    // Atualizar último login
    client.lastLogin = new Date().toISOString();
    fs.writeFileSync(
      path.join(process.cwd(), 'src/dashboard-auth.json'),
      JSON.stringify(authConfig, null, 2)
    );
    
    // Definir cookie de sessão (em produção usar JWT ou session store)
    const sessionData = {
      clientId,
      loginTime: Date.now(),
    };
    
    // Note: No App Router, cookies são set via headers na resposta
    // Esta função será chamada no client, então retornamos sucesso
    // e o cookie será definido via client-side ou middleware
    
    return { success: true };
  } catch (error) {
    console.error('Erro no login:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}

/**
 * Verificar se cliente está autenticado
 */
export async function isClientAuthenticated(clientId: string): Promise<boolean> {
  try {
    // Em produção, verificar JWT token ou session
    // Por enquanto, implementação simplificada
    
    const authConfig = loadAuthConfig();
    const client = authConfig.clients[clientId];
    
    return client && client.active;
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    return false;
  }
}

/**
 * Middleware para proteger rotas do dashboard
 */
export async function requireAuth(request: NextRequest, clientId: string): Promise<boolean> {
  try {
    // Verificar se cliente existe e está ativo
    const isValid = await isClientAuthenticated(clientId);
    
    if (!isValid) {
      return false;
    }
    
    // Em produção, verificar cookie de sessão ou JWT
    // const sessionCookie = request.cookies.get('dashboard-session');
    // if (!sessionCookie) return false;
    
    // Por enquanto, permitir acesso se cliente for válido
    return true;
  } catch (error) {
    console.error('Erro no middleware de auth:', error);
    return false;
  }
}
