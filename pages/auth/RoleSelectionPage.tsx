import React from 'react';
import { User, Building2, Sparkles, ArrowLeft } from 'lucide-react';

interface RoleSelectionPageProps {
  onNavigate?: (page: string) => void;
}

const RoleSelectionPage: React.FC<RoleSelectionPageProps> = ({ onNavigate }) => {
  
  const handleRoleSelect = (role: string) => {
    if (onNavigate) {
      // Navigate to signup with role parameter
      const url = new URL(window.location.href);
      url.searchParams.set('role', role);
      window.history.pushState({}, '', url.toString());
      onNavigate('signup');
    } else {
      // Fallback - direct redirect
      window.location.href = `/signup?role=${role}`;
    }
  };

  const handleBack = () => {
    if (onNavigate) {
      onNavigate('home');
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={handleBack}
            className="absolute top-4 left-4 p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-800">
              <span className="text-black">Inda</span>
              <span className="text-orange-500">Street</span>
            </h1>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Create Account
          </h2>
          <p className="text-gray-500">
            Choose your account type to get started
          </p>
        </div>

        {/* Role Selection */}
        <div className="space-y-4">
          
          {/* Therapist Option */}
          <button
            onClick={() => handleRoleSelect('therapist')}
            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                <User className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800">Massage Therapist</h3>
                <p className="text-sm text-gray-500">Individual massage professionals</p>
              </div>
            </div>
          </button>

          {/* Massage Place Option */}
          <button
            onClick={() => handleRoleSelect('massage_place')}
            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                <Building2 className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800">Massage Spa</h3>
                <p className="text-sm text-gray-500">Massage businesses & spas</p>
              </div>
            </div>
          </button>

          {/* Facial Place Option */}
          <button
            onClick={() => handleRoleSelect('facial_place')}
            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                <Sparkles className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800">Facial Spa</h3>
                <p className="text-sm text-gray-500">Facial treatment providers</p>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate ? onNavigate('login') : (window.location.href = '/login')}
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionPage;