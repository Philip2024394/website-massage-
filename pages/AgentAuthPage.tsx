import React, { useState } from 'react';
import Button from '../components/Button';
import { getSupabase } from '../lib/supabase';

interface AgentAuthPageProps {
    onRegister: (name: string, email: string) => Promise<{ success: boolean, message: string }>;
    onLogin: (email: string) => Promise<{ success: boolean, message: string }>;
    onBack: () => void;
    t: any;
}

const AgentAuthPage: React.FC<AgentAuthPageProps> = ({ onRegister, onLogin, onBack, t }) => {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
        
        if (mode === 'register') {
            if (!name || !email || !password) {
                setError(t.fillFieldsError);
                setIsLoading(false);
                return;
            }
            const { error: signUpError } = await supabase.auth.signUp({ 
                email, 
                password, 
                options: { data: { name: name, role: 'agent' } }
            });

            if (signUpError) {
                setError(signUpError.message);
            } else {
                const result = await onRegister(name, email);
                if (result.success) {
                    setSuccessMessage(result.message);
                    setName('');
                    setEmail('');
                    setPassword('');
                    setMode('login');
                } else {
                    setError(result.message);
                }
            }
        } else { // Login mode
            if (!email || !password) {
                setError(t.fillFieldsError);
                setIsLoading(false);
                return;
            }
            const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
            if (signInError) {
                setError(signInError.message);
            } else {
                const loginResult = await onLogin(email);
                if (!loginResult.success) {
                    setError(loginResult.message);
                    await supabase.auth.signOut();
                }
            }
        }
        setIsLoading(false);
    };

    const title = mode === 'register' ? t.registerTitle : t.loginTitle;
    const buttonText = mode === 'register' ? t.registerButton : t.loginButton;
    const switchText = mode === 'register' ? t.switchToLogin : t.switchToRegister;

    return (
        <div className="min-h-screen flex flex-col justify-center bg-gray-50 p-4 relative">
            <button onClick={onBack} className="absolute top-4 left-4 text-gray-600 hover:text-gray-800" aria-label="Back to Home">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <div className="w-full max-w-md mx-auto">
                 <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-brand-green">2Go Agent Portal</h1>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <h2 className="text-2xl font-semibold text-gray-800 text-center">{title}</h2>
                        {mode === 'register' && (
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t.nameLabel}</label>
                                <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-green focus:border-brand-green" required />
                            </div>
                        )}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t.emailLabel}</label>
                            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-green focus:border-brand-green" required />
                        </div>
                            <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">{t.passwordLabel}</label>
                            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-green focus:border-brand-green" placeholder="••••••••" required />
                        </div>
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        {successMessage && <p className="text-green-600 text-sm text-center">{successMessage}</p>}
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Processing...' : buttonText}
                        </Button>
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setError('');
                                    setSuccessMessage('');
                                    setMode(mode === 'login' ? 'register' : 'login')
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

export default AgentAuthPage;