

import React, { useState } from 'react';
import type { User } from '../types';
import Button from '../components/Button';
import { ADMIN_ACTIVATION_CODE } from '../constants';
import HomeIcon from '../components/icons/HomeIcon';

interface AuthPageProps {
    onLogin: (user: User) => void;
    onBack: () => void;
    t: any;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onBack, t }) => {
    const [isSignedUp, setIsSignedUp] = useState(false);
    const [activationCode, setActivationCode] = useState('');
    const [error, setError] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignUp = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && email && password) {
            setError('');
            setIsSignedUp(true);
        } else {
            setError(t.fillFieldsError);
        }
    };
    
    const handleActivation = () => {
        if (activationCode === ADMIN_ACTIVATION_CODE) {
            const newUser: User = {
                id: `user_${Date.now()}`,
                name: name,
                email: email,
                isActivated: true,
            };
            onLogin(newUser);
        } else {
            setError(t.invalidCodeError);
        }
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
                    {!isSignedUp ? (
                        <form onSubmit={handleSignUp} className="space-y-6">
                            <h2 className="text-2xl font-semibold text-gray-800 text-center">{t.createAccount}</h2>
                             <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t.nameLabel}</label>
                                <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-green focus:border-brand-green" placeholder={t.namePlaceholder} />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t.emailLabel}</label>
                                <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-green focus:border-brand-green" placeholder={t.emailPlaceholder} />
                            </div>
                             <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">{t.passwordLabel}</label>
                                <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-green focus:border-brand-green" placeholder="••••••••" />
                            </div>
                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                            <Button type="submit">{t.signUpButton}</Button>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-semibold text-gray-800 text-center">{t.activationTitle}</h2>
                            <p className="text-center text-gray-600">{t.activationPrompt}</p>
                             <div>
                                <label htmlFor="activationCode" className="block text-sm font-medium text-gray-700">{t.activationCodeLabel}</label>
                                <input 
                                    id="activationCode"
                                    type="text" 
                                    value={activationCode} 
                                    onChange={e => setActivationCode(e.target.value)} 
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-green focus:border-brand-green"
                                    placeholder={t.activationCodePlaceholder} />
                            </div>
                             {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                            <Button onClick={handleActivation}>{t.activateButton}</Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;