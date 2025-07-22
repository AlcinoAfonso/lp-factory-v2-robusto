export async function checkPlanAccess(clientId: string, feature: string): Promise<boolean> {
  try {
    console.log('Verificando plano para:', clientId, feature);
    return false; // Por enquanto sempre false (Light plan)
  } catch (error) {
    console.error('Erro ao verificar plano:', error);
    return false;
  }
}

export async function getClientPlan(clientId: string): Promise<string> {
  return 'light'; // Por enquanto sempre Light
}

export function getPlanDisplayName(plan: string): string {
  if (plan === 'light') return 'LP Factory Light';
  if (plan === 'pro') return 'LP Factory Pro';
  if (plan === 'ultra') return 'LP Factory Ultra';
  return 'LP Factory Light';
}
