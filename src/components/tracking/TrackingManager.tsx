'use client';

import { useEffect, useState } from 'react';
import { GTMInjector } from './GTMInjector';
import { DirectTracking } from './DirectTracking';
import { DynamicTracking } from './DynamicTracking';
import { ConversionDetector } from './ConversionDetector';
import { loadTrackingConfig } from './utils/loadTracking';
import type { TrackingConfig, DetectedConversion } from './types';
import type { LandingPageData } from '@/types/lp-config';

interface TrackingManagerProps {
  clientName: string;
  lpData: LandingPageData;
}

export default function TrackingManager({ clientName, lpData }: TrackingManagerProps) {
  const [trackingConfig, setTrackingConfig] = useState<TrackingConfig | null>(null);
  const [detectedConversions, setDetectedConversions] = useState<DetectedConversion[]>([]);
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

          // Se já tem conversões detectadas, usar elas
          if (config.detected_conversions) {
            setDetectedConversions(Object.values(config.detected_conversions));
          }
        } else {
          console.info('ℹ️ TrackingManager: Nenhuma configuração encontrada para', clientName, '- iniciando detecção automática');
        }
      } catch (error) {
        console.warn('⚠️ TrackingManager: Erro ao carregar configuração:', error);
      } finally {
        setIsLoaded(true);
      }
    }

    initTracking();
  }, [clientName]);

  const handleDetectionComplete = (conversions: DetectedConversion[]) => {
    setDetectedConversions(conversions);
    console.info('🔍 TrackingManager: Detecção automática concluída -', conversions.length, 'conversões encontradas');
  };

  // Ainda carregando
  if (!isLoaded) {
    return null;
  }

  // Determinar qual sistema usar
  const useOldSystem =
    trackingConfig &&
    trackingConfig.configured &&
    trackingConfig.direct_ids?.google_ads?.conversions &&
    !trackingConfig.detected_conversions;

  const useNewSystem = !useOldSystem;

  return (
    <>
      {/* Detecção Automática - sempre executar para LPs novas ou atualizadas */}
      {useNewSystem && (
        <ConversionDetector lpData={lpData} clientName={clientName} onDetectionComplete={handleDetectionComplete} />
      )}

      {/* Sistema Antigo - DirectTracking com tracking_tags manuais */}
      {useOldSystem && trackingConfig && (
        <>
          {(trackingConfig.method === 'gtm' || trackingConfig.method === 'both') &&
            trackingConfig.gtm_snippet && <GTMInjector snippet={trackingConfig.gtm_snippet} />}

          {(trackingConfig.method === 'direct' || trackingConfig.method === 'both') &&
            trackingConfig.direct_ids && <DirectTracking config={trackingConfig.direct_ids} />}
        </>
      )}

      {/* Sistema Novo - DynamicTracking com detecção automática */}
      {useNewSystem && trackingConfig && trackingConfig.configured && (
        <>
          {(trackingConfig.method === 'gtm' || trackingConfig.method === 'both') &&
            trackingConfig.gtm_snippet && <GTMInjector snippet={trackingConfig.gtm_snippet} />}

          {(trackingConfig.method === 'direct' || trackingConfig.method === 'both') && (
            <DynamicTracking
              config={{
                ...trackingConfig.direct_ids,
                detected_conversions: trackingConfig.detected_conversions,
              }}
            />
          )}
        </>
      )}
    </>
  );
}
