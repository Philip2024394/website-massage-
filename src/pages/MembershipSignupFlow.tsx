import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, ArrowLeft, Upload, Clock, AlertTriangle, User, Building2, Sparkles } from 'lucide-react';
import { membershipSignupService, type PlanType, type PortalType, type MembershipSignup } from '../../lib/services/membershipSignup.service';

type Step = 'plan' | 'terms' | 'portal' | 'account' | 'profile' | 'payment';

interface FormData {
    planType: PlanType | null;
    termsAccepted: boolean;
    portalType: PortalType | null;
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    whatsapp: string;
}

const STEPS: { id: Step; title: string; description: string }[] = [
    { id: 'plan', title: 'Select Plan', description: 'Choose Pro or Plus' },
    { id: 'terms', title: 'Terms', description: 'Review & accept' },
    { id: 'portal', title: 'Portal', description: 'Select your type' },
    { id: 'account', title: 'Account', description: 'Create login' },
    { id: 'profile', title: 'Profile', description: 'Upload details' },
    { id: 'payment', title: 'Payment', description: 'Submit proof' },
];

const MembershipSignupFlow: React.FC = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const initialPlan = params.get('plan') as PlanType || null;
    const initialStep = (params.get('step') as Step) || 'plan';

    const [currentStep, setCurrentStep] = useState<Step>(initialStep);
    const [formData, setFormData] = useState<FormData>({
        planType: initialPlan,
        termsAccepted: localStorage.getItem('membership_terms_accepted') === 'true',
        portalType: null,
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        whatsapp: '',
    });
    const [signupId, setSignupId] = useState<string | null>(null);
    const [memberId, setMemberId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentDeadline, setPaymentDeadline] = useState<string | null>(null);
    const [countdown, setCountdown] = useState({ hours: 5, minutes: 0, seconds: 0, expired: false });

    // Initialize signup if coming from terms acceptance
    useEffect(() => {
        const initializeFromTerms = async () => {
            if (initialStep === 'portal' && initialPlan && !signupId) {
                try {
                    setLoading(true);
                    let ip = '0.0.0.0';
                    try {
                        const res = await fetch('https://api.ipify.org?format=json');
                        const data = await res.json();
                        ip = data.ip;
                    } catch { /* ignore */ }

                    const signup = await membershipSignupService.initializeSignup(initialPlan, ip, navigator.userAgent);
                    setSignupId(signup.$id);
                    
                    // Accept terms automatically since they already accepted on previous page
                    await membershipSignupService.acceptTerms(signup.$id);
                } catch (err: any) {
                    setError(err.message || 'Failed to initialize signup');
                    setCurrentStep('plan');
                } finally {
                    setLoading(false);
                }
            }
        };

        initializeFromTerms();
    }, [initialStep, initialPlan, signupId]);

    // Countdown timer for payment deadline
    useEffect(() => {
        if (!paymentDeadline) return;

        const interval = setInterval(() => {
            const remaining = membershipSignupService.getRemainingTime(paymentDeadline);
            setCountdown(remaining);

            if (remaining.expired) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [paymentDeadline]);

    const stepIndex = STEPS.findIndex(s => s.id === currentStep);

    const handlePlanSelect = async (plan: PlanType) => {
        setFormData(prev => ({ ...prev, planType: plan }));
        setError(null);
        
        try {
            setLoading(true);
            // Get IP and user agent
            let ip = '0.0.0.0';
            try {
                const res = await fetch('https://api.ipify.org?format=json');
                const data = await res.json();
                ip = data.ip;
            } catch { /* ignore */ }

            const signup = await membershipSignupService.initializeSignup(plan, ip, navigator.userAgent);
            setSignupId(signup.$id);
            setCurrentStep('terms');
        } catch (err: any) {
            setError(err.message || 'Failed to initialize signup');
        } finally {
            setLoading(false);
        }
    };

    const handleTermsAccept = async () => {
        if (!signupId) return;
        
        try {
            setLoading(true);
            await membershipSignupService.acceptTerms(signupId);
            setFormData(prev => ({ ...prev, termsAccepted: true }));
            setCurrentStep('portal');
        } catch (err: any) {
            setError(err.message || 'Failed to accept terms');
        } finally {
            setLoading(false);
        }
    };

    const handlePortalSelect = async (portal: PortalType) => {
        if (!signupId) return;
        
        try {
            setLoading(true);
            await membershipSignupService.selectPortal(signupId, portal);
            setFormData(prev => ({ ...prev, portalType: portal }));
            setCurrentStep('account');
        } catch (err: any) {
            setError(err.message || 'Failed to select portal');
        } finally {
            setLoading(false);
        }
    };

    const handleAccountCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!signupId) return;

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        try {
            setLoading(true);
            const result = await membershipSignupService.createAccount(
                signupId,
                formData.email,
                formData.password,
                formData.name
            );
            setMemberId(result.memberId);
            setCurrentStep('profile');
        } catch (err: any) {
            setError(err.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileComplete = async () => {
        if (!signupId || !memberId) return;

        try {
            setLoading(true);
            await membershipSignupService.completeProfile(signupId, memberId);
            
            if (formData.planType === 'pro') {
                // Pro users: Go directly to dashboard (30% commission, no payment needed)
                navigate(`/${formData.portalType?.replace('_', '-')}/dashboard`);
            } else {
                // Plus users: Show payment page (Rp 250,000/month)
                const signup = await membershipSignupService.submitGoLive(signupId);
                if (signup.paymentDeadline) {
                    setPaymentDeadline(signup.paymentDeadline);
                }
                setCurrentStep('payment');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to complete profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentProofUpload = async (file: File, bankName: string, accountName: string) => {
        if (!signupId) return;

        try {
            setLoading(true);
            await membershipSignupService.uploadPaymentProof(
                signupId,
                file,
                bankName,
                accountName,
                'bank_transfer'
            );
            // Redirect to dashboard
            navigate(`/${formData.portalType?.replace('_', '-')}/dashboard?payment=pending`);
        } catch (err: any) {
            setError(err.message || 'Failed to upload payment proof');
        } finally {
            setLoading(false);
        }
    };

    const goBack = () => {
        const prevIndex = stepIndex - 1;
        if (prevIndex >= 0) {
            setCurrentStep(STEPS[prevIndex].id);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-medium">Back</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-black text-white font-bold flex items-center justify-center text-sm">I</div>
                        <span className="font-light text-lg">Inda<span className="text-orange-500 font-medium">Street</span></span>
                    </div>
                </div>
            </header>

            {/* Progress Steps */}
            <div className="bg-gray-50 border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-center">
                        <div className="flex items-center space-x-8">
                            {STEPS.map((step, index) => (
                                <div key={step.id} className="flex items-center">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                                            index < stepIndex ? 'bg-orange-500 text-white' :
                                            index === stepIndex ? 'bg-black text-white' :
                                            'bg-gray-200 text-gray-400'
                                        }`}>
                                            {index < stepIndex ? <Check className="w-4 h-4" /> : index + 1}
                                        </div>
                                        <div className="mt-2 text-center">
                                            <p className={`text-xs font-medium ${index <= stepIndex ? 'text-black' : 'text-gray-400'}`}>
                                                {step.title}
                                            </p>
                                        </div>
                                    </div>
                                    {index < STEPS.length - 1 && (
                                        <div className={`w-12 h-px mx-4 ${index < stepIndex ? 'bg-orange-300' : 'bg-gray-200'}`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="bg-red-50 border-b border-red-200">
                    <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-2 text-red-700 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        {error}
                        <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">×</button>
                    </div>
                </div>
            )}

            {/* Payment Deadline Banner */}
            {paymentDeadline && currentStep === 'payment' && !countdown.expired && (
                <div className="bg-orange-50 border-b border-orange-200">
                    <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-2 text-orange-700 text-sm">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">Payment deadline:</span>
                        <span className="font-mono font-bold">
                            {String(countdown.hours).padStart(2, '0')}:{String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}
                        </span>
                        <span className="text-orange-600">remaining</span>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-6 py-16">
                {/* Step 1: Plan Selection */}
                {currentStep === 'plan' && (
                    <PlanSelectionStep
                        selectedPlan={formData.planType}
                        onSelect={handlePlanSelect}
                        loading={loading}
                    />
                )}

                {/* Step 2: Terms */}
                {currentStep === 'terms' && (
                    <TermsStep
                        planType={formData.planType!}
                        onAccept={handleTermsAccept}
                        onBack={goBack}
                        loading={loading}
                    />
                )}

                {/* Step 3: Portal Selection */}
                {currentStep === 'portal' && (
                    <PortalSelectionStep
                        selectedPortal={formData.portalType}
                        onSelect={handlePortalSelect}
                        onBack={goBack}
                        loading={loading}
                    />
                )}

                {/* Step 4: Account Creation */}
                {currentStep === 'account' && (
                    <AccountCreationStep
                        formData={formData}
                        setFormData={setFormData}
                        onSubmit={handleAccountCreate}
                        onBack={goBack}
                        loading={loading}
                    />
                )}

                {/* Step 5: Profile Upload */}
                {currentStep === 'profile' && (
                    <ProfileUploadStep
                        portalType={formData.portalType!}
                        memberId={memberId!}
                        onComplete={handleProfileComplete}
                        onBack={goBack}
                        loading={loading}
                    />
                )}

                {/* Step 6: Payment */}
                {currentStep === 'payment' && (
                    <PaymentStep
                        planType={formData.planType!}
                        deadline={paymentDeadline}
                        countdown={countdown}
                        onUpload={handlePaymentProofUpload}
                        onSkip={() => navigate(`/${formData.portalType?.replace('_', '-')}/dashboard`)}
                        loading={loading}
                    />
                )}
            </main>
        </div>
    );
};

// Step Components

const PlanSelectionStep: React.FC<{
    selectedPlan: PlanType | null;
    onSelect: (plan: PlanType) => void;
    loading: boolean;
}> = ({ selectedPlan, onSelect, loading }) => (
    <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-light text-black mb-3">Choose Your Plan</h1>
            <p className="text-gray-500 text-lg">Simple pricing that grows with you</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Pro Plan - Minimalistic */}
            <div
                className={`relative border rounded-xl transition-all cursor-pointer ${
                    selectedPlan === 'pro' 
                        ? 'border-orange-500 bg-white shadow-lg' 
                        : 'border-gray-200 bg-white hover:border-orange-200 hover:shadow-md'
                }`}
                onClick={() => onSelect('pro')}
            >
                <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                            Pay Per Lead
                        </div>
                        {selectedPlan === 'pro' && (
                            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                            </div>
                        )}
                    </div>
                    
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-black mb-2">Pro</h3>
                        <p className="text-gray-500 text-sm">Perfect for getting started</p>
                    </div>

                    <div className="mb-8">
                        <div className="flex items-baseline">
                            <span className="text-5xl font-light text-black">Rp 0</span>
                            <span className="text-gray-400 ml-2">/month</span>
                        </div>
                        <div className="text-orange-600 font-medium mt-1">+ 30% commission per booking</div>
                    </div>

                    <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3 text-gray-600">
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <span>No upfront payment</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <span>Full booking system</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <span>Standard placement</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Plus Plan - Minimalistic Premium */}
            <div
                className={`relative border rounded-xl transition-all cursor-pointer ${
                    selectedPlan === 'plus' 
                        ? 'border-orange-500 bg-white shadow-lg' 
                        : 'border-gray-200 bg-white hover:border-orange-200 hover:shadow-md'
                }`}
                onClick={() => onSelect('plus')}
            >
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-black text-white px-4 py-1 rounded-full text-xs font-medium">
                        Most Popular
                    </div>
                </div>
                
                <div className="p-8">
                    <div className="flex items-center justify-between mb-6 mt-2">
                        <div className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                            Monthly Fee
                        </div>
                        {selectedPlan === 'plus' && (
                            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                            </div>
                        )}
                    </div>
                    
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-black mb-2">Plus</h3>
                        <p className="text-gray-500 text-sm">For serious professionals</p>
                    </div>

                    <div className="mb-8">
                        <div className="flex items-baseline">
                            <span className="text-5xl font-light text-black">Rp 250K</span>
                            <span className="text-gray-400 ml-2">/month</span>
                        </div>
                        <div className="text-green-600 font-medium mt-1">0% commission - keep everything</div>
                    </div>

                    <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3 text-gray-600">
                            <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                            <span>Zero commission fees</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                            <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                            <span>Priority hotel requests</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                            <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                            <span>Verified badge</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const TermsStep: React.FC<{
    planType: PlanType;
    onAccept: () => void;
    onBack: () => void;
    loading: boolean;
}> = ({ planType, onAccept, onBack, loading }) => {
    const [checked, setChecked] = useState(false);
    const isPro = planType === 'pro';

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Terms & Conditions</h1>
                <p className="text-gray-600">{isPro ? 'Pro Plan' : 'Plus Plan'} Agreement</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 max-h-96 overflow-y-auto space-y-4 text-sm text-gray-700">
                {isPro ? (
                    <>
                        <p className="text-red-600 font-semibold">⚠ Critical Compliance Notice</p>
                        <p>Violating platform rules results in immediate termination with no refund.</p>
                        <p className="text-gray-700 font-medium">Price menu slider is included on your Pro profile (same as Plus).</p>
                        
                        <h4 className="font-semibold text-gray-900 mt-4">Commission Framework</h4>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>30% processing fee per completed booking</li>
                            <li>Pay within 3 hours of receiving each lead</li>
                            <li>Late payments trigger instant account freeze</li>
                        </ul>

                        <h4 className="font-semibold mt-4 text-red-600">Platform Exclusivity Rules</h4>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>No sharing personal contact with platform customers</li>
                            <li>No accepting payments outside IndaStreet</li>
                            <li>Off-platform activity leads to termination</li>
                        </ul>

                        <h4 className="font-semibold text-gray-900 mt-4">5-Hour Payment Window</h4>
                        <p>After submitting your profile, you have 5 hours to upload payment proof or your account will be deactivated.</p>
                    </>
                ) : (
                    <>
                        <h4 className="font-semibold text-gray-900">Core Inclusions</h4>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Rp 250,000/month with 0% commission</li>
                            <li>Verified badge and premium placement</li>
                            <li>Advanced analytics and priority support</li>
                            <li className="font-medium text-orange-700">Priority access to Hotels, Villas & Private Spa Resort service requests</li>
                            <li className="font-medium text-orange-700">Add your full price menu slider with unlimited services</li>
                        </ul>

                        <h4 className="font-semibold text-gray-900 mt-4">Payment Schedule</h4>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>No contract commitment</li>
                            <li>Due on the 1st, grace period until the 5th</li>
                            <li>Rp 25,000 late fee applies (administration)</li>
                        </ul>

                        <h4 className="font-semibold text-gray-900 mt-4">5-Hour Payment Window</h4>
                        <p>After submitting your profile, you have 5 hours to upload payment proof or your account will be deactivated.</p>
                    </>
                )}
            </div>

            <label className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                    className="mt-0.5 w-5 h-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">
                    I have read and agree to all terms and conditions, including the 5-hour payment deadline policy.
                </span>
            </label>

            <div className="flex gap-3">
                <button
                    onClick={onBack}
                    className="px-6 py-3 text-gray-600 hover:text-gray-900"
                >
                    Back
                </button>
                <button
                    onClick={onAccept}
                    disabled={!checked || loading}
                    className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? 'Processing...' : 'Accept & Continue'}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
        </div>
    );
};

const PortalSelectionStep: React.FC<{
    selectedPortal: PortalType | null;
    onSelect: (portal: PortalType) => void;
    onBack: () => void;
    loading: boolean;
}> = ({ selectedPortal, onSelect, onBack, loading }) => (
    <div className="space-y-8">
        <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Select Your Portal</h1>
            <p className="text-gray-600">Choose the type of service you provide</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
            <button
                onClick={() => onSelect('massage_therapist')}
                disabled={loading}
                className={`p-6 rounded-2xl border-2 text-left transition-all ${
                    selectedPortal === 'massage_therapist' 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-200 hover:border-gray-300'
                }`}
            >
                <User className={`w-10 h-10 mb-4 ${selectedPortal === 'massage_therapist' ? 'text-orange-600' : 'text-gray-400'}`} />
                <h3 className="font-bold text-gray-900 mb-1">Therapist</h3>
                <p className="text-sm text-gray-600">Individual massage therapist providing mobile or home services</p>
            </button>

            <button
                onClick={() => onSelect('massage_place')}
                disabled={loading}
                className={`p-6 rounded-2xl border-2 text-left transition-all ${
                    selectedPortal === 'massage_place' 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-200 hover:border-gray-300'
                }`}
            >
                <Building2 className={`w-10 h-10 mb-4 ${selectedPortal === 'massage_place' ? 'text-orange-600' : 'text-gray-400'}`} />
                <h3 className="font-bold text-gray-900 mb-1">Massage Place</h3>
                <p className="text-sm text-gray-600">Spa, salon, or massage center with fixed location</p>
            </button>

            <button
                onClick={() => onSelect('facial_place')}
                disabled={loading}
                className={`p-6 rounded-2xl border-2 text-left transition-all ${
                    selectedPortal === 'facial_place' 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-200 hover:border-gray-300'
                }`}
            >
                <Sparkles className={`w-10 h-10 mb-4 ${selectedPortal === 'facial_place' ? 'text-orange-600' : 'text-gray-400'}`} />
                <h3 className="font-bold text-gray-900 mb-1">Facial Place</h3>
                <p className="text-sm text-gray-600">Beauty clinic or facial treatment center</p>
            </button>
        </div>

        <button
            onClick={onBack}
            className="px-6 py-3 text-gray-600 hover:text-gray-900"
        >
            Back
        </button>
    </div>
);

const AccountCreationStep: React.FC<{
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    onSubmit: (e: React.FormEvent) => void;
    onBack: () => void;
    loading: boolean;
}> = ({ formData, setFormData, onSubmit, onBack, loading }) => (
    <form onSubmit={onSubmit} className="space-y-6 max-w-md mx-auto">
        <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Set up your login credentials</p>
        </div>

        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Your full name"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="your@email.com"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="+62 812 3456 7890"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    minLength={8}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Min. 8 characters"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Confirm password"
                />
            </div>
        </div>

        <div className="flex gap-3">
            <button
                type="button"
                onClick={onBack}
                className="px-6 py-3 text-gray-600 hover:text-gray-900"
            >
                Back
            </button>
            <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 disabled:bg-gray-300 flex items-center justify-center gap-2"
            >
                {loading ? 'Creating...' : 'Create Account'}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
        </div>
    </form>
);

const ProfileUploadStep: React.FC<{
    portalType: PortalType;
    memberId: string;
    onComplete: () => void;
    onBack: () => void;
    loading: boolean;
}> = ({ portalType, memberId, onComplete, onBack, loading }) => {
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfileImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const portalLabel = portalType === 'massage_therapist' ? 'Therapist' : 
                        portalType === 'massage_place' ? 'Massage Place' : 'Facial Place';

    return (
        <div className="space-y-6 max-w-md mx-auto">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
                <p className="text-gray-600">Upload your {portalLabel} profile details</p>
            </div>

            <div className="space-y-4">
                {/* Profile Image Upload */}
                <div className="flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden mb-4">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <Upload className="w-8 h-8 text-gray-400" />
                        )}
                    </div>
                    <label className="cursor-pointer text-sm text-orange-600 hover:text-orange-700 font-medium">
                        Upload Profile Photo
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                    </label>
                </div>

                <div className="bg-orange-50 rounded-xl p-4 text-sm text-orange-800">
                    <p className="font-medium mb-2">📝 Complete your profile in the dashboard</p>
                    <p>After this step, you'll be redirected to your dashboard where you can:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Add services and pricing</li>
                        <li>Set your location</li>
                        <li>Upload gallery images</li>
                        <li>Set availability</li>
                    </ul>
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onBack}
                    className="px-6 py-3 text-gray-600 hover:text-gray-900"
                >
                    Back
                </button>
                <button
                    onClick={onComplete}
                    disabled={loading}
                    className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 disabled:bg-gray-300 flex items-center justify-center gap-2"
                >
                    {loading ? 'Submitting...' : 'Submit & Go Live'}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
        </div>
    );
};

const PaymentStep: React.FC<{
    planType: PlanType;
    deadline: string | null;
    countdown: { hours: number; minutes: number; seconds: number; expired: boolean };
    onUpload: (file: File, bankName: string, accountName: string) => void;
    onSkip: () => void;
    loading: boolean;
}> = ({ planType, deadline, countdown, onUpload, onSkip, loading }) => {
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [bankName, setBankName] = useState('');
    const [accountName, setAccountName] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProofFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = () => {
        if (proofFile && bankName && accountName) {
            onUpload(proofFile, bankName, accountName);
        }
    };

    const amount = planType === 'plus' ? 'Rp 250,000' : 'Rp 0 (Commission-based)';

    return (
        <div className="space-y-6 max-w-md mx-auto">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload Payment Proof</h1>
                <p className="text-gray-600">Complete your registration</p>
            </div>

            {/* Countdown Warning */}
            {!countdown.expired && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-orange-700 mb-2">
                        <Clock className="w-5 h-5" />
                        <span className="font-semibold">Payment Deadline</span>
                    </div>
                    <div className="text-3xl font-mono font-bold text-orange-600">
                        {String(countdown.hours).padStart(2, '0')}:{String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}
                    </div>
                    <p className="text-sm text-orange-600 mt-2">
                        Upload payment proof within 5 hours or your account will be deactivated.
                    </p>
                </div>
            )}

            {countdown.expired && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                    <AlertTriangle className="w-5 h-5 mb-2" />
                    <p className="font-semibold">Deadline Expired</p>
                    <p className="text-sm">Your account has been deactivated. Please contact support.</p>
                </div>
            )}

            {/* Bank Details */}
            <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Transfer to:</p>
                <div className="space-y-1 text-sm">
                    <p><span className="text-gray-500">Bank:</span> <span className="font-medium">BCA</span></p>
                    <p><span className="text-gray-500">Account:</span> <span className="font-medium">1234567890</span></p>
                    <p><span className="text-gray-500">Name:</span> <span className="font-medium">PT IndaStreet Indonesia</span></p>
                    <p><span className="text-gray-500">Amount:</span> <span className="font-bold text-orange-600">{amount}</span></p>
                </div>
            </div>

            {/* Upload Form */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Bank Name</label>
                    <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                        placeholder="e.g., BCA, Mandiri, BNI"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                    <input
                        type="text"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                        placeholder="Name on your bank account"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Proof</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-orange-400 transition-colors">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Proof" className="max-h-48 mx-auto mb-2 rounded" />
                        ) : (
                            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        )}
                        <label className="cursor-pointer text-sm text-orange-600 hover:text-orange-700 font-medium">
                            {previewUrl ? 'Change Image' : 'Upload Screenshot'}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <button
                    onClick={handleSubmit}
                    disabled={!proofFile || !bankName || !accountName || loading || countdown.expired}
                    className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? 'Uploading...' : 'Submit Payment Proof'}
                </button>
                <button
                    onClick={onSkip}
                    className="w-full py-3 text-gray-600 hover:text-gray-900 text-sm"
                >
                    Skip for now (Go to Dashboard)
                </button>
                <p className="text-xs text-center text-gray-500">
                    You can minimize and use your dashboard while pending verification
                </p>
            </div>
        </div>
    );
};

export default MembershipSignupFlow;
