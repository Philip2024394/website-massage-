import React, { useState } from 'react';
import { placeAuth } from '../lib/auth';
import { saveSessionCache } from '../lib/sessionManager';
import { checkRateLimit, handleAppwriteError, resetRateLimit } from '../lib/rateLimitUtils';
import { trackDailySignIn } from '../lib/coinHooks';
import { LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import { AppDrawer } from '../components/AppDrawer';
import { React19SafeWrapper } from '../components/React19SafeWrapper';
import PageNumberBadge from '../components/PageNumberBadge';

interface MassagePlaceLoginPageProps {
    onSuccess: (placeId: string) => void;
    onBack: () => void;
    t: any;
}

const MassagePlaceLoginPage: React.FC<MassagePlaceLoginPageProps> = ({ onSuccess, onBack: _onBack }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Make rate limit reset functions available in browser console for testing
    React.useEffect(() => {
        (window as any).resetPlaceRateLimit = () => {
            resetRateLimit('place-login');
            resetRateLimit('place-signup');
            console.log('✅ Place rate limits reset! You can now try logging in again.');
        };
        
        // Add comprehensive debugging helpers for massage place login
        (window as any).debugPlaceAuth = async (email: string, password: string) => {
            console.log('🔧 Debug Place Authentication for:', email);
            try {
                const response = await placeAuth.signIn(email, password);
                console.log('✅ Auth response:', response);
                return response;
            } catch (err) {
                console.error('❌ Auth debug error:', err);
                return { success: false, error: err };
            }
        };
        
        // Helper to check if massage spa exists in database
        (window as any).checkMassageSpa = async () => {
            console.log('🔍 Checking for massage spa in database...');
            try {
                const { databases, DATABASE_ID, COLLECTIONS } = await import('../lib/appwrite');
                const places = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PLACES);
                const massageSpas = places.documents.filter((place: any) => 
                    place.name?.toLowerCase().includes('massage spa') ||
                    place.email?.toLowerCase().includes('massage') ||
                    place.email?.toLowerCase().includes('spa')
                );
                console.log('🏢 Found massage spa places:', massageSpas);
                console.log('📧 All place emails:', places.documents.map((p: any) => p.email));
                return massageSpas;
            } catch (err) {
                console.error('❌ Database check error:', err);
                return [];
            }
        };
        
        // Helper to create test massage spa account
        (window as any).createTestMassageSpa = async (email: string, password: string) => {
            console.log('🔧 Creating test massage spa account...');
            try {
                const response = await placeAuth.signUp(email, password);
                console.log('✅ Test account created:', response);
                return response;
            } catch (err) {
                console.error('❌ Test account creation error:', err);
                return { success: false, error: err };
            }
        };
        
        console.log('🔧 Debug helpers loaded:');
        console.log('   - resetPlaceRateLimit()');
        console.log('   - debugPlaceAuth(email, password)');
        console.log('   - checkMassageSpa()');
        console.log('   - createTestMassageSpa(email, password)');
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
            const operation = isSignUp ? 'place-signup' : 'place-login';
            const maxAttempts = isSignUp ? 3 : 5;
            const windowMs = isSignUp ? 600000 : 300000; // 10 min for signup, 5 min for login

            if (!checkRateLimit(operation, maxAttempts, windowMs)) {
                setError(`Too many ${isSignUp ? 'signup' : 'login'} attempts. Please wait before trying again.`);
                setLoading(false);
                return;
            }

            console.log(`🔄 Starting place ${isSignUp ? 'signup' : 'login'} for:`, email);

            if (isSignUp) {
                const response = await placeAuth.signUp(email, password);
                
                if (response.success) {
                    console.log('✅ Place account created successfully!');
                    setIsSignUp(false);
                    setError('✅ Account created successfully! Please sign in.');
                    setPassword('');
                } else {
                    throw new Error(response.error || 'Sign up failed');
                }
            } else {
                const response = await placeAuth.signIn(email, password);
                
                if (response.success && response.userId) {
                    // Authentication successful - save session cache
                    saveSessionCache({
                        type: 'place',
                        id: response.userId,
                        email: email,
                        documentId: response.documentId || '',
                        data: { $id: response.userId, email }
                    });
                    
                    // Track daily sign-in for coin rewards (only for login, not signup)
                    if (!isSignUp) {
                        try {
                            await trackDailySignIn(response.userId, 1, 'place');
                        } catch (coinError) {
                            console.warn('Daily sign-in tracking failed:', coinError);
                        }
                    }
                    
                    console.log(`✅ Place login successful for ${email}`);
                    onSuccess(response.userId);
                } else {
                    throw new Error(response.error || 'Sign in failed');
                }
            }
        } catch (err: unknown) {
            const error = err as Error;
            console.error(`❌ Place ${isSignUp ? 'signup' : 'login'} error for ${email}:`, error);
            console.error('Error details:', {
                message: error.message,
                code: (error as any).code,
                type: (error as any).type,
                stack: error.stack
            });
            
            // Provide more specific error messages
            let errorMessage = handleAppwriteError(error, isSignUp ? 'signup' : 'login');
            
            // Special handling for massage spa login issues
            if (email.toLowerCase().includes('massage') && email.toLowerCase().includes('spa')) {
                console.log('🏢 Massage spa login attempt detected');
                if (error.message?.includes('Invalid credentials') || error.message?.includes('401')) {
                    errorMessage = `Login failed for massage spa account. Please check:
                    1. Email: ${email}
                    2. Password length (minimum 8 characters)
                    3. Account exists (try creating account first if needed)
                    
                    Use browser console: checkMassageSpa() to verify account exists`;
                }
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
            <PageNumberBadge pageNumber={5} pageName="MassagePlaceLoginPage" isLocked={false} />
            
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
            <main className="flex-1 flex items-center justify-center p-4 overflow-hidden">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2 text-gray-800">Massage Place Portal</h2>
                        <p className="text-gray-600 text-sm">Manage your massage place services and bookings</p>
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

                    {/* Tab Navigation */}
                    <div className="flex mb-6 bg-gray-100 rounded-lg p-1 border border-gray-200">
                        <button
                            onClick={() => {
                                setIsSignUp(false);
                                setError(''); // Clear error when switching modes
                            }}
                            className={`flex-1 py-3 px-4 rounded-lg transition-all font-medium ${
                                !isSignUp ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
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
                                isSignUp ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            Create Account
                        </button>
                    </div>

                    {/* Forms */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={isSignUp ? "Create a password (min 8 characters)" : "Enter your password"}
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
                                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    {isSignUp ? <UserPlus className="w-5 h-5 mr-2" /> : <LogIn className="w-5 h-5 mr-2" />}
                                    {isSignUp ? 'Create Place Account' : 'Sign In to Place'}
                                </div>
                            )}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default MassagePlaceLoginPage;