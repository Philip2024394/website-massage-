import { useState, useEffect } from 'react';
import { translationsService } from '../lib/appwriteService';
import { translations as fallbackTranslations } from '../translations/index';

const CACHE_KEY = 'indostreet_translations';
const CACHE_EXPIRY_MS = 1000 * 60 * 60; // 1 hour

export function useTranslations(language: 'en' | 'id' = 'en') {
    const [translations, setTranslations] = useState<any>(fallbackTranslations);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTranslations();
    }, []);

    const loadTranslations = async () => {
        try {
            // Check cache first
            const cached = getCachedTranslations();
            if (cached) {
                setTranslations(cached);
                setLoading(false);
                return;
            }

            // Load from Appwrite
            const appwriteTranslations = await translationsService.getAll();
            
            if (appwriteTranslations && Object.keys(appwriteTranslations.en).length > 0) {
                setTranslations(appwriteTranslations);
                cacheTranslations(appwriteTranslations);
            } else {
                // Fallback to local translations
                console.log('Using local fallback translations');
            }
        } catch (error) {
            console.error('Error loading translations, using fallback:', error);
            // Continue with fallback translations already set
        } finally {
            setLoading(false);
        }
    };

    const getCachedTranslations = () => {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (!cached) return null;

            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp > CACHE_EXPIRY_MS) {
                localStorage.removeItem(CACHE_KEY);
                return null;
            }

            return data;
        } catch {
            return null;
        }
    };

    const cacheTranslations = (data: any) => {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                data,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.error('Error caching translations:', error);
        }
    };

    return {
        t: translations[language],
        loading,
        refresh: loadTranslations
    };
}
