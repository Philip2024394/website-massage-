import React, { useState, useEffect } from 'react';
import { Crown, Check, Star, Calendar, Database, Users, Menu, Home, FileText } from 'lucide-react';
import Button from '../components/Button';
import NotificationBell from '../components/NotificationBell';
import { appwriteTranslationService } from '../lib/appwriteTranslationService';
import MembershipTermsModal from '../components/MembershipTermsModal';

interface MembershipPlan {
  id: string;
  name: string;
  duration: string;
  price: number;
  originalPrice?: number;
  features: string[];
  isPopular?: boolean;
  savings?: string;
}

interface MembershipPlansPageProps {
  onBack: () => void;
  userType: 'therapist' | 'place';
  currentPlan?: string;
  onNavigateToNotifications?: () => void;
  unreadNotificationsCount?: number;
}

const MembershipPlansPage: React.FC<MembershipPlansPageProps> = ({ 
  userType, 
  currentPlan = 'free',
  onBack,
  onNavigateToNotifications,
  unreadNotificationsCount = 0
}) => {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);
  const [language, setLanguage] = useState<'id' | 'en'>('en');
  const [t, setT] = useState<any>({});
  const [acceptedTerms, setAcceptedTerms] = useState<{ [planId: string]: boolean }>({});
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [selectedPlanForTerms, setSelectedPlanForTerms] = useState<string | null>(null);

  // Fetch translations from Appwrite
  const loadTranslations = async (lang: 'id' | 'en') => {
    try {
      const translations = await appwriteTranslationService.getCategoryTranslations('membership', lang);
      if (Object.keys(translations).length > 0) {
        setT(translations);
      } else {
        // Fallback to hardcoded translations
        const fallback = appwriteTranslationService.getFallbackTranslations('membership', lang);
        setT(fallback);
      }
    } catch (error) {
      console.error('Error loading translations:', error);
      // Use fallback
      const fallback = appwriteTranslationService.getFallbackTranslations('membership', lang);
      setT(fallback);
    }
  };

  // Detect language from browser or localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem('language') as 'id' | 'en';
    const browserLang = navigator.language.toLowerCase();
    
    let detectedLang: 'id' | 'en' = 'en';
    if (savedLang) {
      detectedLang = savedLang;
    } else if (browserLang.includes('id')) {
      detectedLang = 'id';
    }
    
    setLanguage(detectedLang);
    loadTranslations(detectedLang);
  }, []);

  // Handle language change
  const handleLanguageToggle = () => {
    const newLang = language === 'id' ? 'en' : 'id';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
    loadTranslations(newLang);
  };

  // Helper function to get current plan status
  const getCurrentPlanStatus = () => {
    if (!t.freePlan) return { name: 'Free Plan', status: 'Active', color: 'text-gray-600', bgColor: 'bg-gray-100' };
    
    switch (currentPlan) {
      case 'free':
        return { name: t.freePlan, status: t.active, color: 'text-gray-600', bgColor: 'bg-gray-100' };
      case '1month':
        return { name: `1 ${t.month} ${t.currentPlan}`, status: t.active, color: 'text-green-600', bgColor: 'bg-green-100' };
      case '3month':
        return { name: `3 ${t.months} ${t.currentPlan}`, status: t.active, color: 'text-blue-600', bgColor: 'bg-blue-100' };
      case '6month':
        return { name: `6 ${t.months} ${t.currentPlan}`, status: t.active, color: 'text-purple-600', bgColor: 'bg-purple-100' };
      case '1year':
        return { name: `1 ${t.year} ${t.currentPlan}`, status: t.active, color: 'text-orange-600', bgColor: 'bg-orange-100' };
      default:
        return { name: t.freePlan, status: t.active, color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
  };

  // Mock data - this will be replaced with admin-updated data
  const getDefaultPlans = (): MembershipPlan[] => {
    if (!t.month || !t.feature) return [];
    
    return [
      {
        id: '1month',
        name: `1 ${t.month}`,
        duration: `1 ${t.month}`,
        price: 25000,
        features: [
          t.feature?.livePresence || 'Live presence on platform',
          t.feature?.bookingManagement || 'Customer booking management',
          t.feature?.profileCustomization || 'Profile customization',
          t.feature?.basicAnalytics || 'Basic analytics',
          t.feature?.customerTools || 'Customer communication tools'
        ]
      },
      {
        id: '3month',
        name: `3 ${t.months}`,
        duration: `3 ${t.months}`,
        price: 65000,
        originalPrice: 75000,
        savings: `${t.save} Rp 10,000`,
        features: [
          `${t.feature?.allPrevious || 'All features'} 1 ${t.month}`,
          t.feature?.priorityListing || 'Priority listing placement',
          t.feature?.advancedAnalytics || 'Advanced analytics dashboard',
          t.feature?.bulkBooking || 'Bulk booking management',
          t.feature?.extendedProfile || 'Extended profile options',
          t.feature?.reviewManagement || 'Customer review management'
        ]
      },
      {
        id: '6month',
        name: `6 ${t.months}`,
        duration: `6 ${t.months}`,
        price: 120000,
        originalPrice: 150000,
        savings: `${t.save} Rp 30,000`,
        isPopular: true,
        features: [
          `${t.feature?.allPrevious || 'All features'} 3 ${t.months}`,
          t.feature?.featuredStatus || 'Featured provider status',
          t.feature?.premiumSupport || 'Premium customer support',
          t.feature?.marketingTools || 'Marketing tools & promotions',
          t.feature?.revenueInsights || 'Revenue optimization insights',
          t.feature?.multiLocation || 'Multi-location management'
        ]
      },
      {
        id: '12month',
        name: `12 ${t.months}`,
        duration: `12 ${t.months}`,
        price: 200000,
        originalPrice: 300000,
        savings: `${t.save} Rp 100,000`,
        features: [
          `${t.feature?.allPrevious || 'All features'} 6 ${t.months}`,
          t.feature?.exclusiveBenefits || 'Exclusive partner benefits',
          t.feature?.apiAccess || 'API access for integrations',
          t.feature?.whiteLabel || 'White-label booking widgets',
          t.feature?.priorityFeatures || 'Priority feature requests',
          t.feature?.accountManager || 'Dedicated account manager'
        ]
      }
    ];
  };

  useEffect(() => {
    // Simulate loading membership plans from admin dashboard
    const loadPlans = async () => {
      setLoading(true);
      // In real implementation, fetch from admin-configured plans
      setTimeout(() => {
        setPlans(getDefaultPlans());
        setLoading(false);
      }, 1000);
    };

    loadPlans();
  }, [language]);

  const handleSelectPlan = (planId: string) => {
    if (acceptedTerms[planId]) {
      console.log(`Selected plan: ${planId} for ${userType}`);
      // Implement plan selection logic
      // TODO: Proceed with payment or activation
    }
  };

  const handleTermsCheckbox = (planId: string, checked: boolean) => {
    if (checked) {
      // Open terms modal
      setSelectedPlanForTerms(planId);
      setShowTermsModal(true);
    } else {
      // Uncheck terms
      setAcceptedTerms(prev => ({ ...prev, [planId]: false }));
    }
  };

  const handleAcceptTerms = () => {
    if (selectedPlanForTerms) {
      setAcceptedTerms(prev => ({ ...prev, [selectedPlanForTerms]: true }));
      setShowTermsModal(false);
      setSelectedPlanForTerms(null);
    }
  };

  const handleCloseTermsModal = () => {
    setShowTermsModal(false);
    setSelectedPlanForTerms(null);
  };

  if (loading || !t.loadingPlans) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">{t.loadingPlans || 'Loading membership plans...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Burger Menu */}
      <header className="bg-white shadow-sm px-4 py-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold">
            <span className="text-gray-900">Inda</span>
            <span className="text-orange-500">Street</span>
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLanguageToggle}
              className="min-w-[44px] min-h-[44px] p-2 flex items-center justify-center text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-colors touch-manipulation"
              title={language === 'id' ? 'Switch to English' : 'Beralih ke Bahasa Indonesia'}
              aria-label="Toggle Language"
            >
              <Home className="w-5 h-5" />
            </button>
            {onNavigateToNotifications && (
              <NotificationBell count={unreadNotificationsCount} onClick={onNavigateToNotifications} />
            )}
            <button
              onClick={() => setIsSideDrawerOpen(true)}
              className="p-2 text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-orange-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Side Drawer */}
      {isSideDrawerOpen && (
        <div className="fixed inset-0 z-50">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsSideDrawerOpen(false)}
          />
          
          {/* Drawer */}
          <div className="absolute right-0 top-0 h-full w-80 bg-gradient-to-br from-orange-500 to-red-500 shadow-xl">
            {/* Drawer Header */}
            <div className="p-6 border-b border-orange-400">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">{t.menuTitle}</h2>
                <button
                  onClick={() => setIsSideDrawerOpen(false)}
                  className="p-2 text-white hover:bg-orange-600 rounded-lg transition-colors"
                >
                  <Star className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Drawer Content */}
            <div className="p-6">
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setIsSideDrawerOpen(false);
                    onBack();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-orange-600 rounded-lg transition-colors text-left"
                >
                  <Crown className="w-5 h-5" />
                  <span>{t.backToDashboard}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plan Status Section */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className={`${getCurrentPlanStatus().bgColor} border border-opacity-20 rounded-lg p-6 mb-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className={`w-6 h-6 ${getCurrentPlanStatus().color}`} />
              <div>
                <h2 className={`text-lg font-semibold ${getCurrentPlanStatus().color}`}>
                  {t.currentPlan}: {getCurrentPlanStatus().name}
                </h2>
                <p className={`text-sm ${getCurrentPlanStatus().color} opacity-80`}>
                  {t.status}: {getCurrentPlanStatus().status}
                </p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${getCurrentPlanStatus().bgColor} ${getCurrentPlanStatus().color} border border-current border-opacity-20`}>
              {getCurrentPlanStatus().status}
            </div>
          </div>
        </div>

        {/* Page Title */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.title || 'Membership Plans'}</h1>
          <p className="text-gray-600">{t.subtitle || 'Choose the perfect plan for your business needs'}</p>
        </div>
      </div>

      {/* Header */}
      {/* Notice */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Star className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                {t.aboutTitle || 'About Our Membership Plans'}
              </h3>
              <p className="text-blue-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: t.aboutDescription || 'Our membership packages are designed to enhance your online presence.' }} />
              <p className="text-sm text-blue-700 mt-3 font-medium">
                {t.team || '- The Indastreet Team'}
              </p>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`relative bg-white rounded-xl shadow-lg border-2 transition-all hover:shadow-xl ${
                plan.isPopular ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {t.mostPopular}
                  </span>
                </div>
              )}

              <div className="p-6">
                {/* Plan Header */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    {plan.originalPrice && (
                      <span className="text-sm text-gray-500 line-through mr-2">
                        Rp {plan.originalPrice.toLocaleString()}
                      </span>
                    )}
                    <span className="text-3xl font-bold text-orange-600">
                      Rp {plan.price.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-600 flex items-center justify-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {plan.duration}
                  </p>
                  {plan.savings && (
                    <p className="text-green-600 text-sm font-semibold mt-1">{plan.savings}</p>
                  )}
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">{t.featuresIncluded}</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Terms & Conditions Checkbox */}
                {currentPlan !== plan.id && (
                  <div className="mb-4 p-3 bg-orange-50 rounded-lg border-2 border-orange-300">
                    <label className="flex items-start cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={acceptedTerms[plan.id] || false}
                        onChange={(e) => handleTermsCheckbox(plan.id, e.target.checked)}
                        className="mt-0.5 w-5 h-5 text-orange-500 border-2 border-orange-400 rounded focus:ring-2 focus:ring-orange-500 cursor-pointer"
                      />
                      <span className="ml-3 text-sm text-gray-900 font-medium">
                        I agree to the{' '}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedPlanForTerms(plan.id);
                            setShowTermsModal(true);
                          }}
                          className="text-orange-600 hover:text-orange-700 font-bold underline inline-flex items-center"
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          Terms & Conditions
                        </button>
                      </span>
                    </label>
                    {!acceptedTerms[plan.id] && (
                      <p className="mt-2 text-xs text-orange-700 font-semibold ml-8 flex items-center">
                        <span className="mr-1">⚠️</span>
                        Please read and accept the terms before selecting this plan
                      </p>
                    )}
                  </div>
                )}

                {/* Action Button */}
                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={currentPlan !== plan.id && !acceptedTerms[plan.id]}
                  className={`w-full ${
                    currentPlan === plan.id
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : !acceptedTerms[plan.id]
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : plan.isPopular 
                      ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                      : 'bg-gray-800 hover:bg-gray-900 text-white'
                  }`}
                >
                  {currentPlan === plan.id ? t.currentPlanBtn : !acceptedTerms[plan.id] ? 'Accept Terms to Continue' : t.selectPlan}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Current Plan Section */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-center">
              <Crown className="w-5 h-5 mr-2 text-orange-500" />
              <span className="text-lg text-gray-700">{t.currentPlan}:</span>
              <span className="font-bold text-green-600 ml-2">{t.freePlan}</span>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <Users className="w-8 h-8 text-orange-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">{t.livePresence}</h3>
            <p className="text-sm text-gray-600">
              {t.livePresenceDesc}
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <Database className="w-8 h-8 text-orange-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">{t.secureStorage}</h3>
            <p className="text-sm text-gray-600">
              {t.secureStorageDesc}
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <Crown className="w-8 h-8 text-orange-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">{t.zeroCommission}</h3>
            <p className="text-sm text-gray-600">
              {t.zeroCommissionDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Terms & Conditions Modal */}
      <MembershipTermsModal
        isOpen={showTermsModal}
        onClose={handleCloseTermsModal}
        onAccept={handleAcceptTerms}
        planType={selectedPlanForTerms === '1month' ? 'pro' : 'plus'}
      />
    </div>
  );
};

export default MembershipPlansPage;
