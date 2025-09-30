
import React, { useState } from 'react';
import Button from '../components/Button';
import HomeIcon from '../components/icons/HomeIcon';
import { getSupabase } from '../lib/supabase';

interface AdminLoginPageProps {
    onAdminLogin: () => void;
    onBack: () => void;
    onGoToSupabaseSettings: () => void;
    isSupabaseConnected: boolean;
    t: any;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onAdminLogin, onBack, t, onGoToSupabaseSettings, isSupabaseConnected }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        const supabase = getSupabase();
        if (!supabase) {
            setError("Database connection lost. Please configure it again.");
            return;
        }

        setError('');
        setIsLoading(true);

        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: 'admin@2go.massage',
            password,
        });

        if (signInError) {
            setError(signInError.message);
        } else {
            onAdminLogin();
        }
        setIsLoading(false);
    };

    if (!isSupabaseConnected) {
        return (
            <div className="min-h-screen flex flex-col justify-center bg-gray-50 p-4 relative">
                <button onClick={onBack} className="absolute top-4 left-4 text-gray-600 hover:text-gray-800" aria-label="Back to Home">
                    <HomeIcon className="w-8 h-8" />
                </button>
                <div className="w-full max-w-sm mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-brand-green">2Go Massage</h1>
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                        <h2 className="text-xl font-semibold text-gray-800">Database Not Connected</h2>
                        <p className="text-gray-600 mt-4 mb-6">
                            To access the admin panel, you must first connect the application to your Supabase database.
                        </p>
                        <Button onClick={onGoToSupabaseSettings}>Go to Connection Settings</Button>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen flex flex-col justify-center bg-gray-50 p-4 relative">
            <button onClick={onBack} className="absolute top-4 left-4 text-gray-600 hover:text-gray-800" aria-label="Back to Home">
                <HomeIcon className="w-8 h-8" />
            </button>
            <div className="w-full max-w-sm mx-auto">
                 <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-brand-green">2Go Massage</h1>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold text-gray-800 text-center">{t.title}</h2>
                         <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">{t.prompt}</label>
                            <input 
                                id="password"
                                type="password" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-green focus:border-brand-green text-gray-900"
                                placeholder={t.placeholder}
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <Button onClick={handleLogin} disabled={isLoading}>{isLoading ? 'Signing in...' : t.button}</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;
