import { parseLanguages } from '../../utils/appwriteHelpers';
import type { Therapist } from '../types';

interface TherapistSpecializationsProps {
  massageTypes: string[];
  therapist: Therapist;
  t: any;
}

const TherapistSpecializations = ({ massageTypes, therapist, t }: TherapistSpecializationsProps): JSX.Element => {
  const rawLanguages = therapist.languages
    ? typeof therapist.languages === 'string'
      ? parseLanguages(therapist.languages)
      : therapist.languages
    : [];

  // Always include Indonesian as standard, add other languages only if therapist selected them
  const languages = rawLanguages.length > 0 ? rawLanguages : ['Indonesian'];

  const langMap: Record<string, { flag: string; name: string }> = {
    english: { flag: '🇬🇧', name: 'EN' },
    indonesian: { flag: '🇮🇩', name: 'ID' },
    mandarin: { flag: '🇨🇳', name: 'ZH' },
    japanese: { flag: '🇯🇵', name: 'JP' },
    korean: { flag: '🇰🇷', name: 'KR' },
    thai: { flag: '🇹🇭', name: 'TH' },
    vietnamese: { flag: '🇻🇳', name: 'VI' },
    french: { flag: '🇫🇷', name: 'FR' },
    german: { flag: '🇩🇪', name: 'DE' },
    spanish: { flag: '🇪🇸', name: 'ES' },
    portuguese: { flag: '🇵🇹', name: 'PT' },
    italian: { flag: '🇮🇹', name: 'IT' },
    russian: { flag: '🇷🇺', name: 'RU' },
    arabic: { flag: '🇸🇦', name: 'AR' },
    hindi: { flag: '🇮🇳', name: 'HI' },
    en: { flag: '🇬🇧', name: 'EN' },
    id: { flag: '🇮🇩', name: 'ID' },
    zh: { flag: '🇨🇳', name: 'ZH' },
    ja: { flag: '🇯🇵', name: 'JP' },
    ko: { flag: '🇰🇷', name: 'KR' },
    th: { flag: '🇹🇭', name: 'TH' },
    vi: { flag: '🇻🇳', name: 'VI' },
    fr: { flag: '🇫🇷', name: 'FR' },
    de: { flag: '🇩🇪', name: 'DE' },
    es: { flag: '🇪🇸', name: 'ES' },
    pt: { flag: '🇵🇹', name: 'PT' },
    it: { flag: '🇮🇹', name: 'IT' },
    ru: { flag: '🇷🇺', name: 'RU' },
    ar: { flag: '🇸🇦', name: 'AR' },
    hi: { flag: '🇮🇳', name: 'HI' },
  };

  return (
    <div className="space-y-4">
      {/* Massage Specializations */}
      <div className="border-t border-gray-100 pt-4">
        <div className="mb-2">
          <h4 className="text-xs font-semibold text-gray-700">
            {t.home?.therapistCard?.experiencedArea || 'Areas of Expertise'}
          </h4>
        </div>
        <div className="flex flex-wrap gap-1">
          {massageTypes.slice(0, 5).map((type) => (
            <span
              key={type}
              className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs font-medium rounded-full border border-orange-200"
            >
              {type}
            </span>
          ))}
          {massageTypes.length === 0 && <span className="text-xs text-gray-400">No specialties selected</span>}
          {massageTypes.length > 5 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
              +{massageTypes.length - 5}
            </span>
          )}
        </div>
      </div>

      {/* Languages Spoken */}
      {languages && Array.isArray(languages) && languages.length > 0 && (
        <div>
          <div className="mb-2">
            <h4 className="text-xs font-semibold text-gray-700">Languages</h4>
          </div>
          <div className="flex flex-wrap gap-1">
            {languages.slice(0, 3).map((lang) => {
              const langKey = lang.toLowerCase();
              const langInfo = langMap[langKey] || { flag: '🌐', name: lang.slice(0, 2).toUpperCase() };
              return (
                <span
                  key={lang}
                  className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-gray-800 text-xs font-medium rounded-full flex items-center gap-1"
                >
                  <span className="text-xs">{langInfo.flag}</span>
                  <span className="text-xs font-semibold">{langInfo.name}</span>
                </span>
              );
            })}
            {languages.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">+{languages.length - 3}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistSpecializations;
