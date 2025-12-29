/**
 * SEO-Optimized Share URL Builder
 * Generates keyword-rich URLs for maximum Google ranking
 * Format: /share/pijat-{city}-{name}/{id}
 * Example: /share/pijat-yogyakarta-wiwid/694ed78e002b0c06171e
 */

import type { Therapist, Place } from '../../../types';
import { locationKeywords } from '../../../utils/seoSlugGenerator';

// ALWAYS use production URL for sharing (never localhost)
const LIVE_SITE_URL = 'https://www.indastreetmassage.com';

/**
 * Generate SEO-friendly slug from location and name
 */
function generateSEOSlug(location: string, name: string): string {
    // Get SEO keyword for location
    const cityName = location.split(',')[0].trim();
    const keywords = locationKeywords[cityName];
    const keyword = keywords?.[0] || `pijat-${cityName.toLowerCase()}`;
    
    // Clean name: remove special chars, lowercase, replace spaces with hyphens
    const cleanName = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 30); // Limit length
    
    return `${keyword}-${cleanName}`;
}

/**
 * Generate SEO-optimized share URL for therapist
 * Format: /share/pijat-yogyakarta-wiwid/694ed78e002b0c06171e
 * SEO keywords in URL = better Google ranking!
 */
export function generateTherapistShareURL(therapist: Therapist): string {
    const id = (therapist as any).id ?? (therapist as any).$id ?? '';
    if (!id) {
        console.error('❌ No ID found for therapist:', therapist);
        return `${LIVE_SITE_URL}/share/therapist/unknown`;
    }
    
    // Generate SEO slug with location keyword + name
    const location = therapist.location || 'Indonesia';
    const name = therapist.name || 'therapist';
    const seoSlug = generateSEOSlug(location, name);
    
    // SEO-optimized format: keyword-rich slug + ID
    return `${LIVE_SITE_URL}/share/${seoSlug}/${id}`;
}

/**
 * Generate SEO-optimized share URL for massage place
 * Format: /share/pijat-yogyakarta-spa-name/place-id
 */
export function generatePlaceShareURL(place: Place): string {
    const id = (place as any).id ?? (place as any).$id ?? '';
    if (!id) {
        console.error('❌ No ID found for place:', place);
        return `${LIVE_SITE_URL}/share/place/unknown`;
    }
    
    const location = (place as any).city || (place as any).location || 'Indonesia';
    const name = (place as any).name || 'spa';
    const seoSlug = generateSEOSlug(location, name);
    
    return `${LIVE_SITE_URL}/share/${seoSlug}/${id}`;
}

/**
 * Generate SEO-optimized share URL for facial place
 * Format: /share/pijat-yogyakarta-facial-name/facial-id
 */
export function generateFacialShareURL(place: Place): string {
    const id = (place as any).id ?? (place as any).$id ?? '';
    if (!id) {
        console.error('❌ No ID found for facial place:', place);
        return `${LIVE_SITE_URL}/share/facial/unknown`;
    }
    
    const location = (place as any).city || (place as any).location || 'Indonesia';
    const name = (place as any).name || 'facial';
    const seoSlug = generateSEOSlug(location, name);
    
    return `${LIVE_SITE_URL}/share/${seoSlug}/${id}`;
}

/**
 * Extract provider ID from share URL
 * Handles all formats:
 * - /share/pijat-yogyakarta-wiwid/694ed78e002b0c06171e (NEW SEO format)
 * - /share/therapist/694ed78e002b0c06171e (Simple format)
 * - /therapist-profile/694ed78e002b0c06171e-pijat-yogyakarta-wiwid (Legacy)
 */
export function extractProviderIdFromURL(url: string): { 
    id: string; 
    type: 'therapist' | 'place' | 'facial' | null;
} {
    const urlObj = new URL(url, LIVE_SITE_URL);
    const path = urlObj.pathname;
    
    // SEO format: /share/{slug}/{id}
    // Match anything that starts with /share/ and has at least 2 segments after
    const seoMatch = path.match(/\/share\/([^\/]+)\/([^\/]+)/);
    if (seoMatch) {
        const slug = seoMatch[1];
        const id = seoMatch[2];
        
        // Determine type from slug or ID length
        // If slug is 'therapist', 'place', or 'facial', use that
        if (slug === 'therapist') return { type: 'therapist', id };
        if (slug === 'place') return { type: 'place', id };
        if (slug === 'facial') return { type: 'facial', id };
        
        // Otherwise, it's an SEO slug - default to therapist for now
        // (we could parse the slug to determine type, but therapist is most common)
        return { type: 'therapist', id };
    }
    
    // Legacy format: /therapist-profile/{id}
    const legacyTherapistMatch = path.match(/\/therapist-profile\/([^\/]+)/);
    if (legacyTherapistMatch) {
        // Extract ID from complex slug formats
        const idPart = legacyTherapistMatch[1].split('-')[0];
        return { type: 'therapist', id: idPart };
    }
    
    // Legacy place format
    const legacyPlaceMatch = path.match(/\/place-profile\/([^\/]+)/);
    if (legacyPlaceMatch) {
        const idPart = legacyPlaceMatch[1].split('-')[0];
        return { type: 'place', id: idPart };
    }
    
    // Legacy facial format
    const legacyFacialMatch = path.match(/\/facial-profile\/([^\/]+)/);
    if (legacyFacialMatch) {
        const idPart = legacyFacialMatch[1].split('-')[0];
        return { type: 'facial', id: idPart };
    }
    
    return { id: '', type: null };
}

/**
 * Generate shareable text for WhatsApp/social media
 */
export function generateShareText(
    providerName: string,
    providerType: 'therapist' | 'place' | 'facial',
    city?: string
): string {
    const typeText = providerType === 'therapist' 
        ? 'Terapis Pijat' 
        : providerType === 'facial'
        ? 'Tempat Facial'
        : 'Tempat Pijat';
    
    const location = city ? ` di ${city}` : '';
    
    return `🌟 Check out ${providerName} - ${typeText} terbaik${location}! Book sekarang via IndaStreet:`;
}

/**
 * Copy URL to clipboard with fallback
 */
export async function copyShareURLToClipboard(url: string): Promise<boolean> {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(url);
            return true;
        }
        
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        return success;
    } catch (error) {
        console.error('Failed to copy URL:', error);
        return false;
    }
}
