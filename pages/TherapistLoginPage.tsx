import React, { useState } from 'react';
import Button from '../components/Button';
import PasswordInput from '../components/PasswordInput';
import { therapistAuth } from '../lib/auth';
import { trackDailySignIn } from '../lib/coinHooks';
import { LogIn, UserPlus, Mail, Eye, EyeOff, ChevronLeft } from 'lucide-react';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import { AppDrawer } from '../components/AppDrawer';
import { React19SafeWrapper } from '../components/React19SafeWrapper';
import PageNumberBadge from '../components/PageNumberBadge';


interface TherapistLoginPageProps {
    onSuccess: (therapistId: string) => void;
    onBack: () => void;
}

const TherapistLoginPage: React.FC<TherapistLoginPageProps> = ({ onSuccess, onBack }) => {
    const [viewMode, setViewMode] = useState<'login' | 'register'>('login');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [registerData, setRegisterData] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        email: '',
        password: ''
    });

    // Set Indonesia as default country
    const selectedCountry = { name: "Indonesia", code: "ID", dial_code: "+62", flag: "🇮🇩" };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // For now, use email-based auth (phone auth can be added later)
            const email = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@therapist.local`;
            const response = await therapistAuth.signIn(email, password);
            
            if (response.success && response.userId) {
                // Track daily sign-in for coin rewards
                try {
                    await trackDailySignIn(response.userId);
                } catch (coinError) {
                    console.warn('Daily sign-in tracking failed:', coinError);
                }
                
                // Clear any cached data
                sessionStorage.clear();
                localStorage.removeItem('therapist-cache');
                
                const therapistId = response.documentId || response.userId;
                console.log('✅ [Login Success] About to call onSuccess with ID:', therapistId);
                onSuccess(therapistId);
            } else {
                throw new Error(response.error || 'Sign in failed. Please try again.');
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await therapistAuth.signUp(registerData.email, registerData.password);
            
            if (response.success && response.userId) {
                setViewMode('login');
                setError('✅ Account created successfully! Please sign in.');
                setPhoneNumber(registerData.phoneNumber);  // Pre-fill phone for login
                setRegisterData({
                    firstName: '',
                    lastName: '',
                    phoneNumber: '',
                    email: '',
                    password: ''
                });
            } else {
                throw new Error(response.error || 'Registration failed. Please try again.');
            }
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
            <PageNumberBadge pageNumber={4} pageName="TherapistLoginPage" isLocked={false} />
            
            {/* Global Header */}
            <header className="bg-white p-4 shadow-md z-[9997] flex-shrink-0">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        <span className="text-black">Inda</span><span className="text-orange-500">street</span>
                    </h1>
                    <div className="flex items-center gap-3 text-gray-600">
                        <button 
                            onClick={onBack}
                            className="p-2 hover:bg-gray-50 rounded-full transition-colors" 
                            title="Back to Home"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </button>

                        <button onClick={() => setIsMenuOpen(true)} title="Menu">
                            <BurgerMenuIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Global App Drawer */}
            <React19SafeWrapper condition={isMenuOpen}>
                <AppDrawer
                    isOpen={isMenuOpen}
                    onClose={() => setIsMenuOpen(false)}
                    onMassageJobsClick={() => {}}
                    onHotelPortalClick={() => {}}
                    onVillaPortalClick={() => {}}
                    onTherapistPortalClick={() => {}}
                    onMassagePlacePortalClick={() => {}}
                    onAgentPortalClick={() => {}}
                    onCustomerPortalClick={() => {}}
                    onAdminPortalClick={() => {}}
                    onTermsClick={() => {}}
                    onPrivacyClick={() => {}}
                    therapists={[]}
                    places={[]}
                />
            </React19SafeWrapper>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 border border-gray-200 max-h-full overflow-y-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2 text-gray-800">Therapist Portal</h2>
                        <p className="text-gray-600 text-sm">Sign in to manage your services and bookings</p>
                    </div>

                    {error && (
                        <div className={`mb-6 p-3 rounded-lg ${
                            error.includes('✅') 
                                ? 'bg-green-50 text-green-700 border border-green-200' 
                                : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                            {error}
                        </div>
                    )}

                    {/* Current View */}
                    {viewMode === 'login' && (
                        <div>
                            <div className="mb-6">
                                <div className="flex items-center justify-center mb-4 p-3 bg-orange-50 rounded-xl border border-orange-200">
                                    <span className="text-2xl mr-3">{selectedCountry.flag}</span>
                                    <span className="font-semibold text-gray-700">{selectedCountry.name}</span>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="Enter your email address"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-white text-gray-700"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                            className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-white text-gray-700"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                            Signing In...
                                        </div>
                                    ) : (
                                        'Sign In'
                                    )}
                                </button>
                            </form>

                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <p className="text-center text-sm text-gray-600">
                                    New to our platform?{' '}
                                    <button
                                        onClick={() => setViewMode('register')}
                                        className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
                                    >
                                        Create Account
                                    </button>
                                </p>
                            </div>
                        </div>
                    )}

                    {viewMode === 'register' && (
                        <div>
                            <div className="mb-6">
                                <button
                                    onClick={() => setViewMode('login')}
                                    className="flex items-center text-orange-600 hover:text-orange-700 transition-colors mb-4 group"
                                >
                                    <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
                                    Back to Sign In
                                </button>
                                <h3 className="text-xl font-semibold text-center text-gray-700">
                                    Create Your Account
                                </h3>
                            </div>

                            <form onSubmit={handleRegisterSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            value={registerData.firstName}
                                            onChange={(e) => setRegisterData(prev => ({ ...prev, firstName: e.target.value }))}
                                            placeholder="First name"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-white text-gray-700"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            value={registerData.lastName}
                                            onChange={(e) => setRegisterData(prev => ({ ...prev, lastName: e.target.value }))}
                                            placeholder="Last name"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-white text-gray-700"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <div className="flex rounded-xl border border-gray-300 focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 transition-all bg-white">
                                        <div className="flex items-center px-3 border-r border-gray-300 bg-gray-50 rounded-l-xl">
                                            <span className="text-sm text-gray-600">{selectedCountry.dial_code}</span>
                                        </div>
                                        <input
                                            type="tel"
                                            value={registerData.phoneNumber}
                                            onChange={(e) => setRegisterData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                            placeholder="Enter your phone number"
                                            className="flex-1 px-4 py-3 rounded-r-xl focus:outline-none bg-white text-gray-700"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={registerData.email}
                                        onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                                        placeholder="Enter your email"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-white text-gray-700"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={registerData.password}
                                            onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                                            placeholder="Create a password"
                                            className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-white text-gray-700"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                            Creating Account...
                                        </div>
                                    ) : (
                                        'Create Account'
                                    )}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TherapistLoginPage;