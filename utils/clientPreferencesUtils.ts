/**
 * Client Preferences Utilities
 * Handles therapist client preference options and formatting
 */

export type ClientPreference = 
    | 'Males Only' 
    | 'Females Only' 
    | 'Males And Females' 
    | 'Babies Only' 
    | 'All Ages And Genders';

export const CLIENT_PREFERENCE_OPTIONS: ClientPreference[] = [
    'Males And Females',
    'Males Only',
    'Females Only', 
    'Babies Only',
    'All Ages And Genders'
];

export const CLIENT_PREFERENCE_LABELS: Record<ClientPreference, string> = {
    'Males And Females': 'Males / Females',
    'Males Only': 'Males Only',
    'Females Only': 'Females Only',
    'Babies Only': 'Babies Only',
    'All Ages And Genders': 'All Ages / Genders'
};

export const CLIENT_PREFERENCE_DESCRIPTIONS: Record<ClientPreference, string> = {
    'Males And Females': 'Accept both male and female adult clients',
    'Males Only': 'Accept only male adult clients',
    'Females Only': 'Accept only female adult clients',
    'Babies Only': 'Specialize in baby massage services only',
    'All Ages And Genders': 'Accept clients of all ages and genders'
};

/**
 * Get the display text for a client preference with translation support
 */
export function getClientPreferenceDisplay(preference?: ClientPreference, language: 'en' | 'id' = 'en'): string {
    const pref = preference || 'Males And Females';
    
    if (language === 'id') {
        const translations: Record<ClientPreference, string> = {
            'Males And Females': 'Pria / Wanita',
            'Males Only': 'Hanya Pria',
            'Females Only': 'Hanya Wanita',
            'Babies Only': 'Hanya Bayi',
            'All Ages And Genders': 'Semua Usia / Jenis Kelamin'
        };
        return translations[pref];
    }
    
    // English versions with / instead of And
    const englishLabels: Record<ClientPreference, string> = {
        'Males And Females': 'Males / Females',
        'Males Only': 'Males Only', 
        'Females Only': 'Females Only',
        'Babies Only': 'Babies Only',
        'All Ages And Genders': 'All Ages / Genders'
    };
    
    return englishLabels[pref];
}

/**
 * Get the description for a client preference
 */
export function getClientPreferenceDescription(preference?: ClientPreference): string {
    return CLIENT_PREFERENCE_DESCRIPTIONS[preference || 'Males And Females'];
}

/**
 * Check if a client preference is valid
 */
export function isValidClientPreference(preference: string): preference is ClientPreference {
    return CLIENT_PREFERENCE_OPTIONS.includes(preference as ClientPreference);
}

/**
 * Get default client preference
 */
export function getDefaultClientPreference(): ClientPreference {
    return 'Males And Females';
}