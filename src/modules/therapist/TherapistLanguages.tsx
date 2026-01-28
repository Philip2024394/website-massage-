/**
 * TherapistLanguages Component
 * 
 * Extracted from TherapistCard.tsx as part of Phase 2 modularization.
 * Handles the display of therapist languages and years of experience.
 * 
 * Features:
 * - Language flags with 2-letter codes
 * - Years of experience display
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
    const languages = therapist.languages 
        ? (typeof therapist.languages === 'string' 
            ? parseLanguages(therapist.languages) 
            : therapist.languages)
        : [];
    
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

    // Only render if languages exist
    if (!languages || !Array.isArray(languages) || languages.length === 0) {
        return null;
    }

    return (
        <div className={`px-4 mb-6 ${getDynamicSpacing('mt-4', 'mt-3', 'mt-2', translatedDescriptionLength)}`}>
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-semibold text-gray-700">Languages</h4>
                {therapist.yearsOfExperience && (
                    <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {therapist.yearsOfExperience} years experience
                    </span>
                )}
            </div>
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