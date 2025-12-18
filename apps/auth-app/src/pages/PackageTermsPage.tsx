import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface PackageTermsPageProps {
  onBack: () => void;
  onNavigate?: (page: string) => void;
}

const PackageTermsPage: React.FC<PackageTermsPageProps> = ({ onBack, onNavigate }) => {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">
                <span className="text-black">Inda</span>
                <span className="text-orange-500">Street</span>
              </h1>
            </div>
            <button onClick={onBack} className="p-3 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-center">
          <h2 className="text-xl mb-4">Terms & Conditions</h2>
          <p className="text-gray-600 mb-8">This page will contain the package terms and conditions</p>
          <button 
            onClick={() => onNavigate?.('membershipSignup')}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Back to Create Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default PackageTermsPage;