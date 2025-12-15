import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, LogIn, Home, ShieldCheck } from 'lucide-react';

interface AdminLoginPageProps {
    onBack: () => void;
    onAdminLogin: (email: string, password: string) => Promise<boolean>;
    t?: any;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ 
    onBack,
    onAdminLogin,
    t
}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }

        setIsLoading(true);
        try {
            const success = await onAdminLogin(email, password);
            if (!success) {
                setError('Invalid admin credentials');
            }
        } catch (err: any) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors"
                >
                    <Home className="w-5 h-5" />
                    <span className="font-medium">Back</span>
                </button>
                <div className="font-bold text-xl">
                    <span className="text-black">Inda</span>
                    <span className="text-orange-500">Street</span>
                </div>
                <div className="w-20"></div> {/* Spacer for centering */}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-md">
                    {/* Card */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        {/* Header Section */}
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-8 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                                <ShieldCheck className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2">
                                Admin Portal
                            </h1>
                            <p className="text-orange-100 text-sm">
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
                                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                        placeholder="admin@indastreet.com"
                                        disabled={isLoading}
                                        required
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
                                        className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                        placeholder="••••••••"
                                        disabled={isLoading}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        disabled={isLoading}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Verifying...</span>
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="w-5 h-5" />
                                        <span>Sign In</span>
                                    </>
                                )}
                            </button>

                            {/* Security Notice */}
                            <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3">
                                <p className="text-xs text-orange-800 text-center">
                                    <ShieldCheck className="w-4 h-4 inline mr-1 mb-0.5" />
                                    This is a secure admin-only area. All access is logged and monitored.
                                </p>
                            </div>
                        </form>
                    </div>

                    {/* Footer Note */}
                    <div className="text-center mt-6 text-sm text-gray-600">
                        <p>Need help? Contact technical support</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;
