import type { TrackingConfig } from '../types';

export async function loadTrackingConfig(clientName: string): Promise<TrackingConfig | null> {
  try {
    // Tentar carregar tracking.json do cliente
    const response = await fetch(`/api/tracking/${clientName}`);
    
    if (!response.ok) {
      console.info(`ℹ️ Nenhum tracking.json encontrado para ${clientName}`);
      return null;
    }
    
    const config = await response.json();
    return config as TrackingConfig;
  } catch (error) {
    // Fallback: tentar require direto (se estiver no build)
    try {
      const config = require(`@/app/${clientName}/tracking.json`);
      return config as TrackingConfig;
    } catch (requireError) {
      console.info(`ℹ️ Tracking não configurado para ${clientName}`);
      return null;
    }
  }
}
