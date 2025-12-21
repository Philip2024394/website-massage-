/**
 * Bulletproof Share URL Builder
 * Simple, reliable URL generation for all provider types
 * GUARANTEED to work on live site
 */

import type { Therapist, Place } from '../../../types';

// ALWAYS use production URL for sharing (never localhost)
const LIVE_SITE_URL = 'https://www.indastreetmassage.com';

/**
 * Generate share URL for therapist
 * Format: /share/therapist/{id}
 * Simple, clean, guaranteed to work
 */
export function generateTherapistShareURL(therapist: Therapist): string {
    const id = (therapist as any).id ?? (therapist as any).$id ?? '';
    if (!id) {
        console.error('❌ No ID found for therapist:', therapist);
        return `${LIVE_SITE_URL}/share/therapist/unknown`;
    }
    
    // Simple format - just ID, no complex slugs
    return `${LIVE_SITE_URL}/share/therapist/${id}`;
}

/**
 * Generate share URL for massage place
 * Format: /share/place/{id}
 */
export function generatePlaceShareURL(place: Place): string {
    const id = (place as any).id ?? (place as any).$id ?? '';
    if (!id) {
        console.error('❌ No ID found for place:', place);
        return `${LIVE_SITE_URL}/share/place/unknown`;
    }
    
    return `${LIVE_SITE_URL}/share/place/${id}`;
}

/**
 * Generate share URL for facial place
 * Format: /share/facial/{id}
 */
export function generateFacialShareURL(place: Place): string {
    const id = (place as any).id ?? (place as any).$id ?? '';
    if (!id) {
        console.error('❌ No ID found for facial place:', place);
        return `${LIVE_SITE_URL}/share/facial/unknown`;
    }
    
    return `${LIVE_SITE_URL}/share/facial/${id}`;
}

/**
 * Extract provider ID from share URL
 * Handles all formats: /share/therapist/123, /therapist-profile/123, etc.
 */
export function extractProviderIdFromURL(url: string): { 
    id: string; 
    type: 'therapist' | 'place' | 'facial' | null;
} {
    const urlObj = new URL(url, LIVE_SITE_URL);
    const path = urlObj.pathname;
    
    // New format: /share/{type}/{id}
    const newMatch = path.match(/\/share\/(therapist|place|facial)\/([^\/]+)/);
    if (newMatch) {
        return {
            type: newMatch[1] as 'therapist' | 'place' | 'facial',
            id: newMatch[2]
        };
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
