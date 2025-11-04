import React, { useState } from 'react';
import Button from '../components/Button';
import PasswordInput from '../components/PasswordInput';
import { therapistAuth } from '../lib/auth';
import { trackDailySignIn } from '../lib/coinHooks';
import { LogIn, UserPlus, Mail } from 'lucide-react';

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
                    onSuccess(response.userId);
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
        <div 
            className="h-screen w-full flex items-center justify-center p-4 relative overflow-hidden fixed inset-0"
            style={{
                backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/garden%20forest.png?updatedAt=1761334454082)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            {/* Overlay for better readability */}
            <div className="absolute inset-0 bg-black/40"></div>

            {/* Home Button */}
            <button
                onClick={onBack}
                className="fixed top-6 left-6 w-12 h-12 bg-orange-500 hover:bg-orange-600 rounded-full shadow-lg flex items-center justify-center transition-all z-20 border border-orange-400"
                aria-label="Go to home"
            >
                <HomeIcon className="w-6 h-6 text-white" />
            </button>

            {/* Glass Effect Login Container */}
            <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 relative z-10 border border-white/20 max-h-[90vh] overflow-y-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        <span className="text-white">Inda</span>
                        <span className="text-orange-400">Street</span>
                    </h1>
                    <p className="text-white/90 font-medium">Therapist Account</p>
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
