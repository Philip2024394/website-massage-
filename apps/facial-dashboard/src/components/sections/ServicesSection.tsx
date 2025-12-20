/**
 * Services Section Component
 * Handles facial types, therapist gender, languages, additional services, and years established
 * Max size: 15KB (Facebook/Amazon standard)
 */

import React from 'react';
import CustomCheckbox from '../../../../../components/CustomCheckbox';
import { FACIAL_TYPES_CATEGORIZED, ADDITIONAL_SERVICES } from '../../../../../constants/rootConstants';

interface ServicesSectionProps {
  facialTypes: string[];
  setfacialTypes: React.Dispatch<React.SetStateAction<string[]>>;
  therapistGender: string;
  setTherapistGender: (value: string) => void;
  languages: string[];
  handleLanguageChange: (langCode: string) => void;
  additionalServices: string[];
  handleAdditionalServiceChange: (service: string) => void;
  yearsEstablished: number;
  setYearsEstablished: (value: number) => void;
  t: any;
}

const ServicesSection: React.FC<ServicesSectionProps> = ({
  facialTypes,
  setfacialTypes,
  therapistGender,
  setTherapistGender,
  languages,
  handleLanguageChange,
  additionalServices,
  handleAdditionalServiceChange,
  yearsEstablished,
  setYearsEstablished
}: ServicesSectionProps): JSX.Element => {
  const handleFacialTypeChange = (type: string) => {
    setfacialTypes((prev: string[]) => {
      const currentTypes = prev || [];
      return currentTypes.includes(type)
        ? currentTypes.filter((t) => t !== type)
        : [...currentTypes, type];
    });
  };

  return (
    <div className="space-y-6">
      {/* Facial Types Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Facial Treatment Types Offered
        </label>
        <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg">
          {FACIAL_TYPES_CATEGORIZED && Object.entries(FACIAL_TYPES_CATEGORIZED).map(([category, types]) => (
            <div key={category} className="mb-4 last:mb-0">
              <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                {category}
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {Array.isArray(types) ? types.map((type: string) => (
                  <CustomCheckbox
                    key={type}
                    label={type}
                    checked={facialTypes.includes(type)}
                    onChange={() => handleFacialTypeChange(type)}
                  />
                )) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Therapist Gender Preference */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Therapist Gender Available
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['Male', 'Female', 'Unisex'].map((gender) => (
            <button
              key={gender}
              type="button"
              onClick={() => setTherapistGender(gender)}
              className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                therapistGender === gender
                  ? 'bg-orange-50 border-orange-500 text-orange-900'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              {gender === 'Male' && '👨'}
              {gender === 'Female' && '👩'}
              {gender === 'Unisex' && '👥'}
              <span className="ml-2">{gender}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Select the gender of therapists available at your spa
        </p>
      </div>

      {/* Languages Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Languages Spoken at Your Place
        </label>
        <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {[
              { code: 'en', flag: '🇬🇧', name: 'English' },
              { code: 'id', flag: '🇮🇩', name: 'Indonesian' },
              { code: 'zh', flag: '🇨🇳', name: 'Chinese' },
              { code: 'ja', flag: '🇯🇵', name: 'Japanese' },
              { code: 'ko', flag: '🇰🇷', name: 'Korean' },
              { code: 'ru', flag: '🇷🇺', name: 'Russian' },
              { code: 'fr', flag: '🇫🇷', name: 'French' },
              { code: 'de', flag: '🇩🇪', name: 'German' },
              { code: 'es', flag: '🇪🇸', name: 'Spanish' },
            ].map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageChange(lang.code)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                  languages.includes(lang.code)
                    ? 'bg-blue-50 border-blue-500 text-blue-900'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="text-sm font-medium">{lang.name}</span>
                {languages.includes(lang.code) && (
                  <svg className="w-4 h-4 ml-auto text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Services Section */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Additional Services
        </label>
        <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {(ADDITIONAL_SERVICES || []).map((service: string) => (
              <CustomCheckbox
                key={service}
                label={service}
                checked={additionalServices.includes(service)}
                onChange={() => handleAdditionalServiceChange(service)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Years Established */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Years Established
        </label>
        <input
          type="number"
          min="1"
          max="50"
          value={yearsEstablished}
          onChange={(e) => setYearsEstablished(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
          className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          How many years has your spa been in business? (1-50 years)
        </p>
      </div>
    </div>
  );
};

export default ServicesSection;
