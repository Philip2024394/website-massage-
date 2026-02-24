/**
 * Place dashboard – Membership / Increase Your Earnings.
 * Free, Pro 149k, Elite 190k with commission and benefits (Massage City Places Indonesia).
 */

import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { MCP_PLANS } from '../../../src/config/massageCityPlacesPlans';
import { useLanguage } from '../../../src/hooks/useLanguage';

interface MembershipPlansPageProps {
  onBack: () => void;
  userType: string;
  currentPlan?: string;
}

const MembershipPlansPage: React.FC<MembershipPlansPageProps> = ({ onBack, currentPlan = 'free' }) => {
  const { language } = useLanguage();
  const isId = (language as string) === 'id';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-full hover:bg-amber-50 text-gray-600"
          aria-label="Back"
        >
          <ArrowRight className="w-5 h-5 rotate-180" />
        </button>
        <h2 className="text-xl font-bold text-gray-900">
          {isId ? 'Tingkatkan Penghasilan Anda' : 'Increase Your Earnings'}
        </h2>
      </div>
      <p className="text-sm text-gray-600">
        {isId
          ? 'Upgrade untuk mengurangi komisi dan dapatkan lebih banyak pelanggan.'
          : 'Upgrade to reduce commission and get more visibility.'}
      </p>

      {MCP_PLANS.map((plan) => {
        const isCurrent = plan.id === currentPlan;
        const isElite = plan.id === 'elite';
        return (
          <div
            key={plan.id}
            className={`relative rounded-2xl border-2 bg-white p-5 shadow-sm ${
              plan.highlighted ? 'border-amber-400 ring-2 ring-amber-200' : isElite ? 'border-amber-300' : 'border-gray-200'
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
                    plan.id === 'free' ? 'bg-green-500' : plan.id === 'pro' ? 'bg-blue-500' : 'bg-amber-500'
                  }`}
                />
                <h3 className="text-lg font-bold text-gray-900">{isId ? plan.nameId : plan.name}</h3>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">
                  {plan.priceIdr === 0 ? '0 IDR' : plan.priceIdr.toLocaleString('id-ID') + ' IDR'}
                </p>
                {plan.priceIdr > 0 && <p className="text-xs text-gray-500">{isId ? '/ bulan' : '/ month'}</p>}
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">{isId ? 'Komisi:' : 'Commission:'} {plan.commissionLabel}</p>
            <ul className="space-y-2 mb-5">
              {(isId ? plan.featuresId : plan.features)?.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 flex-shrink-0 text-green-500" />
                  {f}
                </li>
              ))}
            </ul>
            {isCurrent ? (
              <p className="text-sm font-medium text-amber-700">{isId ? 'Paket Anda saat ini' : 'Your current plan'}</p>
            ) : (
              <button
                type="button"
                className="w-full py-2.5 rounded-xl font-semibold bg-amber-500 text-white hover:bg-amber-600"
                onClick={() => {}}
              >
                {isId ? 'Pilih' : 'Select'} {isId ? plan.nameId : plan.name}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MembershipPlansPage;
