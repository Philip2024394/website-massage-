// File deleted as part of unified login refactor.
import React, { useState } from 'react';


interface VillaLoginPageProps {
    onVillaLogin: () => void;
    onBack: () => void;
}

const VillaLoginPage: React.FC<VillaLoginPageProps> = ({ onVillaLogin, onBack }) => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // Removed unused backgroundStyle and backgroundClass after design unification

    const handleInputChange = (field: string, value: string) => {
        setCredentials(prev => ({
            ...prev,
            [field]: value
        }));
        if (error) setError('');
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!credentials.username || !credentials.password) {
            setError('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Mock authentication - replace with actual villa authentication logic
            const username = credentials.username.trim().toLowerCase();
            const password = credentials.password.trim();
            
            if (username === 'villa123' && password === 'indostreet2024') {
                onVillaLogin();
            } else {
                setError(`Invalid credentials. Please use: villa123 / indostreet2024`);
            }
        } catch (err) {
            setError('Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center p-4 relative" style={{ backgroundImage: "url('https://ik.imagekit.io/7grri5v7d/garden%20massage.png?updatedAt=1761228771461')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="w-full flex justify-center z-30 pt-24 pb-8 absolute top-0 left-0">
                <h1 className="text-6xl font-extrabold tracking-tight drop-shadow-lg">
                    <span className="text-white">Indo</span>
                    <span className="text-orange-500">Street</span>
                </h1>
            </div>
            <button onClick={onBack} className="absolute top-8 left-4 z-20 focus:outline-none" aria-label="Back to Home">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-orange-500 shadow-lg border-2 border-white transition-all duration-200 hover:bg-orange-600">
                    {/* Home icon SVG */}
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </span>
            </button>
            <div className="w-full max-w-sm mx-auto relative z-20 flex items-center justify-center min-h-[30vh] mt-20">
                <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-4 flex flex-col justify-center transition-all duration-300 min-h-[340px] max-h-[440px] w-full max-w-xs">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">
                            <span className="text-white">Indo</span><span className="text-orange-400">Street</span>
                        </h1>
                        <h2 className="text-xl font-semibold text-white mb-2">Villa Login</h2>
                        <p className="text-white/80">Access your villa management dashboard</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-white/90 mb-2">
                                Villa Username
                            </label>
                            <input
                                type="text"
                                value={credentials.username}
                                onChange={(e) => handleInputChange('username', e.target.value)}
                                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent backdrop-blur-sm"
                                placeholder="villa123"
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/90 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={credentials.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent backdrop-blur-sm"
                                placeholder="indostreet2024"
                                disabled={isLoading}
                            />
                        </div>

                        {error && (
                            <div className="text-red-400 text-sm text-center bg-red-500/20 p-2 rounded-md border border-red-400/30">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-orange-500/80 backdrop-blur-sm text-white py-3 px-4 rounded-md hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium border border-white/20"
                        >
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default VillaLoginPage;