import React, { useState } from 'react';
import { authService } from '../lib/appwriteService';
import UserSolidIcon from '../components/icons/UserSolidIcon';
// import HomeIcon from '../components/icons/HomeIcon';
import BriefcaseIcon from '../components/icons/BriefcaseIcon';
import HomeIcon from '../components/icons/HomeIcon';
import MapPinIcon from '../components/icons/MapPinIcon';
import DocumentTextIcon from '../components/icons/DocumentTextIcon';
import { LogIn, UserPlus } from 'lucide-react';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import { AppDrawer } from '../components/AppDrawer';
import { React19SafeWrapper } from '../components/React19SafeWrapper';
import PageNumberBadge from '../components/PageNumberBadge';
import PasswordInput from '../components/PasswordInput';

const loginOptions = [
  { id: 'user', label: 'User', icon: UserSolidIcon },
  { id: 'therapist', label: 'Therapist', icon: UserSolidIcon },
  { id: 'place', label: 'Massage Place', icon: BriefcaseIcon },
  { id: 'hotel', label: 'Hotel', icon: HomeIcon },
  { id: 'villa', label: 'Villa', icon: MapPinIcon },
  { id: 'agent', label: 'Agent', icon: BriefcaseIcon },
  { id: 'admin', label: 'Admin', icon: DocumentTextIcon },
];

interface UnifiedLoginPageProps {
  onBack?: () => void;
  t?: any;
  // Navigation handlers
  onMassageJobsClick?: () => void;
  onHotelPortalClick?: () => void;
  onVillaPortalClick?: () => void;
  onTherapistPortalClick?: () => void;
  onMassagePlacePortalClick?: () => void;
  onAgentPortalClick?: () => void;
  onCustomerPortalClick?: () => void;
  onAdminPortalClick?: () => void;
  onTermsClick?: () => void;
  onPrivacyClick?: () => void;
  onNavigate?: (page: string) => void;
}

const UnifiedLoginPage: React.FC<UnifiedLoginPageProps> = ({
  onBack,
  t,
  onMassageJobsClick,
  onHotelPortalClick,
  onVillaPortalClick,
  onTherapistPortalClick,
  onMassagePlacePortalClick,
  onAgentPortalClick,
  onCustomerPortalClick,
  onAdminPortalClick,
  onTermsClick,
  onPrivacyClick,
  onNavigate
}) => {
  const [selectedRole, setSelectedRole] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ email: '', password: '', extra: '' });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!selectedRole) {
      setError('Please select a role.');
      return;
    }
    try {
      setLoading(true);
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
          if (selectedRole === 'user') {
            try {
              await authService.register(form.email, form.password, 'User');
              try { localStorage.setItem('just_registered', 'true'); } catch {}
              setSuccess('Account created. Please sign in to continue.');
              setMode('login');
            } catch (err: any) {
              if (err?.message?.includes('already exists')) {
                setError('An account with this email already exists. Please use Login.');
                setMode('login');
              } else {
                setError(err?.message || 'An error occurred.');
              }
            }
          } else {
            setError('Registration for this role is not implemented yet.');
          }
        }
      } else {
        if (selectedRole === 'admin') {
          await authService.login(form.email, form.password);
          setSuccess('Logged in as admin! Redirecting...');
          setTimeout(() => { window.location.reload(); }, 1000);
        } else if (selectedRole === 'user') {
          await authService.login(form.email, form.password);
          setSuccess('Logged in! Redirecting to your dashboard...');
          if (onNavigate) {
            onNavigate('customerDashboard');
          } else {
            setTimeout(() => { window.location.reload(); }, 500);
          }
        } else {
          setError('Login for this role is not implemented yet.');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageNumberBadge pageNumber={3} pageName="UnifiedLoginPage" isLocked={false} />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">
            <span className="text-black">Inda</span><span className="text-orange-500"><span className="inline-block animate-float">S</span>treet</span>
          </h1>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMenuOpen(true)} title="Menu" className="p-2 hover:bg-orange-50 rounded-full transition-colors text-orange-500">
              <BurgerMenuIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Global App Drawer */}
      <React19SafeWrapper condition={isMenuOpen}>
        <AppDrawer
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          t={t}
          onMassageJobsClick={onMassageJobsClick}
          onHotelPortalClick={onHotelPortalClick}
          onVillaPortalClick={onVillaPortalClick}
          onTherapistPortalClick={onTherapistPortalClick}
          onMassagePlacePortalClick={onMassagePlacePortalClick}
          onAgentPortalClick={onAgentPortalClick}
          onCustomerPortalClick={onCustomerPortalClick}
          onAdminPortalClick={onAdminPortalClick}
          onNavigate={onNavigate}
          onTermsClick={onTermsClick}
          onPrivacyClick={onPrivacyClick}
          therapists={[]}
          places={[]}
        />
      </React19SafeWrapper>

      {/* Main Content with Background */}
      <main
        className="min-h-screen h-screen w-full flex flex-col items-center justify-center p-4 overflow-hidden"
        style={{
          backgroundImage: "url('https://ik.imagekit.io/7grri5v7d/massage%20image%208.png?updatedAt=1760187222991')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay for better readability */}
        <div className="absolute inset-0 bg-black/40 z-10"></div>

        {/* Removed floating Home button per request */}

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
            <PasswordInput
              value={form.password}
              onChange={(value) => setForm({ ...form, password: value })}
              label="Password"
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
            disabled={loading}
            className={`w-full ${loading ? 'bg-orange-300 cursor-wait' : 'bg-orange-500 hover:bg-orange-600'} text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg transition-all mt-6`}
          >
            {mode === 'login' ? (
              <>
                <LogIn className="w-5 h-5" />
                {loading ? 'Logging in…' : 'Login'}
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                {loading ? 'Creating…' : 'Register'}
              </>
            )}
          </button>
        </form>
      </div>
      </main>
    </div>
  );
};

export default UnifiedLoginPage;
