import { useState, useEffect } from 'react';
import {
  PlanType,
  getPlanFeatures,
  hasFeature,
  PlanFeatures,
} from '@/config/plans';

interface UsePlanReturn {
  plan: PlanType;
  features: PlanFeatures;
  hasFeature: (feature: keyof PlanFeatures) => boolean;
  pricePerLP: number;
  isLoading: boolean;
}

export function usePlan(clientId?: string): UsePlanReturn {
  const [plan, setPlan] = useState<PlanType>('light');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!clientId) {
      setIsLoading(false);
      return;
    }

    // Simular carregamento do plano do cliente
    // Por enquanto, todos são Light
    setPlan('light');
    setIsLoading(false);
  }, [clientId]);

  const features = getPlanFeatures(plan);

  return {
    plan,
    features,
    hasFeature: (feature: keyof PlanFeatures) => hasFeature(plan, feature),
    pricePerLP: features.pricePerLP,
    isLoading,
  };
}
