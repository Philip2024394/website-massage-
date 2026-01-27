/**
 * 🌍 CHAT LANGUAGE SELECTOR COMPONENT
 * 
 * Flag-based language selector for chat window header
 * Allows users to select their preferred language for chat messages
 */

import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES, getLanguage, type LanguageOption } from '../utils/chatTranslation';

interface ChatLanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (languageCode: string) => void;
  autoTranslate: boolean;
  onToggleAutoTranslate: () => void;
  className?: string;
}

export const ChatLanguageSelector: React.FC<ChatLanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange,
  autoTranslate,
  onToggleAutoTranslate,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const currentLang = getLanguage(currentLanguage);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleLanguageSelect = (langCode: string) => {
    onLanguageChange(langCode);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Language Button with Flag */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        title={`Current language: ${currentLang?.nativeName || 'English'}`}
      >
        <span className="text-2xl leading-none">{currentLang?.flag || '🇬🇧'}</span>
        <Globe className="w-4 h-4 text-gray-600" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Auto-translate Toggle */}
          <div className="p-3 border-b border-gray-200">
            <button
              onClick={onToggleAutoTranslate}
              className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-medium text-gray-700">
                Auto-translate messages
              </span>
              <div className={`w-10 h-6 rounded-full transition-colors ${
                autoTranslate ? 'bg-green-500' : 'bg-gray-300'
              }`}>
                <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${
                  autoTranslate ? 'ml-5' : 'ml-1'
                }`} />
              </div>
            </button>
            <p className="text-xs text-gray-500 mt-2">
              {autoTranslate 
                ? '✅ Messages will be translated to your language'
                : '❌ Messages will show in original language'}
            </p>
          </div>

          {/* Language List */}
          <div className="p-2">
            <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Select Language
            </p>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  currentLanguage === lang.code
                    ? 'bg-orange-50 text-orange-700'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className="text-2xl leading-none">{lang.flag}</span>
                <div className="flex-1 text-left">
                  <div className={`text-sm font-medium ${lang.rtl ? 'text-right' : ''}`}>
                    {lang.nativeName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {lang.name}
                  </div>
                </div>
                {currentLanguage === lang.code && (
                  <Check className="w-4 h-4 text-orange-600" />
                )}
              </button>
            ))}
          </div>

          {/* Info Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-600 text-center">
              🌍 Both you and the therapist can select different languages
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Compact flag-only selector (for mobile)
 */
export const ChatLanguageSelectorCompact: React.FC<ChatLanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const currentLang = getLanguage(currentLanguage);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleLanguageSelect = (langCode: string) => {
    onLanguageChange(langCode);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm"
        title={currentLang?.nativeName || 'Select language'}
      >
        <span className="text-xl leading-none">{currentLang?.flag || '🇬🇧'}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto">
          <div className="p-2">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  currentLanguage === lang.code
                    ? 'bg-orange-50 text-orange-700'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className="text-xl leading-none">{lang.flag}</span>
                <span className="text-sm font-medium flex-1 text-left">
                  {lang.nativeName}
                </span>
                {currentLanguage === lang.code && (
                  <Check className="w-4 h-4 text-orange-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatLanguageSelector;
