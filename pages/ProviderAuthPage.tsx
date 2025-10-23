import React, { useState } from 'react';


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
        
        setError('');
        setSuccessMessage('');
        setIsLoading(true);

        if (!email || !password) {
            setError(t.fillFieldsError);
            setIsLoading(false);
            return;
        }

        if (mode === 'register') {
            // Mock implementation - replace with your actual authentication logic
            const result = await onRegister(email, agentCode);
            if (result.success) {
                setSuccessMessage(result.message);
                setEmail('');
                setPassword('');
                setAgentCode('');
            } else {
                setError(result.message);
            }
        } else {
            // Mock implementation for login - replace with your actual authentication logic
            const result = await onLogin(email);
            if (!result.success) {
                setError(result.message);
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
         <div className="min-h-screen flex flex-col justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 p-4 relative">
            <button onClick={onBack} className="absolute top-4 left-4 text-white/80 hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <div className="w-full max-w-md mx-auto">
                <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">
                            <span className="text-white">Indo</span><span className="text-orange-400">Street</span>
                        </h1>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <h2 className="text-xl font-semibold text-white text-center mb-6">{getTitle()}</h2>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">{t.emailLabel}</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent backdrop-blur-sm"
                                placeholder={providerType === 'therapist' ? 'therapist@example.com' : 'place@example.com'}
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
                            />
                        </div>

                        {mode === 'register' && (
                            <div>
                                <label htmlFor="agentCode" className="block text-sm font-medium text-white/90 mb-2">{t.agentCodeLabel}</label>
                                <input
                                    id="agentCode"
                                    type="text"
                                    value={agentCode}
                                    onChange={e => setAgentCode(e.target.value)}
                                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent backdrop-blur-sm"
                                    placeholder="AGENT123"
                                />
                            </div>
                        )}
                        
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
                                    onSwitchMode();
                                }}
                                className="text-sm font-medium text-white/80 hover:text-white hover:underline"
                            >
                                {switchText}
                            </button>
                        </div>
                        
                        <div className="text-center">
                            <p className="text-sm text-white/70">
                                Demo: {providerType}@example.com / password123
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProviderAuthPage;