import React, { useState, useEffect } from 'react';
import { Check, Eye, EyeOff, Building2, User, Sparkles, Hotel, Star, Circle, Mail, Lock } from 'lucide-react';
import { account, ID } from '../lib/appwrite';
import { translations, getStoredLanguage } from '../translations';

type PlanType = 'pro' | 'plus';
type PortalType = 'massage_therapist' | 'massage_place' | 'facial_place' | 'hotel';
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
}

const SimpleSignupFlow: React.FC<SimpleSignupFlowProps> = ({ onNavigate, onBack }) => {
    
    const initialPlan = (localStorage.getItem('selected_membership_plan') as PlanType) || null;
    const initialPortal = (localStorage.getItem('selectedPortalType') as PortalType) || null;

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
    
    const [language, setLanguage] = useState<'en' | 'id'>(getStoredLanguage());
    const t = translations[language].auth;

    useEffect(() => {
        if (formData.planType) {
            const acceptedTerms = JSON.parse(localStorage.getItem('acceptedTerms') || '{}');
            const hasAcceptedCurrentPlan = acceptedTerms[formData.planType];
            
            if (hasAcceptedCurrentPlan && !formData.termsAccepted) {
                setFormData(prev => ({ ...prev, termsAccepted: true }));
            }
        }
    }, [formData.planType]);
    
    // Listen for language changes from home page
    useEffect(() => {
        const handleStorageChange = () => {
            const newLang = getStoredLanguage();
            if (newLang !== language) {
                setLanguage(newLang);
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [language]);

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
                'Standard listing placement',
                'Email customer service'
            ],
            badge: 'Pay Per Lead',
        },
        {
            id: 'plus' as PlanType,
            name: 'Plus',
            price: '250,000',
            commission: '0% commission - keep everything',
            features: [
                'Commission-Free Earnings',
                'Priority Hotel & Villa Partnerships',
                'Verified Professional Status',
                'Premium Listing Placement',
                'Advanced Business Analytics',
                'Automated Availability Management',
                'Dynamic Pricing Automation',
                'Dedicated Live Support',
                'Enhanced Search Visibility'
            ],
            badge: 'Most Popular',
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

        if (!formData.planType) {
            setError(t.pleaseSelectPlan);
            return;
        }
        if (!formData.portalType) {
            setError(t.pleaseSelectPortalType);
            return;
        }
        if (!formData.name.trim()) {
            setError(t.pleaseEnterName);
            return;
        }
        if (!formData.email.trim() || !formData.email.includes('@')) {
            setError(t.pleaseEnterValidEmail);
            return;
        }
        if (formData.password.length < 8) {
            setError(t.passwordMinLength);
            return;
        }
        if (!formData.termsAccepted) {
            const acceptedTerms = JSON.parse(localStorage.getItem('acceptedTerms') || '{}');
            const hasAcceptedCurrentPlan = acceptedTerms[formData.planType];
            
            if (!hasAcceptedCurrentPlan) {
                setError(t.pleaseAcceptTerms);
                return;
            }
        }

        try {
            setLoading(true);

            // Create Appwrite account
            const user = await account.create(
                ID.unique(),
                formData.email,
                formData.password,
                formData.name
            );

            // Create session automatically
            await account.createEmailSession(formData.email, formData.password);

            // Store user info
            localStorage.setItem('selected_membership_plan', formData.planType);
            localStorage.setItem('user_name', formData.name);
            localStorage.setItem('user_email', formData.email);
            localStorage.setItem('user_id', user.$id);
            localStorage.setItem('selectedPortalType', formData.portalType);

            const portalToDashboardUrl: Record<PortalType, string> = {
                'massage_therapist': 'http://localhost:3002',
                'massage_place': 'http://localhost:3005',
                'facial_place': 'http://localhost:3006',
                'hotel': 'http://localhost:3007'
            };

            const dashboardUrl = portalToDashboardUrl[formData.portalType];
            
            console.log(`✅ Account created! Redirecting to ${formData.portalType} dashboard for profile setup`);
            window.location.href = dashboardUrl;

        } catch (err: any) {
            console.error('Signup error:', err);
            if (err.code === 409) {
                setError(t.emailAlreadyExists);
            } else if (err.message.includes('password')) {
                setError(t.passwordMinLength);
            } else {
                setError(err.message || 'Failed to create account');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
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
                            onClick={() => window.location.href = 'http://localhost:3000'}
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

                {currentStep === 'plan' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <h1 className="text-4xl font-bold mb-3">
                                <span className="text-black">{t.chooseYourPlan} </span>
                                <span className="text-orange-500">{t.plan}</span>
                            </h1>
                            <p className="text-gray-500 text-lg">{t.selectYourPlan}</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                            {plans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className={`relative border-2 rounded-2xl transition-all transform hover:scale-105 ${
                                        formData.planType === plan.id 
                                            ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-white shadow-2xl' 
                                            : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-xl'
                                    }`}
                                >
                                    {plan.badge && (
                                        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-5 py-1.5 text-white text-xs font-semibold rounded-full shadow-lg ${
                                            plan.id === 'plus' ? 'bg-gradient-to-r from-orange-500 to-orange-600' : 'bg-gradient-to-r from-orange-400 to-orange-500'
                                        }`}>
                                            {plan.badge}
                                        </div>
                                    )}
                                    
                                    <div className="p-8">
                                        <div className={`flex items-center justify-between mb-6 ${plan.badge ? 'mt-2' : ''}`}>
                                            <div className={`text-sm font-semibold px-3 py-1.5 rounded-full ${
                                                plan.id === 'pro' 
                                                    ? 'text-orange-600 bg-orange-50 border border-orange-200' 
                                                    : 'text-orange-600 bg-orange-50 border border-orange-200'
                                            }`}>
                                                {plan.id === 'pro' ? 'Pay Per Lead' : 'Monthly Fee'}
                                            </div>
                                            {formData.planType === plan.id && (
                                                <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-md">
                                                    <Check className="w-4 h-4 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="mb-4">
                                            <h3 className="text-3xl font-bold text-black mb-3 flex items-center gap-2">
                                                {plan.name}
                                                <div className="flex items-center gap-0.5 ml-2">
                                                    {plan.id === 'pro' ? (
                                                        <>
                                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                            <Star className="w-4 h-4 fill-gray-300 text-gray-300" />
                                                            <Star className="w-4 h-4 fill-gray-300 text-gray-300" />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                        </>
                                                    )}
                                                </div>
                                            </h3>
                                            <p className="text-gray-500 text-sm font-medium">{plan.id === 'pro' ? 'Perfect for getting started' : 'For serious professionals'}</p>
                                        </div>

                                        <div className="mb-8 pb-6 border-b border-gray-200">
                                            <div className="flex items-baseline">
                                                <span className="text-5xl font-bold text-black">Rp {plan.price}</span>
                                                <span className="text-gray-400 ml-2 text-base">/month</span>
                                            </div>
                                            <div className={`font-semibold mt-2 text-base ${
                                                plan.id === 'pro' ? 'text-orange-600' : 'text-green-600'
                                            }`}>
                                                {plan.commission}
                                            </div>
                                        </div>

                                        <div className="space-y-3.5 text-sm mb-8">
                                            {plan.features.map((feature, idx) => (
                                                <div key={idx} className="flex items-center gap-3 text-gray-700">
                                                    <Circle className="w-2 h-2 fill-orange-500 text-orange-500" />
                                                    <span className="font-medium">{feature}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => handlePlanSelect(plan.id)}
                                            className={`w-full py-3.5 px-4 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg ${
                                                formData.planType === plan.id
                                                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white transform scale-105'
                                                    : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700'
                                            }`}
                                        >
                                            {formData.planType === plan.id ? 'Selected ✓' : 'Select Package'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {currentStep === 'account' && (
                    <div className="max-w-2xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold mb-3">
                                <span className="text-black">{t.createYourAccount} </span>
                                <span className="text-orange-500">{t.account}</span>
                            </h2>
                            <p className="text-gray-500 text-lg font-medium">{t.completeDetails}</p>
                        </div>

                        <div className="bg-white rounded-2xl border-2 border-gray-200 p-10 shadow-xl hover:shadow-2xl transition-all">
                            <form onSubmit={handleSignup} className="space-y-7">
                                <div>
                                    <label className="block text-sm font-semibold text-black mb-4">
                                        {t.selectPortalType} <span className="text-orange-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {portals.map((portal) => {
                                            const Icon = portal.icon;
                                            return (
                                                <button
                                                    key={portal.id}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, portalType: portal.id }))}
                                                    className={`p-5 rounded-xl border-2 transition-all transform hover:scale-105 text-left ${
                                                        formData.portalType === portal.id
                                                            ? 'border-green-500 bg-gradient-to-br from-green-500 to-green-600 shadow-xl'
                                                            : 'border-orange-300 bg-gradient-to-br from-orange-400 to-orange-500 hover:border-orange-500 shadow-md hover:shadow-xl'
                                                    }`}
                                                >
                                                    <Icon className="w-7 h-7 mb-2 text-white" />
                                                    <div className="font-semibold text-sm text-white">{portal.name}</div>
                                                    <div className="text-xs mt-1 text-orange-50">{portal.description}</div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-black mb-2">
                                        {t.fullName} <span className="text-orange-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full pl-12 pr-5 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 focus:bg-white transition-all font-medium"
                                            placeholder={t.fullNamePlaceholder}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-black mb-2">
                                        {t.email} <span className="text-orange-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                            className="w-full pl-12 pr-5 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 focus:bg-white transition-all font-medium"
                                            placeholder={t.emailPlaceholder}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-black mb-2">
                                        {t.password} <span className="text-orange-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                            className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 focus:bg-white transition-all font-medium"
                                            placeholder="At least 8 characters"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 font-medium">{t.passwordMinLength}</p>
                                </div>

                                <div className="flex items-start gap-3 p-5 bg-gradient-to-br from-orange-50 to-white rounded-xl border-2 border-orange-100">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        checked={formData.termsAccepted}
                                        onChange={(e) => setFormData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                                        className="mt-1 w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                                        required
                                    />
                                    <label htmlFor="terms" className="text-sm text-gray-700 font-medium">
                                        {t.iAgreeToThe}{' '}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                localStorage.setItem('pendingTermsPlan', formData.planType || 'pro');
                                                onNavigate?.('packageTerms');
                                            }}
                                            className="text-orange-500 hover:text-orange-600 underline font-semibold bg-transparent border-none p-0 cursor-pointer"
                                        >
                                            {t.termsAndConditions}
                                        </button>{' '}
                                        {t.and}{' '}
                                        <button
                                            type="button"
                                            onClick={() => onNavigate?.('privacy')}
                                            className="text-orange-500 hover:text-orange-600 underline font-semibold bg-transparent border-none p-0 cursor-pointer"
                                        >
                                            {t.privacyPolicy}
                                        </button>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                                >
                                    {loading ? (language === 'id' ? 'Membuat Akun...' : 'Creating Account...') : t.createAccountButton}
                                </button>

                                <p className="text-center text-sm text-gray-600 font-medium pt-2">
                                    {t.alreadyHaveAccount}{' '}
                                    <button
                                        type="button"
                                        onClick={() => onNavigate?.('signIn')}
                                        className="text-orange-500 hover:text-orange-600 underline font-semibold bg-transparent border-none p-0 cursor-pointer"
                                    >
                                        {t.signIn}
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