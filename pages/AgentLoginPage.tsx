import React, { useState } from 'react';


import { agentAuth } from '../lib/auth';
import { LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
// No burger menu here
// Drawer is home-only; not used here
import PageNumberBadge from '../components/PageNumberBadge';

interface AgentLoginPageProps {
    onSuccess: (agentId: string) => void;
    onBack: () => void;
    t: any;
}

const AgentLoginPage: React.FC<AgentLoginPageProps> = ({ onSuccess, _onBack, t: _t }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    // No drawer state here; drawer is restricted to HomePage
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isSignUp) {
                const response = await agentAuth.signUp(email, password);
                
                if (response.success) {
                    setIsSignUp(false);
                    setError('✅ Account created! Please sign in.');
                    setPassword('');
                } else {
                    throw new Error(response.error || 'Sign up failed');
                }
            } else {
                const response = await agentAuth.signIn(email, password);
                
                if (response.success && response.userId) {
                    onSuccess(response.userId);
                } else {
                    throw new Error(response.error || 'Sign in failed');
                }
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
            <PageNumberBadge pageNumber={7} pageName="AgentLoginPage" isLocked={false} />
            
            {/* Global Header */}
            <header className="bg-white p-4 shadow-md z-[9997] flex-shrink-0">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        <span className="text-black">Inda</span><span className="text-orange-500"><span className="inline-block animate-float">S</span>treet</span>
                    </h1>
                    <div className="flex items-center gap-3 text-gray-600" />
                </div>
            </header>


            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-4 overflow-hidden">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2 text-gray-800">Agent Portal</h2>
                        <p className="text-gray-600 text-sm">Access your agent dashboard and commissions</p>
                        <div className="w-16 h-1 bg-blue-500 rounded-full mx-auto mt-3"></div>
                    </div>

                        // Deprecated: AgentLoginPage consolidated into Indastreet Partner login
                        import React from 'react';
                        const AgentLoginPage: React.FC = () => null;
                        export default AgentLoginPage;