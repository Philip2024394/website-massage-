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
        <div className="min-h-screen flex flex-col justify-center p-4 relative">
            <div className="w-full flex justify-center z-30 pt-24 pb-8 absolute top-0 left-0">
                <h1 className="text-6xl font-extrabold tracking-tight drop-shadow-lg">
                    <span className="text-white">Indo</span>
                    <span className="text-orange-500">Street</span>
                </h1>
            </div>
            <div
                className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out z-0"
                style={{
                    backgroundImage: "url('https://ik.imagekit.io/7grri5v7d/garden%20massage.png?updatedAt=1761228771461')"
                }}
            />
            <button onClick={onBack} className="absolute top-8 left-4 z-20 focus:outline-none" aria-label="Back to Home">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-orange-500 shadow-lg border-2 border-white transition-all duration-200 hover:bg-orange-600">
                    <HomeIcon className="w-5 h-5 text-white" />
                </span>
            </button>
            <div className="w-full max-w-sm mx-auto relative z-20 flex items-center justify-center min-h-[30vh] mt-20">
                {/* Unify container height for both modes, reduce width */}
                <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-4 flex flex-col justify-center transition-all duration-300 min-h-[340px] max-h-[440px] w-full max-w-xs">
                    <form onSubmit={handleAuth} className="space-y-8">
                                                                        {mode === 'signup' ? (
                                                                            <div className="space-y-6">
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
                                                                            </div>
                                                ) : (
                                                    <>
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
                                                    </>
                                                )}
                        {error && <div className="text-red-400 text-sm text-center bg-red-500/20 p-2 rounded-md border border-red-400/30">{error}</div>}
                        {successMessage && <div className="text-green-400 text-sm text-center bg-green-500/20 p-2 rounded-md border border-green-400/30">{successMessage}</div>}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-orange-500/80 backdrop-blur-sm text-white py-3 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium border border-white/20"
                        >
                            {isLoading ? 'Processing...' : (mode === 'signup' ? t.signUpButton : 'Login')}
                        </button>
                        <div className="text-center pt-2 mt-4">
                            <button
                                type="button"
                                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                                className="text-sm font-medium hover:underline focus:outline-none"
                            >
                                {mode === 'login' ? (
                                    <>
                                        <span className="text-gray-900">Don't have an account? </span>
                                        <span className="text-orange-500 font-bold">Create Account</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-gray-900">Already have an account? </span>
                                        <span className="text-orange-500 font-bold">Sign In</span>
                                    </>
                                )}
                            </button>
                        </div>
                        
                        {/* Demo text removed */}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
