import React, { useState, useEffect } from 'react';
import type { SupabaseConfig } from '../types';
import Button from '../components/Button';

interface SupabaseSettingsPageProps {
    onConnect: (url: string, key: string) => void;
    onDisconnect: () => void;
    onBack: () => void;
    config: SupabaseConfig | null;
    isConnected: boolean;
    t: any;
}

const SupabaseSettingsPage: React.FC<SupabaseSettingsPageProps> = ({ onConnect, onDisconnect, onBack, config, isConnected, t }) => {
    const [url, setUrl] = useState('');
    const [key, setKey] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (config) {
            setUrl(config.url);
            setKey(config.key);
        }
    }, [config]);

    const handleConnect = () => {
        if (!url.trim() || !key.trim()) {
            setError(t.error);
            return;
        }
        setError('');
        onConnect(url, key);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <header className="flex items-center mb-6">
                <button onClick={onBack} className="text-gray-600 hover:text-gray-800 mr-4">
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-xl font-bold text-gray-800">{t.title}</h1>
            </header>
            
            <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
                <div>
                    <h2 className="font-semibold text-lg text-gray-800">{t.status}</h2>
                    <p className={`font-bold mt-1 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                        {isConnected ? t.connected : t.notConnected}
                    </p>
                </div>
                
                <p className="text-sm text-gray-600">{t.description}</p>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="supabase-url" className="block text-sm font-medium text-gray-700">{t.urlLabel}</label>
                        <input
                            id="supabase-url"
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-green focus:border-brand-green text-gray-900"
                            placeholder="https://your-project.supabase.co"
                        />
                    </div>
                     <div>
                        <label htmlFor="supabase-key" className="block text-sm font-medium text-gray-700">{t.keyLabel}</label>
                        <input
                            id="supabase-key"
                            type="password"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-green focus:border-brand-green text-gray-900"
                            placeholder="your-anon-key"
                        />
                    </div>
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <div className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={handleConnect} variant="primary">{t.connectButton}</Button>
                    {isConnected && (
                        <Button onClick={onDisconnect} variant="secondary">{t.disconnectButton}</Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SupabaseSettingsPage;