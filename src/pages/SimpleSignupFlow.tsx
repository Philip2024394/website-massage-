import React, { useState, useEffect } from 'react';
import { Check, ArrowLeft, Eye, EyeOff, Building2, User, Sparkles, Briefcase, Hotel } from 'lucide-react';
import { membershipSignupService, type PlanType, type PortalType } from '../../lib/services/membershipSignup.service';

type Step = 'plan' | 'account';

interface FormData {
    planType: PlanType | null;
    portalType: PortalType | null;
    name: string;
    email: string;
    password: string;
    termsAccepted: boolean;
}

interface SimpleSignupFlowProps {
    onNavigate?: (page: string) => void;
    onBack?: () => void;
    t?: any;
}

const SimpleSignupFlow: React.FC<SimpleSignupFlowProps> = ({ onNavigate, onBack, t }) => {
    
    // Get plan and portal from localStorage (set by side drawer buttons)
    const initialPlan = (localStorage.getItem('selected_membership_plan') as PlanType) || 
                        null;
    const initialPortal = (localStorage.getItem('selectedPortalType') as PortalType) || 
                         null;

    const [currentStep, setCurrentStep] = useState<Step>(initialPlan ? 'account' : 'plan');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    
    const [formData, setFormData] = useState<FormData>({
        planType: initialPlan,
        portalType: initialPortal,
        name: '',
        email: '',
        password: '',
        termsAccepted: false,
    });

    // Check if user has accepted terms via terms page
    useEffect(() => {
        if (formData.planType) {
            const acceptedTerms = JSON.parse(localStorage.getItem('acceptedTerms') || '{}');
            const hasAcceptedCurrentPlan = acceptedTerms[formData.planType];
            
            if (hasAcceptedCurrentPlan && !formData.termsAccepted) {
                setFormData(prev => ({ ...prev, termsAccepted: true }));
            }
        }
    }, [formData.planType]);

    const plans = [
        {
            id: 'pro' as PlanType,
            name: 'Pro',
            price: '0',
            commission: '30% commission per booking',
            features: [
                'Zero monthly fee',
                'Start earning immediately',
                'Full profile & booking system',
                'Standard listing placement'
            ],
            badge: 'Pay Per Lead',
            color: 'from-orange-500 to-orange-600'
        },
        {
            id: 'plus' as PlanType,
            name: 'Plus',
            price: '250,000',
            commission: '0% commission - keep everything',
            features: [
                'Zero commission fees',
                'Priority hotel & villa requests',
                'Verified badge',
                'Premium placement',
                'Advanced analytics'
            ],
            badge: 'Most Popular',
            color: 'from-black to-gray-800'
        }
    ];

    const portals = [
        { id: 'massage_therapist' as PortalType, name: 'Massage Therapist', icon: User, description: 'Offer home service massage' },
        { id: 'massage_place' as PortalType, name: 'Massage Spa', icon: Building2, description: 'Spa or wellness center' },
        { id: 'facial_place' as PortalType, name: 'Facial Clinic', icon: Sparkles, description: 'Beauty and facial clinic' },
        { id: 'hotel' as PortalType, name: 'Hotel/Villa', icon: Hotel, description: 'Hotel or villa with spa' },
    ];

    const handlePlanSelect = (plan: PlanType) => {
        setFormData(prev => ({ ...prev, planType: plan }));
        setCurrentStep('account');
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!formData.planType) {
            setError('Please select a plan');
            return;
        }
        if (!formData.portalType) {
            setError('Please select your account type');
            return;
        }
        if (!formData.name.trim()) {
            setError('Please enter your name');
            return;
        }
        if (!formData.email.trim() || !formData.email.includes('@')) {
            setError('Please enter a valid email');
            return;
        }
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }
        if (!formData.termsAccepted) {
            // Check if user has accepted terms via the terms page
            const acceptedTerms = JSON.parse(localStorage.getItem('acceptedTerms') || '{}');
            const hasAcceptedCurrentPlan = acceptedTerms[formData.planType];
            
            if (!hasAcceptedCurrentPlan) {
                setError('Please accept the terms and conditions');
                return;
            } else {
                // Auto-check the checkbox if they accepted via terms page
                setFormData(prev => ({ ...prev, termsAccepted: true }));
            }
        }

        try {
            setLoading(true);

            // Get IP address
            let ip = '0.0.0.0';
            try {
                const res = await fetch('https://api.ipify.org?format=json');
                const data = await res.json();
                ip = data.ip;
            } catch { /* ignore */ }

            // Initialize signup
            const signup = await membershipSignupService.initializeSignup(
                formData.planType,
                ip,
                navigator.userAgent
            );

            // Accept terms
            await membershipSignupService.acceptTerms(signup.$id);

            // Select portal
            await membershipSignupService.selectPortal(signup.$id, formData.portalType);

            // Create account
            const result = await membershipSignupService.createAccount(
                signup.$id,
                formData.email,
                formData.password,
                formData.name
            );

            // Store signup info
            localStorage.setItem('signupId', signup.$id);
            localStorage.setItem('memberId', result.memberId);
            localStorage.setItem('selected_membership_plan', formData.planType);

            // Map portal type to correct dashboard URL (separate apps on different ports)
            const isProduction = !window.location.origin.includes('localhost');
            const portalToDashboardUrl: Record<PortalType, string> = isProduction ? {
                'massage_therapist': window.location.origin, // All on same domain in production
                'massage_place': window.location.origin,
                'facial_place': window.location.origin,
                'hotel': window.location.origin
            } : {
                'massage_therapist': 'http://localhost:3005', // Therapist Dashboard
                'massage_place': 'http://localhost:3002',      // Place Dashboard
                'facial_place': 'http://localhost:3006',       // Facial Dashboard
                'hotel': 'http://localhost:3007'               // Hotel Dashboard (future)
            };

            const dashboardUrl = portalToDashboardUrl[formData.portalType];
            
            // Redirect to the appropriate dashboard app
            console.log(`✅ Account created! Redirecting to ${formData.portalType} dashboard at ${dashboardUrl}`);
            window.location.href = dashboardUrl;

        } catch (err: any) {
            setError(err.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold">
                                <span className="text-black">Inda</span>
                                <span className="text-orange-500">Street</span>
                            </h1>
                        </div>
                        <button
                            onClick={() => onNavigate?.('home')}
                            className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-16">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                {/* Step 1: Select Plan */}
                {currentStep === 'plan' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <h1 className="text-4xl font-light text-black mb-3">Choose Your Plan</h1>
                            <p className="text-gray-500 text-lg">Select the plan that fits your business needs</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                            {plans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className={`relative border rounded-xl transition-all ${
                                        formData.planType === plan.id 
                                            ? 'border-orange-500 bg-white shadow-lg' 
                                            : 'border-gray-200 bg-white hover:border-orange-200 hover:shadow-md'
                                    }`}
                                >
                                    {plan.badge && (
                                        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-white text-xs font-medium rounded-full ${
                                            plan.id === 'plus' ? 'bg-black' : 'bg-orange-500'
                                        }`}>
                                            {plan.badge}
                                        </div>
                                    )}
                                    
                                    <div className="p-8">
                                        <div className={`flex items-center justify-between mb-6 ${plan.badge ? 'mt-2' : ''}`}>
                                            <div className={`text-sm font-medium px-3 py-1 rounded-full ${
                                                plan.id === 'pro' 
                                                    ? 'text-orange-600 bg-orange-50' 
                                                    : 'text-gray-600 bg-gray-100'
                                            }`}>
                                                {plan.id === 'pro' ? 'Pay Per Lead' : 'Monthly Fee'}
                                            </div>
                                            {formData.planType === plan.id && (
                                                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                                    <Check className="w-4 h-4 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="mb-6">
                                            <h3 className="text-2xl font-bold text-black mb-2">{plan.name}</h3>
                                            <p className="text-gray-500 text-sm">{plan.id === 'pro' ? 'Perfect for getting started' : 'For serious professionals'}</p>
                                        </div>

                                        <div className="mb-8">
                                            <div className="flex items-baseline">
                                                <span className="text-5xl font-light text-black">Rp {plan.price}</span>
                                                <span className="text-gray-400 ml-2">/month</span>
                                            </div>
                                            <div className={`font-medium mt-1 ${
                                                plan.id === 'pro' ? 'text-orange-600' : 'text-green-600'
                                            }`}>
                                                {plan.commission}
                                            </div>
                                        </div>

                                        <div className="space-y-3 text-sm mb-8">
                                            {plan.features.map((feature, idx) => (
                                                <div key={idx} className="flex items-center gap-3 text-gray-600">
                                                    <div className={`w-1 h-1 rounded-full ${
                                                        plan.id === 'pro' ? 'bg-gray-400' : 'bg-orange-500'
                                                    }`}></div>
                                                    <span>{feature}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => handlePlanSelect(plan.id)}
                                            className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                                                formData.planType === plan.id
                                                    ? 'bg-orange-500 text-white shadow-lg'
                                                    : plan.id === 'plus'
                                                    ? 'bg-black text-white hover:bg-gray-800'
                                                    : 'bg-orange-500 text-white hover:bg-orange-600'
                                            }`}
                                        >
                                            {formData.planType === plan.id ? 'Selected' : 'Select Package'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Create Account */}
                {currentStep === 'account' && (
                    <div className="max-w-2xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-light text-black mb-3">Create Your Account</h2>
                            <p className="text-gray-500 text-lg">Get started in less than a minute</p>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                            <form onSubmit={handleSignup} className="space-y-6">
                                {/* Account Type */}
                                <div>
                                    <label className="block text-sm font-medium text-black mb-4">
                                        I am a... <span className="text-orange-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {portals.map((portal) => {
                                            const Icon = portal.icon;
                                            return (
                                                <button
                                                    key={portal.id}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, portalType: portal.id }))}
                                                    className={`p-4 rounded-lg border transition-all text-left ${
                                                        formData.portalType === portal.id
                                                            ? 'border-green-600 bg-green-500 shadow-lg'
                                                            : 'border-orange-600 bg-orange-500 hover:border-orange-700 hover:bg-orange-600 shadow-md hover:shadow-lg'
                                                    }`}
                                                >
                                                    <Icon className={`w-6 h-6 mb-2 ${
                                                        formData.portalType === portal.id ? 'text-white' : 'text-white'
                                                    }`} />
                                                    <div className={`font-medium text-sm ${
                                                        formData.portalType === portal.id ? 'text-white' : 'text-white'
                                                    }`}>{portal.name}</div>
                                                    <div className={`text-xs mt-1 ${
                                                        formData.portalType === portal.id ? 'text-green-100' : 'text-orange-100'
                                                    }`}>{portal.description}</div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-black mb-2">
                                        Full Name <span className="text-orange-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-black mb-2">
                                        Email Address <span className="text-orange-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-medium text-black mb-2">
                                        Password <span className="text-orange-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors pr-12"
                                            placeholder="At least 8 characters"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters long</p>
                                </div>

                                {/* Terms */}
                                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        checked={formData.termsAccepted}
                                        onChange={(e) => setFormData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                                        className="mt-1 w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                                        required
                                    />
                                    <label htmlFor="terms" className="text-sm text-gray-600">
                                        I agree to the{' '}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                // Store current plan in localStorage for terms page
                                                localStorage.setItem('pendingTermsPlan', formData.planType || 'pro');
                                                onNavigate?.('packageTerms');
                                            }}
                                            className="text-orange-500 hover:text-orange-600 underline bg-transparent border-none p-0 cursor-pointer"
                                        >
                                            Terms and Conditions
                                        </button>{' '}
                                        and{' '}
                                        <button
                                            type="button"
                                            onClick={() => onNavigate?.('privacy')}
                                            className="text-orange-500 hover:text-orange-600 underline bg-transparent border-none p-0 cursor-pointer"
                                        >
                                            Privacy Policy
                                        </button>
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-black hover:bg-gray-800 text-white py-4 rounded-lg font-medium text-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Creating Account...' : 'Create Account & Continue'}
                                </button>

                                <p className="text-center text-sm text-gray-500">
                                    Already have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={() => onNavigate?.('providerAuth')}
                                        className="text-orange-500 hover:text-orange-600 underline font-medium bg-transparent border-none p-0 cursor-pointer"
                                    >
                                        Sign in
                                    </button>
                                </p>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SimpleSignupFlow;
