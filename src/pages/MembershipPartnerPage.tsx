/**
 * Country-specific Partner Membership page (Become a Partner / Join Now).
 * Stage 1: Country detection + manual override.
 * Stage 2: Stripe (monthly fee) or commission onboarding.
 * Stage 3: Shared benefits messaging.
 * Stage 4: Redirect to account creation / dashboard after payment or signup.
 *
 * Access: Only via "Become a Partner" / "Join Now" link; not linked in main nav.
 */

import React, { useState, useEffect } from 'react';
import {
  getMembershipPricing,
  isMonthlyFeeCountry,
  isCommissionCountry,
  type MonthlyFeePricing,
  type CommissionPricing,
  MEMBERSHIP_COUNTRY_PRICING,
} from '../config/membershipCountryPricing';
import { MEMBERSHIP_BENEFITS, MEMBERSHIP_BENEFITS_DESCRIPTIONS } from '../config/membershipBenefits';
import { createMembershipCheckoutSession, redirectToStripeCheckout } from '../lib/stripeMembershipService';
import { useCityContext } from '../context/CityContext';

const COUNTRY_NAMES: Record<string, string> = {
  GB: 'United Kingdom',
  US: 'United States',
  AU: 'Australia',
  DE: 'Germany',
  ID: 'Indonesia',
  VN: 'Vietnam',
  MY: 'Malaysia',
  SG: 'Singapore',
  PH: 'Philippines',
  TH: 'Thailand',
};

interface MembershipPartnerPageProps {
  /** Initial country code from URL or context */
  initialCountryCode?: string;
  /** Called when user chooses "Join with commission" — navigate to signup/onboarding */
  onJoinCommission?: (countryCode: string) => void;
  /** Called when user chooses monthly subscription — after Stripe redirect we land on success URL; backend creates account */
  onBack?: () => void;
}

function getInitialCountryFromUrl(): string {
  if (typeof window === 'undefined') return '';
  const hash = window.location.hash || '';
  const match = hash.match(/[?&]country=([A-Za-z]{2})/);
  return match ? match[1].toUpperCase() : '';
}

export const MembershipPartnerPage: React.FC<MembershipPartnerPageProps> = ({
  initialCountryCode = '',
  onJoinCommission,
  onBack,
}) => {
  const { countryCode: contextCountry } = useCityContext();
  const fromUrl = getInitialCountryFromUrl();
  const [countryCode, setCountryCode] = useState<string>(
    () => initialCountryCode || fromUrl || contextCountry || 'DE'
  );
  // Sync from context when user lands without URL override
  useEffect(() => {
    if (!fromUrl && !initialCountryCode && contextCountry && MEMBERSHIP_COUNTRY_PRICING[contextCountry]) {
      setCountryCode(contextCountry);
    }
  }, [contextCountry, fromUrl, initialCountryCode]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');

  const pricing = getMembershipPricing(countryCode);
  const isMonthlyFee = pricing && isMonthlyFeeCountry(countryCode);
  const isCommission = pricing && isCommissionCountry(countryCode);
  const monthlyPricing = isMonthlyFee ? (pricing as MonthlyFeePricing) : null;
  const commissionPricing = isCommission ? (pricing as CommissionPricing) : null;

  // Fallback if no pricing for detected country
  useEffect(() => {
    if (!pricing && countryCode && !MEMBERSHIP_COUNTRY_PRICING[countryCode]) {
      setCountryCode('DE');
    }
  }, [countryCode, pricing]);

  const handleStripeCheckout = async () => {
    if (!monthlyPricing || monthlyPricing.type !== 'monthly_fee') return;
    setLoading(true);
    setError(null);
    try {
      // Stripe expects amount in smallest unit (cents for USD/EUR/GBP, cents for AUD)
      const amount =
        billingInterval === 'year' && monthlyPricing.yearlyAmount != null
          ? Math.round(monthlyPricing.yearlyAmount * 100)
          : Math.round(monthlyPricing.monthlyAmount * 100);
      const successUrl = `${window.location.origin}/#/membership-success?country=${countryCode}`;
      const cancelUrl = `${window.location.origin}/#/membership-partner?country=${countryCode}`;
      const { url } = await createMembershipCheckoutSession({
        countryCode,
        currency: monthlyPricing.currency,
        interval: billingInterval,
        amount,
        successUrl,
        cancelUrl,
        firstMonthFree: monthlyPricing.firstMonthFree,
      });
      redirectToStripeCheckout(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Payment setup failed. Please try again.');
      setLoading(false);
    }
  };

  const handleJoinCommission = () => {
    onJoinCommission?.(countryCode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-700/50 bg-black/20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Become a Partner</h1>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="text-sm text-orange-400 hover:text-orange-300"
            >
              Back
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Country selector */}
        <section className="rounded-2xl bg-gray-800/60 border border-gray-700 p-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Your country</label>
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="w-full rounded-xl bg-gray-700 border border-gray-600 text-white px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            {Object.keys(MEMBERSHIP_COUNTRY_PRICING).map((code) => (
              <option key={code} value={code}>
                {COUNTRY_NAMES[code] || code}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-gray-400">
            Pricing and payment options depend on your country.
          </p>
        </section>

        {/* Pricing card */}
        <section className="rounded-2xl bg-gray-800/60 border border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-4">
            <h2 className="text-lg font-bold text-white">Partner membership</h2>
            <p className="text-orange-100 text-sm">{COUNTRY_NAMES[countryCode] || countryCode}</p>
          </div>
          <div className="p-6 space-y-6">
            {monthlyPricing && (
              <>
                {monthlyPricing.firstMonthFree && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-400/50 text-green-300 text-sm font-semibold">
                    First month free — then {monthlyPricing.monthlyFormatted}/month
                  </div>
                )}
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-4xl font-bold text-white">
                    {monthlyPricing.monthlyFormatted}
                  </span>
                  <span className="text-gray-400">/month</span>
                  {monthlyPricing.yearlyFormatted && (
                    <span className="text-gray-400">
                      or {monthlyPricing.yearlyFormatted}/year
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBillingInterval('month')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      billingInterval === 'month'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingInterval('year')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      billingInterval === 'year'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Yearly
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleStripeCheckout}
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-lg disabled:opacity-50"
                >
                  {loading ? 'Redirecting to payment…' : monthlyPricing.firstMonthFree ? 'Start free trial — Subscribe with Stripe' : 'Subscribe with Stripe'}
                </button>
              </>
            )}

            {commissionPricing && (
              <>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-4xl font-bold text-white">
                    {commissionPricing.commissionPercent}%
                  </span>
                  <span className="text-gray-400">commission per booking</span>
                </div>
                <p className="text-gray-300 text-sm">
                  No monthly fee. You pay only when you earn from bookings.
                </p>
                {commissionPricing.optionalMonthlyFee && (
                  <p className="text-gray-400 text-sm">
                    Optional: {commissionPricing.optionalMonthlyFee.monthlyFormatted}/month for 0%
                    commission (contact us to switch).
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleJoinCommission}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-lg"
                >
                  Join with 30% commission
                </button>
              </>
            )}

            {error && (
              <div className="rounded-lg bg-red-900/30 border border-red-500/50 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}
          </div>
        </section>

        {/* Benefits */}
        <section className="rounded-2xl bg-gray-800/60 border border-gray-700 p-6">
          <h3 className="text-lg font-bold text-white mb-4">What you get</h3>
          <ul className="space-y-3">
            {MEMBERSHIP_BENEFITS.map((benefit) => (
              <li key={benefit} className="flex gap-3">
                <span className="text-orange-400 mt-0.5">✓</span>
                <div>
                  <span className="font-medium text-white">{benefit}</span>
                  {MEMBERSHIP_BENEFITS_DESCRIPTIONS[benefit] && (
                    <p className="text-sm text-gray-400 mt-0.5">
                      {MEMBERSHIP_BENEFITS_DESCRIPTIONS[benefit]}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
};

export default MembershipPartnerPage;
