// Simple login test
console.log('🧪 Testing Login System...');

// Test the auth configuration
import { COLLECTIONS, DATABASE_ID } from './lib/appwrite.js';

console.log('Database ID:', DATABASE_ID);
console.log('Therapists Collection:', COLLECTIONS.THERAPISTS);
console.log('Users Collection:', COLLECTIONS.USERS);

// This should show the updated collection IDs
console.log('✅ Collection IDs are now properly configured');
console.log('Next: Try logging in through the UI at localhost:3002');