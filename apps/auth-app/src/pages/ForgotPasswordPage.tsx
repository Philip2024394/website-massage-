import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { account } from '../lib/appwrite';
import { translations, getStoredLanguage } from '../translations';

interface ForgotPasswordPageProps {
    onBack?: () => void;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onBack }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [language, setLanguage] = useState<'en' | 'id'>(getStoredLanguage());
    const t = translations[language].auth;
    
    useEffect(() => {
        const handleStorageChange = () => setLanguage(getStoredLanguage());
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Send password recovery email via Appwrite
            await account.createRecovery(
                email,
                `${window.location.origin}/reset-password`
            );
            
            setSuccess(true);
            
            // Auto redirect back after 5 seconds
            setTimeout(() => {
                if (onBack) onBack();
            }, 5000);
        } catch (err: any) {
            console.error('Password recovery error:', err);
            if (err.code === 404) {
                setError(t.accountNotFound);
            } else {
                setError(err.message || (language === 'id' ? 'Gagal mengirim email reset. Silakan coba lagi.' : 'Failed to send reset email. Please try again.'));
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            {/* @ts-ignore */}
                            <CheckCircle size={32} className="text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">{t.checkYourEmail}</h2>
                        <p className="text-gray-600 mb-6">
                            {t.resetLinkSent} <strong>{email}</strong>. {t.checkSpam}
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
                {/* Back Button */}
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    {/* @ts-ignore */}
                    <ArrowLeft size={20} />
                    <span>{t.backToSignIn}</span>
                </button>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">
                            <span className="text-black">Inda</span>
                            <span className="text-orange-500">Street</span>
                        </h1>
                        <h2 className="text-2xl font-bold">
                            <span className="text-black">{t.resetYourPassword} </span>
                            <span className="text-orange-500">{t.password}</span>
                        </h2>
                    </div>

                    {/* Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-blue-800">
                            {t.enterEmailForReset}
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t.email}
                            </label>
                            <div className="relative">
                                {/* @ts-ignore */}
                                <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (error) setError(null); // Clear error when user starts typing
                                    }}
                                    placeholder={language === 'id' ? 'email.anda@example.com' : 'your.email@example.com'}
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !email}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (language === 'id' ? 'Mengirim...' : 'Sending...') : t.sendResetLink}
                        </button>
                    </form>

                    {/* Additional Help */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            {t.rememberPassword}{' '}
                            <button
                                onClick={onBack}
                                className="text-orange-500 hover:text-orange-600 font-medium"
                            >
                                {t.signIn}
                            </button>
                        </p>
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

export default ForgotPasswordPage;
