import React, { useState } from 'react';
import { hotelAuth } from '../lib/auth';
import { saveSessionCache } from '../lib/sessionManager';
import { checkRateLimit, handleAppwriteError, resetRateLimit } from '../lib/rateLimitUtils';
import { trackDailySignIn } from '../lib/coinHooks';
import { LogIn, UserPlus } from 'lucide-react';

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
        <div 
            className="min-h-screen h-screen w-full flex items-center justify-center p-4 overflow-hidden fixed inset-0 z-50"
            style={{
                backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/garden%20forest.png?updatedAt=1761334454082)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            {/* Overlay for better readability */}
            <div className="absolute inset-0 bg-black/40 z-10"></div>

            {/* Home Button */}
            <button
                onClick={onBack}
                className="fixed top-6 left-6 w-12 h-12 bg-orange-500 hover:bg-orange-600 rounded-full shadow-lg flex items-center justify-center transition-all z-30 border border-orange-400"
                aria-label="Go to home"
            >
                <HomeIcon className="w-6 h-6 text-white" />
            </button>

            {/* Glass Effect Login Container */}
            <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 relative z-20 border border-white/20">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        <span className="text-white">Inda</span>
                        <span className="text-orange-400">Street</span>
                    </h1>
                    <p className="text-white/90 font-medium">Hotel Account</p>
                </div>

                <div className="flex mb-6 bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20">
                    <button
                        onClick={() => {
                            setIsSignUp(false);
                            setError(''); // Clear error when switching modes
                        }}
                        className={`flex-1 py-2 px-4 rounded-md transition-all ${
                            !isSignUp ? 'bg-orange-500 shadow-lg text-white font-semibold' : 'text-white/90 hover:bg-white/5'
                        }`}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => {
                            setIsSignUp(true);
                            setError(''); // Clear error when switching modes
                        }}
                        className={`flex-1 py-2 px-4 rounded-md transition-all ${
                            isSignUp ? 'bg-orange-500 shadow-lg text-white font-semibold' : 'text-white/90 hover:bg-white/5'
                        }`}
                    >
                        Create Account
                    </button>
                </div>

                {error && (
                    <div className={`mb-4 p-3 rounded-lg backdrop-blur-sm border ${
                        error.includes('created') || error.includes('Switched to Sign In mode')
                            ? 'bg-blue-500/20 text-blue-100 border-blue-400/30' 
                            : 'bg-red-500/20 text-red-100 border-red-400/30'
                    }`}>
                        {error}
                    </div>
                )}

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
                            placeholder="hotel@example.com"
                            required
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/90 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900 placeholder-gray-500"
                            placeholder="Enter your password"
                            required
                            minLength={8}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 mt-6 shadow-lg rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            'Processing...'
                        ) : isSignUp ? (
                            <>
                                <UserPlus className="w-5 h-5" />
                                Create Account
                            </>
                        ) : (
                            <>
                                <LogIn className="w-5 h-5" />
                                Sign In
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default HotelLoginPage;
