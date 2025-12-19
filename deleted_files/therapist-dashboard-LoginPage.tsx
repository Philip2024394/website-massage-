// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import { authService } from '../../../../lib/appwriteService';

interface LoginPageProps {
    onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [viewMode, setViewMode] = useState<'login' | 'register' | 'forgot'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [resetEmail, setResetEmail] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            if (viewMode === 'forgot') {
                if (!resetEmail) {
                    setError('Please enter your email to reset password');
                    return;
                }
                // Appwrite password recovery (replace with your actual method)
                await authService.createRecovery(resetEmail);
                setSuccessMessage('Password reset email sent! Please check your inbox.');
                setViewMode('login');
                setResetEmail('');
                return;
            }

            if (!email || !password) {
                setError('Please enter both email and password');
                return;
            }

            if (viewMode === 'login') {
                // Login
                const emailToUse = email.includes('@') ? email : `${email}@therapist.local`;
                await authService.login(emailToUse, password);
                // Clear any cached data
                sessionStorage.clear();
                localStorage.removeItem('therapist-cache');
                // Navigate to dashboard
                onLogin();
            } else if (viewMode === 'register') {
                // Register
                if (password.length < 8) {
                    setError('Password must be at least 8 characters');
                    return;
                }
                await authService.register(email, password, 'therapist');
                // Switch to login mode after successful registration
                setViewMode('login');
                setPassword('');
                setSuccessMessage('✅ Account created successfully! Please sign in.');
            }
        } catch (err: any) {
            setError(err?.message || 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Image */}
            <div 
                className="hidden lg:block lg:w-1/2 bg-cover bg-center"
                style={{
                    backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/massage%20therapist%20bew.png?updatedAt=1763136088363)'
                }}
            />

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-4 py-8">
                <div className="max-w-md w-full">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-5xl font-bold mb-3">
                            <span className="text-gray-900">Inda</span><span className="text-orange-500">Street</span>
                        </h1>
                        <h2 className="text-3xl font-bold mb-2 text-gray-900">Therapist</h2>
                        <p className="text-gray-600">Manage your massage services and bookings</p>
                    </div>

                    {/* Card */}
                    <div className="border border-gray-200 rounded-lg p-8 space-y-6">
                    {/* Toggle Buttons */}
                    <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
                        <button
                            type="button"
                            onClick={() => {
                                setViewMode('login');
                                setError('');
                                setSuccessMessage('');
                            }}
                            className={`flex-1 py-2 rounded-md font-medium transition-all ${
                                viewMode === 'login'
                                    ? 'bg-orange-500 text-white'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <LogIn className="w-4 h-4 inline mr-2" />
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setViewMode('register');
                                setError('');
                                setSuccessMessage('');
                            }}
                            className={`flex-1 py-2 rounded-md font-medium transition-all ${
                                viewMode === 'register'
                                    ? 'bg-orange-500 text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <UserPlus className="w-4 h-4 inline mr-2" />
                            Register
                        </button>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-800">
                            {error}
                        </div>
                    )}
                    {successMessage && (
                        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-800">
                            {successMessage}
                        </div>
                    )}

                    {/* Form */}
                    {viewMode === 'forgot' ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="Enter your email"
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>Send Reset Link</>
                                )}
                            </button>
                            <div className="text-center mt-2">
                                <button type="button" className="text-orange-500 hover:underline text-sm" onClick={() => { setViewMode('login'); setError(''); setSuccessMessage(''); }}>Back to Sign In</button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email / Phone
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="Enter your email or phone"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder={viewMode === 'register' ? 'Min 8 characters' : 'Enter your password'}
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Forgot password link */}
                            {viewMode === 'login' && (
                                <div className="text-right">
                                    <button
                                        type="button"
                                        className="text-orange-500 hover:underline text-sm"
                                        onClick={() => { setViewMode('forgot'); setError(''); setSuccessMessage(''); }}
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Processing...
                                    </>
                                ) : viewMode === 'login' ? (
                                    <>
                                        <LogIn className="w-5 h-5" />
                                        Sign In
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-5 h-5" />
                                        Create Account
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
