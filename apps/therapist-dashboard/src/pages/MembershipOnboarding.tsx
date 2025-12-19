// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState } from 'react';
import { Crown, Check, AlertCircle, FileText, DollarSign, Calendar, Zap, TrendingUp } from 'lucide-react';

interface MembershipOnboardingProps {
  therapist: any;
  onComplete: (selectedPackage: 'monthly' | 'commission', membershipData: any) => Promise<void>;
}

interface PackageOption {
  id: 'monthly' | 'commission';
  title: string;
  description: string;
  pricing: string;
  benefits: string[];
  warnings?: string[];
  icon: React.ReactNode;
  color: string;
  gradient: string;
  popular?: boolean;
}

const MembershipOnboarding: React.FC<MembershipOnboardingProps> = ({ 
  therapist, 
  onComplete 
}) => {
  const [selectedPackage, setSelectedPackage] = useState<'monthly' | 'commission' | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const packages: PackageOption[] = [
    {
      id: 'commission',
      title: 'Pro - Pay As You Go',
      description: 'Start earning with no upfront costs',
      pricing: '30% commission per completed booking',
      benefits: [
        '✅ No monthly fees or upfront costs',
        '✅ Pay only when you earn money',
        '✅ Professional profile listing',
        '✅ Complete booking management',
        '✅ Customer messaging system',
        '✅ Performance analytics',
        '✅ Standard customer support',
        '✅ Access to all booking features'
      ],
      warnings: [
        '⚠️ 30% commission deducted from each booking',
        '⚠️ Upgrade to Plus Plan available anytime for 0% commission'
      ],
      icon: <Zap className="w-8 h-8" />,
      color: 'orange',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      id: 'monthly',
      title: 'Plus - Everything For Success',
      description: 'Maximum earnings + Premium features',
      pricing: 'Monthly subscription - Keep 100% of earnings',
      benefits: [
        '✅ Keep 100% of all booking earnings',
        '✅ Zero commission on any services',
        '✅ Premium profile with verified badge',
        '✅ Priority placement in search results',
        '✅ Advanced analytics & insights',
        '✅ 24/7 priority customer support',
        '✅ Marketing boost features',
        '✅ Exclusive discount badge system',
        '✅ Featured therapist status'
      ],
      icon: <Crown className="w-8 h-8" />,
      color: 'purple',
      gradient: 'from-purple-600 to-indigo-700',
      popular: true
    }
  ];

  const monthlyPricingDetails = [
    { month: 1, price: 'Rp 300,000', description: 'Monthly subscription - Keep 100% earnings, zero commission' }
  ];

  const handlePackageSelect = (packageId: 'monthly' | 'commission') => {
    setSelectedPackage(packageId);
  };

  const handleGetStarted = async () => {
    if (!selectedPackage || !termsAccepted) {
      return;
    }

    setLoading(true);
    try {
      const membershipData = {
        packageType: selectedPackage,
        startDate: new Date().toISOString(),
        selectedAt: new Date().toISOString(),
        therapistId: therapist.$id,
        status: selectedPackage === 'monthly' ? 'trial' : 'active',
        ...(selectedPackage === 'monthly' && {
          currentMonth: 1,
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
      };

      await onComplete(selectedPackage, membershipData);
    } catch (error) {
      console.error('Failed to set up membership:', error);
      alert('Failed to set up membership. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Safe-area padding for notch devices */}
      <div className="pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b shadow-sm">
          <div className="max-w-sm mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center shadow-md">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div className="leading-tight">
                <h1 className="text-lg font-bold">IndaStreet</h1>
                <p className="text-[11px] text-gray-500">Choose your plan to get started</p>
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-semibold">
                <AlertCircle className="w-4 h-4" />
                Required
              </span>
            </div>
          </div>
        </header>

      {/* Content - Mobile-first container */}
      <div className="max-w-sm mx-auto px-4 py-6">
        {/* Package Selection - Single column on mobile */}
        <div className="grid grid-cols-1 gap-5 mb-24">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => handlePackageSelect(pkg.id)}
              className={`relative bg-white rounded-2xl p-5 cursor-pointer transition-all duration-300 border hover:shadow-xl ${
                selectedPackage === pkg.id
                  ? pkg.id === 'monthly' 
                    ? 'border-purple-400 ring-2 ring-purple-200 bg-gradient-to-b from-purple-50 to-white'
                    : 'border-orange-400 ring-2 ring-orange-200 bg-gradient-to-b from-orange-50 to-white'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Popular Badge */}
              {pkg.popular && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-0.5 rounded-full text-[11px] font-semibold shadow">
                    ⭐ RECOMMENDED
                  </span>
                </div>
              )}

              {/* Selection Indicator */}
              {selectedPackage === pkg.id && (
                <div className="absolute top-4 right-4">
                  <div className={`w-6 h-6 bg-gradient-to-r ${pkg.gradient} rounded-full flex items-center justify-center`}>
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-5">
                <div className={`w-14 h-14 bg-gradient-to-r ${pkg.gradient} rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md`}>
                  <div className="text-white">
                    {pkg.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{pkg.title}</h3>
                <p className="text-sm text-gray-600 mb-2 leading-relaxed">{pkg.description}</p>
                <div className={`text-base font-bold ${
                  pkg.id === 'monthly' ? 'text-purple-600' : 'text-orange-600'
                } bg-gradient-to-r ${pkg.gradient} bg-clip-text text-transparent`}>
                  {pkg.pricing}
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-3 mb-4">
                {pkg.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                    <span className="text-gray-700 text-[13px] leading-snug">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Warnings */}
              {pkg.warnings && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Important Notes
                  </h4>
                  <div className="space-y-2">
                    {pkg.warnings.map((warning, index) => (
                      <div key={index} className="text-sm text-amber-700">{warning}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Monthly Pricing Breakdown */}
        {selectedPackage === 'monthly' && (
          <div className="bg-white rounded-3xl p-10 mb-12 border-2 border-purple-200 shadow-2xl bg-gradient-to-br from-purple-50 to-indigo-50">
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-purple-900 mb-3">
                Plus Plan Pricing Structure
              </h3>
              <p className="text-lg text-gray-600 max-w-sm mx-auto">
                Gradual pricing increase to support your business growth journey
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {monthlyPricingDetails.map((detail, index) => (
                <div 
                  key={detail.month}
                  className={`relative bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                    detail.month === 1 
                      ? 'border-2 border-green-400 bg-gradient-to-br from-green-50 to-emerald-50' 
                      : 'border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-indigo-50'
                  }`}
                >
                  <div className="text-sm font-bold text-gray-500 mb-2">MONTH {detail.month}</div>
                  <div className={`text-2xl font-extrabold mb-3 ${
                    detail.month === 1 ? 'text-green-600' : 'text-purple-600'
                  }`}>
                    {detail.price}
                  </div>
                  <div className="text-sm text-gray-600 leading-relaxed">{detail.description}</div>
                  {detail.month === 1 && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        FREE TRIAL
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 bg-white rounded-lg p-4 border border-purple-200">
                <strong>Total 5-Month Cost:</strong> Rp 1,050,000 
                <span className="text-purple-600 font-semibold"> (Keep 100% of all earnings!)</span>
              </p>
            </div>
          </div>
        )}

        {/* Terms and Conditions */}
        <div className="bg-white rounded-2xl p-8 mb-8 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Terms and Conditions
          </h3>
          <div className="space-y-4 text-gray-700 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Membership Terms:</h4>
              <ul className="space-y-1 ml-4">
                <li>• Monthly packages auto-renew unless cancelled 48 hours before renewal</li>
                <li>• Commission packages have no contracts - pay per booking only</li>
                <li>• Switching from commission to monthly requires 30-day notice</li>
                <li>• All outstanding fees must be cleared before package changes</li>
                <li>• Verified badge removed upon membership cancellation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Service Terms:</h4>
              <ul className="space-y-1 ml-4">
                <li>• Professional conduct expected at all times</li>
                <li>• Accurate profile information required</li>
                <li>• Customer safety and satisfaction priority</li>
                <li>• Platform fees non-refundable once services rendered</li>
              </ul>
            </div>
            <div className="flex items-start gap-3 mt-6">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                I have read and agree to the{' '}
                <a href="#" className="text-orange-600 hover:text-orange-700 font-semibold">
                  Terms and Conditions
                </a>{' '}
                and{' '}
                <a href="#" className="text-orange-600 hover:text-orange-700 font-semibold">
                  Privacy Policy
                </a>
              </label>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Action Bar for mobile */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t shadow-lg px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
          <div className="max-w-sm mx-auto">
            {/* Helper text */}
            <div className="flex items-center justify-between mb-2">
              <p className="text-[12px] text-gray-600">{selectedPackage ? (selectedPackage === 'monthly' ? 'Plus Plan selected' : 'Pro Plan selected') : 'Select a plan above'}</p>
              <label className="flex items-center gap-2 text-[12px]">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-gray-700">Agree to terms</span>
              </label>
            </div>

            <button
              onClick={handleGetStarted}
              disabled={!selectedPackage || !termsAccepted || loading}
              className={`w-full h-12 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md ${
                selectedPackage && termsAccepted && !loading
                  ? 'bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 text-white active:scale-[0.98]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Setting up...
                </span>
              ) : (
                <span className="inline-flex items-center justify-center gap-2">
                  <Crown className="w-5 h-5" />
                  Activate & Continue
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default MembershipOnboarding;