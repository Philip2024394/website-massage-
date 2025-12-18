import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { account } from '../lib/appwrite';
import { translations, getStoredLanguage } from '../translations';

interface ResetPasswordPageProps {
    onNavigate?: (page: string) => void;
}

const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onNavigate }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [secret, setSecret] = useState<string | null>(null);
    const [language, setLanguage] = useState<'en' | 'id'>(getStoredLanguage());
    const t = translations[language].auth;

    useEffect(() => {
        // Extract userId and secret from URL
        const params = new URLSearchParams(window.location.search);
        const userIdParam = params.get('userId');
        const secretParam = params.get('secret');
        
        if (userIdParam && secretParam) {
            setUserId(userIdParam);
            setSecret(secretParam);
        } else {
            setError(language === 'id' ? 'Tautan reset tidak valid. Silakan minta reset password baru.' : 'Invalid reset link. Please request a new password reset.');
        }
    }, []);
    
    useEffect(() => {
        const handleStorageChange = () => setLanguage(getStoredLanguage());
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password.length < 8) {
            setError(t.passwordMinLength);
            return;
        }

        if (password !== confirmPassword) {
            setError(t.passwordsMustMatch);
            return;
        }

        if (!userId || !secret) {
            setError(language === 'id' ? 'Tautan reset tidak valid. Silakan minta reset password baru.' : 'Invalid reset link. Please request a new password reset.');
            return;
        }

        try {
            setLoading(true);

            // Complete password recovery with Appwrite
            await account.updateRecovery(
                userId,
                secret,
                password,
                confirmPassword
            );

            setSuccess(true);

            // Redirect to sign in after 3 seconds
            setTimeout(() => {
                onNavigate?.('signIn');
            }, 3000);
        } catch (err: any) {
            console.error('Password reset error:', err);
            if (err.code === 401) {
                setError(language === 'id' ? 'Tautan reset tidak valid atau kadaluarsa. Silakan minta yang baru.' : 'Invalid or expired reset link. Please request a new one.');
            } else {
                setError(err.message || (language === 'id' ? 'Gagal reset password. Silakan coba lagi.' : 'Failed to reset password. Please try again.'));
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center border-2 border-green-200">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            {/* @ts-ignore */}
                            <CheckCircle size={32} className="text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">{t.passwordResetSuccess}</h2>
                        <p className="text-gray-600 mb-6">
                            {language === 'id' ? 'Password Anda telah direset. Sekarang Anda dapat masuk dengan password baru.' : 'Your password has been reset. You can now sign in with your new password.'}
                        </p>
                        <p className="text-sm text-gray-500">
                            {t.redirectingToSignIn}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">
                            <span className="text-black">Inda</span>
                            <span className="text-orange-500">Street</span>
                        </h1>
                        <h2 className="text-2xl font-bold">
                            <span className="text-black">{t.createNewPassword} </span>
                            <span className="text-orange-500">{t.password}</span>
                        </h2>
                    </div>

                    {/* Instructions */}
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                        <p className="text-sm text-blue-800 font-medium">
                            {language === 'id' ? 'Pilih password baru untuk akun Anda. Pastikan minimal 8 karakter.' : 'Choose a new password for your account. Make sure it\'s at least 8 characters long.'}
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-semibold text-black mb-2">
                                {t.newPassword} <span className="text-orange-500">*</span>
                            </label>
                            <div className="relative">
                                {/* @ts-ignore */}
                                <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={language === 'id' ? 'Minimal 8 karakter' : 'At least 8 characters'}
                                    required
                                    className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 focus:bg-white transition-all font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                                >
                                    {/* @ts-ignore */}
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-semibold text-black mb-2">
                                {t.confirmPassword} <span className="text-orange-500">*</span>
                            </label>
                            <div className="relative">
                                {/* @ts-ignore */}
                                <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder={language === 'id' ? 'Masukkan ulang password' : 'Re-enter your password'}
                                    required
                                    className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 focus:bg-white transition-all font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                                >
                                    {/* @ts-ignore */}
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 font-medium">{language === 'id' ? 'Kedua password harus sama' : 'Both passwords must match'}</p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !password || !confirmPassword}
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                        >
                            {loading ? (language === 'id' ? 'Mereset Password...' : 'Resetting Password...') : t.resetPasswordButton}
                        </button>
                    </form>

                    {/* Back to Sign In */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => onNavigate?.('signIn')}
                            className="text-sm text-orange-500 hover:text-orange-600 font-semibold"
                        >
                            {t.backToSignIn}
                        </button>
                    </div>
                </div>

                {/* Support Note */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                        Need help? Contact us at{' '}
                        <a href="mailto:indastreet.id@gmail.com" className="text-orange-500 hover:underline">
                            indastreet.id@gmail.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
