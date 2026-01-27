/**
 * Appwrite Function: Daily Therapist Status Reset
 * 
 * This function automatically resets ALL therapist online statuses at 6 AM Indonesia time daily.
 * 
 * Reset Logic:
 * - 80% of therapists → status = 'offline'
 * - 20% of therapists → status = 'busy'
 * - This forces therapists to manually reactivate daily
 * - Prevents inactive accounts from showing as available
 * 
 * Scheduling:
 * - Runs at 6:00 AM WIB (UTC+7) - Indonesia Western Time
 * - Runs at 6:00 AM WITA (UTC+8) - Indonesia Central Time  
 * - Runs at 6:00 AM WIT (UTC+9) - Indonesia Eastern Time
 * 
 * Appwrite Cron Schedule Format:
 * - Use Appwrite's built-in scheduled execution
 * - Set schedule: "0 6 * * *" (6 AM daily)
 * - Configure timezone in function settings
 * 
 * Prerequisites:
 * 1. Appwrite API Key with therapist collection permissions
 * 2. Environment variables:
 *    - APPWRITE_ENDPOINT
 *    - APPWRITE_PROJECT_ID  
 *    - APPWRITE_API_KEY
 *    - DATABASE_ID
 *    - THERAPISTS_COLLECTION_ID
 */

import { Client, Databases, Query } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  try {
    log('🌅 Daily Therapist Status Reset - Starting at 6 AM Indonesia Time');
    
    // Initialize Appwrite client
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);
    
    const databaseId = process.env.DATABASE_ID;
    const therapistsCollectionId = process.env.THERAPISTS_COLLECTION_ID;

    if (!databaseId || !therapistsCollectionId) {
      error('Missing required environment variables');
      return res.json({
        success: false,
        error: 'Configuration error: Missing database or collection ID'
      }, 500);
    }

    // Fetch ALL therapists (paginate if necessary)
    log('📋 Fetching all therapists...');
    let allTherapists = [];
    let offset = 0;
    const limit = 100; // Appwrite max per request
    let hasMore = true;

    while (hasMore) {
      const response = await databases.listDocuments(
        databaseId,
        therapistsCollectionId,
        [
          Query.limit(limit),
          Query.offset(offset)
        ]
      );

      allTherapists = allTherapists.concat(response.documents);
      offset += limit;
      hasMore = response.documents.length === limit;
      
      log(`  Fetched ${response.documents.length} therapists (total so far: ${allTherapists.length})`);
    }

    log(`✅ Total therapists found: ${allTherapists.length}`);

    if (allTherapists.length === 0) {
      log('⚠️ No therapists found to reset');
      return res.json({
        success: true,
        message: 'No therapists found to reset',
        resetCount: 0,
        timestamp: new Date().toISOString()
      });
    }

    // Shuffle therapists for random 80/20 distribution
    const shuffled = allTherapists.sort(() => Math.random() - 0.5);
    
    // Calculate 80/20 split
    const totalCount = shuffled.length;
    const offlineCount = Math.floor(totalCount * 0.8); // 80% offline
    const busyCount = totalCount - offlineCount; // Remaining 20% busy

    log(`📊 Reset distribution: ${offlineCount} offline (80%), ${busyCount} busy (20%)`);

    // Update therapists in batches (Appwrite has rate limits)
    const batchSize = 10; // Update 10 at a time to avoid rate limits
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < shuffled.length; i += batchSize) {
      const batch = shuffled.slice(i, i + batchSize);
      
      // Process batch in parallel
      const batchPromises = batch.map(async (therapist, index) => {
        try {
          const globalIndex = i + index;
          const newStatus = globalIndex < offlineCount ? 'offline' : 'busy';
          
          await databases.updateDocument(
            databaseId,
            therapistsCollectionId,
            therapist.$id,
            {
              status: newStatus,
              lastResetAt: new Date().toISOString()
            }
          );
          
          successCount++;
          return { id: therapist.$id, name: therapist.name, newStatus, success: true };
        } catch (err) {
          errorCount++;
          error(`Failed to update therapist ${therapist.$id}: ${err.message}`);
          return { id: therapist.$id, name: therapist.name, error: err.message, success: false };
        }
      });

      await Promise.all(batchPromises);
      
      // Log progress
      log(`  Progress: ${Math.min(i + batchSize, totalCount)}/${totalCount} therapists processed`);
      
      // Small delay between batches to respect rate limits
      if (i + batchSize < shuffled.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      timezone: 'Asia/Jakarta (WIB UTC+7)',
      totalTherapists: totalCount,
      successCount,
      errorCount,
      distribution: {
        offline: offlineCount,
        busy: busyCount
      }
    };

    log('✅ Daily reset completed successfully!');
    log(`📊 Summary: ${successCount} updated, ${errorCount} errors`);

    return res.json(summary, 200);

  } catch (err) {
    error('Fatal error during daily reset:', err);
    return res.json({
      success: false,
      error: err.message,
      timestamp: new Date().toISOString()
    }, 500);
  }
};
