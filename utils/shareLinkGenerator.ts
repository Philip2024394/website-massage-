/**
 * Auto-generate share link when a new member signs up
 * Call this function after creating therapist/place/facial account
 */

import { shareLinkService } from '../lib/services/shareLinkService';

/**
 * Generate share link for new therapist
 */
export async function generateTherapistShareLink(
    therapistId: string,
    name: string,
    city?: string
): Promise<string> {
    try {
        console.log('🔗 Generating share link for therapist:', name);
        
        const shareLink = await shareLinkService.createShareLink(
            'therapist',
            therapistId,
            name,
            city
        );
        
        const shortUrl = `https://www.indastreetmassage.com/share/${shareLink.shortId}`;
        
        console.log('✅ Share link created:', {
            displayId: `#${shareLink.shortId}`,
            slug: shareLink.slug,
            url: shortUrl
        });
        
        return shareLink.shortId;
    } catch (error) {
        console.error('❌ Failed to generate therapist share link:', error);
        throw error;
    }
}

/**
 * Generate share link for new place
 */
export async function generatePlaceShareLink(
    placeId: string,
    name: string,
    city?: string
): Promise<string> {
    try {
        console.log('🔗 Generating share link for place:', name);
        
        const shareLink = await shareLinkService.createShareLink(
            'place',
            placeId,
            name,
            city
        );
        
        const shortUrl = `https://www.indastreetmassage.com/share/${shareLink.shortId}`;
        
        console.log('✅ Share link created:', {
            displayId: `#${shareLink.shortId}`,
            slug: shareLink.slug,
            url: shortUrl
        });
        
        return shareLink.shortId;
    } catch (error) {
        console.error('❌ Failed to generate place share link:', error);
        throw error;
    }
}

/**
 * Generate share link for new facial place
 */
export async function generateFacialShareLink(
    facialPlaceId: string,
    name: string,
    city?: string
): Promise<string> {
    try {
        console.log('🔗 Generating share link for facial place:', name);
        
        const shareLink = await shareLinkService.createShareLink(
            'facial',
            facialPlaceId,
            name,
            city
        );
        
        const shortUrl = `https://www.indastreetmassage.com/share/${shareLink.shortId}`;
        
        console.log('✅ Share link created:', {
            displayId: `#${shareLink.shortId}`,
            slug: shareLink.slug,
            url: shortUrl
        });
        
        return shareLink.shortId;
    } catch (error) {
        console.error('❌ Failed to generate facial place share link:', error);
        throw error;
    }
}

/**
 * Get share link for existing member (or create if doesn't exist)
 */
export async function getOrCreateShareLink(
    entityType: 'therapist' | 'place' | 'facial',
    entityId: string,
    name: string,
    city?: string
): Promise<{ shortId: string; slug: string; url: string }> {
    try {
        const shareLink = await shareLinkService.getOrCreateShareLink(
            entityType,
            entityId,
            name,
            city
        );
        
        return {
            shortId: shareLink.shortId,
            slug: shareLink.slug,
            url: `https://www.indastreetmassage.com/share/${shareLink.shortId}`
        };
    } catch (error) {
        console.error('❌ Failed to get/create share link:', error);
        throw error;
    }
}
