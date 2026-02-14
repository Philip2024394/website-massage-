// 🎯 Employer login/signup for Job Positions - Post a Job flow
import React, { useState } from 'react';
import { employerAuth } from '../../lib/auth';
import { saveSessionCache } from '../../lib/sessionManager';
import { checkRateLimit, handleAppwriteError } from '../../lib/rateLimitUtils';
import { Mail, Lock, Home, Briefcase, Eye, EyeOff } from 'lucide-react';
import PageNumberBadge from '../../components/PageNumberBadge';

interface EmployerLoginPageProps {
    onSuccess: (employerId: string) => void;
    onBack: () => void;
    returnTo?: string;
}

const EmployerLoginPage: React.FC<EmployerLoginPageProps> = ({ onSuccess, onBack, returnTo }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
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
            if (isSignUp && !name?.trim()) {
                setError('Please enter your name');
                setLoading(false);
                return;
            }

            const operation = isSignUp ? 'employer-signup' : 'employer-login';
            const maxAttempts = isSignUp ? 5 : 10;
            const windowMs = isSignUp ? 600000 : 60000;
            if (!checkRateLimit(operation, maxAttempts, windowMs)) {
                setError(`Too many ${isSignUp ? 'signup' : 'login'} attempts. Please wait before trying again.`);
                setLoading(false);
                return;
            }

            if (isSignUp) {
                const response = await employerAuth.signUp(email, password, name.trim() || undefined, businessName.trim() || undefined);
                if (response.success) {
                    setError('');
                    alert('Account created successfully! Please sign in.');
                    setIsSignUp(false);
                    setLoading(false);
                    return;
                }
                throw new Error(response.error || 'Sign up failed');
            } else {
                const response = await employerAuth.signIn(email, password);
                if (response.success && response.documentId) {
                    sessionStorage.setItem('has_entered_app', 'true');
                    saveSessionCache({
                        type: 'employer',
                        id: response.documentId,
                        email: email,
                        documentId: response.documentId,
                        data: { $id: response.documentId, email },
                    });
                    onSuccess(response.documentId);
                    return;
                }
                throw new Error(response.error || 'Sign in failed');
            }
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'An error occurred';
            setError(handleAppwriteError(err as Error, isSignUp ? 'signup' : 'login') || errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden fixed inset-0">
            <PageNumberBadge pageNumber={1} pageName="EmployerLoginPage" isLocked={false} />

            <header className="bg-white p-4 shadow-md z-[9997] flex-shrink-0">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        <span className="text-black">Inda</span><span className="text-orange-500">Street</span>
                    </h1>
                    <button onClick={onBack} title="Go back" className="hover:text-orange-500 transition-colors">
                        <Home className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <main className="flex-1 flex items-start justify-center px-4 py-2 overflow-hidden relative bg-cover bg-center bg-no-repeat min-h-0"
                style={{ backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/jungle%20massage.png)' }}>
                <div className="max-w-md w-full relative z-10 max-h-full pt-4 sm:pt-6" style={{ scrollbarWidth: 'none', overscrollBehavior: 'contain' }}>
                    <div className="text-center mb-4 sm:mb-6">
                        <div className="flex justify-center mb-2">
                            <Briefcase className="w-12 h-12 text-orange-500" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-800 drop-shadow-lg">Post a Job</h2>
                        <p className="text-gray-600 text-sm drop-shadow">Create an account or sign in to post job positions</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex mb-4 bg-white/95 backdrop-blur-sm rounded-lg p-1 border border-white/20 shadow-lg">
                        <button
                            onClick={() => { setIsSignUp(false); setError(''); }}
                            className={`flex-1 py-3 px-4 rounded-lg transition-all font-medium ${!isSignUp ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-700 hover:text-orange-500 hover:bg-orange-50/80'}`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => { setIsSignUp(true); setError(''); }}
                            className={`flex-1 py-3 px-4 rounded-lg transition-all font-medium ${isSignUp ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-700 hover:text-orange-500 hover:bg-orange-50/80'}`}
                        >
                            Create Account
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isSignUp && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-800 mb-2">Your Name</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Enter your name"
                                            className="w-full pl-4 pr-4 py-3 rounded-xl border border-white/20 focus:ring-2 focus:ring-orange-400/50 bg-white/95 text-gray-900 placeholder-gray-500 shadow-lg"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-800 mb-2">Business Name (optional)</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={businessName}
                                            onChange={(e) => setBusinessName(e.target.value)}
                                            placeholder="e.g. Spa Resort Bali"
                                            className="w-full pl-4 pr-4 py-3 rounded-xl border border-white/20 focus:ring-2 focus:ring-orange-400/50 bg-white/95 text-gray-900 placeholder-gray-500 shadow-lg"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-800 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500 w-5 h-5 z-10" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/20 focus:ring-2 focus:ring-orange-400/50 bg-white/95 text-gray-900 placeholder-gray-500 shadow-lg"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-800 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500 w-5 h-5 z-10" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={isSignUp ? 'Create a password (min 8 characters)' : 'Enter your password'}
                                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-white/20 focus:ring-2 focus:ring-orange-400/50 bg-white/95 text-gray-900 placeholder-gray-500 shadow-lg"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-500 hover:text-orange-400 z-10"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                        >
                            {loading ? (
                                <div className="flex justify-center">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                                </div>
                            ) : (
                                isSignUp ? 'Create Account' : 'Sign In'
                            )}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default EmployerLoginPage;
