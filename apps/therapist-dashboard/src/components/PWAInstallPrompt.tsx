// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState } from 'react';
import EnterpriseTherapistPWAInstaller from '../../../src/components/EnterpriseTherapistPWAInstaller';

interface PWAInstallPromptProps {
  dashboardName?: string;
  therapistId?: string;
// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState } from 'react';
import EnterpriseTherapistPWAInstaller from '../../../src/components/EnterpriseTherapistPWAInstaller';

interface PWAInstallPromptProps {
  dashboardName?: string;
  therapistId?: string;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ 
  dashboardName = 'Therapist Dashboard',
  therapistId 
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleSuccess = () => {
    console.log('✅ [ENTERPRISE PWA] Installation successful');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const handleError = (error: string) => {
    console.error('❌ [ENTERPRISE PWA] Installation failed:', error);
    setShowError(true);
    setTimeout(() => setShowError(false), 5000);
  };

  return (
    <div className="enterprise-therapist-pwa-container">
      <EnterpriseTherapistPWAInstaller
        therapistId={therapistId}
        onSuccess={handleSuccess}
        onError={handleError}
        className="mb-4"
      />

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-slide-down">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-semibold">App installed successfully!</span>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {showError && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-slide-down">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-red-400 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-semibold">Installation failed</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-down {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PWAInstallPrompt;
