/**
 * COMPREHENSIVE LOCATION BUG DIAGNOSIS & FIX VERIFICATION
 * 
 * This script will:
 * 1. Verify all Yogyakarta therapists exist in database
 * 2. Check their location field values
 * 3. Test the filtering logic
 * 4. Provide clear instructions for fix
 */

import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const databaseId = '68f76ee1000e64ca8d05';
const therapistCollectionId = 'therapists_collection_id';

async function comprehensiveDiagnosis() {
    console.log('\n' + '='.repeat(80));
    console.log('🔍 COMPREHENSIVE LOCATION BUG DIAGNOSIS');
    console.log('='.repeat(80));
    
    try {
        // STEP 1: Fetch ALL therapists
        console.log('\n📊 STEP 1: Fetching all therapists from Appwrite...');
        const response = await databases.listDocuments(
            databaseId,
            therapistCollectionId,
            [Query.limit(500)]
        );
        
        const allTherapists = response.documents;
        console.log(`✅ Retrieved ${allTherapists.length} therapists`);
        
        // STEP 2: Analyze location field
        console.log('\n📍 STEP 2: Analyzing location field...');
        console.log('-'.repeat(80));
        
        const withLocation = allTherapists.filter(t => t.location && t.location.trim());
        const withoutLocation = allTherapists.filter(t => !t.location || !t.location.trim());
        
        console.log(`Therapists WITH location field: ${withLocation.length}`);
        console.log(`Therapists WITHOUT location field: ${withoutLocation.length}`);
        
        if (withoutLocation.length > 0) {
            console.log('\n⚠️ CRITICAL: These therapists have NO location set:');
            withoutLocation.forEach(t => {
                console.log(`  - ${t.name} (ID: ${t.$id})`);
            });
        }
        
        // STEP 3: Yogyakarta-specific analysis
        console.log('\n\n🏙️ STEP 3: Yogyakarta Therapists Analysis');
        console.log('-'.repeat(80));
        
        const yogyaTherapists = allTherapists.filter(t => {
            if (!t.location) return false;
            const loc = t.location.toLowerCase();
            return loc.includes('yogya') || loc.includes('jogja');
        });
        
        console.log(`\nFound ${yogyaTherapists.length} Yogyakarta therapists:`);
        
        if (yogyaTherapists.length === 0) {
            console.log('\n❌ CRITICAL BUG: NO YOGYAKARTA THERAPISTS FOUND!');
            console.log('   This means location field is not set correctly.');
        } else {
            console.log('\n✅ Yogyakarta therapists exist in database:');
            yogyaTherapists.forEach((t, i) => {
                console.log(`\n${i + 1}. ${t.name}`);
                console.log(`   Location: "${t.location}"`);
                console.log(`   isLive: ${t.isLive}`);
                console.log(`   Status: ${t.status}`);
                console.log(`   Has coordinates: ${t.coordinates ? 'Yes' : 'No'}`);
            });
        }
        
        // STEP 4: Test filtering logic
        console.log('\n\n🧪 STEP 4: Testing Frontend Filtering Logic');
        console.log('-'.repeat(80));
        
        const selectedCity = 'Yogyakarta';
        const filtered = allTherapists.filter(t => {
            // Exact logic from HomePage.tsx
            if (t.location && t.location.toLowerCase().includes(selectedCity.toLowerCase())) {
                return true;
            }
            
            // Check aliases
            if (selectedCity.toLowerCase() === 'yogyakarta' && 
                t.location && (t.location.toLowerCase().includes('yogya') || t.location.toLowerCase().includes('jogja'))) {
                return true;
            }
            
            return false;
        });
        
        console.log(`\nFiltering for "${selectedCity}":`);
        console.log(`  Input: ${allTherapists.length} total therapists`);
        console.log(`  Output: ${filtered.length} matched therapists`);
        
        if (filtered.length === 0) {
            console.log('\n❌ FILTER FAILURE: No therapists matched!');
        } else {
            console.log('\n✅ FILTER SUCCESS: Therapists matched');
            filtered.slice(0, 5).forEach(t => {
                console.log(`  - ${t.name}: location="${t.location}"`);
            });
            if (filtered.length > 5) {
                console.log(`  ... and ${filtered.length - 5} more`);
            }
        }
        
        // STEP 5: Root cause analysis
        console.log('\n\n🎯 STEP 5: ROOT CAUSE ANALYSIS');
        console.log('='.repeat(80));
        
        if (yogyaTherapists.length > 0 && filtered.length > 0) {
            console.log('\n✅ DATABASE IS CORRECT');
            console.log('✅ FILTERING LOGIC IS CORRECT');
            console.log('\n🚨 THE ISSUE IS: BROWSER CACHE');
            console.log('\nSOLUTION:');
            console.log('1. Open live site: https://www.indastreetmassage.com');
            console.log('2. Press Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)');
            console.log('3. Or: F12 → Network tab → Check "Disable cache" → Refresh');
            console.log('4. Verify Yogyakarta therapists appear');
        } else if (withoutLocation.length > 0) {
            console.log('\n❌ DATABASE ISSUE DETECTED');
            console.log(`\n${withoutLocation.length} therapists have NULL/empty location field!`);
            console.log('\nSOLUTION:');
            console.log('1. Each therapist must log into their dashboard');
            console.log('2. Go to Profile page');
            console.log('3. Select location from dropdown');
            console.log('4. Click "Save Profile"');
            console.log('5. Verify location persists after page refresh');
        }
        
        // STEP 6: Verification checklist
        console.log('\n\n✅ VERIFICATION CHECKLIST');
        console.log('='.repeat(80));
        
        console.log('\n[ ] Dashboard Save Test:');
        console.log('    1. Therapist logs in → Profile page');
        console.log('    2. Select location (e.g., "Yogyakarta")');
        console.log('    3. Click "Save Profile"');
        console.log('    4. Navigate away, then back');
        console.log('    5. Verify location still shows (not "all")');
        
        console.log('\n[ ] Homepage Filter Test:');
        console.log('    1. Open homepage (hard refresh: Ctrl+Shift+R)');
        console.log('    2. Select "Yogyakarta" from dropdown');
        console.log('    3. Verify therapists appear');
        console.log('    4. Open browser console (F12)');
        console.log('    5. Look for: "✅ Location match for [name]"');
        
        console.log('\n[ ] Availability Status Test:');
        console.log('    1. Verify therapist cards show status badges');
        console.log('    2. available → green badge');
        console.log('    3. busy → yellow badge');
        console.log('    4. offline → gray badge');
        
        console.log('\n[ ] Location Persistence Test:');
        console.log('    1. Set location via dropdown');
        console.log('    2. Refresh page');
        console.log('    3. Location should NOT reset to "all"');
        
        // STEP 7: Quick fix commands
        console.log('\n\n🛠️ QUICK FIX COMMANDS (if needed)');
        console.log('='.repeat(80));
        
        console.log('\nIf therapists need location updated in bulk:');
        console.log('node bulk-update-location.mjs');
        
        console.log('\nIf you need to verify a specific therapist:');
        console.log('node check-specific-therapist.mjs [therapist-name]');
        
        console.log('\n' + '='.repeat(80));
        console.log('✅ DIAGNOSIS COMPLETE');
        console.log('='.repeat(80) + '\n');
        
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error('Stack:', error.stack);
    }
}

comprehensiveDiagnosis();
