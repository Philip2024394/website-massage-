import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, ShieldCheck, Info, Star, Award, Menu, Home } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';

interface SharedProfileStandardsPageProps {
  onBack?: () => void;
  onNavigate?: (page: string) => void;
}

const SharedProfileStandardsPage: React.FC<SharedProfileStandardsPageProps> = ({ onBack, onNavigate }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Try to go back in browser history
      if (window.history.length > 1) {
        window.history.back();
      } else {
        // Fallback to home page
        onNavigate?.('home');
      }
    }
  };

  return (
    <PageContainer>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          
          <h1 className="text-lg font-bold text-gray-900">Massage Therapist Standards</h1>
          
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="p-2 text-gray-600 hover:text-gray-800"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content for Shared Profile Standards */}
      <div className="p-4 space-y-6">
        
        {/* Professional Standards Header */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
          <div className="flex items-center mb-4">
            <ShieldCheck className="w-8 h-8 text-orange-600 mr-3" />
            <div>
              <h2 className="text-xl font-bold text-orange-800">Professional Massage Therapist Standards</h2>
              <p className="text-orange-700 text-sm">Personal commitment to excellence and care</p>
            </div>
          </div>
        </div>

        {/* Personal Commitment Message */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-800 leading-relaxed mb-4">
              As a professional massage therapist, I am fully committed to maintaining the highest standards of cleanliness, hygiene, and professional practice. All techniques I offer are performed within industry guidelines and are supported by years of formal training and experience.
            </p>
            
            <p className="text-gray-800 leading-relaxed mb-4">
              Massage is more than a service to me—it is a passion rooted in wellness, care, and helping others feel their best. I continuously apply my knowledge and skills to ensure every session is safe, effective, and tailored to each client's individual needs.
            </p>
            
            <p className="text-gray-800 leading-relaxed">
              I welcome you to experience my services and trust that you will feel the same level of care and satisfaction that many of my clients have already enjoyed. Your comfort, wellbeing, and relaxation are always my top priorities.
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="font-bold text-gray-800 text-lg mb-4">Contact & Support</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p><strong>Platform Support:</strong> Available 24/7 for booking assistance</p>
            <p><strong>Quality Concerns:</strong> Report any issues through our support channel</p>
            <p><strong>Emergency Contact:</strong> +62-813-9200-0050</p>
          </div>
        </div>

      </div>

      {/* Navigation Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setDrawerOpen(false)} />
          <div className="relative bg-white w-64 h-full shadow-xl">
            <div className="p-4 border-b">
              <h3 className="font-bold text-gray-900">Navigation</h3>
            </div>
            <div className="p-4 space-y-2">
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  onNavigate?.('home');
                }}
                className="flex items-center w-full p-2 text-left text-gray-700 hover:bg-gray-100 rounded"
              >
                <Home className="w-4 h-4 mr-3" />
                Home
              </button>
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  handleBack();
                }}
                className="flex items-center w-full p-2 text-left text-gray-700 hover:bg-gray-100 rounded"
              >
                <ArrowLeft className="w-4 h-4 mr-3" />
                Back to Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default SharedProfileStandardsPage;