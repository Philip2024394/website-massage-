import React, { useState } from 'react';
import Button from '../components/Button';
import PasswordInput from '../components/PasswordInput';
import { therapistAuth } from '../lib/auth';
import { trackDailySignIn } from '../lib/coinHooks';
import { LogIn, UserPlus, Mail } from 'lucide-react';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import { AppDrawer } from '../components/AppDrawer';
import { React19SafeWrapper } from '../components/React19SafeWrapper';
import PageNumberBadge from '../components/PageNumberBadge';

interface TherapistLoginPageProps {
    onSuccess: (therapistId: string) => void;
    onBack: () => void;
}

const HomeIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const TherapistLoginPage: React.FC<TherapistLoginPageProps> = ({ onSuccess, onBack }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetSent, setResetSent] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isSignUp) {
                // Validate password strength
                if (password.length < 8) {
                    throw new Error('Password must be at least 8 characters long');
                }

                const response = await therapistAuth.signUp(email, password);
                
                if (response.success && response.userId) {
                    setIsSignUp(false);
                    setError('✅ Account created successfully! Please sign in.');
                    setPassword('');
                    setEmail('');
                } else {
                    // Specific error messages
                    if (response.error?.includes('user with the same email already exists') || 
                        response.error?.includes('already exists')) {
                        throw new Error('❌ This email is already registered. Please sign in instead.');
                    } else if (response.error?.includes('Collection') || response.error?.includes('could not be found')) {
                        throw new Error('❌ Database setup required. Please contact administrator.');
                    } else if (response.error?.includes('Invalid email')) {
                        throw new Error('❌ Please enter a valid email address.');
                    } else if (response.error?.includes('password')) {
                        throw new Error('❌ Password must be at least 8 characters long.');
                    }
                    throw new Error('❌ ' + (response.error || 'Sign up failed. Please try again.'));
                }
            } else {
                const response = await therapistAuth.signIn(email, password);
                
                if (response.success && response.userId) {
                    // Track daily sign-in for coin rewards (only for login, not signup)
                    if (!isSignUp) {
                        try {
                            await trackDailySignIn(response.userId);
                        } catch (coinError) {
                            console.warn('Daily sign-in tracking failed:', coinError);
                        }
                    }
                    
                    // Clear any cached data
                    sessionStorage.clear();
                    localStorage.removeItem('therapist-cache');
                    
                    // 🔥 FIX: Use documentId (therapist profile) instead of userId (Appwrite account)
                    const therapistId = response.documentId || response.userId;
                    console.log('🎯 [Login Success] Passing therapist ID to dashboard:', {
                        userId: response.userId,
                        documentId: response.documentId,
                        usingId: therapistId,
                        fullResponse: response
                    });
                    
                    // Store additional session info for debugging
                    localStorage.setItem('therapist_login_debug', JSON.stringify({
                        loginTime: new Date().toISOString(),
                        userId: response.userId,
                        documentId: response.documentId,
                        usedId: therapistId
                    }));
                    
                    console.log('✅ [Login Success] About to call onSuccess with ID:', therapistId);
                    onSuccess(therapistId);
                } else {
                    // Specific error messages
                    if (response.error?.includes('Invalid credentials') || 
                        response.error?.includes('Invalid email or password')) {
                        throw new Error('❌ Incorrect email or password. Please try again.');
                    } else if (response.error?.includes('User (role: guests) missing scope') ||
                               response.error?.includes('not found')) {
                        throw new Error('❌ This email is not registered. Please create an account first.');
                    } else if (response.error?.includes('Therapist not found')) {
                        throw new Error('❌ No therapist account found with this email.');
                    } else if (response.error?.includes('Collection') || response.error?.includes('could not be found')) {
                        throw new Error('❌ Database setup required. Please contact administrator.');
                    }
                    throw new Error('❌ ' + (response.error || 'Sign in failed. Please try again.'));
                }
            }
        } catch (err: any) {
            setError(err.message || '❌ Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Import account from appwrite config
            const { account } = await import('../lib/appwrite');
            await account.createRecovery(
                resetEmail,
                window.location.origin + '/reset-password'
            );
            setResetSent(true);
            setError('✅ Password reset link sent! Please check your email.');
        } catch (err: any) {
            if (err.message?.includes('User with email') && err.message?.includes('not found')) {
                setError('❌ No account found with this email address.');
            } else {
                setError('❌ Failed to send reset email. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <PageNumberBadge pageNumber={4} pageName="TherapistLoginPage" isLocked={false} />
            
            {/* Global Header */}
            <header className="bg-white p-4 shadow-md sticky top-0 z-[9997]">
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
            <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-200 max-h-[calc(100vh-120px)] overflow-y-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2 text-gray-800">Therapist Portal</h2>
                        <p className="text-gray-600 text-sm">Sign in to manage your services and bookings</p>
                    </div>

                    {/* Current View */}
                    {viewMode === 'selectCountry' && (
                        <div>
                            <h3 className="text-xl font-semibold mb-4 text-center text-gray-700">
                                Select Your Country
                            </h3>
                            <div className="mb-6">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search countries..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-white text-gray-700"
                                    />
                                </div>
                            </div>
                            <div className="max-h-60 overflow-y-auto space-y-2">
                                {filteredCountries.map((country) => (
                                    <button
                                        key={country.code}
                                        onClick={() => handleCountrySelect(country)}
                                        className="w-full text-left p-4 rounded-lg hover:bg-orange-50 hover:shadow-md border border-gray-200 transition-all text-gray-700 bg-white"
                                    >
                                        <div className="flex items-center">
                                            <span className="text-xl mr-3">{country.flag}</span>
                                            <span className="font-medium">{country.name}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {viewMode === 'login' && (
                        <div>
                            <div className="mb-6">
                                <button
                                    onClick={() => setViewMode('selectCountry')}
                                    className="flex items-center text-orange-600 hover:text-orange-700 transition-colors mb-4 group"
                                >
                                    <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
                                    Change Country
                                </button>
                                <div className="flex items-center justify-center mb-4 p-3 bg-orange-50 rounded-xl border border-orange-200">
                                    <span className="text-2xl mr-3">{selectedCountry?.flag}</span>
                                    <span className="font-semibold text-gray-700">{selectedCountry?.name}</span>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <div className="flex rounded-xl border border-gray-300 focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 transition-all bg-white">
                                        <div className="flex items-center px-3 border-r border-gray-300 bg-gray-50 rounded-l-xl">
                                            <span className="text-sm text-gray-600">{selectedCountry?.dialCode}</span>
                                        </div>
                                        <input
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            placeholder="Enter your phone number"
                                            className="flex-1 px-4 py-3 rounded-r-xl focus:outline-none bg-white text-gray-700"
                                            required
                                        />
                                    </div>
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
                                            <span className="text-sm text-gray-600">{selectedCountry?.dialCode}</span>
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

                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        <span className="text-black">Inda</span>
                        <span className="text-orange-500">Street</span>
                    </h1>
                    <p className="text-gray-600 font-medium">Therapist Portal</p>
                </div>

                <div className="flex mb-6 bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20">
                    <button
                        onClick={() => setIsSignUp(false)}
                        className={`flex-1 py-2 px-4 rounded-md transition-all ${
                            !isSignUp ? 'bg-orange-500 shadow-lg text-white font-semibold' : 'text-white/90 hover:bg-white/5'
                        }`}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => setIsSignUp(true)}
                        className={`flex-1 py-2 px-4 rounded-md transition-all ${
                            isSignUp ? 'bg-orange-500 shadow-lg text-white font-semibold' : 'text-white/90 hover:bg-white/5'
                        }`}
                    >
                        Create Account
                    </button>
                </div>

                {error && (
                    <div className={`mb-4 p-3 rounded-lg backdrop-blur-sm ${error.includes('✅') ? 'bg-green-500/20 text-green-100 border border-green-400/30' : 'bg-red-500/20 text-red-100 border border-red-400/30'}`}>
                        {error}
                    </div>
                )}

                {showForgotPassword ? (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-white/90 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="email"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white/90 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900 placeholder-gray-500"
                                    placeholder="therapist@indastreet.com"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || resetSent}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 shadow-lg"
                        >
                            {loading ? 'Sending...' : resetSent ? 'Email Sent!' : 'Send Reset Link'}
                        </Button>

                        <button
                            type="button"
                            onClick={() => {
                                setShowForgotPassword(false);
                                setResetEmail('');
                                setResetSent(false);
                                setError('');
                            }}
                            className="w-full text-white/90 hover:text-white text-sm underline"
                        >
                            Back to Sign In
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-white/90 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900 placeholder-gray-500"
                            placeholder="therapist@indastreet.com"
                            required
                        />
                    </div>

                    <PasswordInput
                        value={password}
                        onChange={setPassword}
                        placeholder="Enter your password"
                        required
                        minLength={8}
                    />

                    {!isSignUp && (
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowForgotPassword(true)}
                                className="text-sm text-white/90 hover:text-white underline"
                            >
                                Forgot Password?
                            </button>
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 mt-6 shadow-lg flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <span key="loading">Processing...</span>
                        ) : isSignUp ? (
                            <span key="signup" className="flex items-center gap-2">
                                <UserPlus className="w-5 h-5" />
                                Create Account
                            </span>
                        ) : (
                            <span key="signin" className="flex items-center gap-2">
                                <LogIn className="w-5 h-5" />
                                Sign In
                            </span>
                        )}
                    </Button>
                </form>
                )}
            </div>
        </div>
    );
};

export default TherapistLoginPage;
