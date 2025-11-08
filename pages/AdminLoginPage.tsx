import React, { useState } from 'react';
import { adminAuth } from '../lib/auth';
import { saveSessionCache } from '../lib/sessionManager';
import { checkRateLimit, handleAppwriteError, resetRateLimit, resetAllRateLimits } from '../lib/rateLimitUtils';
import PageNumberBadge from '../components/PageNumberBadge';

interface AdminLoginPageProps {
    onAdminLogin: () => void;
    onBack: () => void;
    t: any;
}

const HomeIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onAdminLogin: _onAdminLogin, onBack, t }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Make rate limit reset functions available in browser console for testing
    React.useEffect(() => {
        (window as any).resetAdminRateLimit = () => {
            resetRateLimit('admin-login');
            resetRateLimit('admin-signup');
            console.log('✅ Admin rate limits reset! You can now try logging in again.');
        };
        (window as any).resetAllRateLimits = () => {
            resetAllRateLimits();
            console.log('✅ All rate limits reset!');
        };
    }, []);

    const handleLogin = async () => {
        setError('');
        setIsLoading(true);

        try {
            // Validate both email and password are provided
            if (!email || !password) {
                setError('Please enter both email and password');
                setIsLoading(false);
                return;
            }

            // Check rate limit before attempting login
            if (!checkRateLimit('admin-login', 5, 300000)) { // 5 attempts per 5 minutes
                setError('Too many login attempts. Please wait 5 minutes before trying again.');
                setIsLoading(false);
                return;
            }

            console.log('🔄 Starting admin login for:', email);

            // Use the new admin auth function
            const response = await adminAuth.signIn(email, password);
            
            if (!response.success) {
                throw new Error(response.error || 'Login failed');
            }
            
            // Save session cache for persistence
            saveSessionCache({
                type: 'admin',
                id: response.userId!,
                email: email,
                documentId: response.documentId || '',
                data: { $id: response.userId, email }
            });
            
            console.log('✅ Admin login successful');
            
            // Reset loading before calling onAdminLogin
            setIsLoading(false);
            _onAdminLogin();
        } catch (err: any) {
            console.error('Admin login error:', err);
            setError(handleAppwriteError(err, 'login'));
            setIsLoading(false);
        }
    };

    const handleSignUp = async () => {
        setError('');
        setIsLoading(true);

        try {
            if (!email || !password) {
                setError('Please enter both email and password');
                setIsLoading(false);
                return;
            }

            if (password.length < 8) {
                setError('Password must be at least 8 characters');
                setIsLoading(false);
                return;
            }

            // Check rate limit before attempting signup
            if (!checkRateLimit('admin-signup', 3, 600000)) { // 3 attempts per 10 minutes
                setError('Too many signup attempts. Please wait 10 minutes before trying again.');
                setIsLoading(false);
                return;
            }

            console.log('🔄 Starting admin account creation...');

            // Use the new admin auth function
            const response = await adminAuth.signUp(email, password);
            
            if (!response.success) {
                // Handle user already exists case specially
                if (response.error?.includes('already exists')) {
                    console.log('🔄 User already exists, switching to sign-in mode');
                    setIsSignUp(false);
                    setError('This email is already registered. Switched to Sign In mode - please enter your password.');
                    setIsLoading(false);
                    return;
                }
                throw new Error(response.error || 'Signup failed');
            }
            
            console.log('✅ Admin account created successfully!');
            
            // Switch to login mode after successful signup
            setIsSignUp(false);
            setError('✅ Account created successfully! Please sign in with your credentials.');
            setPassword(''); // Clear password for security
            setIsLoading(false);
        } catch (err: any) {
            console.error('❌ Admin signup error:', err);
            setError(handleAppwriteError(err, 'account creation'));
            setIsLoading(false);
        }
    };

    const handleSubmit = () => {
        console.log('🔘 Submit button clicked!');
        console.log('📝 isSignUp:', isSignUp);
        console.log('📧 Email:', email);
        console.log('🔑 Password length:', password.length);
        
        if (isSignUp) {
            console.log('➡️ Routing to handleSignUp()');
            handleSignUp();
        } else {
            console.log('➡️ Routing to handleLogin()');
            handleLogin();
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
            <PageNumberBadge pageNumber={5} pageName="AdminLoginPage" isLocked={false} />
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
                    <p className="text-white/90 font-medium">{t.title}</p>
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
                        error.includes('Switched to Sign In mode') 
                            ? 'bg-blue-500/20 text-blue-100 border-blue-400/30' 
                            : 'bg-red-500/20 text-red-100 border-red-400/30'
                    }`}>
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">Email</label>
                        <input 
                            id="email"
                            type="email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900 placeholder-gray-500"
                            placeholder="admin@example.com"
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">{t.prompt}</label>
                        <input 
                            id="password"
                            type="password" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900 placeholder-gray-500"
                            placeholder="Enter password"
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            required
                        />
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 mt-6 shadow-lg rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <span>Processing...</span>
                        ) : (
                            <span>{isSignUp ? 'Create Account' : t.button}</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;
