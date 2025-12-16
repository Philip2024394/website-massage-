import React, { useRef, useState, useEffect } from 'react';
import { User, Building, Sparkles, Home, Star, FileText } from 'lucide-react';

interface ProviderPortalsPageProps {
  onBack: () => void;
  onNavigate?: (page: string) => void;
  t?: any; // translations
  language?: 'en' | 'id';
}

const ProviderPortalsPage: React.FC<ProviderPortalsPageProps> = ({ onBack, onNavigate, t, language = 'en' }) => {
  const [selectedPackage, setSelectedPackage] = useState<'pro' | 'plus' | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState<{ pro: boolean; plus: boolean }>({ pro: false, plus: false });
  const portalsRef = useRef<HTMLDivElement | null>(null);

  // Translation helper
  const getText = (key: string, fallback: string) => {
    return t?.membership?.[key] || fallback;
  };

  // Load accepted terms from localStorage on mount
  useEffect(() => {
    const storedTerms = localStorage.getItem('acceptedTerms');
    if (storedTerms) {
      try {
        const parsed = JSON.parse(storedTerms);
        setAcceptedTerms(prev => ({
          pro: parsed.pro || prev.pro,
          plus: parsed.plus || prev.plus
        }));
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  const portals = [
    {
      title: getText('therapistPortal', 'Therapist Portal'),
      description: getText('therapistPortalDesc', 'For independent massage therapists'),
      icon: User,
      image: 'https://ik.imagekit.io/7grri5v7d/image%201.png',
      color: 'from-orange-500 to-amber-500',
      hoverColor: 'hover:from-orange-600 hover:to-amber-600',
      page: 'therapistLogin',
      features: [getText('manageBookings', 'Manage bookings'), getText('setYourRates', 'Set your rates'), getText('trackEarnings', 'Track earnings')]
    },
    {
      title: getText('massagePlacePortal', 'Massage Place Portal'),
      description: getText('massagePlacePortalDesc', 'For massage spas and wellness centers'),
      icon: Building,
      image: 'https://ik.imagekit.io/7grri5v7d/image%202.png',
      color: 'from-green-500 to-emerald-500',
      hoverColor: 'hover:from-green-600 hover:to-emerald-600',
      page: 'massagePlaceLogin',
      features: [getText('manageYourSpa', 'Manage your spa'), getText('multipleTherapists', 'Multiple therapists'), getText('businessAnalytics', 'Business analytics')]
    },
    {
      title: getText('facialPlacePortal', 'Facial Place Portal'),
      description: getText('facialPlacePortalDesc', 'For facial spas and beauty centers'),
      icon: Sparkles,
      image: 'https://ik.imagekit.io/7grri5v7d/image%203.png',
      color: 'from-pink-500 to-rose-500',
      hoverColor: 'hover:from-pink-600 hover:to-rose-600',
      page: 'facialPortal',
      features: [getText('facialServices', 'Facial services'), getText('beautyTreatments', 'Beauty treatments'), getText('spaManagement', 'Spa management')]
    }
  ];

  const handlePortalClick = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  const handleTermsCheckbox = (plan: 'pro' | 'plus', checked: boolean) => {
    if (checked) {
      // Navigate to full page terms
      localStorage.setItem('pendingTermsPlan', plan);
      onNavigate?.('packageTerms');
    } else {
      setAcceptedTerms((prev) => ({ ...prev, [plan]: false }));
      // Clear from localStorage too
      const storedTerms = localStorage.getItem('acceptedTerms');
      if (storedTerms) {
        try {
          const parsed = JSON.parse(storedTerms);
          parsed[plan] = false;
          localStorage.setItem('acceptedTerms', JSON.stringify(parsed));
        } catch (e) {}
      }
    }
  };

  const handleSelectPlan = (plan: 'pro' | 'plus') => {
    if (!acceptedTerms[plan]) {
      return;
    }
    setSelectedPackage(plan);
    requestAnimationFrame(() => {
      if (portalsRef.current) {
        portalsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }
    });
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
        {/* Packages */}
        <div className="mb-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              <span className="text-gray-800">{language === 'id' ? 'Pilih ' : 'Choose Your '}</span>
              <span className="text-orange-500">{language === 'id' ? 'Keanggotaan' : 'Membership'}</span>
            </h2>
            <p className="text-lg text-gray-600">{getText('simplePricing', 'Simple pricing. Start earning today.')}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Pro Package */}
            <div className="relative rounded-3xl bg-white border-2 border-gray-200 p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="absolute -top-4 left-8">
                <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-md">{getText('payPerLead', 'Pay Per Lead')}</span>
              </div>
              <div className="mt-2 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-bold text-gray-900">{getText('proTitle', 'Pro')}</h3>
                  <div className="flex gap-0.5">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-gray-300 text-gray-300" />
                    <Star className="w-4 h-4 fill-gray-300 text-gray-300" />
                  </div>
                </div>
                <p className="text-sm text-gray-600">{getText('proDescription', 'Great for starting out. Only pay when you get bookings')}</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold text-gray-900">{getText('proMonthlyFee', 'Rp 0')}</span>
                  <span className="text-lg text-gray-500">{getText('perMonth', '/month')}</span>
                </div>
                <div className="mt-2 inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg text-sm font-semibold border border-orange-200">
                  <span>+</span>
                  <span className="text-xl font-bold">{getText('commissionRate', '30%')}</span>
                  <span>{getText('commissionPerBooking', 'commission per booking')}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  <span><strong className="font-semibold text-gray-900">{getText('zeroUpfrontCost', 'Zero upfront cost')}</strong> - {getText('startImmediately', 'Start immediately')}</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  <span><strong className="font-semibold text-gray-900">{getText('payOnlyOnSuccess', 'Pay only on success')}</strong> - 30% {getText('perBooking', 'per booking')}</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  <span>{getText('fullProfileWithPhotos', 'Full profile with photos & services')}</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  <span>{getText('customerChatBooking', 'Customer chat & booking system')}</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  <span>{getText('leadGenerationIncluded', 'Lead generation included')}</span>
                </li>
              </ul>
              <div className="space-y-3">
                <div className="p-4 bg-orange-100 border-2 border-orange-400 rounded-xl shadow-sm">
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptedTerms.pro}
                      onChange={(e) => handleTermsCheckbox('pro', e.target.checked)}
                      className="mt-1 w-5 h-5 text-orange-600 border-2 border-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                    />
                    <span className="ml-3 text-sm text-gray-900">
                      {getText('agreeToTerms', 'I agree to the')}{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          localStorage.setItem('pendingTermsPlan', 'pro');
                          onNavigate?.('packageTerms');
                        }}
                        className="text-orange-700 font-bold underline inline-flex items-center gap-1 hover:text-orange-800"
                        title={getText('termsAndConditions', 'Terms & Conditions')}
                      >
                        <FileText className="w-4 h-4" />
                        {getText('termsAndConditions', 'Terms & Conditions')}
                      </button>
                    </span>
                  </label>
                  {!acceptedTerms.pro && (
                    <p className="mt-2 text-xs text-orange-700 font-semibold flex items-center gap-1">
                      <span>⚠️</span>
                      {getText('acceptTermsWarning', 'Accept the terms before selecting this plan.')}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleSelectPlan('pro')}
                  disabled={!acceptedTerms.pro}
                  className={`w-full font-bold py-4 px-6 rounded-xl transition-colors shadow-md hover:shadow-lg ${
                    !acceptedTerms.pro
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
                  }`}
                >
                  {getText('selectProPlan', 'Select Pro Plan')}
                </button>
                <div className="text-center">
                  <p className="text-xs text-gray-500">{getText('perfectFor', 'Perfect for:')}</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    <span className="px-3 py-1 rounded-full text-xs bg-orange-50 text-orange-600 border border-orange-200 font-medium">{getText('independentTherapists', 'Independent Therapists')}</span>
                    <span className="px-3 py-1 rounded-full text-xs bg-orange-50 text-orange-600 border border-orange-200 font-medium">{getText('startingOut', 'Starting Out')}</span>
                    <span className="px-3 py-1 rounded-full text-xs bg-gray-800 text-orange-400 border border-gray-700 font-medium">{getText('lowRisk', 'Low Risk')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Plus Package */}
            <div className="relative rounded-3xl bg-white border-2 border-gray-200 p-8 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="absolute -top-4 left-8">
                <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-md">{getText('mostPopular', 'Most Popular')}</span>
              </div>
              <div className="mt-2 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-bold text-gray-900">{getText('plusTitle', 'Plus')}</h3>
                  <div className="flex gap-0.5">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  </div>
                </div>
                <p className="text-sm text-gray-600">{getText('plusDescription', 'All-in premium membership. Keep 100% of bookings')}</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold text-gray-900">{getText('plusMonthlyFee', 'Rp 250K')}</span>
                  <span className="text-lg text-gray-500">{getText('perMonth', '/month')}</span>
                </div>
                <div className="mt-2 inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg text-sm font-semibold border border-orange-200">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  <span>{getText('zeroCommission', '0% Commission - Keep Everything')}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  <span><strong className="font-semibold text-gray-900">{getText('zeroCommissionKeep', 'Zero commission')}</strong> - {getText('keep100Percent', 'Keep 100% of earnings')}</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  <span><strong className="font-semibold text-gray-900">{getText('verifiedBadge', 'Verified badge')}</strong> {getText('onYourProfile', 'on your profile')}</span>
                </li>
                <li className="flex items-start gap-3 text-orange-700">
                  <svg className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  <span><strong className="font-semibold">{getText('priorityHotelVilla', 'Priority Hotel, Villa & Private Spa')}</strong> {getText('serviceRequests', 'service requests')}</span>
                </li>
                <li className="flex items-start gap-3 text-orange-700">
                  <svg className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  <span><strong className="font-semibold">{getText('fullPriceMenu', 'Full price menu')}</strong> {getText('displayedOnCard', 'displayed on your card')}</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  <span><strong className="font-semibold text-gray-900">{getText('liveDiscount', 'Live discount')}</strong> {getText('promotionsSystem', 'promotions system')}</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  <span>{getText('unlimitedLeads', 'Unlimited leads & advanced analytics')}</span>
                </li>
              </ul>
              <div className="space-y-3">
                <div className="p-4 bg-orange-100 border-2 border-orange-400 rounded-xl shadow-sm">
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptedTerms.plus}
                      onChange={(e) => handleTermsCheckbox('plus', e.target.checked)}
                      className="mt-1 w-5 h-5 text-orange-600 border-2 border-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                    />
                    <span className="ml-3 text-sm text-gray-900">
                      {getText('agreeToTerms', 'I agree to the')}{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          localStorage.setItem('pendingTermsPlan', 'plus');
                          onNavigate?.('packageTerms');
                        }}
                        className="text-orange-700 font-bold underline inline-flex items-center gap-1 hover:text-orange-800"
                        title={getText('termsAndConditions', 'Terms & Conditions')}
                      >
                        <FileText className="w-4 h-4" />
                        {getText('termsAndConditions', 'Terms & Conditions')}
                      </button>
                    </span>
                  </label>
                  {!acceptedTerms.plus && (
                    <p className="mt-2 text-xs text-orange-700 font-semibold flex items-center gap-1">
                      <span>⚠️</span>
                      {getText('acceptTermsWarning', 'Accept the terms before selecting this plan.')}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleSelectPlan('plus')}
                  disabled={!acceptedTerms.plus}
                  className={`w-full font-bold py-4 px-6 rounded-xl transition-colors shadow-md hover:shadow-lg ${
                    !acceptedTerms.plus
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
                  }`}
                >
                  {getText('selectPlusPlan', 'Select Plus Plan')}
                </button>
                <div className="text-center">
                  <p className="text-xs text-gray-500">{getText('perfectFor', 'Perfect for:')}</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    <span className="px-3 py-1 rounded-full text-xs bg-orange-50 text-orange-600 border border-orange-200 font-medium">{getText('spasAndClinics', 'Spas & Clinics')}</span>
                    <span className="px-3 py-1 rounded-full text-xs bg-orange-50 text-orange-600 border border-orange-200 font-medium">{getText('highVolume', 'High Volume')}</span>
                    <span className="px-3 py-1 rounded-full text-xs bg-orange-50 text-orange-600 border border-orange-200 font-medium">{getText('maximumEarnings', 'Maximum Earnings')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Portal selection */}
        {selectedPackage && (
          <div ref={portalsRef} className="mb-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                <span className="text-gray-800">{language === 'id' ? 'Pilih ' : 'Choose Your '}</span>
                <span className="text-orange-500">{language === 'id' ? 'Jenis Bisnis' : 'Business Type'}</span>
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                {getText('selectedPlan', 'Selected')}: <span className="font-bold text-orange-600">{selectedPackage === 'pro' ? getText('proPlan', 'Pro Plan') + ' (0% ' + getText('perMonth', '/month').replace('/', '') + ' + 30% ' + getText('commissionPerBooking', 'commission') + ')' : getText('plusPlan', 'Plus Plan') + ' (Rp 250K' + getText('perMonth', '/month') + ' + 0% ' + getText('commissionPerBooking', 'commission') + ')'}</span>
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {portals.map((portal, index) => {
                return (
                  <button
                    key={index}
                    onClick={() => {
                      localStorage.setItem('selectedPackage', selectedPackage || '');
                      localStorage.setItem('packageDetails', JSON.stringify({
                        plan: selectedPackage,
                        selectedAt: new Date().toISOString()
                      }));
                      handlePortalClick(portal.page);
                    }}
                    className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-orange-400 transform hover:scale-105"
                  >
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      <img 
                        src={portal.image} 
                        alt={portal.title}
                        className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                        style={{ objectPosition: 'center top' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <h3 className="text-2xl font-bold mb-1">
                          {portal.title}
                        </h3>
                        <p className="text-white/90 text-sm">
                          {portal.description}
                        </p>
                      </div>
                    </div>

                    <div className="p-6">
                      <ul className="space-y-3 mb-6">
                        {portal.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-3 text-gray-700">
                            <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${portal.color}`} />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="py-2 px-4 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold text-sm shadow-md group-hover:shadow-lg transition-shadow">
                        {getText('continueToRegistration', 'Continue to Registration')}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-16 pb-8 relative">
        <div className="relative flex items-center justify-center h-24">
          <img 
            src="https://ik.imagekit.io/7grri5v7d/water_drop-removebg-preview.png" 
            alt="Water drop"
            className="absolute right-4 md:right-12 h-20 w-auto opacity-80"
          />
          <p className="text-center text-sm text-gray-500 z-10">{getText('copyright', '© 2026 IndaStreet. All rights reserved.')}</p>
        </div>
      </div>
    </div>
  );
};

export default ProviderPortalsPage;
