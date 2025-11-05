import React, { useState } from 'react';
import { placeAuth } from '../lib/auth';
import { saveSessionCache } from '../lib/sessionManager';
import { checkRateLimit, handleAppwriteError, resetRateLimit } from '../lib/rateLimitUtils';
import { trackDailySignIn } from '../lib/coinHooks';
import { LogIn, UserPlus } from 'lucide-react';

interface MassagePlaceLoginPageProps {
    onSuccess: (placeId: string) => void;
    onBack: () => void;
    t: any;
}

const HomeIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const MassagePlaceLoginPage: React.FC<MassagePlaceLoginPageProps> = ({ onSuccess, onBack }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Make rate limit reset functions available in browser console for testing
    React.useEffect(() => {
        (window as any).resetPlaceRateLimit = () => {
            resetRateLimit('place-login');
            resetRateLimit('place-signup');
            console.log('✅ Place rate limits reset! You can now try logging in again.');
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
                            await trackDailySignIn(response.userId);
                        } catch (coinError) {
                            console.warn('Daily sign-in tracking failed:', coinError);
                        }
                    }
                    
                    console.log('✅ Place login successful');
                    onSuccess(response.userId);
                } else {
                    throw new Error(response.error || 'Sign in failed');
                }
            }
        } catch (err: any) {
            console.error(`Place ${isSignUp ? 'signup' : 'login'} error:`, err);
            setError(handleAppwriteError(err, isSignUp ? 'signup' : 'login'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            className="min-h-screen flex items-center justify-center p-4 relative"
            style={{
                backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/garden%20forest.png?updatedAt=1761334454082)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/40"></div>

            {/* Back Button */}
            <button
                onClick={onBack}
                className="fixed top-6 left-6 w-12 h-12 bg-orange-500 hover:bg-orange-600 rounded-full shadow-lg flex items-center justify-center transition-all z-20 border border-orange-400"
            >
                <HomeIcon className="w-6 h-6 text-white" />
            </button>

            <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 relative z-10 border border-white/20 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <div className="p-3 bg-orange-500 rounded-xl shadow-lg">
                            {isSignUp ? (
                                <UserPlus className="w-8 h-8 text-white" />
                            ) : (
                                <LogIn className="w-8 h-8 text-white" />
                            )}
                        </div>
                    </div>

                    {/* Toggle Buttons */}
                    <div className="flex mb-6 bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20">
                        <button
                            type="button"
                            onClick={() => setIsSignUp(false)}
                            className={`flex-1 py-2 px-4 rounded-md text-sm transition-all ${
                                !isSignUp ? 'bg-orange-500 shadow-lg text-white font-semibold' : 'text-white/90 hover:bg-white/5'
                            }`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsSignUp(true)}
                            className={`flex-1 py-2 px-4 rounded-md text-sm transition-all ${
                                isSignUp ? 'bg-orange-500 shadow-lg text-white font-semibold' : 'text-white/90 hover:bg-white/5'
                            }`}
                        >
                            Create Account
                        </button>
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-2">
                        {isSignUp ? 'Create Massage Place Account' : 'Massage Place Sign In'}
                    </h1>
                    <p className="text-white/80">
                        {isSignUp 
                            ? 'Register your massage place with IndaStreet'
                            : 'Access your place management dashboard'
                        }
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900 placeholder-gray-500"
                            placeholder="place@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900 placeholder-gray-500"
                            placeholder="••••••••"
                            required
                            minLength={8}
                        />
                    </div>

                    {error && (
                        <div className={`p-4 rounded-lg backdrop-blur-sm ${error.includes('✅') ? 'bg-green-500/20 text-green-100 border border-green-400/30' : 'bg-red-500/20 text-red-100 border border-red-400/30'}`}>
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                                {isSignUp ? 'Creating Account...' : 'Signing In...'}
                            </div>
                        ) : (
                            isSignUp ? 'Create Account' : 'Sign In'
                        )}
                    </button>
                </form>

                {/* Toggle Mode */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setError('');
                            setEmail('');
                            setPassword('');
                        }}
                        className="text-white/90 hover:text-white font-medium backdrop-blur-sm bg-white/10 px-4 py-2 rounded-lg border border-white/20 transition-all hover:bg-white/20"
                    >
                        {isSignUp 
                            ? 'Already have an account? Sign In' 
                            : "Don't have an account? Sign Up"
                        }
                    </button>
                </div>

                {/* Back Button */}
                <div className="mt-6 text-center">
                    <button
                        onClick={onBack}
                        className="flex items-center justify-center mx-auto text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <HomeIcon className="w-5 h-5 mr-2" />
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MassagePlaceLoginPage;