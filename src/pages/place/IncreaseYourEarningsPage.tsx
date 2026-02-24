/**
 * Massage City Places – "Increase Your Earnings" membership page.
 * Shown after vendor publishes their listing (Step 4).
 * Free / Pro 149k / Elite 190k with commission and benefits.
 */

import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { MCP_PLANS } from '../../config/massageCityPlacesPlans';
import { useLanguage } from '../../hooks/useLanguage';

interface IncreaseYourEarningsPageProps {
  onBack: () => void;
  onSelectPlan?: (planId: string) => void;
  currentPlanId?: string;
}

const IncreaseYourEarningsPage: React.FC<IncreaseYourEarningsPageProps> = ({
  onBack,
  onSelectPlan,
  currentPlanId = 'free',
}) => {
  const { language } = useLanguage();
  const isId = (language as string) === 'id';

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-amber-100 flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-full hover:bg-amber-50 text-gray-600"
          aria-label="Back"
        >
          <ArrowRight className="w-5 h-5 rotate-180" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">
          {isId ? 'Tingkatkan Penghasilan Anda' : 'Increase Your Earnings'}
        </h1>
        <div className="w-9" />
      </header>

      <main className="p-4 pb-12 max-w-2xl mx-auto">
        <p className="text-center text-gray-600 text-sm mb-8">
          {isId
            ? 'Listing Anda sudah live. Upgrade untuk mengurangi komisi dan dapatkan lebih banyak pelanggan.'
            : 'Your listing is now live. Upgrade to reduce commission and get more visibility.'}
        </p>

        <div className="space-y-6">
          {MCP_PLANS.map((plan) => {
            const isCurrent = plan.id === currentPlanId;
            const isPro = plan.id === 'pro';
            const isElite = plan.id === 'elite';
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 bg-white p-5 shadow-sm transition-all ${
                  plan.highlighted
                    ? 'border-amber-400 ring-2 ring-amber-200'
                    : isElite
                    ? 'border-amber-300'
                    : 'border-gray-200'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-2.5 left-4 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-400 text-amber-900">
                    {isId ? plan.badgeId : plan.badge}
                  </div>
                )}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        plan.id === 'free'
                          ? 'bg-green-500'
                          : plan.id === 'pro'
                          ? 'bg-blue-500'
                          : 'bg-amber-500'
                      }`}
                    />
                    <h2 className="text-lg font-bold text-gray-900">
                      {isId ? plan.nameId : plan.name}
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {plan.priceIdr === 0
                        ? '0 IDR'
                        : plan.priceIdr.toLocaleString('id-ID') + ' IDR'}
                    </p>
                    {plan.priceIdr > 0 && (
                      <p className="text-xs text-gray-500">
                        {isId ? '/ bulan' : '/ month'}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {isId ? 'Komisi:' : 'Commission:'} {plan.commissionLabel}
                </p>
                <ul className="space-y-2 mb-5">
                  {(isId ? plan.featuresId : plan.features)?.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 flex-shrink-0 text-green-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <p className="text-sm font-medium text-amber-700">
                    {isId ? 'Paket Anda saat ini' : 'Your current plan'}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSelectPlan?.(plan.id)}
                    className="w-full py-2.5 rounded-xl font-semibold bg-amber-500 text-white hover:bg-amber-600 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                  >
                    {isId ? 'Pilih' : 'Select'} {isId ? plan.nameId : plan.name}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-gray-500 mt-8">
          {isId
            ? 'Anda dapat upgrade kapan saja dari dashboard.'
            : 'You can upgrade anytime from your dashboard.'}
        </p>
      </main>
    </div>
  );
};

export default IncreaseYourEarningsPage;
