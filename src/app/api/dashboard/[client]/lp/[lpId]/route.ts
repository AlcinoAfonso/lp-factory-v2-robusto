// src/app/api/dashboard/[client]/lp/[lpId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { githubService } from '@/lib/github-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { client: string; lpId: string } }
) {
  try {
    const { client: clientId, lpId } = params;
    const data = await request.json();

    if (!data.title && typeof data.active === 'undefined') {
      return NextResponse.json(
        { error: 'Nenhum dado para atualizar' },
        { status: 400 }
      );
    }

    const domainPath = `src/app/${clientId}/domain.json`;
    const currentFile = await githubService.getFileContent(domainPath);

    if (!currentFile || !currentFile.content) {
      return NextResponse.json(
        { error: 'domain.json não encontrado' },
        { status: 404 }
      );
    }

    const domainData = JSON.parse(Buffer.from(currentFile.content, 'base64').toString('utf8'));

    if (!domainData.lps || !domainData.lps[lpId]) {
      return NextResponse.json(
        { error: `LP \"${lpId}\" não encontrada` },
        { status: 404 }
      );
    }

    if (data.title !== undefined) {
      domainData.lps[lpId].title = data.title;
    }

    if (typeof data.active === 'boolean') {
      domainData.lps[lpId].active = data.active;
    }

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
    return NextResponse.json(
      {
        error: 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}
