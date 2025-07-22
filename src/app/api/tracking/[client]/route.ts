import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

    const trackingPath = path.join(process.cwd(), 'src/app', clientId, 'tracking.json');

    if (!fs.existsSync(trackingPath)) {
      return NextResponse.json(
        { error: 'Tracking configuration not found' },
        { status: 404 }
      );
    }

    const trackingData = JSON.parse(fs.readFileSync(trackingPath, 'utf8'));

    return NextResponse.json(trackingData);

  } catch (error) {
    console.error('❌ Erro ao carregar tracking data:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
