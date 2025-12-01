import React, { useState } from 'react';
import { Building, Mail, Lock, ArrowLeft } from 'lucide-react';
import { databases, DATABASE_ID, COLLECTIONS } from '../lib/appwrite';
import { Query } from 'appwrite';

interface HotelLoginPageProps {
    onNavigate?: (page: string, data?: any) => void;
    onBack?: () => void;
    onMassageJobsClick?: () => void;
    onTherapistPortalClick?: () => void;
    onMassagePlacePortalClick?: () => void;
    onCustomerPortalClick?: () => void;
    onAdminPortalClick?: () => void;
    onTermsClick?: () => void;
}

const HotelLoginPage: React.FC<HotelLoginPageProps> = ({ 
    onNavigate,
    onBack,
    onMassageJobsClick,
    onTherapistPortalClick,
    onMassagePlacePortalClick,
    onCustomerPortalClick,
    onAdminPortalClick,
    onTermsClick
}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [partnerType, setPartnerType] = useState<'hotel' | 'villa'>('hotel');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Query partners collection for matching email and password
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.PARTNERS,
                [
                    Query.equal('email', email),
                    Query.equal('password', password),
                    Query.equal('category', partnerType)
                ]
            );

            if (response.documents.length === 0) {
                setError('Invalid credentials. Please check your email and password.');
                setLoading(false);
                return;
            }

            const partner = response.documents[0];
            
            // Navigate to partner settings page
            onNavigate?.('partner-settings', { 
                partnerId: partner.$id, 
                partnerType: partner.category 
            });
        } catch (error) {
            console.error('Login error:', error);
            setError('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full">
                {/* Back Button */}
                <button
                    onClick={onBack || (() => onNavigate?.('home'))}
                    className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Back</span>
                </button>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                            <Building className="w-8 h-8 text-white" />
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-center mb-2 text-gray-900">
                        Partner Portal Login
                    </h1>
                    <p className="text-center text-gray-600 mb-6">
                        Access your hotel or villa dashboard
                    </p>

                    {/* Partner Type Toggle */}
                    <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setPartnerType('hotel')}
                            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                                partnerType === 'hotel'
                                    ? 'bg-white text-orange-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            🏨 Hotel
                        </button>
                        <button
                            type="button"
                            onClick={() => setPartnerType('villa')}
                            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                                partnerType === 'villa'
                                    ? 'bg-white text-orange-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            🏡 Villa
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="partner@hotel.com"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Logging in...' : 'Login to Dashboard'}
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-6 text-center space-y-2">
                        <button
                            onClick={() => onNavigate?.('join-indastreet-partners')}
                            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                        >
                            Don't have an account? Join as Partner
                        </button>
                        <div className="text-xs text-gray-500">
                            By logging in, you agree to our{' '}
                            <button onClick={onTermsClick} className="text-orange-600 hover:underline">
                                Terms of Service
                            </button>
                        </div>
                    </div>
                </div>

                {/* Help Text */}
                <div className="mt-6 text-center text-sm text-gray-600">
                    <p>Need help? Contact support at</p>
                    <a href="mailto:indastreet.id@gmail.com" className="text-orange-600 hover:underline font-medium">
                        indastreet.id@gmail.com
                    </a>
                </div>
            </div>
        </div>
    );
};

export default HotelLoginPage;
