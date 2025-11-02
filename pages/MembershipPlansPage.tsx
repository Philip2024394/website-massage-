import React, { useState, useEffect } from 'react';
import { Crown, Check, Star, Calendar, Database, Users } from 'lucide-react';
import Button from '../components/Button';

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
}

const MembershipPlansPage: React.FC<MembershipPlansPageProps> = ({ 
  userType, 
  currentPlan = 'free'
}) => {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - this will be replaced with admin-updated data
  const defaultPlans: MembershipPlan[] = [
    {
      id: '1month',
      name: '1 Month',
      duration: '1 Month',
      price: 25000,
      features: [
        'Live presence on platform',
        'Customer booking management',
        'Profile customization',
        'Basic analytics',
        'Customer communication tools'
      ]
    },
    {
      id: '3month',
      name: '3 Months',
      duration: '3 Months',
      price: 65000,
      originalPrice: 75000,
      savings: 'Save Rp 10,000',
      features: [
        'All 1-month features',
        'Priority listing placement',
        'Advanced analytics dashboard',
        'Bulk booking management',
        'Extended profile options',
        'Customer review management'
      ]
    },
    {
      id: '6month',
      name: '6 Months',
      duration: '6 Months',
      price: 120000,
      originalPrice: 150000,
      savings: 'Save Rp 30,000',
      isPopular: true,
      features: [
        'All 3-month features',
        'Featured provider status',
        'Premium customer support',
        'Marketing tools & promotions',
        'Revenue optimization insights',
        'Multi-location management'
      ]
    },
    {
      id: '12month',
      name: '12 Months',
      duration: '12 Months',
      price: 200000,
      originalPrice: 300000,
      savings: 'Save Rp 100,000',
      features: [
        'All 6-month features',
        'Exclusive partner benefits',
        'API access for integrations',
        'White-label booking widgets',
        'Priority feature requests',
        'Dedicated account manager'
      ]
    }
  ];

  useEffect(() => {
    // Simulate loading membership plans from admin dashboard
    const loadPlans = async () => {
      setLoading(true);
      // In real implementation, fetch from admin-configured plans
      setTimeout(() => {
        setPlans(defaultPlans);
        setLoading(false);
      }, 1000);
    };

    loadPlans();
  }, []);

  const handleSelectPlan = (planId: string) => {
    console.log(`Selected plan: ${planId} for ${userType}`);
    // Implement plan selection logic
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading membership plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Membership Plans</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Notice */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Star className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                About Our Membership Plans
              </h3>
              <p className="text-blue-800 leading-relaxed">
                Our membership packages are designed to enhance your online presence and provide secure data storage. 
                <strong> Indastreet never withholds commissions or fees from your massage services.</strong> We believe in 
                empowering our community to grow and succeed at minimal cost. Think of this as your investment in joining 
                an awesome community that helps you progress to the next level.
              </p>
              <p className="text-sm text-blue-700 mt-3 font-medium">
                - The Indastreet Team
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
                    Most Popular
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
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Features Included:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full ${
                    plan.isPopular 
                      ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  {currentPlan === plan.id ? 'Current Plan' : 'Select Plan'}
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
              <span className="text-lg text-gray-700">Current Plan:</span>
              <span className="font-bold text-green-600 ml-2">Free Plan</span>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <Users className="w-8 h-8 text-orange-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Live Presence</h3>
            <p className="text-sm text-gray-600">
              Maintain your active status on the platform for maximum customer visibility
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <Database className="w-8 h-8 text-orange-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Secure Storage</h3>
            <p className="text-sm text-gray-600">
              Safe and reliable data storage for your profiles, bookings, and customer information
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <Crown className="w-8 h-8 text-orange-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Zero Commission</h3>
            <p className="text-sm text-gray-600">
              Keep 100% of your earnings. We never take a cut from your massage service fees
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipPlansPage;