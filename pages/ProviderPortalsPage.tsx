import React from 'react';
import { User, Building, Sparkles, ArrowLeft } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">I</span>
              </div>
              <h1 className="text-xl font-bold">
                <span className="text-gray-800">Inda</span>
                <span className="text-orange-500">Street</span>
              </h1>
            </div>
            <div className="w-20" /> {/* Spacer for alignment */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
