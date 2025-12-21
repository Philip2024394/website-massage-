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
        
        {/* Professional Standards for Shared Profiles */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
          <div className="flex items-center mb-4">
            <ShieldCheck className="w-8 h-8 text-orange-600 mr-3" />
            <div>
              <h2 className="text-xl font-bold text-orange-800">Professional Massage Therapist Standards</h2>
              <p className="text-orange-700 text-sm">Quality assurance for shared profile services</p>
            </div>
          </div>
        </div>

        {/* Qualifications Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center">
            <Award className="w-5 h-5 text-green-600 mr-2" />
            Therapist Qualifications
          </h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-800">Certified Professional Training</p>
                <p className="text-sm text-gray-600">Minimum 200-hour massage therapy certification from accredited institutions</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-800">Licensed & Insured</p>
                <p className="text-sm text-gray-600">Valid massage therapy license and professional liability insurance</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-800">Specialized Techniques</p>
                <p className="text-sm text-gray-600">Expertise in traditional Indonesian massage and modern therapeutic methods</p>
              </div>
            </div>
          </div>
        </div>

        {/* Service Standards */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center">
            <Star className="w-5 h-5 text-blue-600 mr-2" />
            Service Excellence Standards
          </h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-800">Professional Conduct</p>
                <p className="text-sm text-gray-600">Maintains highest ethical standards and professional boundaries</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-800">Hygiene & Safety</p>
                <p className="text-sm text-gray-600">Strict adherence to sanitation protocols and safety measures</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-800">Client-Centered Approach</p>
                <p className="text-sm text-gray-600">Customized treatments based on individual client needs and preferences</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quality Assurance */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center">
            <Info className="w-5 h-5 text-purple-600 mr-2" />
            Quality Assurance
          </h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-800">Regular Training Updates</p>
                <p className="text-sm text-gray-600">Continuous professional development and skill enhancement</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-800">Client Feedback Monitoring</p>
                <p className="text-sm text-gray-600">Regular review of client satisfaction and service improvement</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-800">Performance Standards</p>
                <p className="text-sm text-gray-600">Maintains minimum 4.0-star rating and positive client reviews</p>
              </div>
            </div>
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