import React from 'react';

interface TherapistLoginPageProps {
  onSuccess: (therapistId: string) => void;
  onBack: () => void;
}

const TherapistLoginPage: React.FC<TherapistLoginPageProps> = ({ onSuccess, onBack }) => {
  const handleLogin = () => {
    // Mock login - replace with real authentication
    onSuccess('therapist-123');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold mb-4">
          <span className="text-black">Inda</span>
          <span className="text-orange-500">Street</span>
        </h1>
        <h2 className="text-xl mb-4">Therapist Login</h2>
        <p className="text-gray-600 mb-8">This page will contain the therapist login form</p>
        <div className="space-y-4">
          <button 
            onClick={handleLogin}
            className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Login (Demo)
          </button>
          <button 
            onClick={onBack}
            className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default TherapistLoginPage;