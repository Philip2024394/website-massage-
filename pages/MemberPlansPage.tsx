import React from 'react';
import { APP_CONFIG } from '../config';

interface MemberPlansPageProps {
  onNavigate: (page: string) => void;
}

const MemberPlansPage: React.FC<MemberPlansPageProps> = ({ onNavigate }) => {
  const plans = APP_CONFIG.MEMBERSHIPS.PLANS;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-6">
          <button
            onClick={() => onNavigate('home')}
            className="text-blue-600 hover:underline"
          >
            ← Back
          </button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Membership Plans</h1>
        <p className="text-gray-600 mb-8">
          Choose a plan to unlock member perks. Purchases are handled securely by Stripe.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.key} className="bg-white rounded-xl shadow border p-6 flex flex-col">
              <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
              <div className="text-2xl font-bold mt-2">{plan.priceLabel}</div>
              <ul className="mt-4 text-gray-700 space-y-1 flex-1">
                {plan.features?.map((f: string) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                disabled={!plan.paymentLink}
                onClick={() => {
                  if (!plan.paymentLink) return;
                  window.open(plan.paymentLink, '_blank');
                }}
                className={`mt-6 w-full py-2 rounded-lg text-white ${
                  plan.paymentLink ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {plan.paymentLink ? 'Subscribe with Stripe' : 'Configure Payment Link'}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-10 text-sm text-gray-600">
          <p>
            After payment, your membership activates automatically once Stripe confirms the subscription. If it doesn’t, contact support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MemberPlansPage;
