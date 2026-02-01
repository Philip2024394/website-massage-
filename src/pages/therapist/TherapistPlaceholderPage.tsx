// 🎯 AUTO-FIXED: Mobile scroll architecture violations (3 fixes)
/**
 * TherapistPlaceholderPage - Temporary page for routes under construction
 * Ensures no blank/error pages during development
 */

import React from 'react';
import { ArrowLeft, FileText, Settings } from 'lucide-react';

interface TherapistPlaceholderPageProps {
  title: string;
  route: string;
  onBack?: () => void;
  description?: string;
}

const TherapistPlaceholderPage: React.FC<TherapistPlaceholderPageProps> = ({ 
  title, 
  route, 
  onBack,
  description = 'This page is under construction and will be available soon.'
}) => {
  return (
    <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50  " style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y pan-x' }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-500">Route: {route}</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="flex justify-center mb-6">
              <div className="relative">
                <Settings className="w-20 h-20 text-orange-500" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-yellow-900">!</span>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {title}
          </h2>

          <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
            {description}
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-8 max-w-md mx-auto">
            <div className="flex items-start gap-3 text-left">
              <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  Development Status
                </p>
                <p className="text-xs text-gray-600">
                  This feature is planned and will be implemented in an upcoming release. 
                  The route is registered but the page content is pending.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {onBack && (
              <button
                onClick={onBack}
                className="w-full max-w-xs mx-auto block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-semibold"
              >
                Go Back to Dashboard
              </button>
            )}
            
            <div className="text-xs text-gray-400 space-y-1">
              <p>Route Path: <code className="bg-gray-100 px-2 py-1 rounded">{route}</code></p>
              <p className="text-gray-500">This placeholder ensures no blank screens appear</p>
            </div>
          </div>
        </div>

        {/* Additional Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">i</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-blue-900 mb-1">
                For Developers
              </h3>
              <p className="text-sm text-blue-800">
                This is a placeholder component rendered when a route case exists but the actual 
                page component is still under development. Replace this with the real component 
                in <code className="bg-blue-100 px-1 py-0.5 rounded text-xs">therapistRoutes.tsx</code>.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TherapistPlaceholderPage;
