import React from 'react';

interface PrivacyPolicyPageProps {
  onBack: () => void;
  onNavigate?: (page: string) => void;
}

const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onBack, onNavigate }) => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">
          <span className="text-black">Inda</span>
          <span className="text-orange-500">Street</span>
        </h1>
        <h2 className="text-xl mb-4">Privacy Policy</h2>
        <p className="text-gray-600 mb-8">This page will contain the privacy policy</p>
        <button 
          onClick={onBack}
          className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;