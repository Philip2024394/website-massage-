import React, { useState } from 'react';
import { authService } from '../lib/appwriteService';
import UserSolidIcon from '../components/icons/UserSolidIcon';
// import HomeIcon from '../components/icons/HomeIcon';
import BriefcaseIcon from '../components/icons/BriefcaseIcon';
import HomeIcon from '../components/icons/HomeIcon';
import MapPinIcon from '../components/icons/MapPinIcon';
import DocumentTextIcon from '../components/icons/DocumentTextIcon';
import { LogIn, UserPlus } from 'lucide-react';
import PageNumberBadge from '../components/PageNumberBadge';

const loginOptions = [
  { id: 'user', label: 'User', icon: UserSolidIcon },
  { id: 'therapist', label: 'Therapist', icon: UserSolidIcon },
  { id: 'place', label: 'Massage Place', icon: BriefcaseIcon },
  { id: 'hotel', label: 'Hotel', icon: HomeIcon },
  { id: 'villa', label: 'Villa', icon: MapPinIcon },
  { id: 'agent', label: 'Agent', icon: BriefcaseIcon },
  { id: 'admin', label: 'Admin', icon: DocumentTextIcon },
];

const UnifiedLoginPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ email: '', password: '', extra: '' });

  // Navigation function - fallback for environments without react-router
  const navigate = (path: string) => {
    window.location.href = path;
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value);
    setForm({ email: '', password: '', extra: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!selectedRole) {
      setError('Please select a role.');
      return;
    }
    try {
      if (mode === 'register') {
        if (selectedRole === 'admin') {
          try {
            await authService.register(form.email, form.password, 'Admin');
            // Try to log in immediately after registration
            try {
              await authService.login(form.email, form.password);
              setSuccess('Admin account created and logged in! Redirecting...');
              setTimeout(() => { window.location.reload(); }, 1000);
            } catch (loginErr: any) {
              // If session conflict, try logout then login again
              if (loginErr?.message?.includes('session is active')) {
                try {
                  await authService.logout();
                  await authService.login(form.email, form.password);
                  setSuccess('Admin account created and logged in! Redirecting...');
                  setTimeout(() => { window.location.reload(); }, 1000);
                } catch (finalErr: any) {
                  setError(finalErr?.message || 'An error occurred after registration.');
                }
              } else {
                setError(loginErr?.message || 'An error occurred after registration.');
              }
            }
          } catch (err: any) {
            if (err?.message?.includes('already exists')) {
              setError('An account with this email already exists. Please use the Login button.');
            } else {
              setError(err?.message || 'An error occurred.');
            }
          }
        } else {
          setError('Registration for this role is not implemented yet.');
        }
      } else {
        if (selectedRole === 'admin') {
          await authService.login(form.email, form.password);
          setSuccess('Logged in as admin! Redirecting...');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          setError('Login for this role is not implemented yet.');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred.');
    }
  };

  return (
    <div
      className="min-h-screen h-screen w-full flex flex-col items-center justify-center p-4 overflow-hidden fixed inset-0 z-50"
      style={{
        backgroundImage: "url('https://ik.imagekit.io/7grri5v7d/massage%20image%208.png?updatedAt=1760187222991')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <PageNumberBadge pageNumber={3} pageName="UnifiedLoginPage" isLocked={false} />
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/40 z-10"></div>

      {/* Return to Home Button */}
      <button
        onClick={() => typeof navigate === 'function' ? navigate('/') : window.location.href = '/'}
        className="fixed top-6 left-6 w-12 h-12 bg-orange-500 hover:bg-orange-600 rounded-full shadow-lg flex items-center justify-center transition-all z-30 border border-orange-400"
        aria-label="Back to Home"
      >
        <HomeIcon className="w-6 h-6 text-white" />
      </button>

      {/* Glass Effect Login Container */}
      <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 relative z-20 border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-white">Inda</span>
            <span className="text-orange-400">Street</span>
          </h1>
          <p className="text-white/90 font-medium">Customer Account</p>
        </div>

        <div className="flex mb-6 bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 px-4 rounded-md transition-all ${
              mode === 'login' ? 'bg-orange-500 shadow-lg text-white font-semibold' : 'text-white/90 hover:bg-white/5'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-2 px-4 rounded-md transition-all ${
              mode === 'register' ? 'bg-orange-500 shadow-lg text-white font-semibold' : 'text-white/90 hover:bg-white/5'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg backdrop-blur-sm bg-red-500/20 text-red-100 border border-red-400/30">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-lg backdrop-blur-sm bg-green-500/20 text-green-100 border border-green-400/30">
            {success}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Select Role</label>
            <select
              className="w-full bg-white/90 backdrop-blur-sm border border-white/30 rounded-lg p-3 focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900"
              value={selectedRole}
              onChange={handleRoleChange}
              required
            >
              <option value="" disabled>Select...</option>
              {loginOptions.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Email</label>
            <input
              type="email"
              name="email"
              className="w-full bg-white/90 backdrop-blur-sm border border-white/30 rounded-lg p-3 focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900 placeholder-gray-500"
              value={form.email}
              onChange={handleInputChange}
              placeholder="your@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Password</label>
            <input
              type="password"
              name="password"
              className="w-full bg-white/90 backdrop-blur-sm border border-white/30 rounded-lg p-3 focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900 placeholder-gray-500"
              value={form.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              required
            />
          </div>
          {/* Extra field for registration, e.g. agent code for therapist/place */}
          {mode === 'register' && (selectedRole === 'therapist' || selectedRole === 'place') && (
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Agent Code (optional)</label>
              <input
                type="text"
                name="extra"
                className="w-full bg-white/90 backdrop-blur-sm border border-white/30 rounded-lg p-3 focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900 placeholder-gray-500"
                value={form.extra}
                onChange={handleInputChange}
                placeholder="Agent code (optional)"
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg transition-all mt-6"
          >
            {mode === 'login' ? (
              <>
                <LogIn className="w-5 h-5" />
                Login
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Register
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UnifiedLoginPage;
