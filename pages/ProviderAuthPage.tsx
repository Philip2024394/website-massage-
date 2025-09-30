import React, { useState } from 'react';
import Button from '../components/Button';
import { getSupabase } from '../lib/supabase';

interface ProviderAuthPageProps {
    mode: 'login' | 'register';
    providerType: 'therapist' | 'place';
    onRegister: (email: string, agentCode?: string) => Promise<{success: boolean, message: string}>;
    onLogin: (email: string) => Promise<{success: boolean, message: string}>;
    onSwitchMode: () => void;
    onBack: () => void;
    t: any;
}

const ProviderAuthPage: React.FC<ProviderAuthPageProps> = ({ mode, providerType, onRegister, onLogin, onSwitchMode, onBack, t }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [agentCode, setAgentCode] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const supabase = getSupabase();
        if (!supabase) {
            setError("Database connection not available.");
            return;
        }

        setError('');
        setSuccessMessage('');
        setIsLoading(true);

        if (!email || !password) {
            setError(t.fillFieldsError);
            setIsLoading(false);
            return;
        }

        if (mode === 'register') {
            const { data: { user }, error: signUpError } = await supabase.auth.signUp({ email, password });

            if (signUpError) {
                setError(signUpError.message);
            } else if (user) {
                const result = await onRegister(email, agentCode);
                if (result.success) {
                    setSuccessMessage(result.message);
                    setEmail('');
                    setPassword('');
                    setAgentCode('');
                } else {
                    setError(result.message);
                    // Consider deleting the auth user if profile creation fails
                }
            }
        } else {
             const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
             if (signInError) {
                setError(signInError.message);
             } else {
                const result = await onLogin(email);
                if (!result.success) {
                    setError(result.message);
                    await supabase.auth.signOut(); // Log them out if profile not found
                }
             }
        }
        setIsLoading(false);
    };

    const getTitle = () => {
        if (providerType === 'therapist') {
            return mode === 'register' ? t.registerTherapistTitle : t.loginTherapistTitle;
        }
        return mode === 'register' ? t.registerPlaceTitle : t.loginPlaceTitle;
    }

    const buttonText = mode === 'register' ? t.registerButton : t.loginButton;
    const switchText = mode === 'register' ? t.switchToLogin : t.switchToRegister;

    return (
         <div className="min-h-screen flex flex-col justify-center bg-gray-50 p-4 relative">
            <button onClick={onBack} className="absolute top-4 left-4 text-gray-600 hover:text-gray-800">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <div className="w-full max-w-md mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-brand-green">2Go Massage</h1>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <h2 className="text-2xl font-semibold text-gray-800 text-center">{getTitle()}</h2>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t.emailLabel}</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-green focus:border-brand-green"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">{t.passwordLabel}</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-green focus:border-brand-green"
                                placeholder="••••••••"
                            />
                        </div>

                        {mode === 'register' && (
                            <div>
                                <label htmlFor="agentCode" className="block text-sm font-medium text-gray-700">{t.agentCodeLabel}</label>
                                <input
                                    id="agentCode"
                                    type="text"
                                    value={agentCode}
                                    onChange={e => setAgentCode(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-green focus:border-brand-green"
                                    placeholder={t.agentCodePlaceholder}
                                />
                            </div>
                        )}
                        
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        {successMessage && <p className="text-green-600 text-sm text-center">{successMessage}</p>}
                        
                        <Button type="submit" disabled={isLoading}>{isLoading ? 'Processing...' : buttonText}</Button>
                        
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setError('');
                                    setSuccessMessage('');
                                    onSwitchMode();
                                }}
                                className="text-sm font-medium text-brand-green hover:underline"
                            >
                                {switchText}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProviderAuthPage;