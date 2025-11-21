import React, { useState } from 'react';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import CountryAppDrawer from '../components/CountryAppDrawer';

type Props = {
  onBack: () => void;
  onNavigate?: (page: string) => void;
};

const SafeTradeInfoPage: React.FC<Props> = ({ onBack, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white pb-24">
      <header className="bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg sticky top-0 z-50">
        <div className="px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <button 
              type="button" 
              onClick={onBack}
              className="p-2 sm:p-2.5 hover:bg-orange-500/50 rounded-full transition-colors flex-shrink-0" 
              aria-label="Go back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate">Indastreet Safe Trade</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <button 
              type="button" 
              onClick={() => setIsMenuOpen(true)} 
              title="Menu" 
              className="p-2.5 sm:p-3 hover:bg-orange-50 rounded-full transition-all duration-300 text-orange-500 border-2 border-transparent hover:border-orange-200 shadow-md hover:shadow-lg"
            >
              <BurgerMenuIcon className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
          </div>
        </div>
      </header>

      <CountryAppDrawer 
        countryCode={(() => { try { const raw = localStorage.getItem('app_user_location'); if (raw) return JSON.parse(raw).countryCode; } catch {} return undefined; })()}
        isOpen={isMenuOpen} 
        isHome={true} 
        onClose={() => setIsMenuOpen(false)} 
        onNavigate={onNavigate || (() => {})}
      />

      <main className="max-w-4xl mx-auto p-4 sm:p-6 pb-24">
        <div className="relative bg-white rounded-lg shadow-xl p-6 sm:p-8 overflow-hidden">
          {/* Animated neon border spark effect */}
          <div className="absolute inset-0 rounded-lg pointer-events-none">
            <div className="absolute inset-0 rounded-lg animate-border-spark" 
                 style={{
                   background: 'linear-gradient(90deg, transparent, transparent, rgba(59, 130, 246, 0.6), transparent, transparent)',
                   backgroundSize: '200% 100%',
                   animation: 'border-spark 3s linear infinite',
                   WebkitMaskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                   WebkitMaskComposite: 'xor',
                   maskComposite: 'exclude',
                   padding: '2px'
                 }}>
            </div>
          </div>
          
          <div className="relative z-10 space-y-6 text-gray-700 leading-relaxed">
            <div className="text-center mb-8">
              <img 
                src="https://ik.imagekit.io/7grri5v7d/payment.png" 
                alt="Payment Security" 
                className="w-24 h-24 mx-auto mb-4 object-contain"
              />
              <p className="font-semibold text-xl text-gray-900">Protect Your Transaction with Trusted Payment Providers</p>
            </div>
            
            <p className="text-base">
              When you use payment methods such as <strong>PayPal</strong>, <strong>Escrow</strong>, <strong>Bank Transfer</strong>, or <strong>Stripe</strong>, 
              you gain access to buyer protection services that safeguard your purchase.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 sm:p-6">
              <h3 className="font-semibold text-blue-900 mb-3 text-lg">Buyer Protection Coverage:</h3>
              <ul className="list-disc list-inside space-y-2 text-blue-900">
                <li>Full refund if the item does not match the seller's description</li>
                <li>Protection if the product fails to meet the buyer agreement contract</li>
                <li>Dispute resolution support through your payment provider</li>
                <li>Money-back guarantee within the return timeframe stated on the product page</li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5 sm:p-6">
              <h3 className="font-semibold text-yellow-900 mb-3 text-lg">Important Notice:</h3>
              <ul className="list-disc list-inside space-y-2 text-yellow-900">
                <li>Delivery delays or extended shipping times are not covered by buyer protection claims</li>
                <li>Claims must be based on product quality or contract violations, not delivery timeframes</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 sm:p-6">
              <p className="text-sm text-gray-600 italic">
                <strong className="text-gray-900">Indastreet's Role:</strong> Indastreet does not participate in any transaction process or provide transaction advice to sellers or buyers. 
                We provide this information to help you make informed decisions about your trading agreements and to prevent fraudulent or misleading sales activity.
              </p>
            </div>
            
            <div className="text-center pt-4">
              <p className="font-semibold text-lg text-gray-900">
                Safe trading creates positive outcomes for everyone in the Indastreet community. Choose trusted payment methods for peace of mind.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SafeTradeInfoPage;
