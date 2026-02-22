// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
import React, { useState, useEffect } from 'react';
import { Check, Star, Briefcase } from 'lucide-react';
import { membershipSignupService, type PlanType } from '../lib/services/membershipSignup.service';
import { useLanguage } from '../hooks/useLanguage';
import { translations } from '../translations';

interface PackageOnboardingProps {
  onNavigate?: (page: string) => void;
}

const PackageOnboarding: React.FC<PackageOnboardingProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const t = translations[language].auth;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [userRole, setUserRole] = useState<string>('');

  // Get user info on mount
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        // Get current user to determine role for dashboard redirect
        const session = await membershipSignupService.getCurrentSession();
        if (session?.user) {
          // For now, we'll determine the role from user metadata or use default
          // This will be properly implemented when we update the auth service
          setUserRole('therapist'); // Default for now
        }
      } catch (error) {
        console.error('Failed to get current user:', error);
        // Redirect to login if no session
        if (onNavigate) {
          onNavigate('login');
        } else {
          window.location.href = '/login';
        }
      }
    };

    getCurrentUser();
  }, [onNavigate]);

  const plans = [
    {
      id: 'pro' as PlanType,
      name: 'Pro',
      price: '0',
      period: 'Free Forever',
      commission: '30% commission per booking',
      features: [
        'Zero monthly fee',
        'Start earning immediately', 
        'Full profile & booking system',
        'Standard listing placement',
        'Customer support'
      ],
      badge: 'Pay Per Lead',
      badgeColor: 'bg-amber-500',
      color: 'from-amber-500 to-amber-600',
      borderColor: 'border-amber-500',
      popular: false
    },
    {
      id: 'plus' as PlanType,
      name: 'Plus',
      price: '250,000',
      period: 'per month',
      commission: '0% commission - keep everything',
      features: [
        'Zero commission fees',
        'Priority hotel & villa requests',
        'Verified badge & premium placement', 
        'Advanced analytics & insights',
        'Priority customer support',
        'Marketing boost features'
      ],
      badge: 'Most Popular',
      badgeColor: 'bg-black',
      color: 'from-black to-gray-800',
      borderColor: 'border-black',
      popular: true
    }
  ];

  const handlePlanSelect = async (planType: PlanType) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🎯 Selecting package:', planType);
      
      // Update user profile with selected package
      await membershipSignupService.updateMembershipPlan(planType);
      
      console.log('✅ Package selection completed');
      
      // Redirect to appropriate dashboard based on role
      redirectToDashboard();

    } catch (error) {
      console.error('❌ Package selection error:', error);
      setError(error instanceof Error ? error.message : 'Failed to select package');
    } finally {
      setLoading(false);
    }
  };

  const redirectToDashboard = () => {
    // Determine dashboard route based on user role
    let dashboardRoute = '/dashboard/therapist'; // Default

    // This logic will be properly implemented when auth service is updated
    // For now, we'll use the userRole state or default to therapist
    
    if (onNavigate) {
      onNavigate('therapist'); // This maps to /dashboard/therapist
    } else {
      window.location.href = dashboardRoute;
    }
  };

  return (
    <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gradient-to-br from-amber-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your business. You can change your plan anytime.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 ${
                selectedPlan === plan.id ? plan.borderColor : 'border-gray-200'
              } transition-all duration-300 hover:shadow-xl ${
                plan.popular ? 'ring-4 ring-amber-100' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-2 rounded-full text-sm font-bold">
                    <Star className="w-4 h-4 inline mr-1" />
                    Recommended
                  </div>
                </div>
              )}

              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white mt-2 ${plan.badgeColor}`}>
                      {plan.badge}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">
                      {plan.price === '0' ? 'FREE' : `Rp ${plan.price}`}
                    </div>
                    <div className="text-sm text-gray-500">{plan.period}</div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className={`text-sm font-medium ${plan.id === 'plus' ? 'text-green-600' : 'text-amber-600'}`}>
                    {plan.commission}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanSelect(plan.id)}
                  disabled={loading}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-white bg-gradient-to-r ${plan.color} hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center`}
                >
                  {loading && selectedPlan === plan.id ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Activating...
                    </div>
                  ) : (
                    <>
                      Get Started
                      <span className="ml-2">→</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 mb-4">
            All plans include our core booking system and customer support
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
            <span>✓ No setup fees</span>
            <span>✓ Cancel anytime</span>
            <span>✓ 24/7 support</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageOnboarding;