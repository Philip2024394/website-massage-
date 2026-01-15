/**
 * 🔒 APPWRITE COLLECTION PROTECTION SYSTEM
 * 
 * Facebook Standard: Rock-Solid Startup Validation
 * 
 * This file MUST be imported in your app's entry point (main.tsx or App.tsx)
 * to validate all collection IDs before the app starts.
 * 
 * USAGE:
 * 
 * ```typescript
 * // In main.tsx or App.tsx
 * import './lib/appwrite-startup-validator';
 * ```
 * 
 * WHAT IT DOES:
 * 1. Validates all collection IDs at startup
 * 2. Blocks app if numeric hash IDs detected
 * 3. Shows clear error messages with fix instructions
 * 4. Prevents 404 errors before they happen
 */

import { validateAllCollections } from './appwrite-collection-validator';

console.log('='.repeat(80));
console.log('🔒 APPWRITE COLLECTION PROTECTION SYSTEM');
console.log('='.repeat(80));

// Run validation
const validation = validateAllCollections();

if (!validation.valid) {
  console.error('\n' + '='.repeat(80));
  console.error('❌ CRITICAL ERROR: Invalid Appwrite Collection IDs Detected');
  console.error('='.repeat(80));
  console.error('\nYour app is using NUMERIC HASH collection IDs that DO NOT EXIST.');
  console.error('This will cause 404 errors when accessing collections.\n');
  
  validation.errors.forEach((error, index) => {
    console.error(`\n${index + 1}. ${error}`);
  });
  
  console.error('\n' + '-'.repeat(80));
  console.error('🔧 HOW TO FIX:');
  console.error('-'.repeat(80));
  console.error('\n1. Open: APPWRITE_MASTER_CONFIG.ts');
  console.error('2. Replace numeric hash IDs (e.g., "675e13fc002aaf0777ce")');
  console.error('   with text-based IDs (e.g., "bookings_collection_id")');
  console.error('\n3. Make sure your Appwrite collections use TEXT-BASED IDs:');
  console.error('   - Go to Appwrite Console → Database → Collections');
  console.error('   - Use Collection ID like: "bookings_collection_id"');
  console.error('   - NOT like: "675e13fc002aaf0777ce"');
  console.error('\n4. Update APPWRITE_MASTER_CONFIG.ts with correct text IDs');
  console.error('5. Restart your dev server\n');
  
  console.error('='.repeat(80));
  
  // In development, throw error to stop the app
  if (import.meta.env.DEV) {
    throw new Error(
      'Invalid Appwrite Collection IDs detected. ' +
      'Check console for details and fix APPWRITE_MASTER_CONFIG.ts'
    );
  } else {
    // In production, just warn (don't break the app)
    console.warn('⚠️  App starting with invalid collection IDs - expect errors');
  }
} else {
  console.log('✅ All collection IDs validated successfully');
  console.log('='.repeat(80) + '\n');
}

// Export validation result for use in other files
export const collectionValidation = validation;

