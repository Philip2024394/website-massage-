#!/usr/bin/env node

/**
 * Admin Script: Verify Surtiningsih
 * Sets isVerified=true and verificationBadge='verified' for Surtiningsih
 */

import { Client, Databases, Query } from 'appwrite';
import { APPWRITE_CONFIG } from './lib/appwrite/config.js';

const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);

const databases = new Databases(client);

async function verifySurtiningsih() {
    try {
        console.log('🔍 Finding Surtiningsih in therapists collection...');
        
        // Find Surtiningsih
        const therapistsResponse = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.therapists,
            [
                Query.equal('name', 'Surtiningsih'),
                Query.limit(1)
            ]
        );
        
        if (therapistsResponse.documents.length === 0) {
            console.error('❌ Surtiningsih not found in therapists collection!');
            return;
        }
        
        const therapist = therapistsResponse.documents[0];
        console.log('✅ Found Surtiningsih:', therapist.$id);
        console.log('   Current isVerified:', therapist.isVerified);
        console.log('   Current verificationBadge:', therapist.verificationBadge);
        
        // Update verification status
        console.log('🚀 Setting verification status...');
        const updateData = {
            isVerified: true,
            verificationBadge: 'verified',
            verifiedAt: new Date().toISOString(),
            verifiedBy: 'admin-script'
        };
        
        const updated = await databases.updateDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.therapists,
            therapist.$id,
            updateData
        );
        
        console.log('✅ SUCCESS! Surtiningsih is now verified:');
        console.log('   isVerified:', updated.isVerified);
        console.log('   verificationBadge:', updated.verificationBadge);
        console.log('   verifiedAt:', updated.verifiedAt);
        
        console.log('🎉 Verification complete! The verified badge should now appear on home cards.');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code === 401) {
            console.log('💡 This script requires admin authentication.');
            console.log('   Please ensure you have valid admin credentials configured.');
        }
    }
}

verifySurtiningsih();