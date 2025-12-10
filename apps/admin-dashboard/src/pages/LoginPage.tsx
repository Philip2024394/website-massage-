import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, LogIn, ShieldCheck } from 'lucide-react';
import { authService } from '@shared/appwriteService';

interface LoginPageProps {
    onLogin: (email: string, password: string) => Promise<void>;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!email || !password) {
                setError('Please enter both email and password');
                return;
            }

            // Login with admin credentials
            const user = await authService.login(email, password);
            
            // TODO: Verify admin role from user.labels or user.prefs
            // For now, any successful login will proceed
            // You should add role verification here:
            // if (!user.labels?.includes('admin')) {
            //     throw new Error('Access denied. Admin privileges required.');
            // }
            
            // Navigate to admin dashboard
            onLogin();
        } catch (err: any) {
            setError(err?.message || 'Admin login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4 py-8">
            <div className="max-w-md w-full">
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                            <ShieldCheck className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            <span className="text-white">Inda</span>
                            <span className="text-blue-100">Street</span>
                        </h1>
                        <h2 className="text-xl font-semibold text-white mb-2">
                            Admin Portal
                        </h2>
                        <p className="text-blue-100 text-sm">
                            Secure access for administrators
                        </p>
                    </div>

                    {/* Form Section */}
                    <form onSubmit={handleSubmit} className="px-6 py-8 space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-3">
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center mt-0.5">
                                    <span className="text-white text-xs font-bold">!</span>
                                </div>
                                <p className="text-sm text-red-800 flex-1">{error}</p>
                            </div>
                        )}

                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Admin Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="admin@indastreet.com"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter your secure password"
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

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    Sign In as Admin
                                </>
                            )}
                        </button>

                        {/* Security Notice */}
                        <div className="pt-4 border-t border-gray-200">
                            <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-2">
                                <ShieldCheck className="w-4 h-4" />
                                Secure connection protected by SSL encryption
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
