import React, { useState, useEffect } from 'react';
import { Crown, Star, Gift, Calendar, CheckCircle, Clock, Zap } from 'lucide-react';

interface PlaceMembershipProps {
  placeId: string;
  onBack?: () => void;
}

const PlaceMembership: React.FC<PlaceMembershipProps> = ({ placeId, onBack }) => {
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [billingHistory, setBillingHistory] = useState<any[]>([]);
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    // Simulate current membership data
    setCurrentPlan({
      name: 'Premium',
      price: 199000,
      features: [
        'Unlimited bookings',
        'Priority support',
        'Advanced analytics',
        'Custom branding',
        'Multi-location management'
      ],
      nextBilling: '2025-02-01',
      status: 'active'
    });

    // Simulate billing history
    setBillingHistory([
      { date: '2025-01-01', amount: 199000, plan: 'Premium', status: 'paid' },
      { date: '2024-12-01', amount: 199000, plan: 'Premium', status: 'paid' },
      { date: '2024-11-01', amount: 99000, plan: 'Basic', status: 'paid' }
    ]);
  }, [placeId]);

  const plans = [
    {
      name: 'Basic',
      price: 99000,
      features: [
        'Up to 50 bookings/month',
        'Basic analytics',
        'Email support',
        'Standard templates',
        'Single location'
      ],
      popular: false
    },
    {
      name: 'Premium',
      price: 199000,
      features: [
        'Unlimited bookings',
        'Advanced analytics',
        'Priority support',
        'Custom branding',
        'Multi-location management',
        'Marketing tools'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 499000,
      features: [
        'Everything in Premium',
        'Dedicated account manager',
        'Custom integrations',
        'White-label solution',
        'Advanced reporting',
        'API access'
      ],
      popular: false
    }
  ];

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const PlanCard = ({ plan, isCurrent }: { plan: any; isCurrent: boolean }) => (
    <div className={`relative bg-white rounded-xl border-2 p-6 transition-all hover:shadow-lg ${
      isCurrent ? 'border-orange-500 shadow-lg' : 'border-gray-200'
    } ${plan.popular ? 'ring-2 ring-orange-200' : ''}`}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3" />
            Most Popular
          </span>
        </div>
      )}
      
      {isCurrent && (
        <div className="absolute -top-3 right-4">
          <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Current Plan
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        <div className="text-3xl font-bold text-orange-600 mb-1">
          {formatCurrency(plan.price)}
        </div>
        <p className="text-gray-600 text-sm">per month</p>
      </div>

      <ul className="space-y-3 mb-6">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-gray-700 text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => setIsUpgrading(true)}
        disabled={isCurrent}
        className={`w-full py-3 rounded-lg font-semibold transition-colors ${
          isCurrent
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
            : 'bg-orange-500 text-white hover:bg-orange-600'
        }`}
      >
        {isCurrent ? 'Current Plan' : 'Upgrade'}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 text-orange-600" />
              </div>
              Membership & Billing
            </h1>
            <p className="text-gray-600 mt-1">Manage your subscription and billing information</p>
          </div>
        </div>
      </div>

      {/* Current Plan Status */}
      {currentPlan && (
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Current Plan: {currentPlan.name}
              </h2>
              <p className="text-orange-100 mt-1">
                Next billing: {currentPlan.nextBilling} • {formatCurrency(currentPlan.price)}/month
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Available Plans */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <PlanCard
              key={plan.name}
              plan={plan}
              isCurrent={currentPlan?.name === plan.name}
            />
          ))}
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-600" />
            Billing History
          </h2>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {billingHistory.map((bill, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{bill.plan} Plan</p>
                    <p className="text-sm text-gray-600">{bill.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-orange-600">{formatCurrency(bill.amount)}</p>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    {bill.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {isUpgrading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <Gift className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Upgrade Your Plan</h3>
              <p className="text-gray-600">Choose a new plan to unlock more features</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setIsUpgrading(false)}
                className="flex-1 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle upgrade
                  setIsUpgrading(false);
                }}
                className="flex-1 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceMembership;