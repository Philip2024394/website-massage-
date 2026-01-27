/**
 * Commission Deadline Enforcer - Appwrite Function
 * 
 * PURPOSE:
 * Enforces 3-hour commission payment deadline using SERVER TIME ONLY.
 * Automatically deactivates therapist accounts when payment deadline passes.
 * 
 * TRIGGER: Cron (*/5 * * * * = every 5 minutes)
 * 
 * SAFETY:
 * - Idempotent (safe to run repeatedly)
 * - Fail-closed behavior (block on error)
 * - No client-side dependencies
 * - Server time only (no client trust)
 * 
 * CRITICAL: This function MUST run reliably for revenue protection.
 */

import { Client, Databases, Query, ID } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  // ===== ENVIRONMENT VALIDATION =====
  const requiredEnv = {
    APPWRITE_FUNCTION_API_ENDPOINT: process.env.APPWRITE_FUNCTION_API_ENDPOINT,
    APPWRITE_FUNCTION_PROJECT_ID: process.env.APPWRITE_FUNCTION_PROJECT_ID,
    APPWRITE_API_KEY: process.env.APPWRITE_API_KEY,
    DATABASE_ID: process.env.DATABASE_ID,
    COMMISSION_RECORDS_COLLECTION_ID: process.env.COMMISSION_RECORDS_COLLECTION_ID,
    THERAPIST_MENUS_COLLECTION_ID: process.env.THERAPIST_MENUS_COLLECTION_ID,
    AUDIT_LOGS_COLLECTION_ID: process.env.AUDIT_LOGS_COLLECTION_ID
  };

  // Validate all required environment variables
  for (const [key, value] of Object.entries(requiredEnv)) {
    if (!value) {
      error(`❌ CRITICAL: Missing environment variable: ${key}`);
      return res.json({
        success: false,
        error: `Missing required environment variable: ${key}`,
        expiredCount: 0,
        deactivatedCount: 0,
        errorCount: 1
      }, 500);
    }
  }

  log('✅ Environment variables validated');

  // ===== INITIALIZE APPWRITE CLIENT =====
  const client = new Client()
    .setEndpoint(requiredEnv.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(requiredEnv.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(requiredEnv.APPWRITE_API_KEY);

  const databases = new Databases(client);

  // ===== GET SERVER TIME (CRITICAL: Never trust client time) =====
  const serverTime = new Date();
  const serverTimeISO = serverTime.toISOString();
  log(`🕐 Server time: ${serverTimeISO}`);

  let expiredCount = 0;
  let deactivatedCount = 0;
  let errorCount = 0;
  const results = [];

  try {
    // ===== QUERY EXPIRED COMMISSIONS =====
    // Find all commissions where:
    // 1. Status is 'pending' or 'awaiting_verification' 
    // 2. Deadline has passed (deadlineAt < serverTime)
    log('🔍 Querying expired commissions...');
    
    const expiredCommissions = await databases.listDocuments(
      requiredEnv.DATABASE_ID,
      requiredEnv.COMMISSION_RECORDS_COLLECTION_ID,
      [
        Query.equal('status', ['pending', 'awaiting_verification']),
        Query.lessThan('deadlineAt', serverTimeISO),
        Query.limit(100) // Process max 100 per run for safety
      ]
    );

    log(`📊 Found ${expiredCommissions.documents.length} expired commissions`);

    if (expiredCommissions.documents.length === 0) {
      log('✅ No expired commissions found');
      return res.json({
        success: true,
        message: 'No expired commissions to process',
        serverTime: serverTimeISO,
        expiredCount: 0,
        deactivatedCount: 0,
        errorCount: 0
      });
    }

    // ===== PROCESS EACH EXPIRED COMMISSION =====
    for (const commission of expiredCommissions.documents) {
      const commissionId = commission.$id;
      const therapistId = commission.therapistId;
      const bookingId = commission.bookingId;
      const deadlineAt = commission.deadlineAt;

      log(`\n🔴 Processing expired commission: ${commissionId}`);
      log(`   Therapist ID: ${therapistId}`);
      log(`   Booking ID: ${bookingId}`);
      log(`   Deadline was: ${deadlineAt}`);
      log(`   Current time: ${serverTimeISO}`);

      try {
        // ===== STEP 1: Mark commission as expired =====
        await databases.updateDocument(
          requiredEnv.DATABASE_ID,
          requiredEnv.COMMISSION_RECORDS_COLLECTION_ID,
          commissionId,
          {
            status: 'expired',
            updatedAt: serverTimeISO
          }
        );
        log(`   ✅ Commission marked as expired`);
        expiredCount++;

        // ===== STEP 2: Find therapist's menu document =====
        const menuDocs = await databases.listDocuments(
          requiredEnv.DATABASE_ID,
          requiredEnv.THERAPIST_MENUS_COLLECTION_ID,
          [
            Query.equal('therapistId', therapistId),
            Query.limit(1)
          ]
        );

        if (menuDocs.documents.length === 0) {
          log(`   ⚠️ WARNING: No therapist_menus document found for therapistId: ${therapistId}`);
          errorCount++;
          results.push({
            commissionId,
            therapistId,
            status: 'error',
            reason: 'No therapist_menus document found'
          });
          continue;
        }

        const menuDoc = menuDocs.documents[0];
        const menuDocId = menuDoc.$id;

        // ===== STEP 3: Check if already deactivated (idempotency) =====
        if (menuDoc.status === 'busy' && menuDoc.bookingEnabled === false) {
          log(`   ℹ️ Therapist already deactivated (idempotent check passed)`);
          results.push({
            commissionId,
            therapistId,
            status: 'already_deactivated',
            menuDocId
          });
          continue;
        }

        // ===== STEP 4: Deactivate therapist account =====
        await databases.updateDocument(
          requiredEnv.DATABASE_ID,
          requiredEnv.THERAPIST_MENUS_COLLECTION_ID,
          menuDocId,
          {
            status: 'busy',
            bookingEnabled: false,
            scheduleEnabled: false,
            deactivationReason: 'commission_overdue',
            deactivatedAt: serverTimeISO
          }
        );
        log(`   ✅ Therapist account deactivated (menuDocId: ${menuDocId})`);
        deactivatedCount++;

        // ===== STEP 5: Write audit log =====
        await databases.createDocument(
          requiredEnv.DATABASE_ID,
          requiredEnv.AUDIT_LOGS_COLLECTION_ID,
          ID.unique(),
          {
            type: 'COMMISSION_EXPIRED',
            userId: therapistId,
            reason: `Commission payment deadline expired. Booking: ${bookingId}, Commission: ${commissionId}, Deadline: ${deadlineAt}`,
            metadata: JSON.stringify({
              commissionId,
              bookingId,
              therapistId,
              deadlineAt,
              enforcedAt: serverTimeISO,
              menuDocId
            }),
            timestamp: serverTimeISO,
            severity: 'critical'
          }
        );
        log(`   ✅ Audit log written`);

        results.push({
          commissionId,
          therapistId,
          bookingId,
          status: 'success',
          menuDocId,
          deactivatedAt: serverTimeISO
        });

      } catch (processingError) {
        error(`   ❌ Error processing commission ${commissionId}: ${processingError.message}`);
        errorCount++;
        results.push({
          commissionId,
          therapistId,
          status: 'error',
          error: processingError.message
        });
        // Continue processing other commissions even if one fails
        continue;
      }
    }

    // ===== RETURN SUCCESS RESPONSE =====
    log('\n📊 ENFORCEMENT SUMMARY:');
    log(`   ✅ Commissions expired: ${expiredCount}`);
    log(`   ✅ Accounts deactivated: ${deactivatedCount}`);
    log(`   ❌ Errors: ${errorCount}`);

    return res.json({
      success: true,
      message: 'Commission deadline enforcement completed',
      serverTime: serverTimeISO,
      expiredCount,
      deactivatedCount,
      errorCount,
      results
    });

  } catch (globalError) {
    error(`❌ CRITICAL ERROR in commission enforcer: ${globalError.message}`);
    error(`Stack trace: ${globalError.stack}`);
    
    return res.json({
      success: false,
      error: globalError.message,
      serverTime: serverTimeISO,
      expiredCount,
      deactivatedCount,
      errorCount: errorCount + 1
    }, 500);
  }
};
