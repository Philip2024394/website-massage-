import React, { useState } from 'react';
import { authService } from '../lib/appwriteService';
import UserSolidIcon from '../components/icons/UserSolidIcon';
// import HomeIcon from '../components/icons/HomeIcon';
import BriefcaseIcon from '../components/icons/BriefcaseIcon';
import HomeIcon from '../components/icons/HomeIcon';
import MapPinIcon from '../components/icons/MapPinIcon';
import DocumentTextIcon from '../components/icons/DocumentTextIcon';

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
  // If using react-router, otherwise replace with your navigation logic
  let navigate: any = () => window.location.href = '/';
  try { navigate = require('react-router-dom').useNavigate(); } catch {}
  const [selectedRole, setSelectedRole] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ email: '', password: '', extra: '' });

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value);
    setForm({ email: '', password: '', extra: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  // Demo quick-login for design: instantly log in as any type
  const handleDemoLogin = (role: string) => {
    // For design/demo: route to the correct dashboard page
    switch (role) {
      case 'user':
        window.location.href = '/'; // HomePage
        break;
      case 'therapist':
        window.location.href = '/#therapistDashboard';
        break;
      case 'place':
        window.location.href = '/#placeDashboard';
        break;
      case 'hotel':
        window.location.href = '/#hotelDashboard';
        break;
      case 'villa':
        window.location.href = '/#villaDashboard';
        break;
      case 'agent':
        window.location.href = '/#agentDashboard';
        break;
      case 'admin':
        window.location.href = '/#adminDashboard';
        break;
      default:
        window.location.href = '/';
    }
  };

  const demoRoles = [
    { id: 'user', label: 'User Dashboard' },
    { id: 'therapist', label: 'Therapist Dashboard' },
    { id: 'place', label: 'Massage Place Dashboard' },
    { id: 'hotel', label: 'Hotel Dashboard' },
    { id: 'villa', label: 'Villa Dashboard' },
    { id: 'agent', label: 'Agent Dashboard' },
    { id: 'admin', label: 'Admin Dashboard' },
  ];

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
      className="min-h-screen flex flex-col items-center justify-center p-4 relative"
      style={{
        backgroundImage: "url('https://ik.imagekit.io/7grri5v7d/massage%20hoter%20villa.png?updatedAt=1760965742264')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Return to Home Button */}
      <button
        onClick={() => typeof navigate === 'function' ? navigate('/') : window.location.href = '/'}
        className="absolute top-6 left-6 z-20 focus:outline-none"
        aria-label="Back to Home"
      >
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-500 shadow-lg border-2 border-white transition-all duration-200 hover:bg-orange-600">
          <HomeIcon className="w-6 h-6 text-white" />
        </span>
      </button>
      <div className="bg-white/90 rounded-xl shadow-lg p-8 w-full max-w-md backdrop-blur-md">
        {/* DEV ONLY: Direct admin dashboard access */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="mb-4 text-center">
            <button
              type="button"
              className="inline-block bg-orange-600 text-white px-4 py-2 rounded font-bold shadow hover:bg-orange-700 transition"
              style={{ marginBottom: 16 }}
              onClick={() => {
                // Set admin state in localStorage and reload to trigger admin dashboard
                localStorage.setItem('isAdminLoggedIn', 'true');
                window.location.reload();
              }}
            >
              Go to Admin Dashboard (DEV ONLY)
            </button>
          </div>
        )}
        {/* DEMO: Quick login for design */}
        <div className="mb-6">
          <div className="font-semibold text-center mb-2 text-orange-600">Quick Dashboard Access (Design Only)</div>
          <div className="flex flex-wrap gap-2 justify-center">
            {demoRoles.map(role => (
              <button
                key={role.id}
                type="button"
                className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 text-xs font-semibold"
                onClick={() => handleDemoLogin(role.id)}
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-6 text-center">Login / Create Account</h2>
  {error && <div className="text-red-500 text-center mb-2">{error}</div>}
  {success && <div className="text-green-600 text-center mb-2">{success}</div>}
  <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Select Role</label>
            <select
              className="w-full border rounded p-2"
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
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              name="email"
              className="w-full border rounded p-2"
              value={form.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Password</label>
            <input
              type="password"
              name="password"
              className="w-full border rounded p-2"
              value={form.password}
              onChange={handleInputChange}
              required
            />
          </div>
          {/* Extra field for registration, e.g. agent code for therapist/place */}
          {mode === 'register' && (selectedRole === 'therapist' || selectedRole === 'place') && (
            <div>
              <label className="block mb-1 font-medium">Agent Code (optional)</label>
              <input
                type="text"
                name="extra"
                className="w-full border rounded p-2"
                value={form.extra}
                onChange={handleInputChange}
              />
            </div>
          )}
          <div className="flex justify-between items-center mt-4">
            <button
              type="button"
              className="text-blue-600 hover:underline text-sm"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            >
              {mode === 'login' ? 'Create an account' : 'Already have an account? Login'}
            </button>
            <button
              type="submit"
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 font-semibold"
            >
              {mode === 'login' ? 'Login' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnifiedLoginPage;
