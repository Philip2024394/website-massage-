import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Building2, User, Sparkles, Hotel, Mail, Lock } from 'lucide-react';
import { account } from '../lib/appwrite';
import { translations } from '../translations';
import { useLanguage } from '../hooks/useLanguage';

type PortalType = 'massage_therapist' | 'massage_place' | 'facial_place' | 'hotel';

interface SignInPageProps {
    onNavigate?: (page: string) => void;
    onBack?: () => void;
}

const SignInPage: React.FC<SignInPageProps> = ({ onNavigate }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const { language } = useLanguage();
    const t = translations[language].auth;
    
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
        if (!formData.password.trim() || formData.password.length < 6) {
            setError(t.passwordMinLength);
            return;
        }

        setLoading(true);
        
        try {
            // Check if there's already an active session and delete it
            try {
                const session = await account.getSession('current');
                if (session) {
                    await account.deleteSession('current');
                }
            } catch (e) {
                // No active session, which is fine
            }
            
            // Create new session with Appwrite
            await account.createEmailPasswordSession(formData.email, formData.password);
            
            // Store portal type for session
            localStorage.setItem('userPortalType', formData.portalType);
            
            // Navigate based on portal type
            switch (formData.portalType) {
                case 'massage_therapist':
                    onNavigate?.('therapistDashboard');
                    break;
                case 'massage_place':
                    onNavigate?.('placeDashboard');
                    break;
                case 'facial_place':
                    onNavigate?.('facialPortal');
                    break;
                case 'hotel':
                    onNavigate?.('hotelPortal');
                    break;
                default:
                    onNavigate?.('home');
                    break;
            }
            
        } catch (err: any) {
            console.error('Sign in error:', err);
            setError(err.message || t.signInFailed);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-orange-100 p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl mb-4">
                            <Lock className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                        <p className="text-gray-600">Sign in to your account</p>
                    </div>

                    <form onSubmit={handleSignIn} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        {/* Portal Type Selection */}
                        <div className="space-y-3">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Select Your Portal
                            </label>
                            <div className="grid grid-cols-1 gap-3">
                                {portals.map((portal) => {
                                    const IconComponent = portal.icon;
                                    return (
                                        <div
                                            key={portal.id}
                                            onClick={() => setFormData(prev => ({ ...prev, portalType: portal.id }))}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                                formData.portalType === portal.id
                                                    ? 'border-orange-500 bg-orange-50 shadow-md'
                                                    : 'border-gray-200 hover:border-orange-300 hover:bg-orange-25'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className={`p-2 rounded-lg ${
                                                    formData.portalType === portal.id
                                                        ? 'bg-orange-500 text-white'
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    <IconComponent className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900">{portal.name}</h3>
                                                    <p className="text-sm text-gray-600">{portal.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Email Input */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-500 bg-white"
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                    className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-500 bg-white"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
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