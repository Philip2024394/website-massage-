import React, { useState } from 'react';
import { villaAuth } from '../lib/auth';
import { saveSessionCache } from '../lib/sessionManager';
import { checkRateLimit, handleAppwriteError, resetRateLimit } from '../lib/rateLimitUtils';
import { trackDailySignIn } from '../lib/coinHooks';
import { LogIn, UserPlus, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import { AppDrawer } from '../components/AppDrawer';
import { React19SafeWrapper } from '../components/React19SafeWrapper';
import PageNumberBadge from '../components/PageNumberBadge';

interface VillaLoginPageProps {
    onSuccess: (villaId: string) => void;
    onBack: () => void;
    t: (key: string, params?: Record<string, any>) => string; // Translation function type
    // Navigation handlers
    onMassageJobsClick?: () => void;
    onHotelPortalClick?: () => void;
    onVillaPortalClick?: () => void;
    onTherapistPortalClick?: () => void;
    onMassagePlacePortalClick?: () => void;
    onAgentPortalClick?: () => void;
    onCustomerPortalClick?: () => void;
    onAdminPortalClick?: () => void;
    onTermsClick?: () => void;
    onPrivacyClick?: () => void;
    onNavigate?: (page: string) => void;
}

const VillaLoginPage: React.FC<VillaLoginPageProps> = ({ 
    onSuccess, 
    onBack: _onBack, 
    t,
    onMassageJobsClick,
    onHotelPortalClick,
    onVillaPortalClick,
    onTherapistPortalClick,
    onMassagePlacePortalClick,
    onAgentPortalClick,
    onCustomerPortalClick,
    onAdminPortalClick,
    onTermsClick,
    onPrivacyClick,
    onNavigate
}) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Make rate limit reset functions available in browser console for testing
    React.useEffect(() => {
        (window as any).resetVillaRateLimit = () => {
            resetRateLimit('villa-login');
            resetRateLimit('villa-signup');
            console.log('✅ Villa rate limits reset! You can now try logging in again.');
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
            const operation = isSignUp ? 'villa-signup' : 'villa-login';
            const maxAttempts = isSignUp ? 3 : 5;
            const windowMs = isSignUp ? 600000 : 300000; // 10 min for signup, 5 min for login

            if (!checkRateLimit(operation, maxAttempts, windowMs)) {
                setError(`Too many ${isSignUp ? 'signup' : 'login'} attempts. Please wait before trying again.`);
                setLoading(false);
                return;
            }

            console.log(`🔄 Starting villa ${isSignUp ? 'signup' : 'login'} for:`, email);

            if (isSignUp) {
                const response = await villaAuth.signUp(email, password);
                
                if (response.success) {
                    console.log('✅ Villa account created successfully!');
                    setIsSignUp(false);
                    setError('✅ Account created successfully! Please sign in.');
                    setPassword('');
                } else {
                    throw new Error(response.error || 'Sign up failed');
                }
            } else {
                const response = await villaAuth.signIn(email, password);
                
                if (response.success && response.userId) {
                    // Authentication successful - save session cache
                    saveSessionCache({
                        type: 'villa',
                        id: response.userId,
                        email: email,
                        documentId: response.documentId || '',
                        data: { $id: response.userId, email }
                    });
                    
                    // Track daily sign-in for coin rewards (only for login, not signup)
                    if (!isSignUp) {
                        try {
                            await trackDailySignIn(response.userId, 1, 'villa');
                        } catch (coinError) {
                            console.warn('Daily sign-in tracking failed:', coinError);
                        }
                    }
                    
                    console.log('✅ Villa login successful');
                    onSuccess(response.userId);
                } else {
                    throw new Error(response.error || 'Sign in failed');
                }
            }
        } catch (err: unknown) {
            const error = err as Error;
            console.error(`Villa ${isSignUp ? 'signup' : 'login'} error:`, error);
            setError(handleAppwriteError(error, isSignUp ? 'signup' : 'login'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden fixed inset-0">
            <PageNumberBadge pageNumber={3} pageName="VillaLoginPage" isLocked={false} />
            
            {/* Global Header */}
            <header className="bg-white p-4 shadow-md z-[9997] flex-shrink-0">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        <span className="text-black">Inda</span><span className="text-orange-500">street</span>
                    </h1>
                    <div className="flex items-center gap-3 text-gray-600">
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
                    t={t}
                    onMassageJobsClick={onMassageJobsClick}
                    onHotelPortalClick={onHotelPortalClick}
                    onVillaPortalClick={onVillaPortalClick}
                    onTherapistPortalClick={onTherapistPortalClick}
                    onMassagePlacePortalClick={onMassagePlacePortalClick}
                    onAgentPortalClick={onAgentPortalClick}
                    onCustomerPortalClick={onCustomerPortalClick}
                    onAdminPortalClick={onAdminPortalClick}
                    onNavigate={onNavigate}
                    onTermsClick={onTermsClick}
                    onPrivacyClick={onPrivacyClick}
                    therapists={[]}
                    places={[]}
                />
            </React19SafeWrapper>

            {/* Main Content with Background */}
            <main 
                className="flex-1 flex items-start justify-center px-4 py-2 overflow-hidden relative bg-cover bg-center bg-no-repeat min-h-0"
                style={{
                    backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/villa%20image.png?updatedAt=1763052495068)'
                }}
            >
                <div className="max-w-md w-full relative z-10 max-h-full overflow-y-auto pt-4 sm:pt-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {/* Header - Positioned right under header area */}
                    <div className="text-center mb-4 sm:mb-6">
                        <h2 className="text-4xl sm:text-5xl font-bold mb-2 sm:mb-3 text-gray-800 drop-shadow-lg">Villa</h2>
                        <p className="text-gray-600 text-xs sm:text-sm drop-shadow">Manage your massage services and bookings</p>
                    </div>

                    <div className="mb-3 sm:mb-4 min-h-[50px] flex items-center">
                        {error && (
                            <div className={`w-full p-2 sm:p-3 rounded-lg text-sm ${
                                error.includes('✅') 
                                    ? 'bg-green-50 text-green-700 border border-green-200' 
                                    : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex mb-4 sm:mb-6 bg-white/95 backdrop-blur-sm rounded-lg p-1 border border-white/20 shadow-lg">
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
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-800 mb-2 drop-shadow">
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
                            <label className="block text-sm font-medium text-gray-800 mb-2 drop-shadow">
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
                                    {isSignUp ? 'Create Villa Account' : 'Sign In to Villa'}
                                </div>
                            )}
                        </button>
                    </form>
                </div>
            </main>
            
            {/* Hide scrollbars */}
            <style>{`
                .max-w-md::-webkit-scrollbar {
                    display: none;
                }
                @media (max-height: 600px) {
                    .space-y-4 > * + * {
                        margin-top: 0.75rem;
                    }
                    .space-y-6 > * + * {
                        margin-top: 1rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default VillaLoginPage;
