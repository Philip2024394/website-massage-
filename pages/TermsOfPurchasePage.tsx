import React from 'react';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import FlagIcon from '../components/FlagIcon';

type Props = {
  onBack: () => void;
};

const TermsOfPurchasePage: React.FC<Props> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-orange-600">Terms Of Purchase</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-32">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 space-y-4">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Important Notice</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Please read these terms carefully before contacting sellers or making any purchases through the Indastreet platform.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Platform Purpose</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              Indastreet is strictly a directory platform designed to connect buyers and sellers. We provide a space for users to discover products and contact sellers directly. Indastreet does not facilitate, process, or manage any transactions between buyers and sellers.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Disclaimer of Responsibility</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p className="leading-relaxed">
                <strong>Indastreet holds no responsibility regarding:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                <li>Any seller or buyer on the Indastreet platform</li>
                <li>The quality, authenticity, or legality of products listed</li>
                <li>The accuracy of product descriptions or seller information</li>
                <li>Any communication, agreements, or transactions between users</li>
                <li>Payment processing, delivery, or fulfillment of orders</li>
                <li>Disputes arising from transactions or interactions on the platform</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Safe Trade Guidelines</h3>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
              <p className="text-orange-900 font-semibold mb-1 text-sm">⚠️ Important Safety Notice</p>
              <p className="text-orange-800 leading-relaxed text-sm">
                Indastreet has clearly stated safe trade options for sellers and buyers. Trading outside of these recommended payment gateways can and will implement unsafe trading practices.
              </p>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed mb-2">
              <strong>We strongly recommend using only verified payment providers such as:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-sm text-gray-700">
              <li>Stripe</li>
              <li>PayPal</li>
              <li>Escrow services</li>
              <li>Bank transfers with proper documentation</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Disputes and Legal Issues</h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-2">
              Indastreet does not get involved in any disputes or legal issues that arise from the Indastreet marketplace. All transactions, agreements, and disputes are solely between the buyer and seller.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              Users are responsible for conducting their own due diligence, verifying seller credentials, and ensuring secure payment methods before completing any transaction.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Platform Monitoring</h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-2">
              While Indastreet has implemented advanced monitoring systems to maintain platform integrity, we cannot ensure at all times that sellers with wrong intent will not arise, as with any online platform.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-blue-900 font-semibold mb-1 text-sm">📢 Report Issues</p>
              <p className="text-blue-800 leading-relaxed text-sm">
                If you encounter suspicious activity, fraudulent sellers, or any violations, please report them immediately through our Customer Service page. We will investigate all reported cases promptly and take appropriate action.
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Acknowledgment</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              By checking the "I agree to Terms Of Purchase" box and contacting sellers through the Indastreet platform, you acknowledge that you have read, understood, and agree to these terms. You accept full responsibility for your interactions and transactions with sellers.
            </p>
          </section>
        </div>
      </main>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            I Understand - Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsOfPurchasePage;
