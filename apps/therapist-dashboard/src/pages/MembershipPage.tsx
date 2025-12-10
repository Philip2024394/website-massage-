import React, { useState } from 'react';
import { Crown, Check, X, Star, TrendingUp, MessageCircle, Shield, Zap, BarChart3 } from 'lucide-react';

interface MembershipPageProps {
  therapist: any;
  onBack: () => void;
}

const MembershipPage: React.FC<MembershipPageProps> = ({ therapist, onBack }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const currentTier = therapist?.membershipTier || 'free';
  const premiumExpiresAt = therapist?.premiumExpiresAt ? new Date(therapist.premiumExpiresAt) : null;

  const monthlyPrice = 200000; // 200k IDR
  const annualPrice = 2000000; // 2M IDR (2 months free)

  const handleUpgrade = (plan: 'monthly' | 'annual') => {
    // TODO: Integrate payment gateway
    console.log('Upgrading to premium:', plan);
    alert(`Payment integration coming soon!\n\nPlan: Premium ${plan}\nPrice: ${plan === 'monthly' ? 'Rp 200,000/month' : 'Rp 2,000,000/year'}`);
  };

  const formatExpiryDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Header */}
      <div className="w-full bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ←
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Membership Plans</h1>
              <p className="text-xs text-gray-500">Choose the plan that fits your needs</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Current Status Banner */}
        {currentTier === 'premium' && premiumExpiresAt && (
          <div className="mb-8 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Premium Member</h2>
                  <p className="text-yellow-100">
                    Your premium membership expires on {formatExpiryDate(premiumExpiresAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleUpgrade('monthly')}
                className="px-6 py-3 bg-white text-amber-600 font-bold rounded-xl hover:shadow-lg transition-all"
              >
                Renew Now
              </button>
            </div>
          </div>
        )}

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              billingCycle === 'monthly'
                ? 'bg-orange-500 text-white shadow-lg'
                : 'bg-white text-gray-700 border-2 border-gray-300'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all relative ${
              billingCycle === 'annual'
                ? 'bg-orange-500 text-white shadow-lg'
                : 'bg-white text-gray-700 border-2 border-gray-300'
            }`}
          >
            Annual
            <span className="absolute -top-2 -right-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full font-bold">
              Save 16%
            </span>
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Free</h3>
              <div className="text-5xl font-bold text-gray-800 mb-2">
                Rp 0
              </div>
              <p className="text-gray-600">Basic features to get started</p>
              <div className="mt-3 text-center">
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                  30% commission
                </span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm">Profile listing</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm">Receive bookings</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm">Basic earnings tracking</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm">WhatsApp integration</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">Verified badge</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">Analytics</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">Priority support</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">Calendar</span>
              </li>
            </ul>

            <button
              disabled={currentTier === 'free'}
              className="w-full py-4 bg-gray-100 text-gray-800 font-bold rounded-xl border-2 border-gray-300 cursor-not-allowed"
            >
              {currentTier === 'free' ? 'Current Plan' : 'Downgrade'}
            </button>
          </div>

          {/* Premium Plan */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-2xl border-4 border-blue-400 p-8 relative transform scale-105">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-bold rounded-full shadow-lg flex items-center gap-2">
                <Star className="w-5 h-5" />
                <span>MOST POPULAR</span>
              </div>
            </div>

            <div className="text-center mb-6 mt-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown className="w-8 h-8 text-yellow-600" />
                <h3 className="text-2xl font-bold text-gray-800">Premium</h3>
              </div>
              <div className="text-5xl font-bold text-gray-800 mb-2">
                {billingCycle === 'monthly' ? (
                  <>Rp 200k</>
                ) : (
                  <>Rp 2M</>
                )}
              </div>
              <p className="text-gray-600">
                {billingCycle === 'monthly' ? 'per month' : 'per year (save Rp 400k)'}
              </p>
            </div>

            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 mb-6">
              <p className="text-lg text-green-900 font-bold text-center">🎉 0% COMMISSION</p>
              <p className="text-sm text-green-800 text-center mt-1">Keep 100% of your earnings!</p>
              <p className="text-xs text-green-700 text-center mt-2">Save 25% on every booking vs free tier</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <div>
                  <span className="text-gray-800 font-semibold">Everything in Free, plus:</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-800 font-semibold">Verified Badge</span>
                  <p className="text-sm text-gray-600">Blue checkmark on profile for trust & credibility</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <BarChart3 className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-800 font-semibold">Best Times Analytics</span>
                  <p className="text-sm text-gray-600">Peak hours, busy days, optimal schedule recommendations</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-800 font-semibold">24/7 Customer Support Chat</span>
                  <p className="text-sm text-gray-600">Direct chat with support team, 2-hour response time</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-800 font-semibold">Discount Badges</span>
                  <p className="text-sm text-gray-600">Set 5%, 10%, 15%, or 20% discount badges to attract customers</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-800 font-semibold">Priority Search Placement</span>
                  <p className="text-sm text-gray-600">Appear at the top of customer search results</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Star className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-800 font-semibold">Advanced Analytics</span>
                  <p className="text-sm text-gray-600">Customer demographics, booking patterns, revenue forecasting</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-800 font-semibold">Profile Optimization Support</span>
                  <p className="text-sm text-gray-600">Help with photos, descriptions, translations</p>
                </div>
              </li>
            </ul>

            <button
              onClick={() => handleUpgrade(billingCycle)}
              disabled={currentTier === 'premium'}
              className="w-full py-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentTier === 'premium' ? 'Current Plan' : `Upgrade to Premium - Rp ${billingCycle === 'monthly' ? '200k' : '2M'}`}
            </button>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Detailed Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-700">Free</th>
                  <th className="text-center py-4 px-4 font-semibold text-yellow-600">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="bg-yellow-50">
                  <td className="py-4 px-4 font-semibold text-gray-900">Commission Rate</td>
                  <td className="text-center py-4 px-4">
                    <span className="text-red-600 font-bold text-lg">25%</span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="text-green-600 font-bold text-lg">0% 🎉</span>
                  </td>
                </tr>
                <tr className="bg-green-50">
                  <td className="py-4 px-4 text-gray-700">Your Earnings (per Rp 100k booking)</td>
                  <td className="text-center py-4 px-4">
                    <span className="font-semibold text-gray-900">Rp 75,000</span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="font-semibold text-green-600 text-lg">Rp 100,000</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Profile Listing</td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Receive Bookings</td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Basic Analytics</td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="bg-yellow-50">
                  <td className="py-4 px-4 text-gray-700 font-semibold">Verified Badge</td>
                  <td className="text-center py-4 px-4"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-yellow-600 mx-auto" /></td>
                </tr>
                <tr className="bg-yellow-50">
                  <td className="py-4 px-4 text-gray-700 font-semibold">Best Times Analytics</td>
                  <td className="text-center py-4 px-4"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-yellow-600 mx-auto" /></td>
                </tr>
                <tr className="bg-yellow-50">
                  <td className="py-4 px-4 text-gray-700 font-semibold">Customer Support Chat</td>
                  <td className="text-center py-4 px-4"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-yellow-600 mx-auto" /></td>
                </tr>
                <tr className="bg-yellow-50">
                  <td className="py-4 px-4 text-gray-700 font-semibold">Discount Badges (5-20%)</td>
                  <td className="text-center py-4 px-4"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-yellow-600 mx-auto" /></td>
                </tr>
                <tr className="bg-yellow-50">
                  <td className="py-4 px-4 text-gray-700 font-semibold">Priority Search Placement</td>
                  <td className="text-center py-4 px-4"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-yellow-600 mx-auto" /></td>
                </tr>
                <tr className="bg-yellow-50">
                  <td className="py-4 px-4 text-gray-700 font-semibold">Profile Optimization Support</td>
                  <td className="text-center py-4 px-4"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-yellow-600 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-gray-900 mb-2">What's the commission structure?</h4>
              <p className="text-sm text-gray-700">
                <strong>Free tier:</strong> We take 25% commission on each booking, you keep 75%. 
                <strong className="ml-2">Premium tier (Rp 200k/month):</strong> 0% commission - you keep 100% of all earnings! 
                Plus you get the verified badge displayed on your profile image. Premium members typically earn back the membership fee after just 1-2 bookings.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">How does billing work?</h3>
              <p className="text-gray-600">
                Monthly subscriptions are billed every 30 days. Annual subscriptions are billed once per year and save you Rp 400,000 (2 months free).
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600">
                Yes! You can cancel your Premium subscription anytime. You'll continue to have access until the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept bank transfers, credit/debit cards, and mobile payments (GoPay, OVO, Dana).
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">How long does it take to get verified badge?</h3>
              <p className="text-gray-600">
                After upgrading to Premium, our team will review your profile within 24-48 hours. Once approved, the verified badge will appear automatically on all your listings.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">What's included in customer support?</h3>
              <p className="text-gray-600">
                Premium members get direct chat access to our support team for help with profile optimization, technical issues, booking management, and general platform questions. Response time is typically within 2 hours during business hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipPage;
