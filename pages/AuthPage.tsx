import React, { useState } from 'react';
import Button from '../components/Button';
import HomeIcon from '../components/icons/HomeIcon';
import { getSupabase } from '../lib/supabase';

interface AuthPageProps {
    onAuthSuccess: () => void;
    onBack: () => void;
    t: any;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess, onBack, t }) => {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        const supabase = getSupabase();
        if (!supabase) {
            setError("Database connection not available.");
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccessMessage('');
        
        if (mode === 'signup') {
            if (!name || !email || !password) {
                setError(t.fillFieldsError);
                setIsLoading(false);
                return;
            }
            const { error: signUpError } = await supabase.auth.signUp({ 
                email, 
                password, 
                options: { 
                    data: { name: name }
                }
            });

            if (signUpError) {
                setError(signUpError.message);
            } else {
                setSuccessMessage("Sign up successful! Please wait for an admin to activate your account.");
                setName('');
                setEmail('');
                setPassword('');
                setMode('login');
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
                onAuthSuccess();
            }
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex flex-col justify-center bg-gray-50 p-4 relative">
             <button onClick={onBack} className="absolute top-4 left-4 text-gray-600 hover:text-gray-800" aria-label="Back to Home">
                <HomeIcon className="w-8 h-8" />
            </button>
            <div className="w-full max-w-md mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-brand-green">2Go Massage</h1>
                    <p className="text-gray-500 mt-2">{t.tagline}</p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <form onSubmit={handleAuth} className="space-y-6">
                        <h2 className="text-2xl font-semibold text-gray-800 text-center">
                            {mode === 'signup' ? t.createAccount : 'Welcome Back'}
                        </h2>
                        {mode === 'signup' && (
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t.nameLabel}</label>
                                <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-green focus:border-brand-green" placeholder={t.namePlaceholder} required />
                            </div>
                        )}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t.emailLabel}</label>
                            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-green focus:border-brand-green" placeholder={t.emailPlaceholder} required />
                        </div>
                            <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">{t.passwordLabel}</label>
                            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-green focus:border-brand-green" placeholder="••••••••" required />
                        </div>
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        {successMessage && <p className="text-green-600 text-sm text-center">{successMessage}</p>}
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Processing...' : (mode === 'signup' ? t.signUpButton : 'Login')}
                        </Button>
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                                className="text-sm font-medium text-brand-green hover:underline"
                            >
                                {mode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
