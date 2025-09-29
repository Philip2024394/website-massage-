
import React, { useState } from 'react';
import Button from '../components/Button';
import { ADMIN_SIGNIN_CODE } from '../constants';
import LogoIcon from '../components/icons/LogoIcon';

interface AdminLoginPageProps {
    onAdminLogin: () => void;
    t: any;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onAdminLogin, t }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');

    const handleLogin = () => {
        if (code === ADMIN_SIGNIN_CODE) {
            onAdminLogin();
        } else {
            setError(t.error);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center bg-gray-50 p-4">
            <div className="w-full max-w-sm mx-auto">
                 <div className="text-center mb-8">
                    <div className="inline-block bg-brand-green p-4 rounded-full">
                       <LogoIcon className="h-12 w-auto" />
                    </div>
                    <h1 className="text-3xl font-bold text-brand-green mt-4">2Go Massage</h1>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold text-gray-800 text-center">{t.title}</h2>
                        <p className="text-center text-gray-600">{t.prompt}</p>
                        <div>
                            <input 
                                type="password" 
                                value={code} 
                                onChange={e => setCode(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-green focus:border-brand-green text-center text-gray-900"
                                placeholder={t.placeholder}
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <Button onClick={handleLogin}>{t.button}</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;