// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState } from 'react';
import { Crown, Check, X, Star, BadgePercent, Coins, CheckCircle, LogOut } from 'lucide-react';

interface MembershipPlansPageProps {
  facialPlace: any;
  onBack: () => void;
}

const MembershipPlansPage: React.FC<MembershipPlansPageProps> = ({ onBack }) => {
  const [selected, setSelected] = useState<'monthly' | 'commission' | null>(null);
  const [agree, setAgree] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSelectPlan = async () => {
    if (!selected || !agree) {
      alert('Please select a plan and agree to the terms');
      return;
    }

    setSaving(true);
    try {
      // Update facial place document with membership type
      // TODO: Implement update logic for facialPlaceService if needed
      // await facialPlaceService.update(facialPlace.$id, {
      //   membershipType: selected,
      //   membershipSelectedAt: new Date().toISOString(),
      //   membershipTier: 'plus',
      //   subscriptionMonth: 1,
      // });

      console.log('✅ Membership plan selected:', selected);
      
      // Navigate to dashboard
      onBack();
    } catch (error) {
      console.error('❌ Failed to save membership selection:', error);
      alert('Failed to save membership selection. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pb-24">
      {/* Header */}
      <div className="w-full bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Membership Plans</h1>
                <p className="text-xs text-gray-500">Choose the plan that fits your needs</p>
              </div>
            </div>
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 mb-8 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Star className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Welcome to IndaStreet Facial!</h2>
              <p className="text-purple-100">Your first month is FREE - Choose your plan to get started</p>
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-sm text-purple-50">
              ✨ <strong>Special Offer:</strong> Get started with zero cost for 30 days. Cancel anytime!
            </p>
          </div>
        </div>

        {/* Membership Plans */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Monthly Plan */}
          <div 
            onClick={() => setSelected('monthly')}
            className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${
              selected === 'monthly' 
                ? 'border-purple-500 bg-purple-50 shadow-lg scale-105' 
                : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
            }`}
          >
            {selected === 'monthly' && (
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            )}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Monthly Subscription</h3>
                <p className="text-sm text-purple-600 font-semibold">Predictable Pricing</p>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-800">$199</span>
                <span className="text-gray-500">/month</span>
              </div>
              <p className="text-xs text-green-600 font-semibold mt-1">First month FREE!</p>
            </div>

            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Fixed monthly cost - no surprises</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Unlimited bookings</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Priority customer support</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Cancel anytime</span>
              </li>
            </ul>
          </div>

          {/* Commission Plan */}
          <div 
            onClick={() => setSelected('commission')}
            className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${
              selected === 'commission' 
                ? 'border-pink-500 bg-pink-50 shadow-lg scale-105' 
                : 'border-gray-200 bg-white hover:border-pink-300 hover:shadow-md'
            }`}
          >
            {selected === 'commission' && (
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            )}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
                <BadgePercent className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Commission Based</h3>
                <p className="text-sm text-pink-600 font-semibold">Pay as You Grow</p>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-800">15%</span>
                <span className="text-gray-500">per booking</span>
              </div>
              <p className="text-xs text-green-600 font-semibold mt-1">No upfront costs!</p>
            </div>

            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Only pay when you earn</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">No monthly commitment</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Great for startups</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Flexible & scalable</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Terms Agreement */}
        <div className="bg-white rounded-xl p-6 mb-6 border shadow-sm">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-purple-500 focus:ring-purple-500 mt-0.5 cursor-pointer"
            />
            <div className="flex-1">
              <span className="text-sm text-gray-700">
                I agree to the{' '}
                <a href="#" className="text-purple-600 hover:underline font-medium">
                  Terms of Service
                </a>
                {' '}and{' '}
                <a href="#" className="text-purple-600 hover:underline font-medium">
                  Privacy Policy
                </a>
              </span>
              <p className="text-xs text-gray-500 mt-1">
                Your first month is free. You can cancel anytime before the trial ends.
              </p>
            </div>
          </label>
        </div>

        {/* Action Button */}
        <button
          onClick={handleSelectPlan}
          disabled={!selected || !agree || saving}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
            !selected || !agree || saving
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl'
          }`}
        >
          {saving ? 'Activating...' : 'Start Free Trial'}
        </button>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Questions? Contact us at{' '}
            <a href="mailto:support@indastreet.com" className="text-purple-600 hover:underline">
              support@indastreet.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MembershipPlansPage;