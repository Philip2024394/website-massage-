/**
 * Short URL Resolver
 * Resolves #12345 format short IDs and slugs to full entity data
 */

import { shareLinkService } from '../../../lib/services/shareLinkService';
import type { Therapist, Place } from '../../../types';

/**
 * Extract short ID or slug from URL
 * Supports: /share/12345, /share/#12345, /share/budi-massage-ubud
 */
export function extractShortIdentifier(url: string): string | null {
    try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        
        // Look for /share/{identifier}
        const shareIndex = pathParts.indexOf('share');
        if (shareIndex !== -1 && pathParts.length > shareIndex + 1) {
            const identifier = pathParts[shareIndex + 1];
            // Remove # if present
            return identifier.replace('#', '');
        }
        
        return null;
    } catch (error) {
        console.error('Failed to parse URL:', error);
        return null;
    }
}

/**
 * Resolve short URL to entity
 */
export async function resolveShortUrl<T extends (Therapist | Place)>(
    identifier: string,
    allEntities: T[]
): Promise<{ entity: T | null; shareLink: any | null }> {
    try {
        console.log('🔍 Resolving short identifier:', identifier);
        
        // Get share link from Appwrite
        const shareLink = await shareLinkService.getByShortIdOrSlug(identifier);
        
        if (!shareLink) {
            console.warn('Share link not found for identifier:', identifier);
            return { entity: null, shareLink: null };
        }
        
        console.log('✅ Found share link:', {
            shortId: `#${shareLink.shortId}`,
            slug: shareLink.slug,
            entityType: shareLink.entityType,
            entityName: shareLink.entityName
        });
        
        // Find entity in the provided array
        const entity = allEntities.find(e => {
            const entityId = (e as any).$id || (e as any).id;
            return entityId === shareLink.entityId;
        });
        
        if (!entity) {
            console.warn('Entity not found in array:', shareLink.entityId);
        }
        
        return { entity: entity || null, shareLink };
    } catch (error) {
        console.error('Failed to resolve short URL:', error);
        return { entity: null, shareLink: null };
    }
}

/**
 * Generate share URL with short ID
 */
export function generateShortShareUrl(shortId: string): string {
    const LIVE_SITE_URL = 'https://www.indastreetmassage.com';
    return `${LIVE_SITE_URL}/share/${shortId}`;
}

/**
 * Display format for short ID (with #)
 */
export function formatShortId(shortId: string): string {
    return `#${shortId.replace('#', '')}`;
}
