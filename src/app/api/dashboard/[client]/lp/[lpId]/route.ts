import { NextRequest, NextResponse } from 'next/server';
import { githubService } from '@/lib/github-service';

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

    // O githubService.updateFile já lida com:
    // 1. Obter o conteúdo atual do arquivo
    // 2. Obter o SHA atual
    // 3. Fazer o update com retry automático

    // Primeiro, precisamos ler o conteúdo atual para fazer a atualização parcial
    const currentContent = await githubService.getFileContent(domainPath);

    if (!currentContent) {
      return NextResponse.json(
        { error: 'domain.json não encontrado' },
        { status: 404 }
      );
    }

    // Parse do conteúdo atual
    const domainData = JSON.parse(currentContent.content);

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
    const result = await githubService.updateFile({
      path: domainPath,
      content: JSON.stringify(domainData, null, 2),
      message: `Dashboard update: ${clientId} - LP ${lpId} (title/active)`
    });

    if (!result.success) {
      throw new Error(result.error || 'Falha ao atualizar arquivo');
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Configurações da LP salvas com sucesso!',
      commit: result.commit
    });
  } catch (error) {
    console.error('Erro ao salvar configurações da LP:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
