// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
// Test component for hotel-villa-safe-pass route
import React from 'react';

interface TestHotelVillaSafePassPageProps {
  onNavigate: (page: string) => void;
  onTherapistPortalClick?: () => void;
  language?: 'en' | 'id';
}

const TestHotelVillaSafePassPage: React.FC<TestHotelVillaSafePassPageProps> = ({ 
  onNavigate,
  onTherapistPortalClick,
  language = 'en'
}) => {
  return (
    <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-white p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">
          Hotel & Villa Safe Pass - TEST VERSION
        </h1>
        <p className="text-lg text-gray-600">
          This is a test version to debug the component load error.
        </p>
        <button 
          onClick={() => onNavigate('home')} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default TestHotelVillaSafePassPage;