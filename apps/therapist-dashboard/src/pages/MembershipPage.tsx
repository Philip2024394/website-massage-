// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React from 'react';
import { Crown, Check, X, Star } from 'lucide-react';

interface MembershipPageProps {
  therapist: any;
  onBack: () => void;
}

const MembershipPage: React.FC<MembershipPageProps> = ({ therapist, onBack }) => {
  const currentTier = therapist?.membershipTier || 'free'; // free, plus
  const plusExpiresAt = therapist?.plusExpiresAt ? new Date(therapist.plusExpiresAt) : null;
  const subscriptionMonth = therapist?.subscriptionMonth || 1;

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
        {currentTier === 'plus' && plusExpiresAt && (
          <div className="mb-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Plus Member - Month {subscriptionMonth}</h2>
                  <p className="text-purple-100">
                    0% Commission · Next billing: {formatExpiryDate(plusExpiresAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleUpgrade('monthly')}
                className="px-6 py-3 bg-white text-purple-600 font-bold rounded-xl hover:shadow-lg transition-all"
              >
                Manage Plan
              </button>
            </div>
          </div>
        )}

        {/* Pricing Info */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Choose Your Growth Path</h2>
          <p className="text-gray-600">Select the plan that matches your business goals</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-5xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Free</h3>
              <div className="text-5xl font-bold text-gray-800 mb-2">
                Rp 0
              </div>
              <p className="text-gray-600">Forever</p>
              <div className="mt-3 text-center">
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">
                  25% per booking
                </span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm">Basic profile listing</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm">Receive bookings</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm">Basic earnings tracker</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm">Basic chat window</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm">View booking history</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm">Basic notifications</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">No verified badge</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">No analytics</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">No calendar</span>
              </li>
            </ul>

            <button
              disabled={currentTier === 'free'}
              className="w-full py-4 bg-gray-100 text-gray-800 font-bold rounded-xl border-2 border-gray-300 cursor-not-allowed"
            >
              {currentTier === 'free' ? 'Current Plan' : 'Downgrade'}
            </button>
          </div>

          {/* Plus Plan */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl shadow-2xl border-4 border-purple-500 p-8 relative transform scale-105">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-full shadow-lg flex items-center gap-2">
                <Star className="w-5 h-5" />
                <span>BEST VALUE</span>
              </div>
            </div>

            <div className="text-center mb-6 mt-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown className="w-8 h-8 text-purple-600" />
                <h3 className="text-2xl font-bold text-gray-800">Plus</h3>
              </div>
              <div className="space-y-2 mb-3">
                <div className="text-lg text-gray-600">
                  <span className="font-bold text-green-600">Month 1: FREE</span>
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <div>Month 2: Rp 100k</div>
                  <div>Month 3: Rp 135k</div>
                  <div>Month 4: Rp 175k</div>
                  <div className="font-semibold">Month 5+: Rp 200k</div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 mb-6">
              <p className="text-lg text-green-900 font-bold text-center">🎉 0% COMMISSION</p>
              <p className="text-sm text-green-800 text-center mt-1">Keep 100% of your earnings!</p>
              <p className="text-xs text-green-700 text-center mt-2">Save 25% commission on every booking</p>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-gray-800 font-semibold">Everything in Free, plus:</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm">Gold verified badge</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm">Advanced analytics dashboard</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm">Best times to work insights</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm">Customer demographics</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm">Booking patterns & trends</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm">Revenue forecasting</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm">Priority search placement (top 3)</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm">Smart calendar with optimization</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm">Custom discount campaigns</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm">Featured profile badge</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm">Profile optimization support</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm">Multi-location management</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm">Review management tools</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm">Automated customer reminders</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm">Monthly performance reports</span>
              </li>
            </ul>

            <button
              onClick={() => handleUpgrade('monthly')}
              disabled={currentTier === 'plus'}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentTier === 'plus' ? 'Current Plan' : 'Upgrade to Plus - Start FREE'}
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
                  <th className="text-center py-4 px-4 font-semibold text-purple-600">Plus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="bg-purple-50">
                  <td className="py-4 px-4 font-semibold text-gray-900">Monthly Cost</td>
                  <td className="text-center py-4 px-4">
                    <span className="text-green-600 font-bold text-lg">Rp 0</span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="text-purple-600 font-bold text-sm">FREE → 100k → 135k → 175k → 200k</span>
                  </td>
                </tr>
                <tr className="bg-yellow-50">
                  <td className="py-4 px-4 font-semibold text-gray-900">Commission Rate</td>
                  <td className="text-center py-4 px-4">
                    <span className="text-orange-600 font-bold text-lg">25%</span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="text-green-600 font-bold text-lg">0% 🎉</span>
                  </td>
                </tr>
                <tr className="bg-green-50">
                  <td className="py-4 px-4 text-gray-700">Your Earnings (per Rp 150k booking)</td>
                  <td className="text-center py-4 px-4">
                    <span className="font-semibold text-gray-900">Rp 112,500</span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="font-semibold text-green-600 text-lg">Rp 150,000</span>
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
                <tr className="bg-purple-50">
                  <td className="py-4 px-4 text-gray-700 font-semibold">Verified Badge</td>
                  <td className="text-center py-4 px-4"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-purple-600 mx-auto" /></td>
                </tr>
                <tr className="bg-purple-50">
                  <td className="py-4 px-4 text-gray-700 font-semibold">Advanced Analytics</td>
                  <td className="text-center py-4 px-4"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-purple-600 mx-auto" /></td>
                </tr>
                <tr className="bg-purple-50">
                  <td className="py-4 px-4 text-gray-700 font-semibold">Smart Calendar</td>
                  <td className="text-center py-4 px-4"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-purple-600 mx-auto" /></td>
                </tr>
                <tr className="bg-purple-50">
                  <td className="py-4 px-4 text-gray-700 font-semibold">Discount Campaigns</td>
                  <td className="text-center py-4 px-4"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-purple-600 mx-auto" /></td>
                </tr>
                <tr className="bg-purple-50">
                  <td className="py-4 px-4 text-gray-700 font-semibold">Priority Search (Top 3)</td>
                  <td className="text-center py-4 px-4"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-purple-600 mx-auto" /></td>
                </tr>
                <tr className="bg-purple-50">
                  <td className="py-4 px-4 text-gray-700 font-semibold">Profile Optimization</td>
                  <td className="text-center py-4 px-4"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-purple-600 mx-auto" /></td>
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
                <strong className="ml-2">Plus tier:</strong> 0% commission - you keep 100% of all earnings! 
                Month 1 is FREE, then Rp 100k (month 2), Rp 135k (month 3), Rp 175k (month 4), and Rp 200k from month 5 onwards.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">How does Plus billing work?</h3>
              <p className="text-gray-600">
                Plus tier has escalating monthly pricing: your first month is completely FREE to try all premium features. Month 2 is Rp 100k, month 3 is Rp 135k, month 4 is Rp 175k, and from month 5 onwards it's Rp 200k per month.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600">
                Yes! You can cancel your Plus subscription anytime. You'll continue to have access until the end of your billing period.
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
                After upgrading to Plus, the gold verified badge will appear automatically on your profile.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">Is Plus worth it?</h3>
              <p className="text-gray-600">
                Yes! With 0% commission, you save 25% on every booking. If you get just 2-3 bookings per month (at Rp 150k each), you'll save more than the subscription cost. Plus you get all premium features like analytics, priority placement, and profile optimization.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipPage;
