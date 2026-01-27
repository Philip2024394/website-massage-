/**
 * FACEBOOK-STANDARD LANGUAGE SWITCHER
 * Reusable component for consistent language switching across all dashboards
 * Features: Flag icons, smooth animations, persistent state
 */

import React from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface LanguageSwitcherProps {
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  size = 'md',
  showLabels = false,
  className = ''
}) => {
  const { language, setLanguage } = useLanguage();

  const sizeClasses = {
    sm: {
      container: 'p-0.5',
      button: 'px-2 py-1',
      flag: 'text-sm',
      text: 'text-xs'
    },
    md: {
      container: 'p-1',
      button: 'px-3 py-1.5',
      flag: 'text-base',
      text: 'text-xs'
    },
    lg: {
      container: 'p-1',
      button: 'px-4 py-2',
      flag: 'text-lg',
      text: 'text-sm'
    }
  };

  const classes = sizeClasses[size];

  return (
    <div className={`flex items-center gap-2 bg-gray-100 rounded-full ${classes.container} ${className}`}>
      {/* Indonesian Flag Button */}
      <button
        onClick={() => {
          console.log('🇮🇩 Language switcher: Switching to Indonesian');
          setLanguage('id');
        }}
        className={`flex items-center gap-1 ${classes.button} rounded-full font-medium transition-all duration-200 ${
          language === 'id' 
            ? 'bg-white shadow-sm text-gray-900 scale-105' 
            : 'text-gray-600 hover:bg-white/50'
        }`}
        title="Bahasa Indonesia"
        aria-label="Switch to Indonesian"
      >
        <span className={classes.flag}>🇮🇩</span>
        {showLabels && <span className={classes.text}>ID</span>}
      </button>
      
      {/* GB/English Flag Button */}
      <button
        onClick={() => {
          console.log('🇬🇧 Language switcher: Switching to English');
          setLanguage('gb');
        }}
        className={`flex items-center gap-1 ${classes.button} rounded-full font-medium transition-all duration-200 ${
          language === 'gb' || language === 'en'
            ? 'bg-white shadow-sm text-gray-900 scale-105' 
            : 'text-gray-600 hover:bg-white/50'
        }`}
        title="English"
        aria-label="Switch to English"
      >
        <span className={classes.flag}>🇬🇧</span>
        {showLabels && <span className={classes.text}>EN</span>}
      </button>
    </div>
  );
};

export default LanguageSwitcher;
