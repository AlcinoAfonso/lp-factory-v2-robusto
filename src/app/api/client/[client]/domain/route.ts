import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Interface para tipagem do domain.json
interface DomainData {
  domain?: string;
  active?: boolean;
  homepage?: string;
  lps?: Record<string, any>;
  plan?: string;
  [key: string]: any;
}


export async function GET(
  request: NextRequest,
  { params }: { params: { client: string } }
) {
  try {
    const clientId = params.client;
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID é obrigatório' },
        { status: 400 }
      );
    }

    const domainPath = path.join(process.cwd(), 'src/app', clientId, 'domain.json');

    if (!fs.existsSync(domainPath)) {
      return NextResponse.json(
        { error: 'Domain configuration not found' },
        { status: 404 }
      );
    }

    const domainData = JSON.parse(fs.readFileSync(domainPath, 'utf8'));

    return NextResponse.json(domainData);

} catch (error) {
  console.error('❌ Erro ao carregar domain config:', error);
  return NextResponse.json(
    { error: 'Erro interno do servidor' },
    { status: 500 }
  );
}
}

// Interface para tipagem do domain.json
interface DomainData {
  domain?: string;
  active?: boolean;
  homepage?: string;
  lps?: Record<string, any>;
  plan?: string;
  [key: string]: any;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { client: string } }
) {
  try {
    const clientId = params.client;
    const data = await request.json();
    
    // Validar cliente
    const clientPath = path.join(process.cwd(), 'src/app', clientId);
    if (!fs.existsSync(clientPath)) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }
    
    // Carregar domain.json atual
  const domainPath = path.join(clientPath, 'domain.json');
  let currentData: DomainData = {};
    
    if (fs.existsSync(domainPath)) {
      currentData = JSON.parse(fs.readFileSync(domainPath, 'utf8'));
    }
    
    // Atualizar dados com tipagem correta
  const updatedData: DomainData = {
      ...currentData,
      domain: data.domain || currentData.domain || '',
      active: data.active !== undefined ? data.active : currentData.active || false,
      // Manter outras configurações existentes
      ...data
    };
    
    // Salvar domain.json
    fs.writeFileSync(domainPath, JSON.stringify(updatedData, null, 2), 'utf8');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Configurações de domínio salvas com sucesso!',
      data: updatedData 
    });
  } catch (error) {
    console.error('Erro ao salvar domain.json:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
