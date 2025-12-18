// MOVED FROM: apps\therapist-dashboard\src\pages\MembershipPage.tsx
// REASON: Package selection now happens on main site during signup flow, not in therapist dashboard
// DATE: December 18, 2025

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
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Banner */}
      {currentTier === 'plus' && plusExpiresAt && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5" />
              <span className="font-medium">Plus Member</span>
              <span className="text-green-100">•</span>
              <span className="text-green-100">Expires on {formatExpiryDate(plusExpiresAt)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Plus member renewal notice */}
        {currentTier === 'plus' && (
          <div className="mb-8 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-8 text-white shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <Crown className="w-12 h-12 text-yellow-300" />
              <div>
                <h2 className="text-3xl font-bold mb-2">Plus Member Renewal</h2>
                <p className="text-purple-100 text-lg">Your subscription expires on {plusExpiresAt ? formatExpiryDate(plusExpiresAt) : 'Unknown'}</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-4">Current Benefits</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-300" />
                    <span className="text-lg">Zero commission fees</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-300" />
                    <span className="text-lg">Verified badge</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-300" />
                    <span className="text-lg">Priority placement</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-300" />
                    <span className="text-lg">Hotel & Villa requests</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <button 
                  onClick={() => handleUpgrade('monthly')}
                  className="w-full bg-white text-purple-700 font-bold py-4 rounded-xl hover:bg-purple-50 transition-colors shadow-lg"
                >
                  Renew Monthly - Rp 200,000
                </button>
                <button 
                  onClick={() => handleUpgrade('annual')}
                  className="w-full bg-yellow-400 text-gray-900 font-bold py-4 rounded-xl hover:bg-yellow-300 transition-colors shadow-lg"
                >
                  Renew Annual - Rp 2,000,000
                  <span className="block text-sm font-medium opacity-90">Save 16% with annual</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Show upgrade options for free members */}
        {currentTier !== 'plus' && (
          <div className="mb-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Star className="w-4 h-4" />
                Free Member
              </div>
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
                  <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-bold mb-4">
                    <BadgePercent className="w-3 h-3" />
                    PAY PER LEAD
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-2">Pro</h3>
                  <p className="text-gray-600 mb-6">Perfect for starting therapists</p>
                  
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-gray-900">Rp 0</span>
                    <span className="text-xl text-gray-500">/month</span>
                  </div>
                  
                  <div className="bg-orange-50 rounded-lg p-4 mb-6">
                    <p className="text-sm text-orange-800 font-medium">+ 30% commission per booking</p>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Zero upfront cost</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Start earning immediately</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Full profile & booking system</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Standard listing placement</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-400">Verified badge</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-400">Hotel & Villa priority</span>
                  </li>
                </ul>

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
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold">
                    MOST POPULAR
                  </div>
                </div>

                {selected === 'monthly' && (
                  <div className="absolute -top-3 -right-3">
                    <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold mb-4">
                    <Crown className="w-3 h-3" />
                    PREMIUM
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-2">Plus</h3>
                  <p className="text-gray-600 mb-6">For serious professionals</p>
                  
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-gray-900">Rp 200K</span>
                    <span className="text-xl text-gray-500">/month</span>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4 mb-6">
                    <p className="text-sm text-green-800 font-bold">0% Commission - Keep Everything!</p>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">Zero commission</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">Verified badge</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Priority Hotel, Villa & Private Spa</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Full price menu displayed</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Top listing placement</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Advanced analytics</span>
                  </li>
                </ul>

                <button
                  type="button"
                  onClick={() => setSelected('monthly')}
                  className={`w-full py-4 rounded-xl font-semibold text-base transition-all duration-200 ${
                    selected === 'monthly'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  {selected === 'monthly' ? '✓ Selected' : 'Select Plan'}
                </button>
              </div>
            </div>

            {/* Continue Button */}
            {selected && (
              <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {selected === 'monthly' ? 'Plus Plan' : 'Pro Plan'} Selected
                    </h3>
                    <p className="text-gray-600">
                      {selected === 'monthly' ? 'Rp 200,000/month · 0% commission' : 'Rp 0/month · 30% commission per booking'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <input
                    id="terms-agreement"
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="w-5 h-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                  />
                  <label htmlFor="terms-agreement" className="text-sm text-gray-700">
                    I agree to the{' '}
                    <button className="text-orange-600 hover:underline font-medium">
                      terms and conditions
                    </button>
                  </label>
                </div>

                <button
                  onClick={onContinue}
                  disabled={!agree}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform ${
                    agree
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg hover:shadow-xl hover:scale-105'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Continue to Profile Setup
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MembershipPage;