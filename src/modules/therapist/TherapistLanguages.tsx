/**
 * TherapistLanguages Component
 *
 * Displays therapist languages (flags + codes). Years of experience are shown in the hero only.
 *
 * Features:
 * - Language flags with 2-letter codes
 * - Shows up to 3 languages with "+N" indicator
 * - Dynamic spacing based on description length
 */

import React from 'react';
import { parseLanguages } from '../../utils/appwriteHelpers';
import { devLog } from '../../utils/devMode';

interface TherapistLanguagesProps {
    therapist: any;
    getDynamicSpacing: (high: string, medium: string, low: string, descriptionLength: number) => string;
    translatedDescriptionLength: number;
}

const TherapistLanguages: React.FC<TherapistLanguagesProps> = ({ 
    therapist, 
    getDynamicSpacing, 
    translatedDescriptionLength 
}) => {
    const rawLanguages = therapist.languages 
        ? (typeof therapist.languages === 'string' 
            ? parseLanguages(therapist.languages) 
            : therapist.languages)
        : [];
    
    // Always include Indonesian as standard, add other languages only if therapist selected them
    const languages = rawLanguages.length > 0 ? rawLanguages : ['Indonesian'];
    
    // Debug in development mode (reduced verbosity)
    if (process.env.NODE_ENV === 'development' && therapist.name?.toLowerCase().includes('budi')) {
        devLog(`🌐 ${therapist.name} languages:`, languages);
    }
    
    // Language mapping for flags and display codes
    const langMap: Record<string, {flag: string, name: string}> = {
        'english': {flag: '🇬🇧', name: 'EN'},
        'indonesian': {flag: '🇮🇩', name: 'ID'},
        'mandarin': {flag: '🇨🇳', name: 'ZH'},
        'japanese': {flag: '🇯🇵', name: 'JP'},
        'korean': {flag: '🇰🇷', name: 'KR'},
        'thai': {flag: '🇹🇭', name: 'TH'},
        'vietnamese': {flag: '🇻🇳', name: 'VI'},
        'french': {flag: '🇫🇷', name: 'FR'},
        'german': {flag: '🇩🇪', name: 'DE'},
        'spanish': {flag: '🇪🇸', name: 'ES'},
        'portuguese': {flag: '🇵🇹', name: 'PT'},
        'italian': {flag: '🇮🇹', name: 'IT'},
        'russian': {flag: '🇷🇺', name: 'RU'},
        'arabic': {flag: '🇸🇦', name: 'AR'},
        'hindi': {flag: '🇮🇳', name: 'HI'},
        // Also support language codes for backward compatibility
        'en': {flag: '🇬🇧', name: 'EN'},
        'id': {flag: '🇮🇩', name: 'ID'},
        'zh': {flag: '🇨🇳', name: 'ZH'},
        'ja': {flag: '🇯🇵', name: 'JP'},
        'ko': {flag: '🇰🇷', name: 'KR'},
        'th': {flag: '🇹🇭', name: 'TH'},
        'vi': {flag: '🇻🇳', name: 'VI'},
        'fr': {flag: '🇫🇷', name: 'FR'},
        'de': {flag: '🇩🇪', name: 'DE'},
        'es': {flag: '🇪🇸', name: 'ES'},
        'pt': {flag: '🇵🇹', name: 'PT'},
        'it': {flag: '🇮🇹', name: 'IT'},
        'ru': {flag: '🇷🇺', name: 'RU'},
        'ar': {flag: '🇸🇦', name: 'AR'},
        'hi': {flag: '🇮🇳', name: 'HI'}
    };

    // Languages should always exist now (Indonesian as minimum)
    if (!languages || !Array.isArray(languages) || languages.length === 0) {
        return null; // This should rarely happen now
    }

    return (
        <div className={`px-4 mb-6 ${getDynamicSpacing('mt-4', 'mt-3', 'mt-2', translatedDescriptionLength)}`}>
            <h4 className="text-xs font-semibold text-gray-700 mb-2">Languages</h4>
            <div className="flex flex-wrap gap-1">
                {languages.slice(0, 3).map((lang: string) => {
                    const langKey = lang.toLowerCase();
                    const langInfo = langMap[langKey] || {flag: '🌐', name: lang.slice(0, 2).toUpperCase()};
                    return (
                        <span key={lang} className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-gray-800 text-xs font-medium rounded-full flex items-center gap-1">
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
    );
};

export default TherapistLanguages;