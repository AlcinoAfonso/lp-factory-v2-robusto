import { useState, useEffect } from 'react';
import { PlanType, getPlanLimits, hasFeature, PlanLimits } from '@/config/plans';

interface UsePlanReturn {
  plan: PlanType;
  limits: PlanLimits;
  hasFeature: (feature: keyof PlanLimits) => boolean;
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

  return {
    plan,
    limits: getPlanLimits(plan),
    hasFeature: (feature: keyof PlanLimits) => hasFeature(plan, feature),
    isLoading,
  };
}
