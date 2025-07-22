export interface PlanLimits {
  maxLPs: number; // -1 = unlimited
  dashboard: boolean;
  abTesting: boolean;
  heatmaps: boolean;
  popups: boolean;
  multiStep: boolean;
  crmIntegration: boolean;
  urgencyFeatures: boolean;
  realTimeSocial: boolean;
  cdnPremium: boolean;
  aiSuggestions: boolean;
  trafficPersonalization: boolean;
  apiAccess: boolean;
  whiteLabel: boolean;
  multiUsers: boolean;
  autoBackup: boolean;
  prioritySupport: boolean;
  price: number;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  light: {
    maxLPs: 1,
    dashboard: false,
    abTesting: false,
    heatmaps: false,
    popups: false,
    multiStep: false,
    crmIntegration: false,
    urgencyFeatures: false,
    realTimeSocial: false,
    cdnPremium: false,
    aiSuggestions: false,
    trafficPersonalization: false,
    apiAccess: false,
    whiteLabel: false,
    multiUsers: false,
    autoBackup: false,
    prioritySupport: false,
    price: 297,
  },
  pro: {
    maxLPs: 5,
    dashboard: true,
    abTesting: true,
    heatmaps: true,
    popups: true,
    multiStep: true,
    crmIntegration: true,
    urgencyFeatures: true,
    realTimeSocial: true,
    cdnPremium: false,
    aiSuggestions: false,
    trafficPersonalization: false,
    apiAccess: false,
    whiteLabel: false,
    multiUsers: false,
    autoBackup: false,
    prioritySupport: false,
    price: 597,
  },
  ultra: {
    maxLPs: -1, // unlimited
    dashboard: true,
    abTesting: true,
    heatmaps: true,
    popups: true,
    multiStep: true,
    crmIntegration: true,
    urgencyFeatures: true,
    realTimeSocial: true,
    cdnPremium: true,
    aiSuggestions: true,
    trafficPersonalization: true,
    apiAccess: true,
    whiteLabel: true,
    multiUsers: true,
    autoBackup: true,
    prioritySupport: true,
    price: 997,
  },
};

export type PlanType = keyof typeof PLAN_LIMITS;

export function getPlanLimits(plan: PlanType): PlanLimits {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.light;
}

export function canCreateLP(currentLPs: number, plan: PlanType): boolean {
  const limits = getPlanLimits(plan);
  return limits.maxLPs === -1 || currentLPs < limits.maxLPs;
}

export function hasFeature(plan: PlanType, feature: keyof PlanLimits): boolean {
  const limits = getPlanLimits(plan);
  return Boolean(limits[feature]);
}
