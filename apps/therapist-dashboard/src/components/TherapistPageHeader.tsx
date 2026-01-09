import React from 'react';
import { Home } from 'lucide-react';
import { useLanguage } from '../../../../hooks/useLanguage';

interface TherapistPageHeaderProps {
  title: string;
  subtitle?: string;
  onBackToStatus: () => void;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

const TherapistPageHeader: React.FC<TherapistPageHeaderProps> = ({
  title,
  subtitle,
  onBackToStatus,
  icon,
  actions
}) => {
  const { language, setLanguage } = useLanguage();
  
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Icon (if provided) */}
            {icon && (
              <div className="flex-shrink-0">
                {icon}
              </div>
            )}

            {/* Title and Subtitle */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-black truncate">{title}</h1>
              {subtitle && (
                <p className="text-sm text-gray-600 truncate">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Actions, Language Switcher and Home Icon on Right */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Optional Actions */}
            {actions && (
              <div className="flex-shrink-0">
                {actions}
              </div>
            )}
            
            {/* Language Switcher - Facebook Style */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-full p-0.5">
              <button
                onClick={() => setLanguage('id')}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  language === 'id' 
                    ? 'bg-white shadow-sm text-gray-900' 
                    : 'text-gray-600 hover:bg-white/50'
                }`}
                title="Bahasa Indonesia"
              >
                <span className="text-sm">🇮🇩</span>
              </button>
              <button
                onClick={() => setLanguage('gb')}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  language === 'gb' || language === 'en'
                    ? 'bg-white shadow-sm text-gray-900' 
                    : 'text-gray-600 hover:bg-white/50'
                }`}
                title="English"
              >
                <span className="text-sm">🇬🇧</span>
              </button>
            </div>
            
            {/* Home Icon - Always on Right */}
            <button
              onClick={onBackToStatus}
              className="p-2 hover:bg-orange-50 rounded-lg transition-colors flex-shrink-0"
              aria-label="Back to status page"
              title="Back to Online Status"
            >
              <Home className="w-5 h-5 text-orange-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TherapistPageHeader;
