import React from 'react';
import { PlanType, hasFeature, PlanFeatures, getPlanFeatures } from '@/config/plans';

interface PlanGateProps {
  plan: PlanType;
  feature: keyof PlanFeatures;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PlanGate({ plan, feature, children, fallback = null }: PlanGateProps) {
  const hasAccess = hasFeature(plan, feature);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

// Componente de upgrade
export function UpgradeBanner({ 
  currentPlan, 
  requiredFeature 
}: { 
  currentPlan: PlanType; 
  requiredFeature: keyof PlanFeatures;
}) {
  const requiredPlan = requiredFeature === 'dashboard' ? 'pro' : 'ultra';
  
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Upgrade Necessário
          </h3>
          <p className="text-sm text-yellow-700 mt-1">
            Esta funcionalidade requer o plano {requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)}. 
            Você está no plano {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}.
          </p>
          <div className="mt-3">
            <a
              href="https://wa.me/5521999998888?text=Quero%20fazer%20upgrade%20do%20meu%20plano"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200"
            >
              Fazer Upgrade
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente para mostrar preço
export function PlanPricing({ plan, lpCount }: { plan: PlanType; lpCount: number }) {
  const features = getPlanFeatures(plan);
  const monthlyTotal = features.pricePerLP * lpCount;
  
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="font-medium text-gray-900 mb-2">
        Plano Atual: {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </h3>
      <div className="text-sm text-gray-600">
        <p>R$ {features.pricePerLP} por LP/mês</p>
        <p>{lpCount} LP{lpCount !== 1 ? 's' : ''} ativa{lpCount !== 1 ? 's' : ''}</p>
        <p className="font-semibold text-lg text-gray-900 mt-2">
          Total: R$ {monthlyTotal}/mês
        </p>
      </div>
    </div>
  );
}
