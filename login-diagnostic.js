// Quick login diagnostic script
import { account, databases, DATABASE_ID, COLLECTIONS } from './lib/appwrite.js';

console.log('=== LOGIN DIAGNOSTIC ===');
console.log('Database ID:', DATABASE_ID);
console.log('Collections:', COLLECTIONS);

// Test Appwrite connection
async function testConnection() {
    try {
        console.log('\n🔍 Testing Appwrite connection...');
        
        // Test account service
        try {
            const session = await account.getSession('current');
            console.log('✅ Already logged in:', session.userId);
        } catch (err) {
            console.log('ℹ️ No active session (this is normal)');
        }

        // Test database connection
        console.log('\n🔍 Testing database collections...');
        
        // Test therapists collection
        try {
            const therapists = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.THERAPISTS,
                []
            );
            console.log('✅ Therapists collection accessible, documents:', therapists.total);
        } catch (err) {
            console.error('❌ Therapists collection error:', err.message);
        }

        // Test users collection
        try {
            const users = await databases.listDocuments(
                DATABASE_ID, 
                COLLECTIONS.USERS,
                []
            );
            console.log('✅ Users collection accessible, documents:', users.total);
        } catch (err) {
            console.error('❌ Users collection error:', err.message);
        }

    } catch (error) {
        console.error('❌ Connection failed:', error.message);
    }
}

// Run diagnostic
testConnection();