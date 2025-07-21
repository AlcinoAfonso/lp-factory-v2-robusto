import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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
    let currentData = {};
    
    if (fs.existsSync(domainPath)) {
      currentData = JSON.parse(fs.readFileSync(domainPath, 'utf8'));
    }
    
    // Atualizar dados
    const updatedData = {
      ...currentData,
      domain: data.domain || '',
      active: data.active || false,
      // Manter outras configurações existentes
    };
    
    // Salvar domain.json
    fs.writeFileSync(domainPath, JSON.stringify(updatedData, null, 2), 'utf8');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Configurações de domínio salvas com sucesso!' 
    });
  } catch (error) {
    console.error('Erro ao salvar domain.json:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
