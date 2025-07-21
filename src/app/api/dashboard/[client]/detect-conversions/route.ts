import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { client: string } }
) {
  try {
    const { lpData } = await request.json();

    const conversions = await detectConversionsFromLPData(lpData);

    return NextResponse.json({
      success: true,
      conversions
    });
  } catch (error) {
    console.error('Erro ao detectar conversões:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

async function detectConversionsFromLPData(lpData: any) {
  return [
    {
      id: 'whatsapp_demo',
      type: 'whatsapp',
      destination: '+5511999999999',
      label: 'WhatsApp Principal',
      elementsCount: 3,
      locations: ['hero', 'ctaFinal'],
      enabled: false,
      googleAdsId: '',
    }
  ];
}
