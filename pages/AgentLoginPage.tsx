import React, { useState } from 'react';
import Button from '../components/Button';

interface AgentLoginPageProps {
    onSuccess: (agentId: string) => void;
    onBack: () => void;
    t: any;
}

const AgentLoginPage: React.FC<AgentLoginPageProps> = ({ onSuccess, onBack, t }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isSignUp) {
                const response = await fetch('/api/auth/agent/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                if (!response.ok) throw new Error('Sign up failed');
                
                setIsSignUp(false);
                setError('Account created! Please sign in.');
                setPassword('');
            } else {
                const response = await fetch('/api/auth/agent/signin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                if (!response.ok) throw new Error('Sign in failed');
                
                const data = await response.json();
                onSuccess(data.agentId);
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-purple-600 mb-2">IndaStreet</h1>
                    <p className="text-gray-600">Agent Portal</p>
                </div>

                <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setIsSignUp(false)}
                        className={`flex-1 py-2 px-4 rounded-md transition-all ${
                            !isSignUp ? 'bg-white shadow text-purple-600 font-semibold' : 'text-gray-600'
                        }`}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => setIsSignUp(true)}
                        className={`flex-1 py-2 px-4 rounded-md transition-all ${
                            isSignUp ? 'bg-white shadow text-purple-600 font-semibold' : 'text-gray-600'
                        }`}
                    >
                        Sign Up
                    </button>
                </div>

                {error && (
                    <div className={`mb-4 p-3 rounded-lg ${error.includes('created') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="agent@indastreet.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="••••••••"
                            required
                            minLength={8}
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 mt-6"
                    >
                        {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
                    </Button>
                </form>

                <button
                    onClick={onBack}
                    className="w-full mt-4 text-gray-600 hover:text-gray-800 py-2"
                >
                    ← Back to Login Portal
                </button>
            </div>
        </div>
    );
};

export default AgentLoginPage;
