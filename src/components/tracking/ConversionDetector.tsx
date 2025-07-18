'use client';

import { useEffect, useState } from 'react';
import type { LandingPageData } from '@/types/lp-config';
import type { DetectedConversion } from './types';
import { detectConversionsFromLP } from './utils/detectionEngine';

interface ConversionDetectorProps {
  lpData: LandingPageData;
  clientName: string;
  onDetectionComplete?: (conversions: DetectedConversion[]) => void;
}

export function ConversionDetector({ lpData, clientName, onDetectionComplete }: ConversionDetectorProps) {
  const [detectedConversions, setDetectedConversions] = useState<DetectedConversion[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    detectConversions();
  }, [lpData]);

  async function detectConversions() {
    setIsDetecting(true);

    try {
      console.info(`🎯 ConversionDetector: Iniciando detecção para ${clientName}`);

      // Executar detecção
      const conversions = detectConversionsFromLP(lpData);

      setDetectedConversions(conversions);
      onDetectionComplete?.(conversions);

      // Salvar no tracking.json (opcional - para cache)
      await saveDetectedConversions(clientName, conversions);

      console.info(
        `✅ ConversionDetector: Detecção concluída - ${conversions.length} conversões encontradas`,
      );
    } catch (error) {
      console.error('❌ ConversionDetector: Erro na detecção:', error);
    } finally {
      setIsDetecting(false);
    }
  }

  async function saveDetectedConversions(client: string, conversions: DetectedConversion[]) {
    try {
      const trackingConfig = {
        client,
        method: 'direct' as const,
        detected_conversions: conversions.reduce((acc, conv) => {
          acc[conv.id] = conv;
          return acc;
        }, {} as Record<string, DetectedConversion>),
        configured: false,
      };

      // Salvar via API ou localStorage temporário
      if (typeof window !== 'undefined') {
        localStorage.setItem(`tracking_${client}`, JSON.stringify(trackingConfig));
        console.info('💾 ConversionDetector: Configuração salva no cache local');
      }
    } catch (error) {
      console.warn('⚠️ ConversionDetector: Erro ao salvar cache:', error);
    }
  }

  // Componente não renderiza nada - apenas processa
  return null;
}

export default ConversionDetector;
