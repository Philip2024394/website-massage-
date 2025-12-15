import React from 'react';
import { User, Building, Sparkles, Home } from 'lucide-react';

interface ProviderPortalsPageProps {
  onBack: () => void;
  onNavigate?: (page: string) => void;
}

const ProviderPortalsPage: React.FC<ProviderPortalsPageProps> = ({ onBack, onNavigate }) => {
  const portals = [
    {
      title: 'Therapist Portal',
      description: 'For independent massage therapists',
      icon: User,
      color: 'from-orange-500 to-amber-500',
      hoverColor: 'hover:from-orange-600 hover:to-amber-600',
      page: 'therapistLogin',
      features: ['Manage bookings', 'Set your rates', 'Track earnings']
    },
    {
      title: 'Massage Place Portal',
      description: 'For massage spas and wellness centers',
      icon: Building,
      color: 'from-green-500 to-emerald-500',
      hoverColor: 'hover:from-green-600 hover:to-emerald-600',
      page: 'massagePlaceLogin',
      features: ['Manage your spa', 'Multiple therapists', 'Business analytics']
    },
    {
      title: 'Facial Place Portal',
      description: 'For facial spas and beauty centers',
      icon: Sparkles,
      color: 'from-pink-500 to-rose-500',
      hoverColor: 'hover:from-pink-600 hover:to-rose-600',
      page: 'facialPortal',
      features: ['Facial services', 'Beauty treatments', 'Spa management']
    }
  ];

  const handlePortalClick = (page: string) => {
    console.log('🎯 ProviderPortalsPage: handlePortalClick called with:', page);
    if (onNavigate) {
      console.log('🎯 ProviderPortalsPage: Calling onNavigate with:', page);
      onNavigate(page);
    } else {
      console.error('❌ ProviderPortalsPage: onNavigate is undefined!');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-[9997] w-full max-w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex-shrink-0">
              <span className="text-black">Inda</span>
              <span className="text-orange-500">Street</span>
            </h1>
            <div className="flex items-center gap-2 sm:gap-3 text-gray-600 flex-shrink-0">
              <button
                onClick={onBack}
                className="hover:bg-orange-50 rounded-full transition-colors text-gray-600 flex-shrink-0 min-w-[44px] min-h-[44px] w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center"
                title="Back to Home"
              >
                <Home className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Plans row (minimalistic, no hero image) */}
        <div className="mb-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              <span className="text-gray-800">Choose Your </span>
              <span className="text-orange-500">Membership</span>
            </h2>
            <p className="text-lg text-gray-600">Simple pricing. Start earning today.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Pro Package - Pay per Lead */}
            <div className="relative rounded-3xl bg-white border-2 border-gray-200 p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="absolute -top-4 left-8">
                <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-md">Pay Per Lead</span>
              </div>
              <div className="mt-2 mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
                <p className="text-sm text-gray-600">Great for starting out. Only pay when you get bookings</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold text-gray-900">Rp 0</span>
                  <span className="text-lg text-gray-500">/month</span>
                </div>
                <div className="mt-2 inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg text-sm font-semibold border border-orange-200">
                  <span>+</span>
                  <span className="text-xl font-bold">30%</span>
                  <span>commission per booking</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  <span><strong className="font-semibold text-gray-900">Zero upfront cost</strong> - Start immediately</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  <span><strong className="font-semibold text-gray-900">Pay only on success</strong> - 30% per booking</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  <span>Full profile with photos & services</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  <span>Customer chat & booking system</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  <span>Lead generation included</span>
                </li>
              </ul>
              <div className="space-y-3">
                <button onClick={() => window.location.assign('/packages?plan=pro')} className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-md hover:shadow-lg">
                  View Full Details
                </button>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Perfect for:</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    <span className="px-3 py-1 rounded-full text-xs bg-orange-50 text-orange-600 border border-orange-200 font-medium">Independent Therapists</span>
                    <span className="px-3 py-1 rounded-full text-xs bg-orange-50 text-orange-600 border border-orange-200 font-medium">Starting Out</span>
                    <span className="px-3 py-1 rounded-full text-xs bg-gray-800 text-orange-400 border border-gray-700 font-medium">Low Risk</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Plus Package - All-Inclusive */}
            <div className="relative rounded-3xl bg-white border-2 border-gray-200 p-8 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="absolute -top-4 left-8">
                <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-md">Most Popular</span>
              </div>
              <div className="mt-2 mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Plus</h3>
                <p className="text-sm text-gray-600">All-in premium membership. Keep 100% of bookings</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold text-gray-900">Rp 250K</span>
                  <span className="text-lg text-gray-500">/month</span>
                </div>
                <div className="mt-2 inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg text-sm font-semibold border border-orange-200">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  <span>0% Commission - Keep Everything</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  <span><strong className="font-semibold text-gray-900">Zero commission</strong> - Keep 100% of earnings</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  <span><strong className="font-semibold text-gray-900">Verified badge</strong> on your profile</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  <span><strong className="font-semibold text-gray-900">Live discount</strong> promotions system</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  <span><strong className="font-semibold text-gray-900">Profile sharing</strong> & social media tools</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  <span><strong className="font-semibold text-gray-900">High priority listing</strong> - Top placement</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  <span>Unlimited leads & advanced analytics</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  <span>Priority customer support</span>
                </li>
              </ul>
              <div className="space-y-3">
                <button onClick={() => window.location.assign('/packages?plan=plus')} className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-md hover:shadow-lg">
                  View Full Details
                </button>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Perfect for:</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    <span className="px-3 py-1 rounded-full text-xs bg-orange-50 text-orange-600 border border-orange-200 font-medium">Spas & Clinics</span>
                    <span className="px-3 py-1 rounded-full text-xs bg-orange-50 text-orange-600 border border-orange-200 font-medium">High Volume</span>
                    <span className="px-3 py-1 rounded-full text-xs bg-orange-50 text-orange-600 border border-orange-200 font-medium">Maximum Earnings</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Portal
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select your business type to access your dashboard and start managing your services
          </p>
        </div>

        {/* Portal Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {portals.map((portal, index) => {
            const Icon = portal.icon;
            return (
              <div
                key={index}
                onClick={() => handlePortalClick(portal.page)}
                className="group cursor-pointer"
              >
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-orange-200">
                  {/* Card Header with Gradient */}
                  <div className={`bg-gradient-to-r ${portal.color} ${portal.hoverColor} p-8 text-white transition-all duration-300`}>
                    <div className="flex justify-center mb-4">
                      <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-10 h-10" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-center mb-2">
                      {portal.title}
                    </h3>
                    <p className="text-white/90 text-center text-sm">
                      {portal.description}
                    </p>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <ul className="space-y-3 mb-6">
                      {portal.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-gray-700">
                          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${portal.color}`} />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handlePortalClick(portal.page)}
                      className={`w-full py-3 px-6 rounded-xl bg-gradient-to-r ${portal.color} ${portal.hoverColor} text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform group-hover:scale-105`}
                    >
                      Go to Login
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-3xl mx-auto border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Not registered yet?
            </h3>
            <p className="text-gray-600 mb-6">
              Join thousands of wellness providers growing their business with IndaStreet
            </p>
            <button
              onClick={() => onNavigate?.('registration-choice')}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300"
            >
              <span>Join IndaStreet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 pb-8 text-center text-sm text-gray-500">
        <p>© 2026 IndaStreet. All rights reserved.</p>
      </div>
    </div>
  );
};

export default ProviderPortalsPage;
