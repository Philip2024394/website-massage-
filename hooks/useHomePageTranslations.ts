/**
 * useHomePageTranslations - Translation adapter logic
 * Extracted from HomePage.tsx to reduce file size
 */

import { useMemo } from 'react';

export function useHomePageTranslations(t: any) {
    return useMemo(() => {
        console.log('🏠 HomePage received translations:', {
            tExists: !!t,
            tType: typeof t,
            tIsFunction: typeof t === 'function',
            tKeys: t && typeof t === 'object' ? Object.keys(t) : 'not an object',
        });

        // SAFE: Provide default fallback translations
        const defaultTranslations = {
            home: {
                homeServiceTab: 'Home Service',
                massagePlacesTab: 'Massage Places',
                loading: 'Loading...',
                loginSignUp: 'Login / Sign Up',
                noMoreTherapists: 'No more therapists available',
                setLocation: 'Set Location',
                updateLocation: 'Update Location',
                cityLocation: 'City / Location',
                therapistsOnline: 'Therapists Online',
                searchPlaceholder: 'Search...',
                noResults: 'No results found',
                massageDirectory: 'Massage Directory',
                massageDirectoryTitle: 'Browse All Massage Types',
                noTherapistsAvailable: 'No therapists available in your area',
                therapistsTitle: 'Home Massage Therapists',
                therapistsSubtitle: 'Find the best massage therapists',
                massagePlacesTitle: 'Featured Massage Spas',
                massagePlacesSubtitle: 'Find the best massage places',
                noPlacesAvailable: 'No massage places available in your area'
            },
            detail: {},
            common: {}
        };

        // SAFE: Return default if t is missing
        if (!t) {
            console.warn('⚠️ HomePage: No translations provided, using defaults');
            return defaultTranslations;
        }

        // Adapter: Convert translation function to object structure for HomePage compatibility
        if (typeof t === 'function') {
            console.log('🔄 Converting translation function to object structure for HomePage');
            try {
                const homeTranslations = {
                    homeServiceTab: t('home.homeServiceTab') || defaultTranslations.home.homeServiceTab,
                    massagePlacesTab: t('home.massagePlacesTab') || defaultTranslations.home.massagePlacesTab,
                    loading: t('home.loading') || defaultTranslations.home.loading,
                    loginSignUp: t('home.loginSignUp') || defaultTranslations.home.loginSignUp,
                    noMoreTherapists: t('home.noMoreTherapists') || defaultTranslations.home.noMoreTherapists,
                    setLocation: t('home.setLocation') || defaultTranslations.home.setLocation,
                    updateLocation: t('home.updateLocation') || defaultTranslations.home.updateLocation,
                    cityLocation: t('cityLocation') || defaultTranslations.home.cityLocation,
                    therapistsOnline: t('home.therapistsOnline') || defaultTranslations.home.therapistsOnline,
                    searchPlaceholder: t('home.searchPlaceholder') || defaultTranslations.home.searchPlaceholder,
                    noResults: t('home.noResults') || defaultTranslations.home.noResults,
                    massageDirectory: t('home.massageDirectory') || defaultTranslations.home.massageDirectory,
                    massageDirectoryTitle: t('home.massageDirectoryTitle') || defaultTranslations.home.massageDirectoryTitle,
                    noTherapistsAvailable: t('home.noTherapistsAvailable') || defaultTranslations.home.noTherapistsAvailable,
                    therapistsTitle: t('home.therapistsTitle') || defaultTranslations.home.therapistsTitle,
                    therapistsSubtitle: t('home.therapistsSubtitle') || defaultTranslations.home.therapistsSubtitle,
                    massagePlacesTitle: t('home.massagePlacesTitle') || defaultTranslations.home.massagePlacesTitle,
                    massagePlacesSubtitle: t('home.massagePlacesSubtitle') || defaultTranslations.home.massagePlacesSubtitle,
                    noPlacesAvailable: t('home.noPlacesAvailable') || defaultTranslations.home.noPlacesAvailable
                };
                
                console.log('✅ Converted function-based translations to object structure for HomePage');
                return {
                    home: homeTranslations,
                    detail: {},
                    common: {}
                };
            } catch (error) {
                console.error('❌ Error converting translations:', error);
                return defaultTranslations;
            }
        }
        
        // SAFE: If t is object but missing home property, merge with defaults
        if (typeof t === 'object' && !t.home) {
            console.warn('⚠️ HomePage: Translations object missing home property, using defaults');
            return defaultTranslations;
        }
        
        return t;
    }, [t]);
}
