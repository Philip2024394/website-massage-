import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { membershipPackageService, type MembershipPackage } from '../../lib/appwriteService';
import { account } from '../../lib/appwrite';

interface PackageDetails {
    type: 'bronze' | 'silver' | 'gold';
    name: string;
    tagline: string;
    price: string;
    billingCycle: string;
    leadCost: string;
    features: string[];
    recommended?: boolean;
}

const PACKAGES: PackageDetails[] = [
    {
        type: 'silver',
        name: 'Silver Package',
        tagline: 'Pay As You Grow',
        price: 'Rp 0',
        billingCycle: 'monthly fee',
        leadCost: '25% admin commission per lead',
        features: [
            'Full profile with photos',
            'Lead generation system',
            'Pay 25% commission to admin per booking',
            'Standard support',
            'No monthly commitment',
            'DEFAULT for all new members'
        ],
        recommended: true
    },
    {
        type: 'gold',
        name: 'Monthly Package',
        tagline: 'Fixed Monthly Rate',
        price: 'Rp 200,000',
        billingCycle: 'per month',
        leadCost: 'NO commission - Keep 100%',
        features: [
            'Full profile placement',
            'Unlimited leads included',
            'NO commission on bookings',
            'Keep 100% of your earnings',
            'Priority support',
            'Fixed predictable cost',
            'Cancel anytime'
        ]
    },
    {
        type: 'bronze',
        name: 'Bronze Package',
        tagline: 'Best Annual Value',
        price: 'Rp 2,000,000',
        billingCycle: 'per year',
        leadCost: 'NO commission - Keep 100%',
        features: [
            'Full profile listing',
            'Unlimited leads included',
            'NO commission on bookings',
            'Keep 100% of your earnings',
            'Priority support',
            'Save Rp 400,000 vs monthly',
            'Annual commitment'
        ]
    }
];

const MembershipPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [currentMembership, setCurrentMembership] = useState<MembershipPackage | null>(null);
    const [selectedPackage, setSelectedPackage] = useState<'bronze' | 'silver' | 'gold' | null>(null);
    const [processing, setProcessing] = useState(false);
    const [memberType, setMemberType] = useState<'therapist' | 'massage_place' | 'facial_place'>('therapist');
    const [memberId, setMemberId] = useState<string>('');
    const [userId, setUserId] = useState<string>('');

    useEffect(() => {
        loadMembershipData();
    }, []);

    const loadMembershipData = async () => {
        try {
            setLoading(true);

            // Get current user
            const user = await account.get();
            setUserId(user.$id);

            // Determine member type and ID from user preferences
            const prefs = user.prefs as any;
            const type = prefs?.memberType || 'therapist';
            const id = prefs?.memberId || user.$id;
            
            setMemberType(type);
            setMemberId(id);

            // Get current membership
            const membership = await membershipPackageService.getMembership(id, type);
            setCurrentMembership(membership);
            setSelectedPackage(membership?.packageType || 'silver');

        } catch (error) {
            console.error('Error loading membership:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePackageSelect = async (packageType: 'bronze' | 'silver' | 'gold') => {
        if (processing) return;

        try {
            setProcessing(true);
            setSelectedPackage(packageType);

            if (!currentMembership) {
                // Create new membership
                await membershipPackageService.createDefaultMembership(userId, memberId, memberType);
                await loadMembershipData();
            }

            // Check for outstanding fees before allowing upgrade to Monthly/Bronze
            if (packageType === 'bronze' || packageType === 'gold') {
                alert(`To upgrade to ${packageType === 'gold' ? 'Monthly' : 'Bronze'} package:\n\n1. Pay all outstanding commission fees\n2. Contact admin to verify payment\n3. Admin will activate your upgrade\n\nPackage: ${packageType === 'gold' ? 'Rp 200,000/month' : 'Rp 2,000,000/year'}\nBenefit: Keep 100% of earnings, NO commission`);
            } else {
                // Downgrade to Silver (instant, but loses no-commission benefit)
                if (currentMembership) {
                    await membershipPackageService.updatePackage(currentMembership.$id!, packageType);
                }
                alert('Downgraded to Silver package. You will now pay 25% commission per booking.');
                await loadMembershipData();
            }

        } catch (error) {
            console.error('Error selecting package:', error);
            alert('Failed to update membership. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const getPackagePrice = (pkg: PackageDetails) => {
        // All packages now have fixed pricing
        return pkg.price;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    <p className="mt-4 text-gray-600">Loading membership plans...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Choose Your Membership Package
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Select the perfect plan for your business. Upgrade, downgrade, or switch anytime.
                    </p>
                    
                    {currentMembership && (
                        <div className="mt-6 inline-flex items-center bg-white px-6 py-3 rounded-full shadow-md">
                            <span className="text-sm font-medium text-gray-600 mr-2">Current Plan:</span>
                            <span className={`text-lg font-bold uppercase ${
                                currentMembership.packageType === 'bronze' ? 'text-amber-700' :
                                currentMembership.packageType === 'silver' ? 'text-gray-600' :
                                'text-yellow-600'
                            }`}>
                                {currentMembership.packageType}
                            </span>
                            {currentMembership.packageType === 'gold' && currentMembership.goldTier && (
                                <span className="ml-2 text-sm text-gray-500">
                                    (Month {currentMembership.goldTier})
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Package Cards */}
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    {PACKAGES.map((pkg) => {
                        const isCurrentPlan = currentMembership?.packageType === pkg.type;
                        const isRecommended = pkg.recommended;

                        return (
                            <div
                                key={pkg.type}
                                className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                                    isCurrentPlan ? 'ring-4 ring-indigo-500' : ''
                                } ${isRecommended ? 'md:-mt-4 md:mb-4' : ''}`}
                            >
                                {/* Recommended Badge */}
                                {isRecommended && (
                                    <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-4 py-2 rounded-bl-lg">
                                        RECOMMENDED
                                    </div>
                                )}

                                {/* Current Plan Badge */}
                                {isCurrentPlan && (
                                    <div className="absolute top-0 left-0 bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-br-lg">
                                        CURRENT PLAN
                                    </div>
                                )}

                                {/* Package Header */}
                                <div className={`p-8 ${
                                    pkg.type === 'bronze' ? 'bg-gradient-to-br from-amber-50 to-orange-50' :
                                    pkg.type === 'silver' ? 'bg-gradient-to-br from-gray-50 to-slate-50' :
                                    'bg-gradient-to-br from-yellow-50 to-amber-50'
                                }`}>
                                    <h3 className={`text-2xl font-bold mb-2 ${
                                        pkg.type === 'bronze' ? 'text-amber-900' :
                                        pkg.type === 'silver' ? 'text-gray-900' :
                                        'text-yellow-900'
                                    }`}>
                                        {pkg.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-4">{pkg.tagline}</p>
                                    
                                    <div className="mb-2">
                                        <span className="text-4xl font-bold text-gray-900">
                                            {getPackagePrice(pkg)}
                                        </span>
                                        <span className="text-sm text-gray-600 ml-2">
                                            {pkg.billingCycle}
                                        </span>
                                    </div>
                                    
                                    <div className={`text-sm font-semibold ${
                                        pkg.type === 'bronze' ? 'text-amber-700' :
                                        pkg.type === 'silver' ? 'text-indigo-600' :
                                        'text-green-600'
                                    }`}>
                                        {pkg.leadCost}
                                    </div>
                                </div>

                                {/* Features List */}
                                <div className="p-8">
                                    <ul className="space-y-4 mb-8">
                                        {pkg.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start">
                                                <svg
                                                    className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${
                                                        pkg.type === 'gold' ? 'text-yellow-500' : 'text-indigo-500'
                                                    }`}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                <span className="text-sm text-gray-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Action Button */}
                                    <button
                                        onClick={() => handlePackageSelect(pkg.type)}
                                        disabled={processing || isCurrentPlan}
                                        className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
                                            isCurrentPlan
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : pkg.type === 'gold'
                                                ? 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 shadow-lg hover:shadow-xl'
                                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                                        } ${processing ? 'opacity-50 cursor-wait' : ''}`}
                                    >
                                        {processing && selectedPackage === pkg.type
                                            ? 'Processing...'
                                            : isCurrentPlan
                                            ? 'Current Plan'
                                            : pkg.type === 'silver'
                                            ? 'Switch to Silver'
                                            : pkg.type === 'bronze'
                                            ? 'Select Bronze'
                                            : 'Upgrade to Gold'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Additional Info */}
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
                    
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Can I switch packages anytime?</h4>
                            <p className="text-gray-600">Yes! You can upgrade or downgrade at any time. Upgrades take effect immediately, while downgrades take effect at the next billing cycle.</p>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">How does the Gold progressive pricing work?</h4>
                            <p className="text-gray-600">Gold package starts at Rp 1M in month 1, increases by Rp 1M each month up to Rp 5M, then stays at Rp 5M from month 5 onwards. If you cancel and rejoin, pricing resets to month 1.</p>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">What happens if my Bronze membership expires?</h4>
                            <p className="text-gray-600">If you don't renew your Bronze package before expiry, you'll automatically revert to Silver (pay-per-lead) to ensure uninterrupted service.</p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Which package is right for me?</h4>
                            <p className="text-gray-600">
                                <strong>Bronze:</strong> Best for established businesses with direct customer base.<br/>
                                <strong>Silver:</strong> Perfect for getting started with no upfront cost.<br/>
                                <strong>Gold:</strong> Ideal for high-volume providers who want unlimited leads and no commissions.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Back Button */}
                <div className="text-center mt-12">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MembershipPage;
