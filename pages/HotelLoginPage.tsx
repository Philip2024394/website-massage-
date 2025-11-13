import React, { useState } from 'react';
import { hotelAuth } from '../lib/auth';
import { saveSessionCache } from '../lib/sessionManager';
import { checkRateLimit, handleAppwriteError, resetRateLimit } from '../lib/rateLimitUtils';
import { trackDailySignIn } from '../lib/coinHooks';
import { LogIn, UserPlus, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import PasswordInput from '../components/PasswordInput';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import { AppDrawer } from '../components/AppDrawer';
import { React19SafeWrapper } from '../components/React19SafeWrapper';
import PageNumberBadge from '../components/PageNumberBadge';

interface HotelLoginPageProps {
    onSuccess: (hotelId: string) => void;
    onBack: () => void;
    t: (key: string, params?: Record<string, any>) => string; // Translation function type
}

const HomeIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const HotelLoginPage: React.FC<HotelLoginPageProps> = ({ onSuccess, onBack }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Make rate limit reset functions available in browser console for testing
    React.useEffect(() => {
        (window as any).resetHotelRateLimit = () => {
            resetRateLimit('hotel-login');
            resetRateLimit('hotel-signup');
            console.log('✅ Hotel rate limits reset! You can now try logging in again.');
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validate inputs
            if (!email || !password) {
                setError('Please enter both email and password');
                setLoading(false);
                return;
            }

            if (password.length < 8) {
                setError('Password must be at least 8 characters');
                setLoading(false);
                return;
            }

            // Rate limiting
            const operation = isSignUp ? 'hotel-signup' : 'hotel-login';
            const maxAttempts = isSignUp ? 3 : 5;
            const windowMs = isSignUp ? 600000 : 300000; // 10 min for signup, 5 min for login

            if (!checkRateLimit(operation, maxAttempts, windowMs)) {
                setError(`Too many ${isSignUp ? 'signup' : 'login'} attempts. Please wait before trying again.`);
                setLoading(false);
                return;
            }

            console.log(`🔄 Starting hotel ${isSignUp ? 'signup' : 'login'} for:`, email);

            if (isSignUp) {
                const response = await hotelAuth.signUp(email, password);
                
                if (response.success) {
                    console.log('✅ Hotel account created successfully!');
                    setIsSignUp(false);
                    setError('✅ Account created successfully! Please sign in.');
                    setPassword('');
                } else {
                    throw new Error(response.error || 'Sign up failed');
                }
            } else {
                const response = await hotelAuth.signIn(email, password);
                
                if (response.success && response.userId) {
                    // Authentication successful - save session cache
                    saveSessionCache({
                        type: 'hotel',
                        id: response.userId,
                        email: email,
                        documentId: response.documentId || '',
                        data: { $id: response.userId, email }
                    });
                    
                    // Track daily sign-in for coin rewards (only for login, not signup)
                    if (!isSignUp) {
                        try {
                            await trackDailySignIn(response.userId, 1, 'hotel');
                        } catch (coinError) {
                            console.warn('Daily sign-in tracking failed:', coinError);
                        }
                    }
                    
                    console.log('✅ Hotel login successful');
                    onSuccess(response.userId);
                } else {
                    throw new Error(response.error || 'Sign in failed');
                }
            }
        } catch (err: unknown) {
            const error = err as Error;
            console.error(`Hotel ${isSignUp ? 'signup' : 'login'} error:`, error);
            setError(handleAppwriteError(error, isSignUp ? 'signup' : 'login'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden fixed inset-0">
            <PageNumberBadge pageNumber={2} pageName="HotelLoginPage" isLocked={false} />
            
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

            {/* Main Content with Background */}
            <main 
                className="flex-1 flex items-center justify-center p-4 overflow-hidden relative bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/hotel%20image.png?updatedAt=1763051035257)'
                }}
            >
                {/* Background overlay */}
                <div className="absolute inset-0 bg-black/40"></div>
                
                <div className="max-w-md w-full relative z-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2 text-white">Hotel</h2>
                        <p className="text-white/90 text-sm">Manage your massage services and bookings</p>
                    </div>

                    <div className="mb-6 min-h-[60px] flex items-center">
                        {error && (
                            <div className={`w-full p-3 rounded-lg ${
                                error.includes('✅') 
                                    ? 'bg-green-50 text-green-700 border border-green-200' 
                                    : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex mb-6 bg-white/95 backdrop-blur-sm rounded-lg p-1 border border-white/20 shadow-lg">
                        <button
                            onClick={() => {
                                setIsSignUp(false);
                                setError(''); // Clear error when switching modes
                            }}
                            className={`flex-1 py-3 px-4 rounded-lg transition-all font-medium ${
                                !isSignUp ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-700 hover:text-orange-500 hover:bg-orange-50/80'
                            }`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => {
                                setIsSignUp(true);
                                setError(''); // Clear error when switching modes
                            }}
                            className={`flex-1 py-3 px-4 rounded-lg transition-all font-medium ${
                                isSignUp ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-700 hover:text-orange-500 hover:bg-orange-50/80'
                            }`}
                        >
                            Create Account
                        </button>
                    </div>

                    {/* Forms */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500 w-5 h-5 z-10" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/20 focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all bg-white/95 backdrop-blur-sm text-gray-900 placeholder-gray-500 shadow-lg"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500 w-5 h-5 z-10" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={isSignUp ? "Create a password (min 8 characters)" : "Enter your password"}
                                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-white/20 focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all bg-white/95 backdrop-blur-sm text-gray-900 placeholder-gray-500 shadow-lg"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-500 hover:text-orange-400 transition-colors z-10"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-2xl backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    {isSignUp ? <UserPlus className="w-5 h-5 mr-2" /> : <LogIn className="w-5 h-5 mr-2" />}
                                    {isSignUp ? 'Create Hotel Account' : 'Sign In to Hotel'}
                                </div>
                            )}
                        </button>
                    </form>
                </div>
            </main>
            

        </div>
    );
};

export default HotelLoginPage;
