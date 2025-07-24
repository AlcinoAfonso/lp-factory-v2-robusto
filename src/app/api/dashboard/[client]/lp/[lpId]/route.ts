import { NextRequest, NextResponse } from 'next/server';
import { readJson, writeJson } from '@/lib/persist';

export async function POST(
  request: NextRequest,
  { params }: { params: { client: string; lpId: string } }
) {
  try {
    const { client: clientId, lpId } = params;
    const data = await request.json();

    // Validar se há dados para atualizar
    if (!data.title && typeof data.active === 'undefined') {
      return NextResponse.json(
        { error: 'Nenhum dado para atualizar' },
        { status: 400 }
      );
    }

    // Caminho do domain.json no repositório
    const domainPath = `src/app/${clientId}/domain.json`;

    // Ler conteúdo atual via helper
    const domainData = await readJson(domainPath).catch(() => null);

    if (!domainData) {
      return NextResponse.json(
        { error: 'domain.json não encontrado' },
        { status: 404 }
      );
    }

    // Validar se a LP existe
    if (!domainData.lps || !domainData.lps[lpId]) {
      return NextResponse.json(
        { error: `LP "${lpId}" não encontrada` },
        { status: 404 }
      );
    }

    // Atualizar apenas os campos fornecidos
    if (data.title !== undefined) {
      domainData.lps[lpId].title = data.title;
    }

    if (typeof data.active === 'boolean') {
      domainData.lps[lpId].active = data.active;
    }

    // Salvar via GitHub API
    await writeJson(
      domainPath,
      domainData,
      `chore: dashboard – update LP ${lpId} (title/active)`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao salvar configurações da LP:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
