// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
import React from 'react';
import { commonLanguages } from '../../constants/languages';

interface LanguageSelectorProps {
  selectedLanguages: string[];
  onLanguagesChange: (languages: string[]) => void;
  className?: string;
}

/**
 * Reusable language selection component with checkboxes and custom input
 * Used in both therapist and massage place admin edit forms
 */
export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguages,
  onLanguagesChange,
  className = ''
}) => {
  const handleLanguageToggle = (language: string, isChecked: boolean) => {
    const updatedLanguages = isChecked
      ? [...selectedLanguages, language]
      : selectedLanguages.filter(lang => lang !== language);
    
    onLanguagesChange(updatedLanguages);
  };

  const handleCustomLanguagesAdd = (customLanguagesText: string) => {
    const customLanguages = customLanguagesText
      .split(',')
      .map(lang => lang.trim())
      .filter(lang => lang && !commonLanguages.includes(lang) && !selectedLanguages.includes(lang));
    
    if (customLanguages.length > 0) {
      onLanguagesChange([...selectedLanguages, ...customLanguages]);
      return true; // Signal to clear input
    }
    return false;
  };

  const handleLanguageRemove = (index: number) => {
    onLanguagesChange(selectedLanguages.filter((_, i) => i !== index));
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Languages Spoken
      </label>
      
      {/* Checkbox Grid */}
      <div className="max-h-48  border border-gray-300 rounded-lg p-3 bg-gray-50">
        <div className="grid grid-cols-2 gap-3">
          {commonLanguages.map((language) => (
            <label key={language} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-white p-2 rounded transition-colors">
              <input
                type="checkbox"
                checked={selectedLanguages.includes(language)}
                onChange={(e) => handleLanguageToggle(language, e.target.checked)}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
              />
              <span className="text-gray-700">{language}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Custom Languages Input */}
      <div className="mt-3">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Additional Languages (optional)
        </label>
        <input
          type="text"
          placeholder="Enter other languages separated by commas"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          onBlur={(e) => {
            if (handleCustomLanguagesAdd(e.target.value)) {
              e.target.value = '';
            }
          }}
        />
      </div>
      
      {/* Selected Languages Display */}
      {selectedLanguages.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-600 mb-2">Selected Languages:</p>
          <div className="flex flex-wrap gap-2">
            {selectedLanguages.map((language, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
              >
                {language}
                <button
                  type="button"
                  onClick={() => handleLanguageRemove(index)}
                  className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-orange-600 hover:bg-orange-200 hover:text-orange-800 focus:outline-none focus:bg-orange-200 focus:text-orange-800"
                >
                  <svg className="w-2 h-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                    <path strokeLinecap="round" strokeWidth="1.5" d="m1 1 6 6m0-6-6 6" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};