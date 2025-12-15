// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState } from 'react';
import { Crown, Check, X, Star, BadgePercent, Coins, CheckCircle, LogOut } from 'lucide-react';
import { membershipNotificationService } from '../services/membershipNotificationService';
import { therapistService } from '../../../../lib/appwriteService';

interface MembershipPageProps {
  therapist: any;
  onBack: () => void;
  onContinue?: () => void;
  showLogout?: boolean;
  onLogout?: () => void;
}

const MembershipPage: React.FC<MembershipPageProps> = ({ therapist, onBack, onContinue, showLogout = false, onLogout }) => {
  const currentTier = therapist?.membershipTier || 'free'; // free, plus
  const plusExpiresAt = therapist?.plusExpiresAt ? new Date(therapist.plusExpiresAt) : null;
  const subscriptionMonth = therapist?.subscriptionMonth || 1;

  const [selected, setSelected] = useState<'monthly' | 'commission' | null>(null);
  const [agree, setAgree] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 pb-24">
      {/* Header */}
      <div className="w-full bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Membership Plans</h1>
              <p className="text-xs text-gray-500">Choose the plan that fits your needs</p>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-900 hover:bg-gray-100 rounded-lg font-semibold transition-colors"
              title="Log out of account"
            >
              <LogOut className="w-5 h-5" />
              <span>Log Out</span>
            </button>
          )}
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
          {/* Pro (Commission) - Minimalistic Design */}
          <div
            className={`bg-white rounded-2xl shadow-lg border p-10 relative transition-all duration-300 hover:shadow-xl ${
              selected === 'commission' ? 'border-amber-500 shadow-amber-100' : 'border-gray-200'
            }`}
          >
            {selected === 'commission' && (
              <div className="absolute -top-3 -right-3">
                <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                  <Check className="w-6 h-6 text-white" />
                </div>
              </div>
            )}

            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                  <BadgePercent className="w-8 h-8 text-amber-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
              <p className="text-gray-600 text-sm mb-4">For starting out with no commitment</p>
              
              <div className="mb-6">
                <div className="text-5xl font-bold text-gray-900 mb-2">Rp 0</div>
                <div className="text-gray-500 text-sm font-medium">per month</div>
              </div>

              <div className="inline-block bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
                <p className="text-amber-800 font-semibold text-sm">30% commission per booking</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-900 font-medium">No upfront costs</p>
                  <p className="text-gray-500 text-sm">Start earning immediately</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-900 font-medium">Pay only when you earn</p>
                  <p className="text-gray-500 text-sm">You keep 70% of earnings</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-900 font-medium">Cancel anytime</p>
                  <p className="text-gray-500 text-sm">No commitment required</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-900 font-medium">Upgrade when ready</p>
                  <p className="text-gray-500 text-sm">Switch to Plus anytime</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelected('commission')}
              className={`w-full py-4 rounded-xl font-semibold text-base transition-all duration-200 ${
                selected === 'commission'
                  ? 'bg-green-600 text-white shadow-lg hover:bg-green-700'
                  : 'bg-orange-500 text-white shadow-md hover:bg-orange-600'
              }`}
            >
              {selected === 'commission' ? '✓ Selected' : 'Select Plan'}
            </button>
          </div>

          {/* Plus Plan - Minimalistic Premium Design */}
          <div
            className={`bg-white rounded-2xl shadow-lg border p-10 relative transform scale-105 transition-all duration-300 hover:shadow-xl ${
              selected === 'monthly' ? 'border-amber-500 shadow-amber-100' : 'border-gray-200'
            }`}
          >
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
              <div className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-full shadow-lg text-sm">
                BEST VALUE
              </div>
            </div>

            {selected === 'monthly' && (
              <div className="absolute -top-3 -right-3 z-10">
                <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                  <Check className="w-6 h-6 text-white" />
                </div>
              </div>
            )}

            <div className="text-center mb-8 mt-6">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                  <Crown className="w-8 h-8 text-amber-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Plus</h3>
              <p className="text-gray-600 text-sm mb-6">Grow online while keeping 100% profits</p>
              
              <div className="inline-block bg-green-50 border border-green-200 rounded-lg px-4 py-2 mb-6">
                <p className="text-green-800 font-semibold text-sm">0% commission · Keep all earnings</p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                <p className="text-xs text-gray-600 font-semibold mb-3">5-Month Agreement · Progressive Pricing</p>
                <div className="grid grid-cols-5 gap-2 text-xs">
                  <div className="text-center">
                    <div className="text-gray-600 font-medium mb-1">M1</div>
                    <div className="text-lg font-bold text-green-600">FREE</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600 font-medium mb-1">M2</div>
                    <div className="text-sm font-bold text-gray-800">100k</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600 font-medium mb-1">M3</div>
                    <div className="text-sm font-bold text-gray-800">135k</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600 font-medium mb-1">M4</div>
                    <div className="text-sm font-bold text-gray-800">175k</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600 font-medium mb-1">M5</div>
                    <div className="text-sm font-bold text-amber-700">200k</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-900 font-medium">0% commission forever</p>
                  <p className="text-gray-500 text-sm">Keep 100% of all earnings</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-900 font-medium">Gold verified badge</p>
                  <p className="text-gray-500 text-sm">Build trust with customers</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-900 font-medium">Priority search placement</p>
                  <p className="text-gray-500 text-sm">Top 3 in search results</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-900 font-medium">Advanced analytics dashboard</p>
                  <p className="text-gray-500 text-sm">Insights, trends & forecasting</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-900 font-medium">Profile optimization support</p>
                  <p className="text-gray-500 text-sm">Expert help to boost bookings</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-900 font-medium">Smart calendar & reminders</p>
                  <p className="text-gray-500 text-sm">Automated customer management</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelected('monthly')}
              className={`w-full py-4 rounded-xl font-semibold text-base transition-all duration-200 ${
                selected === 'monthly'
                  ? 'bg-green-600 text-white shadow-lg hover:bg-green-700'
                  : 'bg-orange-500 text-white shadow-md hover:bg-orange-600'
              }`}
            >
              {selected === 'monthly' ? '✓ Selected' : 'Select Plan'}
            </button>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-10 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Detailed Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-4 px-6 font-bold text-gray-900 text-base">Feature</th>
                  <th className="text-center py-4 px-6 font-bold text-gray-900 text-base">Pro</th>
                  <th className="text-center py-4 px-6 font-bold text-amber-700 text-base">Plus</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-5 px-6 font-semibold text-gray-900">Monthly Cost</td>
                  <td className="text-center py-5 px-6">
                    <span className="inline-block bg-green-100 text-green-700 font-bold text-base px-3 py-1 rounded-lg">Rp 0</span>
                  </td>
                  <td className="text-center py-5 px-6">
                    <span className="inline-block bg-amber-100 text-amber-700 font-bold text-sm px-3 py-1 rounded-lg">FREE → 100k → 135k → 175k → 200k</span>
                  </td>
                </tr>
                <tr className="border-b border-gray-200 bg-yellow-50 hover:bg-yellow-100">
                  <td className="py-5 px-6 font-semibold text-gray-900">Commission Rate</td>
                  <td className="text-center py-5 px-6">
                    <span className="inline-block bg-red-100 text-red-700 font-bold text-base px-3 py-1 rounded-lg">30%</span>
                  </td>
                  <td className="text-center py-5 px-6">
                    <span className="inline-block bg-green-100 text-green-700 font-bold text-base px-3 py-1 rounded-lg">0% 🎉</span>
                  </td>
                </tr>
                <tr className="border-b border-gray-200 bg-green-50 hover:bg-green-100">
                  <td className="py-5 px-6 text-gray-900 font-semibold">Your Earnings (per Rp 150k booking)</td>
                  <td className="text-center py-5 px-6">
                    <span className="font-bold text-gray-700 text-base">Rp 105,000</span>
                    <div className="text-xs text-gray-500 mt-1">(-30% commission)</div>
                  </td>
                  <td className="text-center py-5 px-6">
                    <span className="font-bold text-green-600 text-lg">Rp 150,000</span>
                    <div className="text-xs text-green-600 mt-1 font-semibold">+Rp 45k saved!</div>
                  </td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-4 px-6 text-gray-700">Profile Listing</td>
                  <td className="text-center py-4 px-6"><Check className="w-6 h-6 text-green-600 mx-auto" /></td>
                  <td className="text-center py-4 px-6"><Check className="w-6 h-6 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-4 px-6 text-gray-700">Receive Bookings</td>
                  <td className="text-center py-4 px-6"><Check className="w-6 h-6 text-green-600 mx-auto" /></td>
                  <td className="text-center py-4 px-6"><Check className="w-6 h-6 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-4 px-6 text-gray-700">Basic Analytics</td>
                  <td className="text-center py-4 px-6"><Check className="w-6 h-6 text-green-600 mx-auto" /></td>
                  <td className="text-center py-4 px-6"><Check className="w-6 h-6 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-200 bg-amber-50 hover:bg-amber-100">
                  <td className="py-4 px-6 text-gray-900 font-semibold">Verified Badge</td>
                  <td className="text-center py-4 px-6"><X className="w-6 h-6 text-red-500 mx-auto" /></td>
                  <td className="text-center py-4 px-6"><Check className="w-6 h-6 text-amber-600 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-200 bg-amber-50 hover:bg-amber-100">
                  <td className="py-4 px-6 text-gray-900 font-semibold">Advanced Analytics</td>
                  <td className="text-center py-4 px-6"><X className="w-6 h-6 text-red-500 mx-auto" /></td>
                  <td className="text-center py-4 px-6"><Check className="w-6 h-6 text-amber-600 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-200 bg-amber-50 hover:bg-amber-100">
                  <td className="py-4 px-6 text-gray-900 font-semibold">Smart Calendar</td>
                  <td className="text-center py-4 px-6"><X className="w-6 h-6 text-red-500 mx-auto" /></td>
                  <td className="text-center py-4 px-6"><Check className="w-6 h-6 text-amber-600 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-200 bg-amber-50 hover:bg-amber-100">
                  <td className="py-4 px-6 text-gray-900 font-semibold">Discount Campaigns</td>
                  <td className="text-center py-4 px-6"><X className="w-6 h-6 text-red-500 mx-auto" /></td>
                  <td className="text-center py-4 px-6"><Check className="w-6 h-6 text-amber-600 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-200 bg-amber-50 hover:bg-amber-100">
                  <td className="py-4 px-6 text-gray-900 font-semibold">Priority Search (Top 3)</td>
                  <td className="text-center py-4 px-6"><X className="w-6 h-6 text-red-500 mx-auto" /></td>
                  <td className="text-center py-4 px-6"><Check className="w-6 h-6 text-amber-600 mx-auto" /></td>
                </tr>
                <tr className="bg-amber-50 hover:bg-amber-100">
                  <td className="py-4 px-6 text-gray-900 font-semibold">Profile Optimization</td>
                  <td className="text-center py-4 px-6"><X className="w-6 h-6 text-red-500 mx-auto" /></td>
                  <td className="text-center py-4 px-6"><Check className="w-6 h-6 text-amber-600 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
      {/* Sticky Terms + Continue */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="flex items-center justify-between text-sm mb-3">
          <label className="flex items-start gap-2">
            <input type="checkbox" checked={agree} onChange={e=>setAgree(e.target.checked)} />
            <span>I agree to the <a className="text-amber-700 underline" href={`/membership-terms?type=therapist&memberId=${encodeURIComponent(therapist?.$id||'')}`}>Membership Terms</a>.</span>
          </label>
          <a href="/membership-faq" className="text-amber-700 underline hover:text-amber-800 whitespace-nowrap ml-4">
            View FAQs
          </a>
        </div>
        <button
          disabled={!selected || !agree}
          className={`w-full py-3 rounded-lg font-semibold ${!selected||!agree ? 'bg-gray-300 text-gray-600' : 'bg-amber-600 text-white'}`}
          onClick={async ()=>{
            if(!selected) return;
            const pkg = selected;
            const now = new Date();
            const updateData: any = {
              membershipType: pkg,
              membershipSelectedAt: now.toISOString(),
              membershipStatus: pkg==='monthly' ? 'trial' : 'active',
            };
            if(pkg==='monthly'){
              const trialEnd = new Date(now.getTime()+30*24*60*60*1000).toISOString();
              updateData.membershipCurrentMonth = 1;
              updateData.membershipTrialEndDate = trialEnd;
              updateData.membershipNextBillingDate = trialEnd;
            }
            try{
              // 1. Update therapist document with membership selection
              await therapistService.update(therapist.$id, updateData);
              
              // 2. Create agreement record in membership_agreements collection
              try {
                const { databases, Query, ID } = await import('appwrite');
                const { appwriteDatabases, APPWRITE_CONFIG } = await import('../../../../lib/appwriteService');
                await appwriteDatabases.createDocument(
                  APPWRITE_CONFIG.databaseId,
                  APPWRITE_CONFIG.collections.membershipAgreements,
                  ID.unique(),
                  {
                    memberId: therapist.$id,
                    memberType: 'therapist',
                    membershipType: pkg,
                    agreedAt: now.toISOString(),
                    agreedToTerms: true,
                    ipAddress: 'N/A',
                    version: '1.0'
                  }
                );
                console.log('✅ Agreement record created');
              } catch (agreementErr) {
                console.warn('⚠️ Failed to create agreement record (non-critical):', agreementErr);
              }
              
              // 3. Notify admin
              await membershipNotificationService.notifyAdminOfMembershipSelection({
                therapistId: therapist.$id,
                therapistName: therapist.name || therapist.email || 'Unknown',
                therapistEmail: therapist.email || 'No email',
                membershipType: pkg,
                selectedAt: updateData.membershipSelectedAt,
                membershipData: updateData,
              });
              
              console.log('✅ Therapist updated successfully');
              console.log('✅ Admin notified of membership selection');
              
              alert(`✅ ${pkg==='monthly'?'Plus':'Pro'} membership selected!\n\nWelcome to ${pkg==='monthly'?'Plus':'Pro'}! Let's set up your profile.`);
              
              // Call onContinue callback if provided (for onboarding flow)
              if (onContinue) {
                onContinue();
              } else {
                // For Plus/Premium (monthly) package, go to dashboard instead of back to package page
                if (pkg === 'monthly') {
                  // Reload the page to refresh user state and show dashboard with Premium access
                  window.location.reload();
                } else {
                  onBack();
                }
              }
            }catch(e){
              console.error('❌ Error updating therapist:', e);
              alert('Failed to save membership selection. Please try again.');
            }
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default MembershipPage;
