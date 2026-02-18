/**
 * Post-Stripe payment success page (Stage 4).
 * Shown after redirect from Stripe Checkout; backend webhook creates partner account.
 * User can proceed to create account / login and access dashboard.
 */

import React from 'react';

interface MembershipSuccessPageProps {
  onNavigateToSignup?: () => void;
  onNavigateToLogin?: () => void;
  onBack?: () => void;
}

export const MembershipSuccessPage: React.FC<MembershipSuccessPageProps> = ({
  onNavigateToSignup,
  onNavigateToLogin,
  onBack,
}) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col items-center justify-center p-4">
    <div className="max-w-md w-full rounded-2xl bg-gray-800/60 border border-gray-700 p-8 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
        <span className="text-4xl">✓</span>
      </div>
      <h1 className="text-2xl font-bold text-white">Payment successful</h1>
      <p className="text-gray-400">
        Your subscription is active. Create your partner account to access the dashboard, booking tools, and income reports.
      </p>
      <div className="flex flex-col gap-3 pt-4">
        {onNavigateToSignup && (
          <button
            type="button"
            onClick={onNavigateToSignup}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-lg"
          >
            Create account
          </button>
        )}
        {onNavigateToLogin && (
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="w-full py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-medium"
          >
            I already have an account — Log in
          </button>
        )}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-gray-400 hover:text-gray-300"
          >
            Back to home
          </button>
        )}
      </div>
    </div>
  </div>
);

export default MembershipSuccessPage;
