import React from 'react';
import { X } from 'lucide-react';

interface MembershipTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  planType: 'pro' | 'plus';
}

const MembershipTermsModal: React.FC<MembershipTermsModalProps> = ({ 
  isOpen, 
  onClose, 
  onAccept,
  planType 
}) => {
  if (!isOpen) return null;

  const isPro = planType === 'pro';

  const proContent = (
    <div className="space-y-6">
      {/* Hero Text */}
      <div className="text-center pb-6 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Know Before You Grow</h3>
        <p className="text-gray-600 text-sm max-w-lg mx-auto">
          Pro membership connects you to IndaStreet customers. Earn 70% of every confirmed booking.
        </p>
      </div>

      {/* Critical Notice - Red standout */}
      <div className="py-4 border-b border-gray-100">
        <p className="text-red-600 font-semibold text-sm mb-2">⚠ Critical Compliance Notice</p>
        <p className="text-gray-700 text-sm leading-relaxed">
          Violating platform rules results in immediate termination with no refund. Keep all communications, 
          bookings, and payments inside the platform.
        </p>
      </div>

      {/* Commission */}
      <div className="py-4 border-b border-gray-100">
        <p className="font-semibold text-gray-900 text-sm mb-3">Commission Framework</p>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">•</span>
            <span>30% processing fee per completed booking — pay within 3 hours of receiving each lead</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">•</span>
            <span>Late or missing payments trigger instant account freeze</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">•</span>
            <span>Consistent late payments lead to permanent removal</span>
          </li>
        </ul>
      </div>

      {/* Platform Rules - Red highlight */}
      <div className="py-4 border-b border-gray-100">
        <p className="text-red-600 font-semibold text-sm mb-3">Platform Exclusivity Rules</p>
        <p className="text-gray-700 text-sm mb-3">The following actions are strictly prohibited:</p>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-0.5">✕</span>
            <span>Sharing personal WhatsApp, phone, or social media with platform customers</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-0.5">✕</span>
            <span>Accepting cash or direct transfers outside IndaStreet payment flow</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-0.5">✕</span>
            <span>Encouraging customers to rebook privately or promise better prices off-platform</span>
          </li>
        </ul>
        <p className="text-red-600 text-xs font-medium mt-3">
          Off-platform activity leads to instant termination and blacklisting.
        </p>
      </div>

      {/* Payment Timing */}
      <div className="py-4 border-b border-gray-100">
        <p className="font-semibold text-gray-900 text-sm mb-3">Payment Timing</p>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">•</span>
            <span>Confirm commission payment within 3 hours of lead notification</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">•</span>
            <span>Have funds ready before appointments — frozen accounts cannot accept bookings</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">•</span>
            <span>Keep payment receipts for audits</span>
          </li>
        </ul>
      </div>

      {/* Support */}
      <div className="py-4 border-b border-gray-100">
        <p className="font-semibold text-gray-900 text-sm mb-2">Support</p>
        <p className="text-gray-700 text-sm">
          Email-based assistance with up to 72-hour response window. Plus members are prioritized.
        </p>
      </div>

      {/* Account Changes */}
      <div className="py-4 border-b border-gray-100">
        <p className="font-semibold text-gray-900 text-sm mb-3">Account &amp; Plan Changes</p>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">•</span>
            <span>Clear all debts before activating or upgrading</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">•</span>
            <span>Accounts under investigation cannot change tiers</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">•</span>
            <span>Changes take effect next billing cycle</span>
          </li>
        </ul>
      </div>

      {/* Summary */}
      <div className="pt-2">
        <p className="font-semibold text-gray-900 text-sm mb-3">Pro Membership Summary</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-gray-600">Monthly Fee</div>
          <div className="text-gray-900 font-medium">Rp 0</div>
          <div className="text-gray-600">Commission</div>
          <div className="text-orange-600 font-medium">30% per booking</div>
          <div className="text-gray-600">Payment Window</div>
          <div className="text-gray-900 font-medium">3 hours</div>
          <div className="text-gray-600">Support SLA</div>
          <div className="text-gray-900 font-medium">72 hours</div>
        </div>
      </div>
    </div>
  );

  const plusContent = (
    <div className="space-y-6">
      {/* Hero Text */}
      <div className="text-center pb-6 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Know Before You Grow</h3>
        <p className="text-gray-600 text-sm max-w-lg mx-auto">
          Plus membership gives you full control. Fixed monthly fee, keep 100% of bookings, premium placement.
        </p>
      </div>

      {/* Core Inclusions */}
      <div className="py-4 border-b border-gray-100">
        <p className="font-semibold text-gray-900 text-sm mb-3">Core Inclusions</p>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">✓</span>
            <span>Rp 250,000/month with <span className="text-orange-600 font-medium">0% commission</span> on every booking</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">✓</span>
            <span>Verified badge and premium search placement</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">✓</span>
            <span>Advanced analytics and shareable profile links</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">✓</span>
            <span>Priority customer support</span>
          </li>
        </ul>
      </div>

      {/* Payment Schedule */}
      <div className="py-4 border-b border-gray-100">
        <p className="font-semibold text-gray-900 text-sm mb-3">Payment Schedule</p>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">•</span>
            <span>Minimum 5-month commitment. Due on the 1st, grace until the 5th</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">•</span>
            <span>6th–10th: Rp 25,000 late fee applies</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-0.5">•</span>
            <span className="text-red-600">After 10th: Account shifts to pay-per-lead (Rp 50,000/lead)</span>
          </li>
        </ul>
      </div>

      {/* Growth Tools */}
      <div className="py-4 border-b border-gray-100">
        <p className="font-semibold text-gray-900 text-sm mb-2">Growth Tools</p>
        <p className="text-gray-700 text-sm">
          Campaign banners, promo codes, featured placements. Track every click, booking, and customer source.
        </p>
      </div>

      {/* Priority Support */}
      <div className="py-4 border-b border-gray-100">
        <p className="font-semibold text-gray-900 text-sm mb-2">Priority Support</p>
        <p className="text-gray-700 text-sm">
          Dedicated email support with priority routing and faster response times.
        </p>
      </div>

      {/* Account Readiness */}
      <div className="py-4 border-b border-gray-100">
        <p className="font-semibold text-gray-900 text-sm mb-3">Account Readiness</p>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">•</span>
            <span>Clear all outstanding invoices before activating</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">•</span>
            <span>Maintain healthy compliance record</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">•</span>
            <span>Complete profile with services, pricing, and photos</span>
          </li>
        </ul>
      </div>

      {/* Summary */}
      <div className="pt-2">
        <p className="font-semibold text-gray-900 text-sm mb-3">Plus Membership Summary</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-gray-600">Monthly Fee</div>
          <div className="text-gray-900 font-medium">Rp 250,000</div>
          <div className="text-gray-600">Commission</div>
          <div className="text-orange-600 font-medium">0% — Keep 100%</div>
          <div className="text-gray-600">Commitment</div>
          <div className="text-gray-900 font-medium">5 months minimum</div>
          <div className="text-gray-600">Support</div>
          <div className="text-gray-900 font-medium">Priority</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header - Minimal */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Terms &amp; Conditions</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {isPro ? 'Pro Plan' : 'Plus Plan'}
                <span className="mx-2 text-gray-300">•</span>
                <span className="text-orange-600 font-medium">{isPro ? 'Pay Per Lead' : '0% Commission'}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          {isPro ? proContent : plusContent}
        </div>

        {/* Footer - Minimal */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-gray-500">
              By accepting, you agree to these terms
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onAccept}
                className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                I Accept
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipTermsModal;
