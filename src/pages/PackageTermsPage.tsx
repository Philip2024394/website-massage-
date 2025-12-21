import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';

type Plan = 'pro' | 'plus';

const PackageTermsPage: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const plan = (params.get('plan') as Plan) || 'pro';
  const isPro = plan === 'pro';

  const handleAccept = () => {
    // Store the acceptance in localStorage and navigate back to signup
    const acceptedTerms = JSON.parse(localStorage.getItem('acceptedTerms') || '{}');
    acceptedTerms[plan] = true;
    localStorage.setItem('acceptedTerms', JSON.stringify(acceptedTerms));
    localStorage.setItem('membership_terms_accepted', 'true');
    localStorage.setItem('membership_terms_date', new Date().toISOString());
    
    // Navigate back to the previous page (likely the signup form)
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold">
                <span className="text-black">Inda</span>
                <span className="text-orange-500">Street</span>
              </h1>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-black hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              Home
            </button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-sm text-gray-500 mb-2">
            {isPro ? 'Pro Plan' : 'Plus Plan'}
            <span className="mx-2">•</span>
            <span className="text-orange-500 font-medium">{isPro ? 'Pay Per Lead' : '0% Commission'}</span>
          </p>
          <h1 className="text-4xl font-light text-black mb-3">Terms &amp; Conditions</h1>
          <p className="text-gray-500 text-lg max-w-md mx-auto">
            {isPro 
              ? 'Pro membership connects you to IndaStreet customers. Earn 70% of every confirmed booking.'
              : 'Plus membership gives you full control. Fixed monthly fee, keep 100% of bookings, premium placement.'
            }
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm mb-32">
          {isPro ? <ProTerms /> : <PlusTerms />}
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <p className="text-xs text-gray-500 hidden sm:block">
            By accepting, you agree to these terms
          </p>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 sm:flex-none px-6 py-3 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 sm:flex-none px-8 py-3 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
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
  <div className="space-y-8">
    {/* Critical Notice */}
    <section className="py-6 border-b border-gray-100">
      <p className="text-red-600 font-semibold text-sm mb-3">⚠ Critical Compliance Notice</p>
      <p className="text-gray-700 text-sm leading-relaxed">
        Violating platform rules results in immediate termination with no refund. Keep all communications, 
        bookings, and payments inside the platform.
      </p>
    </section>

    {/* Commission */}
    <section className="py-6 border-b border-gray-100">
      <h2 className="font-semibold text-gray-900 text-base mb-4">Commission Framework</h2>
      <ul className="space-y-3 text-sm text-gray-700">
        <li className="flex items-start gap-3">
          <span className="text-orange-500 mt-0.5">•</span>
          <span>30% processing fee per completed booking — pay within 3 hours of receiving each lead</span>
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

    {/* Included Features */}
    <section className="py-6 border-b border-gray-100">
      <h2 className="font-semibold text-gray-900 text-base mb-4">Included Features</h2>
      <ul className="space-y-3 text-sm text-gray-700">
        <li className="flex items-start gap-3">
          <span className="text-orange-500 mt-0.5">✓</span>
          <span>Full profile with photos, services, chat, and booking</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-orange-500 mt-0.5">✓</span>
          <span>Price menu slider displayed on your card (also included in Plus)</span>
        </li>
      </ul>
    </section>

    {/* Platform Rules */}
    <section className="py-6 border-b border-gray-100">
      <p className="text-red-600 font-semibold text-sm mb-4">Platform Exclusivity Rules</p>
      <p className="text-gray-700 text-sm mb-4">The following actions are strictly prohibited:</p>
      <ul className="space-y-3 text-sm text-gray-700">
        <li className="flex items-start gap-3">
          <span className="text-red-500 mt-0.5 font-bold">✕</span>
          <span>Sharing personal WhatsApp, phone, or social media with platform customers</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-red-500 mt-0.5 font-bold">✕</span>
          <span>Accepting cash or direct transfers outside IndaStreet payment flow</span>
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
    <section className="py-6 border-b border-gray-100">
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
    <section className="py-6 border-b border-gray-100">
      <h2 className="font-semibold text-gray-900 text-base mb-3">Support</h2>
      <p className="text-gray-700 text-sm">
        Email-based assistance with up to 72-hour response window. Plus members are prioritized.
      </p>
    </section>

    {/* Account Changes */}
    <section className="py-6 border-b border-gray-100">
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
    <section className="py-6">
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
  <div className="space-y-8">
    {/* Core Inclusions */}
    <section className="py-6 border-b border-gray-100">
      <h2 className="font-semibold text-gray-900 text-base mb-4">Core Inclusions</h2>
      <ul className="space-y-3 text-sm text-gray-700">
        <li className="flex items-start gap-3">
          <span className="text-orange-500 mt-0.5">✓</span>
          <span>Rp 250,000/month with <span className="text-orange-600 font-medium">0% commission</span> on every booking</span>
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
          <span className="text-orange-700 font-medium">Add your full price menu slider with unlimited services</span>
        </li>
      </ul>
    </section>

    {/* Payment Schedule */}
    <section className="py-6 border-b border-gray-100">
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
    <section className="py-6 border-b border-gray-100">
      <h2 className="font-semibold text-gray-900 text-base mb-3">Growth Tools</h2>
      <p className="text-gray-700 text-sm">
        Campaign banners, promo codes, featured placements. Track every click, booking, and customer source.
      </p>
    </section>

    {/* Priority Support */}
    <section className="py-6 border-b border-gray-100">
      <h2 className="font-semibold text-gray-900 text-base mb-3">Priority Support</h2>
      <p className="text-gray-700 text-sm">
        Dedicated email support with priority routing and faster response times.
      </p>
    </section>

    {/* Account Readiness */}
    <section className="py-6 border-b border-gray-100">
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
    <section className="py-6">
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
