import React, { useState } from 'react';
import { Eye, EyeOff, Building2, User, Sparkles, Hotel } from 'lucide-react';

type PortalType = 'massage_therapist' | 'massage_place' | 'facial_place' | 'hotel';

interface SignInPageProps {
    onNavigate?: (page: string) => void;
    onBack?: () => void;
}

const SignInPage: React.FC<SignInPageProps> = ({ onNavigate, onBack }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    
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
            setError('Please select your account type');
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

        try {
            setLoading(true);

            // TODO: Implement actual authentication with Appwrite
            // For now, simulate authentication
            localStorage.setItem('user_email', formData.email);
            localStorage.setItem('selectedPortalType', formData.portalType);

            const portalToDashboardUrl: Record<PortalType, string> = {
                'massage_therapist': 'http://localhost:3002',
                'massage_place': 'http://localhost:3005',
                'facial_place': 'http://localhost:3006',
                'hotel': 'http://localhost:3007'
            };

            const dashboardUrl = portalToDashboardUrl[formData.portalType];
            
            console.log(`✅ Sign-in successful! Redirecting to ${formData.portalType} dashboard`);
            window.location.href = dashboardUrl;

        } catch (err: any) {
            setError(err.message || 'Failed to sign in');
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
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                <div className="text-center mb-12">
                    <h2 className="text-4xl font-light text-black mb-3">Welcome Back</h2>
                    <p className="text-gray-500 text-lg">Sign in to your account to continue</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                    <form onSubmit={handleSignIn} className="space-y-6">
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
                                            <Icon className="w-6 h-6 mb-2 text-white" />
                                            <div className="font-medium text-sm text-white">{portal.name}</div>
                                            <div className={`text-xs mt-1 ${
                                                formData.portalType === portal.id ? 'text-green-100' : 'text-orange-100'
                                            }`}>{portal.description}</div>
                                        </button>
                                    );
                                })}
                            </div>
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
                                    placeholder="Enter your password"
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
                        </div>

                        {/* Forgot Password */}
                        <div className="text-right">
                            <button
                                type="button"
                                className="text-sm text-orange-500 hover:text-orange-600 underline bg-transparent border-none p-0 cursor-pointer"
                            >
                                Forgot password?
                            </button>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black hover:bg-gray-800 text-white py-4 rounded-lg font-medium text-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>

                        <p className="text-center text-sm text-gray-500">
                            Don't have an account?{' '}
                            <button
                                type="button"
                                onClick={() => onNavigate?.('membershipSignup')}
                                className="text-orange-500 hover:text-orange-600 underline font-medium bg-transparent border-none p-0 cursor-pointer"
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
