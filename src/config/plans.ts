export interface PlanFeatures {
  // Dashboard e controles
  dashboard: boolean;

  // Features Pro
  abTesting: boolean;
  heatmaps: boolean;
  popups: boolean;
  multiStep: boolean;
  crmIntegration: boolean;
  urgencyFeatures: boolean;
  realTimeSocial: boolean;

  // Features Ultra
  cdnPremium: boolean;
  aiSuggestions: boolean;
  trafficPersonalization: boolean;
  apiAccess: boolean;
  whiteLabel: boolean;
  multiUsers: boolean;
  autoBackup: boolean;
  prioritySupport: boolean;

  // Preço por LP por mês
  pricePerLP: number;
}

export const PLAN_FEATURES: Record<string, PlanFeatures> = {
  light: {
    // Acesso básico
    dashboard: false,

    // Pro features
    abTesting: false,
    heatmaps: false,
    popups: false,
    multiStep: false,
    crmIntegration: false,
    urgencyFeatures: false,
    realTimeSocial: false,

    // Ultra features
    cdnPremium: false,
    aiSuggestions: false,
    trafficPersonalization: false,
    apiAccess: false,
    whiteLabel: false,
    multiUsers: false,
    autoBackup: false,
    prioritySupport: false,

    pricePerLP: 297,
  },
  pro: {
    // Acesso básico
    dashboard: true,

    // Pro features
    abTesting: true,
    heatmaps: true,
    popups: true,
    multiStep: true,
    crmIntegration: true,
    urgencyFeatures: true,
    realTimeSocial: true,

    // Ultra features (ainda não)
    cdnPremium: false,
    aiSuggestions: false,
    trafficPersonalization: false,
    apiAccess: false,
    whiteLabel: false,
    multiUsers: false,
    autoBackup: false,
    prioritySupport: false,

    pricePerLP: 597,
  },
  ultra: {
    // Acesso básico
    dashboard: true,

    // Pro features
    abTesting: true,
    heatmaps: true,
    popups: true,
    multiStep: true,
    crmIntegration: true,
    urgencyFeatures: true,
    realTimeSocial: true,

    // Ultra features
    cdnPremium: true,
    aiSuggestions: true,
    trafficPersonalization: true,
    apiAccess: true,
    whiteLabel: true,
    multiUsers: true,
    autoBackup: true,
    prioritySupport: true,

    pricePerLP: 997,
  },
};

export type PlanType = keyof typeof PLAN_FEATURES;

export function getPlanFeatures(plan: PlanType): PlanFeatures {
  return PLAN_FEATURES[plan] || PLAN_FEATURES.light;
}

export function hasFeature(plan: PlanType, feature: keyof PlanFeatures): boolean {
  const features = getPlanFeatures(plan);
  return Boolean(features[feature]);
}

export function getPlanPrice(plan: PlanType): number {
  const features = getPlanFeatures(plan);
  return features.pricePerLP;
}

export function calculateMonthlyBilling(plan: PlanType, lpCount: number): number {
  const pricePerLP = getPlanPrice(plan);
  return pricePerLP * lpCount;
}
