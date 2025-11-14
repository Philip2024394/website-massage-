import React, { useState } from 'react';
import { adminAuth } from '../lib/auth';
import { saveSessionCache } from '../lib/sessionManager';
import { checkRateLimit, handleAppwriteError, resetRateLimit, resetAllRateLimits } from '../lib/rateLimitUtils';
import PageNumberBadge from '../components/PageNumberBadge';

import { LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import { AppDrawer } from '../components/AppDrawer';
import { React19SafeWrapper } from '../components/React19SafeWrapper';

interface AdminLoginPageProps {
    onAdminLogin: () => void;
    onBack: () => void;
    t: any;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onAdminLogin: _onAdminLogin, onBack: _onBack, t: _t }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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

            // Password validation
            if (password.length < 8) {
                setError('Password must be at least 8 characters long');
                setIsLoading(false);
                return;
            }

            // Rate limiting check
            const operation = isSignUp ? 'admin-signup' : 'admin-login';
            const maxAttempts = 3; // Admin gets stricter rate limiting
            const windowMs = 300000; // 5 minutes

            if (!checkRateLimit(operation, maxAttempts, windowMs)) {
                setError(`Too many ${isSignUp ? 'signup' : 'login'} attempts. Please wait 5 minutes before trying again.`);
                setIsLoading(false);
                return;
            }

            console.log(`🔄 Starting admin ${isSignUp ? 'signup' : 'login'} for:`, email);

            if (isSignUp) {
                const response = await adminAuth.signUp(email, password);
                
                if (response.success) {
                    console.log('✅ Admin account created successfully!');
                    setIsSignUp(false);
                    setError('✅ Account created successfully! Please sign in.');
                    setPassword('');
                } else {
                    throw new Error(response.error || 'Admin signup failed');
                }
            } else {
                const response = await adminAuth.signIn(email, password);
                
                if (response.success && response.userId) {
                    // Authentication successful - save session cache
                    saveSessionCache({
                        type: 'admin',
                        id: response.userId,
                        email: email,
                        documentId: response.documentId || '',
                        data: { $id: response.userId, email }
                    });
                    
                    console.log(`✅ Admin login successful for ${email}`);
                    _onAdminLogin();
                } else {
                    throw new Error(response.error || 'Admin login failed');
                }
            }
        } catch (err: any) {
            console.error(`Admin ${isSignUp ? 'signup' : 'login'} error:`, err);
            setError(handleAppwriteError(err, isSignUp ? 'signup' : 'login'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleLogin();
    };

    return (
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
            <PageNumberBadge pageNumber={6} pageName="AdminLoginPage" isLocked={false} />
            
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
                        <h2 className="text-3xl font-bold mb-2 text-gray-800">Admin Portal</h2>
                        <p className="text-gray-600 text-sm">Administrative access and system management</p>
                        <div className="w-16 h-1 bg-red-500 rounded-full mx-auto mt-3"></div>
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
                                !isSignUp ? 'bg-white text-red-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
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
                                isSignUp ? 'bg-white text-red-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
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
                                placeholder="Enter admin email"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-white text-gray-700"
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
                                    placeholder={isSignUp ? "Create a secure password (min 8 characters)" : "Enter your password"}
                                    className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-white text-gray-700"
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

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <div className="flex items-start">
                                <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <div className="ml-3">
                                    <p className="text-sm text-amber-700">
                                        <span className="font-medium">Administrative Access:</span> This portal is restricted to authorized administrators only.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    {isSignUp ? <UserPlus className="w-5 h-5 mr-2" /> : <LogIn className="w-5 h-5 mr-2" />}
                                    {isSignUp ? 'Create Admin Account' : 'Admin Sign In'}
                                </div>
                            )}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default AdminLoginPage;