import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(
  request: NextRequest,
  { params }: { params: { client: string; lpId: string } }
) {
  try {
    const { client: clientId, lpId } = params;
    const data = await request.json();
    
    // Validar cliente
    const clientPath = path.join(process.cwd(), 'src/app', clientId);
    const domainPath = path.join(clientPath, 'domain.json');
    
    if (!fs.existsSync(domainPath)) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }
    
    // Carregar domain.json
    const domainData = JSON.parse(fs.readFileSync(domainPath, 'utf8'));
    
    if (!domainData.lps?.[lpId]) {
      return NextResponse.json({ error: 'LP não encontrada' }, { status: 404 });
    }
    
    // Atualizar configurações da LP no domain.json
    if (data.title || typeof data.active === 'boolean') {
      if (data.title) domainData.lps[lpId].title = data.title;
      if (typeof data.active === 'boolean') domainData.lps[lpId].active = data.active;
      
      fs.writeFileSync(domainPath, JSON.stringify(domainData, null, 2), 'utf8');
    }
    
    // Salvar tracking.json se houver dados de tracking
    if (data.googleAdsRemark || data.metaPixelId || data.googleAnalyticsId) {
      const trackingPath = path.join(clientPath, 'tracking.json');
      let trackingData = {};
      
      if (fs.existsSync(trackingPath)) {
        trackingData = JSON.parse(fs.readFileSync(trackingPath, 'utf8'));
      }
      
      // Atualizar tracking data
      const updatedTrackingData = {
        ...trackingData,
        client: clientId,
        method: 'direct',
        direct_ids: {
          google_ads: {
            remarketing: data.googleAdsRemark || '',
          },
          meta_pixel: data.metaPixelId || '',
          google_analytics: data.googleAnalyticsId || '',
        },
        configured: true,
      };
      
      fs.writeFileSync(trackingPath, JSON.stringify(updatedTrackingData, null, 2), 'utf8');
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Configurações da LP salvas com sucesso!' 
    });
  } catch (error) {
    console.error('Erro ao salvar configurações da LP:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
