import React, { useState } from 'react';
import { useBackground } from '../../../shared/hooks/useBackground';
import PasswordInput from '../../../../components/PasswordInput';

interface AdminLoginProps {
  onLogin: (credentials: { username: string; password: string }) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const { backgroundStyle, backgroundClass } = useBackground('admin');
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      onLogin(credentials);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div 
      className={`min-h-screen flex flex-col justify-center p-4 ${backgroundClass}`}
      style={backgroundStyle}
    >
      <div className="w-full max-w-sm mx-auto">
        <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              <span className="text-white">Indo</span>
              <span className="text-orange-400">Street</span>
            </h1>
            <h2 className="text-xl font-semibold text-white mb-2">Admin Portal</h2>
            <p className="text-white/80">Secure administrative access</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Admin Username
              </label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent backdrop-blur-sm"
                placeholder="admin123"
                required
              />
            </div>

            <div>
              <PasswordInput
                value={credentials.password}
                onChange={(value: string) => setCredentials({ ...credentials, password: value })}
                label="Password"
                placeholder="indostreet2024"
                required
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent backdrop-blur-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500/80 backdrop-blur-sm text-white py-3 px-4 rounded-md hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium border border-white/20"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="text-center">
              <p className="text-sm text-white/70">
                Demo: admin123 / indostreet2024
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;