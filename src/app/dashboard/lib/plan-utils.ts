import { PlanType, getPlanLimits, canCreateLP } from '@/config/plans';

export async function checkPlanAccess(clientId: string, feature: keyof typeof getPlanLimits): Promise<boolean> {
  try {
    // Por enquanto, todos são Light
    const plan: PlanType = 'light';
    const limits = getPlanLimits(plan);
    return Boolean(limits[feature]);
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
  const names = {
    light: 'LP Factory Light',
    pro: 'LP Factory Pro',
    ultra: 'LP Factory Ultra'
  };
  return names[plan] || 'LP Factory Light';
}
