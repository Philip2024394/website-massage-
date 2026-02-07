/**
 * 🚀 BULK DATA SERVICE - Eliminate N+1 Queries
 * 
 * Purpose: Fetch data for multiple entities in single queries instead of N queries
 * Performance: Reduces 20+ queries → 2-3 queries
 * 
 * @module bulkDataService
 */

import { databases } from '../appwrite.config';
import { Query } from 'appwrite';
import type { TherapistMenu, ShareLink } from '../../types';

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const THERAPIST_MENUS_COLLECTION_ID = import.meta.env.VITE_THERAPIST_MENUS_COLLECTION_ID;
const SHARE_LINKS_COLLECTION_ID = import.meta.env.VITE_SHARE_LINKS_COLLECTION_ID;

interface BulkTherapistMenusResult {
  byTherapistId: Map<string, TherapistMenu>;
  all: TherapistMenu[];
}

interface BulkShareLinksResult {
  byEntityId: Map<string, ShareLink>;
  all: ShareLink[];
}

/**
 * 🎯 Fetch all therapist menus for multiple therapists in ONE query
 * 
 * @param therapistIds - Array of therapist IDs to fetch menus for
 * @returns Map of therapistId → menu document
 * 
 * @example
 * ```ts
 * const therapistIds = therapists.map(t => t.$id || t.id);
 * const menus = await bulkFetchTherapistMenus(therapistIds);
 * const menu = menus.byTherapistId.get(therapistId);
 * ```
 */
export async function bulkFetchTherapistMenus(
  therapistIds: string[]
): Promise<BulkTherapistMenusResult> {
  if (therapistIds.length === 0) {
    return { byTherapistId: new Map(), all: [] };
  }

  try {
    // Appwrite Query.equal can handle arrays for IN queries
    // Fetch all menus where therapistId is in the array
    const response = await databases.listDocuments(
      DATABASE_ID,
      THERAPIST_MENUS_COLLECTION_ID,
      [
        Query.equal('therapistId', therapistIds),
        Query.orderDesc('$updatedAt'),
        Query.limit(500) // Adjust based on expected max therapists per page
      ]
    );

    // Build map: therapistId → most recent menu
    const byTherapistId = new Map<string, TherapistMenu>();
    
    // Group by therapistId and keep only the most recent (already sorted by $updatedAt DESC)
    response.documents.forEach((doc) => {
      const menu = doc as unknown as TherapistMenu;
      const therapistId = menu.therapistId;
      
      // Only add if this therapist doesn't have a menu yet (first = most recent)
      if (!byTherapistId.has(therapistId)) {
        byTherapistId.set(therapistId, menu);
      }
    });

    console.log(`✅ Bulk fetched ${byTherapistId.size} therapist menus for ${therapistIds.length} therapists`);

    return {
      byTherapistId,
      all: response.documents as unknown as TherapistMenu[]
    };
  } catch (error) {
    console.error('❌ Error bulk fetching therapist menus:', error);
    return { byTherapistId: new Map(), all: [] };
  }
}

/**
 * 🎯 Fetch all share links for multiple entities in ONE query
 * 
 * @param entityType - 'therapist' | 'place'
 * @param entityIds - Array of entity IDs to fetch share links for
 * @returns Map of entityId → share link
 * 
 * @example
 * ```ts
 * const therapistIds = therapists.map(t => t.$id || t.id);
 * const shareLinks = await bulkFetchShareLinks('therapist', therapistIds);
 * const link = shareLinks.byEntityId.get(therapistId);
 * ```
 */
export async function bulkFetchShareLinks(
  entityType: 'therapist' | 'place',
  entityIds: string[]
): Promise<BulkShareLinksResult> {
  if (entityIds.length === 0) {
    return { byEntityId: new Map(), all: [] };
  }

  try {
    // Fetch all share links for this entity type where entityId is in array
    const response = await databases.listDocuments(
      DATABASE_ID,
      SHARE_LINKS_COLLECTION_ID,
      [
        Query.equal('linkedItemType', entityType),
        Query.equal('linkedItemId', entityIds),
        Query.equal('isActive', true),
        Query.limit(500)
      ]
    );

    // Build map: entityId → share link
    const byEntityId = new Map<string, ShareLink>();
    
    response.documents.forEach((doc) => {
      const link = doc as unknown as ShareLink;
      const entityId = link.linkedItemId;
      
      // Store the link (assuming one active link per entity)
      if (!byEntityId.has(entityId)) {
        byEntityId.set(entityId, link);
      }
    });

    console.log(`✅ Bulk fetched ${byEntityId.size} share links for ${entityIds.length} ${entityType}s`);

    return {
      byEntityId,
      all: response.documents as unknown as ShareLink[]
    };
  } catch (error) {
    console.error(`❌ Error bulk fetching share links for ${entityType}:`, error);
    return { byEntityId: new Map(), all: [] };
  }
}

/**
 * 🎯 Prefetch all data needed for therapist cards
 * 
 * Call this ONCE before rendering multiple TherapistHomeCard components
 * 
 * @param therapists - Array of therapists to prefetch data for
 * @returns Object with menus and shareLinks maps
 */
export async function prefetchTherapistCardData(therapists: any[]) {
  const therapistIds = therapists.map(t => String(t.$id || t.id));

  console.log(`🚀 Prefetching data for ${therapistIds.length} therapists...`);
  
  const startTime = performance.now();

  // Fetch both in parallel (2 queries total instead of N*2)
  const [menus, shareLinks] = await Promise.all([
    bulkFetchTherapistMenus(therapistIds),
    bulkFetchShareLinks('therapist', therapistIds)
  ]);

  const endTime = performance.now();
  console.log(`✅ Prefetch complete in ${(endTime - startTime).toFixed(0)}ms`);
  console.log(`   - Menus: ${menus.byTherapistId.size} found`);
  console.log(`   - Share Links: ${shareLinks.byEntityId.size} found`);

  return {
    menus: menus.byTherapistId,
    shareLinks: shareLinks.byEntityId
  };
}

/**
 * 🎯 Prefetch all data needed for place cards
 */
export async function prefetchPlaceCardData(places: any[]) {
  const placeIds = places.map(p => String(p.$id || p.id));

  console.log(`🚀 Prefetching data for ${placeIds.length} places...`);
  
  const startTime = performance.now();

  const shareLinks = await bulkFetchShareLinks('place', placeIds);

  const endTime = performance.now();
  console.log(`✅ Prefetch complete in ${(endTime - startTime).toFixed(0)}ms`);
  console.log(`   - Share Links: ${shareLinks.byEntityId.size} found`);

  return {
    shareLinks: shareLinks.byEntityId
  };
}
