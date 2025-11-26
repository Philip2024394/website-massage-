import React, { useState } from 'react';
import { placeAuth } from '../lib/auth';
import { saveSessionCache } from '../lib/sessionManager';
import { checkRateLimit, handleAppwriteError, resetRateLimit } from '../lib/rateLimitUtils';
import { trackDailySignIn } from '../lib/coinHooks';
import { LogIn, UserPlus, Eye, EyeOff, Mail, Lock, Home } from 'lucide-react';
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
    const [showPassword, setShowPassword] = useState(false);
    const [debugInfo, setDebugInfo] = useState<string>('');

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
        
        // Add test dashboard navigation helper
        (window as any).testDashboardNav = () => {
            console.log('🧪 Testing dashboard navigation with mock placeId...');
            const mockPlaceId = 'test_place_123';
            onSuccess(mockPlaceId);
            console.log('✅ Called onSuccess with:', mockPlaceId);
        };
        
        console.log('🔧 Debug helpers loaded:');
        console.log('   - resetPlaceRateLimit()');
        console.log('   - debugPlaceAuth(email, password)');
        console.log('   - checkMassageSpa()');
        console.log('   - createTestMassageSpa(email, password)');
        console.log('   - testDashboardNav() - Test navigation to dashboard');
    }, [onSuccess]);

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
                    console.log('✅ Place account created successfully! Auto-directing to dashboard…');
                    const effectivePlaceId = response.documentId || response.userId || '';
                    
                    if (!effectivePlaceId) {
                        throw new Error('No placeId returned from signup - cannot proceed to dashboard');
                    }
                    
                    console.log('💾 Provider data ready (localStorage disabled)');
                    console.log('💾 Provider data:', { id: effectivePlaceId, type: 'place' });
                    
                    // localStorage disabled - using Appwrite session only
                    console.log('✅ Provider data verified (using Appwrite storage)');
                    
                    setDebugInfo(`Provider stored in Appwrite: ${effectivePlaceId}, Type: place`);
                    
                    // Mark app as entered
                    sessionStorage.setItem('has_entered_app', 'true');
                    sessionStorage.setItem('current_page', 'placeDashboard');
                    
                    // Persist session cache immediately so dashboard can load
                    saveSessionCache({
                        type: 'place',
                        id: effectivePlaceId,
                        email: email,
                        documentId: response.documentId || '',
                        data: { $id: effectivePlaceId, email }
                    });
                    
                    console.log('🔄 Calling onSuccess to navigate to dashboard with placeId:', effectivePlaceId);
                    // Navigate straight to dashboard (skip manual sign-in step)
                    onSuccess(effectivePlaceId);
                    return;
                } else {
                    throw new Error(response.error || 'Sign up failed');
                }
            } else {
                const response = await placeAuth.signIn(email, password);
                
                if (response.success && response.userId) {
                    // Prefer the Appwrite PLACE document id for provider operations
                    const effectivePlaceId = response.documentId || response.userId;
                    
                    if (!effectivePlaceId) {
                        throw new Error('No placeId returned from signin - cannot proceed to dashboard');
                    }
                    
                    console.log('💾 Provider data ready (localStorage disabled)');
                    console.log('💾 Provider data:', { id: effectivePlaceId, type: 'place' });
                    
                    // localStorage disabled - using Appwrite session only
                    console.log('✅ Provider data verified (using Appwrite storage)');
                    
                    // Mark app as entered
                    sessionStorage.setItem('has_entered_app', 'true');
                    sessionStorage.setItem('current_page', 'placeDashboard');
                    
                    // Authentication successful - save session cache (align id with place document for dashboard lookup)
                    saveSessionCache({
                        type: 'place',
                        id: effectivePlaceId,
                        email: email,
                        documentId: response.documentId || '',
                        data: { $id: effectivePlaceId, email }
                    });
                    
                    // Track daily sign-in for coin rewards (only for login, not signup)
                    if (!isSignUp) {
                        try {
                            await trackDailySignIn(response.userId, 1, 'place');
                        } catch (coinError) {
                            console.warn('Daily sign-in tracking failed:', coinError);
                        }
                    }
                    
                    console.log(`✅ Place login successful for ${email} (placeId: ${effectivePlaceId})`);
                    console.log('🔄 Calling onSuccess to navigate to dashboard with placeId:', effectivePlaceId);
                    // Pass the PLACE document id to router so dashboard can load the correct profile
                    onSuccess(effectivePlaceId);
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
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden fixed inset-0">
            <PageNumberBadge pageNumber={5} pageName="MassagePlaceLoginPage" isLocked={false} />
            
            {/* Global Header */}
            <header className="bg-white p-4 shadow-md z-[9997] flex-shrink-0">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        <span className="text-black">Inda</span><span className="text-orange-500">Street</span>
                    </h1>
                    <div className="flex items-center gap-3 text-gray-600">
                        <button onClick={_onBack} title="Go to Home" className="hover:text-orange-500 transition-colors">
                            <Home className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content with Background */}
            <main 
                className="flex-1 flex items-start justify-center px-4 py-2 overflow-hidden relative bg-cover bg-center bg-no-repeat min-h-0"
                style={{
                    backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/massage%20spa.png)'
                }}
            >
                <div className="max-w-md w-full relative z-10 max-h-full overflow-y-auto pt-4 sm:pt-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {/* Header - Positioned right under header area */}
                    <div className="text-center mb-4 sm:mb-6">
                        <h2 className="text-4xl sm:text-5xl font-bold mb-2 sm:mb-3 text-gray-800 drop-shadow-lg">Massage Place</h2>
                        <p className="text-gray-600 text-xs sm:text-sm drop-shadow">Manage your massage place services and bookings</p>
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
                        {debugInfo && !error && (
                            <div className="w-full p-2 sm:p-3 rounded-lg text-sm bg-blue-50 text-blue-700 border border-blue-200">
                                🔍 {debugInfo}
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
                                <div className="flex items-center justify-center gap-2">
                                    {isSignUp ? '✨ Create Place Account' : '🔑 Sign In to Place'}
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

export default MassagePlaceLoginPage;