import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, Home } from 'lucide-react';

type Plan = 'pro' | 'plus';

interface PackageTermsPageProps {
  onBack: () => void;
  onNavigate?: (page: string) => void;
  onAcceptTerms?: (plan: Plan) => void;
  t?: any; // translations
  language?: 'en' | 'id';
}

const PackageTermsPage: React.FC<PackageTermsPageProps> = ({ onBack, onNavigate, onAcceptTerms, t, language = 'en' }) => {
  // Read plan immediately from localStorage to avoid flash of wrong content
  const getInitialPlan = (): Plan => {
    if (typeof window !== 'undefined') {
      const pendingPlan = localStorage.getItem('pendingTermsPlan') as Plan;
      if (pendingPlan === 'pro' || pendingPlan === 'plus') {
        return pendingPlan;
      }
    }
    return 'pro';
  };

  const [plan, setPlan] = useState<Plan>(getInitialPlan);
  const isPro = plan === 'pro';

  // Translation helper
  const getText = (key: string, fallback: string) => {
    return t?.packageTerms?.[key] || fallback;
  };

  useEffect(() => {
    // Re-check plan from localStorage on mount (handles any async updates)
    const pendingPlan = localStorage.getItem('pendingTermsPlan') as Plan;
    if (pendingPlan === 'pro' || pendingPlan === 'plus') {
      setPlan(pendingPlan);
    }
  }, []);

  const handleAccept = () => {
    // Store acceptance in localStorage
    const acceptedTerms = JSON.parse(localStorage.getItem('acceptedTerms') || '{}');
    acceptedTerms[plan] = true;
    localStorage.setItem('acceptedTerms', JSON.stringify(acceptedTerms));
    
    // Clear pending plan
    localStorage.removeItem('pendingTermsPlan');
    
    // Call callback if provided
    if (onAcceptTerms) {
      onAcceptTerms(plan);
    }
    
    // Navigate back to join page
    onNavigate?.('joinIndastreet');
  };

  const handleCancel = () => {
    localStorage.removeItem('pendingTermsPlan');
    onNavigate?.('joinIndastreet');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Global Header */}
      <header className="bg-white shadow-md sticky top-0 z-[9997] w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <button 
              onClick={handleCancel} 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:inline">Back</span>
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              <span className="text-black">Inda</span>
              <span className="text-orange-500">Street</span>
            </h1>
            <button
              onClick={onBack}
              className="hover:bg-orange-50 rounded-full transition-colors text-gray-600 flex-shrink-0 min-w-[44px] min-h-[44px] w-10 h-10 flex items-center justify-center"
              title="Back to Home"
            >
              <Home className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-8 pb-6 text-center">
        <p className="text-sm text-gray-500 mb-2">
          {isPro ? 'Pro Plan' : 'Plus Plan'}
          <span className="mx-2">•</span>
          <span className="text-orange-600 font-medium">{isPro ? 'Pay Per Lead' : '0% Commission'}</span>
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Terms &amp; Conditions</h1>
        <p className="text-gray-600 text-sm max-w-md mx-auto">
          {isPro 
            ? 'Pro membership connects you to IndaStreet customers. Earn 70% of every confirmed booking.'
            : 'Plus membership gives you full control. Fixed monthly fee, keep 100% of bookings, premium placement.'
          }
        </p>
      </div>

      {/* Content */}
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        {isPro ? <ProTerms /> : <PlusTerms />}
      </main>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-[9998]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500 text-center sm:text-left">
            By accepting, you agree to these terms
          </p>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={handleCancel}
              className="flex-1 sm:flex-none px-6 py-3 text-sm text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 sm:flex-none px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium rounded-lg hover:from-orange-600 hover:to-orange-700 transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              I Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProTerms: React.FC = () => (
  <div className="space-y-6">
    {/* Critical Notice */}
    <section className="py-5 border-b border-gray-100">
      <p className="text-red-600 font-semibold text-sm mb-3">⚠ Critical Compliance Notice</p>
      <p className="text-gray-700 text-sm leading-relaxed">
        Violating platform rules results in immediate termination with no refund. Keep all communications 
        and bookings through the platform. Note: Payments are made directly between customer and provider — 
        IndaStreet does not process payments.
      </p>
    </section>

    {/* Commission */}
    <section className="py-5 border-b border-gray-100">
      <h2 className="font-semibold text-gray-900 text-base mb-4">Commission Framework</h2>
      <ul className="space-y-3 text-sm text-gray-700">
        <li className="flex items-start gap-3">
          <span className="text-orange-500 mt-0.5">•</span>
          <span>30% commission fee per completed booking — pay within 3 hours of receiving each lead</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-orange-500 mt-0.5">•</span>
          <span>Customer pays you directly — IndaStreet does not handle or process any payments</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-orange-500 mt-0.5">•</span>
          <span>Late or missing payments trigger instant account freeze</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-orange-500 mt-0.5">•</span>
          <span>Consistent late payments lead to permanent removal</span>
        </li>
      </ul>
    </section>

    {/* Platform Rules */}
    <section className="py-5 border-b border-gray-100">
      <p className="text-red-600 font-semibold text-sm mb-4">Platform Exclusivity Rules</p>
      <p className="text-gray-700 text-sm mb-4">The following actions are strictly prohibited:</p>
      <ul className="space-y-3 text-sm text-gray-700">
        <li className="flex items-start gap-3">
          <span className="text-red-500 mt-0.5 font-bold">✕</span>
          <span>Sharing personal WhatsApp, phone, or social media with platform customers</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-red-500 mt-0.5 font-bold">✕</span>
          <span>Accepting bookings from IndaStreet customers outside the platform to avoid commission</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-red-500 mt-0.5 font-bold">✕</span>
          <span>Encouraging customers to rebook privately or promise better prices off-platform</span>
        </li>
      </ul>
      <p className="text-red-600 text-xs font-medium mt-4">
        Off-platform activity leads to instant termination and blacklisting.
      </p>
    </section>

    {/* Payment Timing */}
    <section className="py-5 border-b border-gray-100">
      <h2 className="font-semibold text-gray-900 text-base mb-4">Payment Timing</h2>
      <ul className="space-y-3 text-sm text-gray-700">
        <li className="flex items-start gap-3">
          <span className="text-orange-500 mt-0.5">•</span>
          <span>Confirm commission payment within 3 hours of lead notification</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-orange-500 mt-0.5">•</span>
          <span>Have funds ready before appointments — frozen accounts cannot accept bookings</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-orange-500 mt-0.5">•</span>
          <span>Keep payment receipts for audits</span>
        </li>
      </ul>
    </section>

    {/* Support */}
    <section className="py-5 border-b border-gray-100">
      <h2 className="font-semibold text-gray-900 text-base mb-3">Support</h2>
      <p className="text-gray-700 text-sm">
        Email-based assistance with up to 72-hour response window. Plus members are prioritized.
      </p>
    </section>

    {/* Account Changes */}
    <section className="py-5 border-b border-gray-100">
      <h2 className="font-semibold text-gray-900 text-base mb-4">Account &amp; Plan Changes</h2>
      <ul className="space-y-3 text-sm text-gray-700">
        <li className="flex items-start gap-3">
          <span className="text-orange-500 mt-0.5">•</span>
          <span>Clear all debts before activating or upgrading</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-orange-500 mt-0.5">•</span>
          <span>Accounts under investigation cannot change tiers</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-orange-500 mt-0.5">•</span>
          <span>Changes take effect next billing cycle</span>
        </li>
      </ul>
    </section>

    {/* Summary */}
    <section className="py-5">
      <h2 className="font-semibold text-gray-900 text-base mb-4">Pro Membership Summary</h2>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="text-gray-500">Monthly Fee</div>
        <div className="text-gray-900 font-medium">Rp 0</div>
        <div className="text-gray-500">Commission</div>
        <div className="text-orange-600 font-medium">30% per booking</div>
        <div className="text-gray-500">Payment Window</div>
        <div className="text-gray-900 font-medium">3 hours</div>
        <div className="text-gray-500">Support SLA</div>
        <div className="text-gray-900 font-medium">72 hours</div>
      </div>
    </section>
  </div>
);

const PlusTerms: React.FC = () => (
  <div className="space-y-6">
    {/* Core Inclusions */}
    <section className="py-5 border-b border-gray-100">
      <h2 className="font-semibold text-gray-900 text-base mb-4">Core Inclusions</h2>
      <ul className="space-y-3 text-sm text-gray-700">
        <li className="flex items-start gap-3">
          <span className="text-orange-500 mt-0.5">✓</span>
          <span>Rp 250,000/month with <span className="text-orange-600 font-medium">0% commission</span> on every booking</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-orange-500 mt-0.5">✓</span>
          <span>Customer pays you directly — IndaStreet does not handle or process any payments</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-orange-500 mt-0.5">✓</span>
          <span>Verified badge and premium search placement</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-orange-500 mt-0.5">✓</span>
          <span>Advanced analytics and shareable profile links</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-orange-500 mt-0.5">✓</span>
          <span>Priority customer support</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-orange-600 mt-0.5 font-bold">★</span>
          <span className="text-orange-700 font-medium">Priority access to Hotels, Villas &amp; Private Spa Resort service requests</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-orange-600 mt-0.5 font-bold">★</span>
          <span className="text-orange-700 font-medium">Add your full price menu with unlimited services</span>
        </li>
      </ul>
    </section>

    {/* Payment Schedule */}
    <section className="py-5 border-b border-gray-100">
      <h2 className="font-semibold text-gray-900 text-base mb-4">Payment Schedule</h2>
      <ul className="space-y-3 text-sm text-gray-700">
        <li className="flex items-start gap-3">
          <span className="text-orange-500 mt-0.5">•</span>
          <span>No contract commitment</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-orange-500 mt-0.5">•</span>
          <span>Due on the 1st, grace period until the 5th</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-orange-500 mt-0.5">•</span>
          <span>Rp 25,000 late fee applies (administration)</span>
        </li>
      </ul>
    </section>

    {/* Growth Tools */}
    <section className="py-5 border-b border-gray-100">
      <h2 className="font-semibold text-gray-900 text-base mb-3">Growth Tools</h2>
      <p className="text-gray-700 text-sm">
        Campaign banners, promo codes, featured placements. Track every click, booking, and customer source.
      </p>
    </section>

    {/* Priority Support */}
    <section className="py-5 border-b border-gray-100">
      <h2 className="font-semibold text-gray-900 text-base mb-3">Priority Support</h2>
      <p className="text-gray-700 text-sm">
        Dedicated email support with priority routing and faster response times.
      </p>
    </section>

    {/* Account Readiness */}
    <section className="py-5 border-b border-gray-100">
      <h2 className="font-semibold text-gray-900 text-base mb-4">Account Readiness</h2>
      <ul className="space-y-3 text-sm text-gray-700">
        <li className="flex items-start gap-3">
          <span className="text-orange-500 mt-0.5">•</span>
          <span>Clear all outstanding invoices before activating</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-orange-500 mt-0.5">•</span>
          <span>Maintain healthy compliance record</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-orange-500 mt-0.5">•</span>
          <span>Complete profile with services, pricing, and photos</span>
        </li>
      </ul>
    </section>

    {/* Summary */}
    <section className="py-5">
      <h2 className="font-semibold text-gray-900 text-base mb-4">Plus Membership Summary</h2>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="text-gray-500">Monthly Fee</div>
        <div className="text-gray-900 font-medium">Rp 250,000</div>
        <div className="text-gray-500">Commission</div>
        <div className="text-orange-600 font-medium">0% — Keep 100%</div>
        <div className="text-gray-500">Commitment</div>
        <div className="text-gray-900 font-medium">No contract</div>
        <div className="text-gray-500">Late Fee</div>
        <div className="text-gray-900 font-medium">Rp 25,000</div>
        <div className="text-gray-500">Priority</div>
        <div className="text-orange-600 font-medium">Hotels, Villas, Spas</div>
      </div>
    </section>
  </div>
);

export default PackageTermsPage;
