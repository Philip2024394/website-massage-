import React, { useState } from 'react';
import HomeIcon from '../components/icons/HomeIcon';


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
        
        setIsLoading(true);
        setError('');
        setSuccessMessage('');
        
        if (mode === 'signup') {
            if (!name || !email || !password) {
                setError(t.fillFieldsError);
                setIsLoading(false);
                return;
            }
            
            // Mock implementation - replace with your actual authentication logic
            setSuccessMessage("Sign up successful! Please wait for an admin to activate your account.");
            setName('');
            setEmail('');
            setPassword('');
            setMode('login');
        } else { // Login mode
            if (!email || !password) {
                setError(t.fillFieldsError);
                setIsLoading(false);
                return;
            }
            
            // Mock implementation - replace with your actual authentication logic
            // For demo purposes, simulate successful login
            onAuthSuccess();
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex flex-col justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 p-4 relative">
             <button onClick={onBack} className="absolute top-4 left-4 text-white/80 hover:text-white" aria-label="Back to Home">
                <HomeIcon className="w-8 h-8" />
            </button>
            <div className="w-full max-w-md mx-auto">
                <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">
                            <span className="text-white">Indo</span><span className="text-orange-400">Street</span>
                        </h1>
                        <p className="text-white/80">{t.tagline}</p>
                    </div>
                    <form onSubmit={handleAuth} className="space-y-6">
                        <h2 className="text-xl font-semibold text-white text-center mb-6">
                            {mode === 'signup' ? t.createAccount : 'Welcome Back'}
                        </h2>
                        {mode === 'signup' && (
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-white/90 mb-2">{t.nameLabel}</label>
                                <input 
                                    id="name" 
                                    type="text" 
                                    value={name} 
                                    onChange={e => setName(e.target.value)} 
                                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent backdrop-blur-sm" 
                                    placeholder="John Doe" 
                                    required 
                                />
                            </div>
                        )}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">{t.emailLabel}</label>
                            <input 
                                id="email" 
                                type="email" 
                                value={email} 
                                onChange={e => setEmail(e.target.value)} 
                                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent backdrop-blur-sm" 
                                placeholder="user@example.com" 
                                required 
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">{t.passwordLabel}</label>
                            <input 
                                id="password" 
                                type="password" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent backdrop-blur-sm" 
                                placeholder="password123" 
                                required 
                            />
                        </div>
                        {error && <div className="text-red-400 text-sm text-center bg-red-500/20 p-2 rounded-md border border-red-400/30">{error}</div>}
                        {successMessage && <div className="text-green-400 text-sm text-center bg-green-500/20 p-2 rounded-md border border-green-400/30">{successMessage}</div>}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-orange-500/80 backdrop-blur-sm text-white py-3 px-4 rounded-md hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium border border-white/20"
                        >
                            {isLoading ? 'Processing...' : (mode === 'signup' ? t.signUpButton : 'Login')}
                        </button>
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                                className="text-sm font-medium text-white/80 hover:text-white hover:underline"
                            >
                                {mode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                            </button>
                        </div>
                        
                        <div className="text-center">
                            <p className="text-sm text-white/70">
                                Demo: user@example.com / password123
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
