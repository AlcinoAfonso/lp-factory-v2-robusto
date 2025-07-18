'use client';

import { useEffect, useState } from 'react';
import { GTMInjector } from './GTMInjector';
import { DirectTracking } from './DirectTracking';
import { loadTrackingConfig } from './utils/loadTracking';
import type { TrackingConfig } from './types';

interface TrackingManagerProps {
  clientName: string;
}

export default function TrackingManager({ clientName }: TrackingManagerProps) {
  const [trackingConfig, setTrackingConfig] = useState<TrackingConfig | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function initTracking() {
      try {
        const config = await loadTrackingConfig(clientName);
        setTrackingConfig(config);
        
        if (config) {
          console.info('🎯 TrackingManager: Configuração carregada para', clientName);
          console.info('📊 Método ativo:', config.method);
          console.info('✅ Configurado:', config.configured);
        } else {
          console.info('ℹ️ TrackingManager: Nenhuma configuração encontrada para', clientName, '- LP funcionará sem tracking');
        }
      } catch (error) {
        console.warn('⚠️ TrackingManager: Erro ao carregar configuração:', error);
      } finally {
        setIsLoaded(true);
      }
    }

    initTracking();
  }, [clientName]);

  // Ainda carregando
  if (!isLoaded) {
    return null;
  }

  // Sem configuração ou não configurado
  if (!trackingConfig || !trackingConfig.configured) {
    console.info('ℹ️ TrackingManager: LP funcionando sem tracking ativo');
    return null;
  }

  return (
    <>
      {/* GTM Injection */}
      {(trackingConfig.method === 'gtm' || trackingConfig.method === 'both') && 
       trackingConfig.gtm_snippet && (
        <GTMInjector snippet={trackingConfig.gtm_snippet} />
      )}

      {/* Direct Tracking */}
      {(trackingConfig.method === 'direct' || trackingConfig.method === 'both') && 
       trackingConfig.direct_ids && (
        <DirectTracking config={trackingConfig.direct_ids} />
      )}
    </>
  );
}
