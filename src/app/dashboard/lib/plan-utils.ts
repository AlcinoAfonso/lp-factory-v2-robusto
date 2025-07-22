import { PlanType, getPlanFeatures, hasFeature, PlanFeatures } from '@/config/plans';

export async function checkPlanAccess(clientId: string, feature: keyof PlanFeatures): Promise<boolean> {
  try {
    // Por enquanto, todos são Light
    const plan: PlanType = 'light';
    return hasFeature(plan, feature);
  } catch (error) {
    console.error('Erro ao verificar plano:', error);
    return false;
  }
}

export async function getClientPlan(clientId: string): Promise<PlanType> {
  try {
    // Carregar do domain.json
    const response = await fetch(`/api/client/${clientId}/plan`);
    if (response.ok) {
      const data = await response.json();
      return data.plan || 'light';
    }
  } catch (error) {
    console.error('Erro ao carregar plano:', error);
  }
  return 'light'; // fallback
}

export function getPlanDisplayName(plan: PlanType): string {
  if (plan === 'light') return 'LP Factory Light';
  if (plan === 'pro') return 'LP Factory Pro';
  if (plan === 'ultra') return 'LP Factory Ultra';
  return 'LP Factory Light';
}

export function calculateClientBilling(plan: PlanType, lpCount: number): {
  pricePerLP: number;
  monthlyTotal: number;
  plan: string;
} {
  const features = getPlanFeatures(plan);
  return {
    pricePerLP: features.pricePerLP,
    monthlyTotal: features.pricePerLP * lpCount,
    plan: getPlanDisplayName(plan)
  };
}
