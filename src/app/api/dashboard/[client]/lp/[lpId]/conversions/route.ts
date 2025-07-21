import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(
  request: NextRequest,
  { params }: { params: { client: string; lpId: string } }
) {
  try {
    const { client: clientId, lpId } = params;
    const { conversions } = await request.json();

    const trackingPath = path.join(process.cwd(), 'src/app', clientId, 'tracking.json');

    let trackingData = {};
    if (fs.existsSync(trackingPath)) {
      trackingData = JSON.parse(fs.readFileSync(trackingPath, 'utf8'));
    }

    const updatedTrackingData = {
      ...trackingData,
      client: clientId,
      method: 'direct',
      detected_conversions: conversions.reduce((acc: any, conv: any) => {
        acc[conv.id] = {
          ...conv,
          tracking_enabled: conv.enabled
        };
        return acc;
      }, {}),
      configured: true,
    };

    fs.writeFileSync(trackingPath, JSON.stringify(updatedTrackingData, null, 2), 'utf8');

    return NextResponse.json({
      success: true,
      message: 'Configurações de conversão salvas com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao salvar conversões:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
