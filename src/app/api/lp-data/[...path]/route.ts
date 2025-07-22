import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const pathSegments = params.path;
    
    if (!pathSegments || pathSegments.length === 0) {
      return NextResponse.json(
        { error: 'Path é obrigatório' },
        { status: 400 }
      );
    }

    // Reconstruir o caminho
    const filePath = pathSegments.join('/');
    
    // Validar que termina com lp.json
    if (!filePath.endsWith('lp.json')) {
      return NextResponse.json(
        { error: 'Apenas arquivos lp.json são permitidos' },
        { status: 400 }
      );
    }

    const fullPath = path.join(process.cwd(), 'src/app', filePath);

    // Validar que o arquivo está dentro do diretório src/app
    const appDir = path.join(process.cwd(), 'src/app');
    const resolvedPath = path.resolve(fullPath);
    if (!resolvedPath.startsWith(appDir)) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    if (!fs.existsSync(fullPath)) {
      return NextResponse.json(
        { error: 'LP data não encontrada' },
        { status: 404 }
      );
    }

    const lpData = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

    return NextResponse.json(lpData);

  } catch (error) {
    console.error('❌ Erro ao carregar LP data:', error);
    
    // Verificar se é erro de JSON malformado
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Arquivo JSON malformado' },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
