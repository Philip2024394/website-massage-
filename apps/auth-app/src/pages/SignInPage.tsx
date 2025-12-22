import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Building2, User, Sparkles, Hotel, Mail, Lock } from 'lucide-react';
import { account } from '../lib/appwrite';
import { translations, getStoredLanguage } from '../translations';

type PortalType = 'massage_therapist' | 'massage_place' | 'facial_place' | 'hotel';

interface SignInPageProps {
    onNavigate?: (page: string) => void;
    onBack?: () => void;
}

const SignInPage: React.FC<SignInPageProps> = ({ onNavigate }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [language, setLanguage] = useState<'en' | 'id'>(getStoredLanguage());
    const t = translations[language].auth;
    
    // Listen for language changes
    useEffect(() => {
        const handleStorageChange = () => {
            setLanguage(getStoredLanguage());
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);
    
    const [formData, setFormData] = useState({
        portalType: null as PortalType | null,
        email: '',
        password: '',
    });

    const portals = [
        { id: 'massage_therapist' as PortalType, name: 'Massage Therapist', icon: User, description: 'Offer home service massage' },
        { id: 'massage_place' as PortalType, name: 'Massage Spa', icon: Building2, description: 'Spa or wellness center' },
        { id: 'facial_place' as PortalType, name: 'Facial Clinic', icon: Sparkles, description: 'Beauty and facial clinic' },
        { id: 'hotel' as PortalType, name: 'Hotel/Villa', icon: Hotel, description: 'Hotel or villa with spa' },
    ];

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.portalType) {
            setError(t.pleaseSelectPortalType);
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

        try {
            setLoading(true);

            // Trim email and password to remove any whitespace
            const email = formData.email.trim().toLowerCase();
            const password = formData.password.trim();

            console.log('🔐 Attempting sign-in with email:', email);
            console.log('🔐 Portal type:', formData.portalType);

            // Delete any existing session first to avoid "session already exists" error
            try {
                await account.deleteSession('current');
                console.log('🗑️ Deleted existing session');
            } catch (sessionError) {
                console.log('ℹ️ No existing session to delete (this is normal)');
            }

            // Authenticate with Appwrite
            const session = await account.createEmailPasswordSession(email, password);
            
            console.log('✅ Session created:', session);
            
            // Store user info and portal type
            localStorage.setItem('user_email', email);
            localStorage.setItem('selectedPortalType', formData.portalType);
            localStorage.setItem('session_id', session.$id);

            const isProduction = !window.location.origin.includes('localhost');
            const dashboardUrls: Record<string, string> = isProduction ? {
                'massage_therapist': 'https://therapist.indastreet.com',
                'massage_place': 'https://place.indastreet.com',
                'facial_place': 'https://facial.indastreet.com',
                'hotel': 'https://hotel.indastreet.com'
            } : {
                'massage_therapist': 'http://localhost:3003',
                'massage_place': 'http://localhost:3002',
                'facial_place': 'http://localhost:3006',
                'hotel': 'http://localhost:3007'
            };

            const dashboardUrl = dashboardUrls[formData.portalType];
            
            console.log(`✅ Sign-in successful! Redirecting to ${formData.portalType} dashboard at ${dashboardUrl}`);
            window.location.href = dashboardUrl;

        } catch (err: any) {
            console.error('❌ Sign-in error details:', err);
            console.error('❌ Error code:', err.code);
            console.error('❌ Error type:', err.type);
            console.error('❌ Error message:', err.message);
            
            if (err.code === 401 || err.type === 'user_invalid_credentials') {
                setError('Invalid email or password. Please check your credentials and try again.');
            } else if (err.type === 'user_blocked') {
                setError('Your account has been blocked. Please contact support.');
            } else if (err.message.includes('user_not_found')) {
                setError('No account found with this email. Please sign up first.');
            } else {
                setError(err.message || 'Failed to sign in. Please try again.');
            }
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

            <div className="max-w-2xl mx-auto px-6 py-16">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 font-medium">
                        {error}
                    </div>
                )}

                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-3">
                        <span className="text-black">{t.welcomeBack} </span>
                        <span className="text-orange-500">{t.back}</span>
                    </h2>
                    <p className="text-gray-500 text-lg font-medium">{t.signInToYourAccount}</p>
                </div>

                <div className="bg-white rounded-2xl border-2 border-gray-200 p-10 shadow-xl hover:shadow-2xl transition-all">
                    <form onSubmit={handleSignIn} className="space-y-7">
                        {/* Account Type */}
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
                                            {/* @ts-ignore */}
                                            <Icon size={28} className="mb-2 text-white" />
                                            <div className="font-semibold text-sm text-white">{portal.name}</div>
                                            <div className="text-xs mt-1 text-orange-50">{portal.description}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-black mb-2">
                                {t.email} <span className="text-orange-500">*</span>
                            </label>
                            <div className="relative">
                                {/* @ts-ignore */}
                                <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full pl-12 pr-5 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 focus:bg-white transition-all font-medium"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-black mb-2">
                                Password <span className="text-orange-500">*</span>
                            </label>
                            <div className="relative">
                                {/* @ts-ignore */}
                                <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                    className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 focus:bg-white transition-all font-medium"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                                >
                                    {/* @ts-ignore */}
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Forgot Password */}
                        <div className="text-right">
                            <button
                                type="button"
                                onClick={() => onNavigate?.('forgotPassword')}
                                className="text-sm text-orange-500 hover:text-orange-600 underline font-semibold bg-transparent border-none p-0 cursor-pointer"
                            >
                                Forgot password?
                            </button>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>

                        <p className="text-center text-sm text-gray-600 font-medium pt-2">
                            Don't have an account?{' '}
                            <button
                                type="button"
                                onClick={() => onNavigate?.('membershipSignup')}
                                className="text-orange-500 hover:text-orange-600 underline font-semibold bg-transparent border-none p-0 cursor-pointer"
                            >
                                Create account
                            </button>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SignInPage;
