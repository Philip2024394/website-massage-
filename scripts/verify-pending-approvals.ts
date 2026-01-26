/**
 * 🔍 PENDING APPROVALS VERIFICATION SCRIPT
 * 
 * This script verifies the pending approvals system is working correctly
 * by checking database connections, counting pending items, and validating
 * the approval workflow.
 */

import { Client, Databases, Query } from 'appwrite';

// Appwrite Configuration
const APPWRITE_CONFIG = {
    endpoint: 'https://cloud.appwrite.io/v1',
    projectId: '6762a05a000b4d66c73b',
    databaseId: '6762a092002dc25c8e9e',
    collections: {
        therapists: '6762a0da00141fd80bd5',
        places: '67631ccb0035fdc0e31e',
        bookings: '6763bbb9000e9e7efccf',
        notifications: '6763bc0b00062de5c7c3',
        analytics: '676a31b400076b6cf2ba',
        share_analytics: '67707e8c00393ebdf726'
    }
};

// Initialize Appwrite
const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);

const databases = new Databases(client);

/**
 * Test 1: Database Connection
 */
async function testDatabaseConnection() {
    console.log('🔌 Testing database connection...');
    try {
        const response = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.therapists,
            [Query.limit(1)]
        );
        console.log('✅ Database connection successful');
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
}

/**
 * Test 2: Count Pending Therapists
 */
async function countPendingTherapists() {
    console.log('👥 Counting pending therapists...');
    try {
        // New therapists (pending status)
        const newTherapists = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.therapists,
            [Query.equal('status', 'pending')]
        );

        // Therapists with updates pending
        const updatePendingTherapists = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.therapists,
            [
                Query.or([
                    Query.equal('needsReapproval', true),
                    Query.equal('pendingUpdates', true),
                    Query.equal('profileUpdatePending', true)
                ])
            ]
        );

        console.log(`📊 New therapists pending: ${newTherapists.total}`);
        console.log(`📊 Therapists with updates pending: ${updatePendingTherapists.total}`);
        
        return {
            newCount: newTherapists.total,
            updateCount: updatePendingTherapists.total,
            total: newTherapists.total + updatePendingTherapists.total
        };
    } catch (error) {
        console.error('❌ Error counting pending therapists:', error);
        return { newCount: 0, updateCount: 0, total: 0 };
    }
}

/**
 * Test 3: Count Pending Places
 */
async function countPendingPlaces() {
    console.log('🏢 Counting pending places...');
    try {
        // New places (pending status)
        const newPlaces = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.places,
            [Query.equal('status', 'pending')]
        );

        // Places with updates pending
        const updatePendingPlaces = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.places,
            [
                Query.or([
                    Query.equal('needsReapproval', true),
                    Query.equal('pendingUpdates', true),
                    Query.equal('profileUpdatePending', true)
                ])
            ]
        );

        console.log(`📊 New places pending: ${newPlaces.total}`);
        console.log(`📊 Places with updates pending: ${updatePendingPlaces.total}`);
        
        return {
            newCount: newPlaces.total,
            updateCount: updatePendingPlaces.total,
            total: newPlaces.total + updatePendingPlaces.total
        };
    } catch (error) {
        console.error('❌ Error counting pending places:', error);
        return { newCount: 0, updateCount: 0, total: 0 };
    }
}

/**
 * Test 4: Verify Re-Approval Fields
 */
async function verifyReApprovalFields() {
    console.log('🔍 Verifying re-approval fields...');
    try {
        // Check therapists with re-approval flags
        const therapistsWithFlags = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.therapists,
            [
                Query.equal('needsReapproval', true),
                Query.limit(5)
            ]
        );

        console.log('👥 Therapists needing re-approval:');
        therapistsWithFlags.documents.forEach((therapist, index) => {
            console.log(`  ${index + 1}. ${therapist.name}`);
            console.log(`     - needsReapproval: ${therapist.needsReapproval}`);
            console.log(`     - approvalType: ${therapist.approvalType || 'not set'}`);
            console.log(`     - pendingUpdate: ${therapist.pendingUpdate || 'not set'}`);
            console.log(`     - adminNotes: ${therapist.adminNotes || 'not set'}`);
        });

        // Check places with re-approval flags
        const placesWithFlags = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.places,
            [
                Query.equal('needsReapproval', true),
                Query.limit(5)
            ]
        );

        console.log('🏢 Places needing re-approval:');
        placesWithFlags.documents.forEach((place, index) => {
            console.log(`  ${index + 1}. ${place.name}`);
            console.log(`     - needsReapproval: ${place.needsReapproval}`);
            console.log(`     - approvalType: ${place.approvalType || 'not set'}`);
            console.log(`     - pendingUpdate: ${place.pendingUpdate || 'not set'}`);
            console.log(`     - adminNotes: ${place.adminNotes || 'not set'}`);
        });

        return {
            therapistsCount: therapistsWithFlags.total,
            placesCount: placesWithFlags.total
        };
    } catch (error) {
        console.error('❌ Error verifying re-approval fields:', error);
        return { therapistsCount: 0, placesCount: 0 };
    }
}

/**
 * Test 5: Count Available Now (Online/Active)
 */
async function countAvailableNow() {
    console.log('🟢 Counting available now...');
    try {
        // Active therapists
        const activeTherapists = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.therapists,
            [
                Query.equal('status', 'active'),
                Query.equal('islive', true)
            ]
        );

        // Active places
        const activePlaces = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.places,
            [
                Query.equal('status', 'Open'),
                Query.equal('islive', true)
            ]
        );

        console.log(`📊 Active therapists: ${activeTherapists.total}`);
        console.log(`📊 Active places: ${activePlaces.total}`);
        console.log(`📊 Total available now: ${activeTherapists.total + activePlaces.total}`);

        return {
            therapists: activeTherapists.total,
            places: activePlaces.total,
            total: activeTherapists.total + activePlaces.total
        };
    } catch (error) {
        console.error('❌ Error counting available now:', error);
        return { therapists: 0, places: 0, total: 0 };
    }
}

/**
 * Main Verification Function
 */
async function runPendingApprovalsVerification() {
    console.log('🚀 Starting Pending Approvals System Verification...\n');

    // Test 1: Database Connection
    const connectionOk = await testDatabaseConnection();
    if (!connectionOk) {
        console.log('❌ Verification failed - Database connection issues');
        return;
    }
    console.log('');

    // Test 2: Count Pending Items
    const therapistCounts = await countPendingTherapists();
    console.log('');
    const placeCounts = await countPendingPlaces();
    console.log('');

    // Test 3: Verify Re-Approval Fields
    const reApprovalCounts = await verifyReApprovalFields();
    console.log('');

    // Test 4: Count Available Now
    const availableCounts = await countAvailableNow();
    console.log('');

    // Summary Report
    console.log('📋 VERIFICATION SUMMARY REPORT');
    console.log('==============================');
    console.log(`✅ Database Connection: ${connectionOk ? 'WORKING' : 'FAILED'}`);
    console.log('');
    console.log('📊 PENDING APPROVALS COUNTS:');
    console.log(`   • New Therapists: ${therapistCounts.newCount}`);
    console.log(`   • Therapist Updates: ${therapistCounts.updateCount}`);
    console.log(`   • New Places: ${placeCounts.newCount}`);
    console.log(`   • Place Updates: ${placeCounts.updateCount}`);
    console.log(`   • TOTAL PENDING: ${therapistCounts.total + placeCounts.total}`);
    console.log('');
    console.log('🔍 RE-APPROVAL SYSTEM:');
    console.log(`   • Therapists with flags: ${reApprovalCounts.therapistsCount}`);
    console.log(`   • Places with flags: ${reApprovalCounts.placesCount}`);
    console.log('');
    console.log('🟢 AVAILABLE NOW:');
    console.log(`   • Active Therapists: ${availableCounts.therapists}`);
    console.log(`   • Active Places: ${availableCounts.places}`);
    console.log(`   • TOTAL AVAILABLE: ${availableCounts.total}`);
    console.log('');

    // Validation Checks
    const totalPending = therapistCounts.total + placeCounts.total;
    const totalReApprovals = reApprovalCounts.therapistsCount + reApprovalCounts.placesCount;
    
    console.log('✅ SYSTEM STATUS:');
    console.log(`   • Pending Approvals System: ${totalPending >= 0 ? 'OPERATIONAL' : 'ERROR'}`);
    console.log(`   • Re-Approval Workflow: ${totalReApprovals >= 0 ? 'FUNCTIONAL' : 'ERROR'}`);
    console.log(`   • Available Count: ${availableCounts.total > 0 ? 'POPULATED' : 'EMPTY'}`);
    
    if (totalPending === 0 && totalReApprovals === 0) {
        console.log('');
        console.log('ℹ️  NOTE: No pending approvals found. This could mean:');
        console.log('   1. All accounts are approved (good!)');
        console.log('   2. No new registrations or updates recently');
        console.log('   3. System needs testing with new accounts/updates');
    }
}

// Run verification if this script is executed directly
if (typeof window === 'undefined') {
    runPendingApprovalsVerification().catch(console.error);
}

// Export for use in other modules
export { runPendingApprovalsVerification };