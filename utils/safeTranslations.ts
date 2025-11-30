/**
 * Safe Translation Utilities
 * Provides null-safe translation access to prevent runtime errors
 * 
 * PROBLEM SOLVED: This prevents the recurring error where accessing translations
 * like t?.home?.title throws errors when t is undefined or malformed.
 * 
 * This has been a recurring issue (50+ times) - this utility ensures it never happens again.
 */

export interface TranslationObject {
    home?: Record<string, string>;
    detail?: Record<string, string>;
    common?: Record<string, string>;
    [key: string]: Record<string, string> | undefined;
}

/**
 * Safely access nested translation properties
 * @param t - Translation object or function
 * @param path - Dot-notation path (e.g., 'home.title')
 * @param fallback - Fallback value if translation not found
 * @returns Translation string or fallback
 */
export function safeTranslate(
    t: any,
    path: string,
    fallback: string
): string {
    try {
        // If t is null or undefined, return fallback immediately
        if (!t) {
            console.warn(`⚠️ Translation missing for "${path}", using fallback: "${fallback}"`);
            return fallback;
        }

        // If t is a function, call it with the path
        if (typeof t === 'function') {
            const result = t(path);
            return result || fallback;
        }

        // If t is an object, navigate the path
        if (typeof t === 'object') {
            const keys = path.split('.');
            let current: any = t;

            for (const key of keys) {
                if (current && typeof current === 'object' && key in current) {
                    current = current[key];
                } else {
                    console.warn(`⚠️ Translation path "${path}" not found, using fallback: "${fallback}"`);
                    return fallback;
                }
            }

            return typeof current === 'string' ? current : fallback;
        }

        return fallback;
    } catch (error) {
        console.error(`❌ Error accessing translation "${path}":`, error);
        return fallback;
    }
}

/**
 * Create a safe translation object with default values
 * @param t - Translation object or function
 * @param defaults - Default translation values
 * @returns Safe translation object
 */
export function createSafeTranslations<T extends TranslationObject>(
    t: any,
    defaults: T
): T {
    if (!t) {
        console.warn('⚠️ No translations provided, using defaults');
        return defaults;
    }

    // If t is a function, convert to object structure
    if (typeof t === 'function') {
        const result: any = {};
        
        for (const section in defaults) {
            result[section] = {};
            for (const key in defaults[section]) {
                const path = `${section}.${key}`;
                result[section][key] = t(path) || defaults[section]![key];
            }
        }
        
        return result as T;
    }

    // If t is an object, merge with defaults
    if (typeof t === 'object') {
        const result: any = { ...defaults };
        
        for (const section in defaults) {
            if (t[section] && typeof t[section] === 'object') {
                result[section] = { ...defaults[section], ...t[section] };
            }
        }
        
        return result as T;
    }

    return defaults;
}

/**
 * Validate that translation object has required structure
 * @param t - Translation object to validate
 * @param requiredSections - Required top-level sections
 * @returns true if valid, false otherwise
 */
export function validateTranslations(
    t: any,
    requiredSections: string[] = ['home', 'common']
): boolean {
    if (!t || typeof t !== 'object') {
        console.error('❌ Invalid translation object: not an object');
        return false;
    }

    for (const section of requiredSections) {
        if (!(section in t)) {
            console.error(`❌ Invalid translation object: missing section "${section}"`);
            return false;
        }
    }

    return true;
}

/**
 * Hook to get safe translations
 * @param t - Translation object or function
 * @param defaults - Default translations
 * @returns Safe translation object
 */
export function useSafeTranslations<T extends TranslationObject>(
    t: any,
    defaults: T
): T {
    // Note: React.useMemo would be used here in a React component
    // This is a utility function that can be called in useMemo
    return createSafeTranslations(t, defaults);
}
