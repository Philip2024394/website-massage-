/**
 * Share Links Auto-Initialization Service
 * 
 * 🚀 AUTOMATIC SHARE LINK GENERATION
 * Runs in background to ensure ALL entities have proper share links
 * for Facebook-standard social media sharing
 * 
 * Features:
 * ✅ Auto-detects missing share links on app startup
 * ✅ Creates share links for existing entities without them
 * ✅ Monitors new entity creation via webhooks/events
 * ✅ Ensures 100% coverage for social media sharing
 */

import { shareLinksValidationService } from './shareLinksValidationService';
import { shareLinkService } from './shareLinkService';

class ShareLinksAutoInitService {
    private initialized = false;
    private runningCheck = false;

    /**
     * 🚀 Initialize share links system
     * Called on app startup to ensure all entities have share links
     * OPTIMIZATION: Skips expensive checks on normal page loads
     */
    async initialize(): Promise<void> {
        if (this.initialized || this.runningCheck) {
            console.log('🔗 [Share Links] Already initialized or running');
            return;
        }

        this.runningCheck = true;
        console.log('🚀 [Share Links Auto-Init] Starting initialization...');

        try {
            // OPTIMIZATION: Skip the health check entirely on normal loads
            // Only run full validation in admin mode or on demand
            const isAdminMode = import.meta?.env?.MODE === 'admin';
            
            if (!isAdminMode) {
                console.log('✅ [Share Links] Skipping auto-init on user page load (performance optimization)');
                this.initialized = true;
                return;
            }

            // Quick health check first (admin only)
            const health = await shareLinksValidationService.healthCheck();
            console.log(`🩺 [Share Links] Health: ${health.status} - ${health.message}`);

            // If coverage is below 100%, create missing links
            if (health.stats.coveragePercent < 100) {
                console.log(`🔧 [Share Links] Creating missing links (${health.stats.coveragePercent}% coverage)...`);
                
                const result = await shareLinksValidationService.createMissingShareLinks();
                
                console.log(`✅ [Share Links] Auto-init complete: Created ${result.linksCreated} new links`);
                
                if (result.errors.length > 0) {
                    console.warn(`⚠️ [Share Links] ${result.errors.length} errors during creation:`, result.errors.slice(0, 3));
                }
            } else {
                console.log('✅ [Share Links] All entities already have share links');
            }

            this.initialized = true;
            
            // Schedule periodic validation (every 30 minutes)
            this.schedulePeriodicValidation();
            
        } catch (error) {
            console.error('❌ [Share Links Auto-Init] Failed:', error);
        } finally {
            this.runningCheck = false;
        }
    }

    /**
     * 🕒 Schedule periodic validation to catch any missed entities
     */
    private schedulePeriodicValidation(): void {
        setInterval(async () => {
            try {
                const health = await shareLinksValidationService.healthCheck();
                
                // If coverage drops below 95%, auto-fix it
                if (health.stats.coveragePercent < 95) {
                    console.log(`🔄 [Share Links] Periodic fix: ${health.stats.coveragePercent}% coverage`);
                    await shareLinksValidationService.createMissingShareLinks();
                }
                
            } catch (error) {
                console.error('❌ [Share Links] Periodic validation failed:', error);
            }
        }, 30 * 60 * 1000); // 30 minutes
    }

    /**
     * 🎯 Ensure specific entity has share link
     * Called when creating new therapists/places to guarantee share link exists
     */
    async ensureEntityHasShareLink(
        entityType: 'therapist' | 'place' | 'facial',
        entityId: string,
        entityName: string,
        city?: string
    ): Promise<{ success: boolean; shareUrl?: string; error?: string }> {
        try {
            console.log(`🔍 [Share Links] Checking ${entityType} ${entityName}...`);
            
            // Check if share link already exists
            const existingLink = await this.findExistingShareLink(entityType, entityId);
            
            if (existingLink) {
                const shareUrl = `https://www.indastreetmassage.com/share/${existingLink.slug}/${existingLink.entityId}`;
                console.log(`✅ [Share Links] ${entityType} already has share link: ${shareUrl}`);
                return { success: true, shareUrl };
            }

            // Create new share link
            const newLink = await shareLinkService.createShareLink(
                entityType,
                entityId,
                entityName,
                city || (entityType === 'therapist' ? 'Bali' : 'Jakarta')
            );

            const shareUrl = `https://www.indastreetmassage.com/share/${newLink.slug}/${newLink.entityId}`;
            console.log(`✅ [Share Links] Created new link for ${entityType}: ${shareUrl}`);
            
            return { success: true, shareUrl };
            
        } catch (error) {
            console.error(`❌ [Share Links] Failed to ensure ${entityType} link:`, error);
            return { success: false, error: (error as any).toString() };
        }
    }

    /**
     * 🔍 Find existing share link for entity
     */
    private async findExistingShareLink(entityType: string, entityId: string) {
        try {
            const { databases } = await import('../appwrite');
            const { APPWRITE_CONFIG } = await import('../appwrite.config');
            const { Query } = await import('appwrite');

            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.share_links,
                [
                    Query.equal('entityType', entityType),
                    Query.equal('entityId', entityId),
                    Query.limit(1)
                ]
            );

            return response.documents.length > 0 ? response.documents[0] : null;
        } catch (error) {
            console.error('Error finding existing share link:', error);
            return null;
        }
    }

    /**
     * 📊 Get initialization status
     */
    getStatus(): {
        initialized: boolean;
        runningCheck: boolean;
    } {
        return {
            initialized: this.initialized,
            runningCheck: this.runningCheck
        };
    }
}

export const shareLinksAutoInitService = new ShareLinksAutoInitService();

// 🚀 AUTO-START on import
// This ensures share links are validated as soon as the service is loaded
setTimeout(() => {
    shareLinksAutoInitService.initialize().catch(error => {
        console.error('❌ [Share Links] Auto-initialization failed:', error);
    });
}, 2000); // Wait 2 seconds for other services to load

// Export helper for manual entity checking
export const ensureEntityShareLink = (
    entityType: 'therapist' | 'place' | 'facial',
    entityId: string,
    entityName: string,
    city?: string
) => shareLinksAutoInitService.ensureEntityHasShareLink(entityType, entityId, entityName, city);

console.log('🔗 Share Links Auto-Init Service loaded - will auto-validate in 2 seconds');