
import React, { useState } from 'react';
import HomeIcon from '../components/icons/HomeIcon';
import { useBackground } from '../src/shared/hooks/useBackground';

interface AdminLoginPageProps {
    onAdminLogin: () => void;
    onBack: () => void;
    t: any;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onAdminLogin, onBack, t }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { backgroundStyle, backgroundClass } = useBackground('admin');

    const handleLogin = async () => {
        setError('');
        setIsLoading(true);

        // Simple password check for demo purposes
        // In production, replace with proper authentication
        if (password === 'admin123' || password === 'indostreet2024') {
            onAdminLogin();
        } else {
            setError('Invalid password. Try "admin123" or "indostreet2024"');
        }
        setIsLoading(false);
    };

    // Removed Supabase connection check - using Appwrite backend

    return (
        <div 
            className={`min-h-screen flex flex-col justify-center p-4 relative ${backgroundClass}`}
            style={backgroundStyle}
        >
            <button onClick={onBack} className="absolute top-4 left-4 text-white/80 hover:text-white" aria-label="Back to Home">
                <HomeIcon className="w-8 h-8" />
            </button>
            <div className="w-full max-w-sm mx-auto">
                <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">
                            <span className="text-white">Indo</span><span className="text-orange-400">Street</span>
                        </h1>
                        <h2 className="text-xl font-semibold text-white mb-2">{t.title}</h2>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">{t.prompt}</label>
                            <input 
                                id="password"
                                type="password" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)}
                                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent backdrop-blur-sm"
                                placeholder="indostreet2024"
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            />
                        </div>
                        {error && <div className="text-red-400 text-sm text-center bg-red-500/20 p-2 rounded-md border border-red-400/30">{error}</div>}
                        <button
                            onClick={handleLogin}
                            disabled={isLoading}
                            className="w-full bg-orange-500/80 backdrop-blur-sm text-white py-3 px-4 rounded-md hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium border border-white/20"
                        >
                            {isLoading ? 'Signing in...' : t.button}
                        </button>
                        
                        <div className="text-center">
                            <p className="text-sm text-white/70">
                                Demo: indostreet2024
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;
