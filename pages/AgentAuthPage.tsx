// File deleted as part of unified login refactor.
import React, { useState } from 'react';


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
        
        setError('');
        setSuccessMessage('');
        setIsLoading(true);
        
        if (mode === 'register') {
            if (!name || !email || !password) {
                setError(t.fillFieldsError);
                setIsLoading(false);
                return;
            }
            
            // Mock implementation - replace with your actual authentication logic
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
        } else { // Login mode
            if (!email || !password) {
                setError(t.fillFieldsError);
                setIsLoading(false);
                return;
            }
            
            // Mock implementation - replace with your actual authentication logic
            const loginResult = await onLogin(email);
            if (!loginResult.success) {
                setError(loginResult.message);
            }
        }
        setIsLoading(false);
    };

    const title = mode === 'register' ? t.registerTitle : t.loginTitle;
    const buttonText = mode === 'register' ? t.registerButton : t.loginButton;
    const switchText = mode === 'register' ? t.switchToLogin : t.switchToRegister;

    return (
        <div className="min-h-screen flex flex-col justify-center p-4 relative" style={{ backgroundImage: "url('https://ik.imagekit.io/7grri5v7d/massage%20hoter%20villa.png?updatedAt=1760965742264')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="w-full flex justify-center z-30 pt-20 pb-8 absolute top-0 left-0">
                <h1 className="text-6xl font-extrabold tracking-tight drop-shadow-lg">
                    <span className="text-white">Indo</span>
                    <span className="text-orange-500">Street</span>
                </h1>
            </div>
            <button onClick={onBack} className="absolute top-8 left-4 z-20 focus:outline-none" aria-label="Back to Home">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-orange-500 shadow-lg border-2 border-white transition-all duration-200 hover:bg-orange-600">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </span>
            </button>
            <div className="w-full max-w-sm mx-auto relative z-20 flex items-center justify-center min-h-[20vh] mt-32">
                <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-4 flex flex-col justify-center transition-all duration-300 min-h-[240px] max-h-[340px] w-full max-w-xs">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <h2 className="text-xl font-semibold text-white text-center mb-6">{title}</h2>
                        {mode === 'register' && (
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-white/90 mb-2">{t.nameLabel}</label>
                                <input 
                                    id="name" 
                                    type="text" 
                                    value={name} 
                                    onChange={e => setName(e.target.value)} 
                                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent backdrop-blur-sm" 
                                    placeholder="Agent Name"
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
                                placeholder="agent@example.com"
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
                            {isLoading ? 'Processing...' : buttonText}
                        </button>
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setError('');
                                    setSuccessMessage('');
                                    setMode(mode === 'login' ? 'register' : 'login')
                                }}
                                className="text-sm font-medium text-white/80 hover:text-white hover:underline"
                            >
                                {switchText}
                            </button>
                        </div>
                        
                        <div className="text-center">
                            <p className="text-sm text-white/70">
                                Demo: agent@example.com / password123
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AgentAuthPage;