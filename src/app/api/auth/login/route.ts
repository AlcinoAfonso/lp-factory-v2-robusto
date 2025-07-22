import { NextRequest, NextResponse } from 'next/server';

interface ClientCredentials {
  clientId: string;
  passwordHash: string;
  active: boolean;
  name?: string;
  lastLogin?: string;
}

interface AuthConfig {
  clients: Record<string, ClientCredentials>;
}

function loadAuthConfig(): AuthConfig {
  // Usar configuração estática para produção
  const staticConfig: AuthConfig = {
    clients: {
      fitnutri: {
        clientId: 'fitnutri',
        passwordHash: 'demo123',
        active: true,
        name: 'FitNutri - Nutrição Personalizada',
      },
      'unico-digital': {
        clientId: 'unico-digital',
        passwordHash: 'demo123',
        active: true,
        name: 'Único Digital - LP Factory',
      },
    },
  };

  return staticConfig;
}

export async function POST(request: NextRequest) {
  try {
    const { clientId, password } = await request.json();

    if (!clientId || !password) {
      return NextResponse.json(
        { success: false, error: 'ClientId e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const authConfig = loadAuthConfig();
    const client = authConfig.clients[clientId];

    if (!client || !client.active) {
      return NextResponse.json(
        { success: false, error: 'Cliente não encontrado ou inativo' },
        { status: 401 }
      );
    }

    if (client.passwordHash !== password) {
      return NextResponse.json(
        { success: false, error: 'Senha incorreta' },
        { status: 401 }
      );
    }

    // Não tentar salvar lastLogin em produção (read-only)
    console.log(`Login realizado: ${clientId} em ${new Date().toISOString()}`);

    const response = NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso',
      client: {
        id: clientId,
        name: client.name || clientId,
      },
    });

    response.cookies.set('dashboard-session', clientId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400,
    });

    return response;
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
