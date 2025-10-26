/**
 * UPDATE COLLECTION IDS - Run this script to get real collection IDs from Appwrite
 * 
 * This script will:
 * 1. Connect to your Appwrite project
 * 2. List all existing collections
 * 3. Find the collection IDs for: hotels, users, therapists, places, agents
 * 4. Update both config files automatically
 * 
 * Usage:
 *   node scripts/update-collection-ids.js YOUR_API_KEY
 */

import { Client, Databases } from 'node-appwrite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Appwrite Configuration
const ENDPOINT = 'https://syd.cloud.appwrite.io/v1';
const PROJECT_ID = '68f23b11000d25eb3664';
const DATABASE_ID = '68f76ee1000e64ca8d05';

async function updateCollectionIds() {
    // Get API key from command line
    const apiKey = process.argv[2];
    
    if (!apiKey) {
        console.error('❌ Error: API key required');
        console.log('\nUsage: node scripts/update-collection-ids.js YOUR_API_KEY');
        console.log('\nGet your API key from:');
        console.log('https://cloud.appwrite.io/console/project-' + PROJECT_ID + '/overview/keys');
        process.exit(1);
    }

    console.log('🔍 Connecting to Appwrite...\n');

    // Initialize Appwrite client
    const client = new Client();
    client
        .setEndpoint(ENDPOINT)
        .setProject(PROJECT_ID)
        .setKey(apiKey);

    const databases = new Databases(client);

    try {
        // List all collections
        console.log('📋 Fetching collections from database:', DATABASE_ID);
        const response = await databases.listCollections(DATABASE_ID);
        const collections = response.collections;

        console.log(`\n✅ Found ${collections.length} collections:\n`);

        // Display all collections
        collections.forEach((col, index) => {
            console.log(`${index + 1}. ${col.name} (ID: ${col.$id})`);
        });

        // Find specific collections we need
        const collectionMap = {};
        const requiredCollections = ['hotels', 'users', 'therapists', 'places', 'agents', 'villas', 'admins'];

        requiredCollections.forEach(name => {
            const found = collections.find(col => 
                col.name.toLowerCase() === name.toLowerCase() || 
                col.$id.toLowerCase().includes(name.toLowerCase())
            );
            if (found) {
                collectionMap[name] = found.$id;
            }
        });

        console.log('\n🎯 Mapped Collections:');
        Object.entries(collectionMap).forEach(([name, id]) => {
            console.log(`   ${name}: ${id}`);
        });

        // Check if we found the essential ones
        const essential = ['hotels', 'users', 'therapists', 'places', 'agents'];
        const missing = essential.filter(name => !collectionMap[name]);
        
        if (missing.length > 0) {
            console.log('\n⚠️  Warning: Missing collections:', missing.join(', '));
            console.log('These collections exist in your database but weren\'t auto-detected.');
            console.log('Please verify the collection names match exactly.\n');
        }

        // Update appwrite.config.ts
        console.log('\n📝 Updating lib/appwrite.config.ts...');
        const configPath = path.join(__dirname, '../lib/appwrite.config.ts');
        let configContent = fs.readFileSync(configPath, 'utf8');

        // Replace collection IDs
        if (collectionMap.therapists) {
            configContent = configContent.replace(
                /therapists:\s*'[^']*'/,
                `therapists: '${collectionMap.therapists}'`
            );
        }
        if (collectionMap.places) {
            configContent = configContent.replace(
                /places:\s*'[^']*'/,
                `places: '${collectionMap.places}'`
            );
        }
        if (collectionMap.agents) {
            configContent = configContent.replace(
                /agents:\s*'[^']*'/,
                `agents: '${collectionMap.agents}'`
            );
        }
        if (collectionMap.hotels) {
            configContent = configContent.replace(
                /hotels:\s*'[^']*'/,
                `hotels: '${collectionMap.hotels}'`
            );
        }
        if (collectionMap.users) {
            configContent = configContent.replace(
                /users:\s*'[^']*'/,
                `users: '${collectionMap.users}'`
            );
        }
        if (collectionMap.villas) {
            configContent = configContent.replace(
                /villas:\s*'[^']*'/,
                `villas: '${collectionMap.villas}'`
            );
        }
        if (collectionMap.admins) {
            configContent = configContent.replace(
                /admins:\s*'[^']*'/,
                `admins: '${collectionMap.admins}'`
            );
        }

        fs.writeFileSync(configPath, configContent);
        console.log('✅ Updated lib/appwrite.config.ts');

        // Update lib/appwrite.ts
        console.log('📝 Updating lib/appwrite.ts...');
        const appwritePath = path.join(__dirname, '../lib/appwrite.ts');
        let appwriteContent = fs.readFileSync(appwritePath, 'utf8');

        // Replace collection IDs in COLLECTIONS object
        if (collectionMap.therapists) {
            appwriteContent = appwriteContent.replace(
                /THERAPISTS:\s*'[^']*'/,
                `THERAPISTS: '${collectionMap.therapists}'`
            );
        }
        if (collectionMap.places) {
            appwriteContent = appwriteContent.replace(
                /PLACES:\s*'[^']*'/,
                `PLACES: '${collectionMap.places}'`
            );
        }
        if (collectionMap.agents) {
            appwriteContent = appwriteContent.replace(
                /AGENTS:\s*'[^']*'/,
                `AGENTS: '${collectionMap.agents}'`
            );
        }
        if (collectionMap.hotels) {
            appwriteContent = appwriteContent.replace(
                /HOTELS:\s*'[^']*'/,
                `HOTELS: '${collectionMap.hotels}'`
            );
        }
        if (collectionMap.users) {
            appwriteContent = appwriteContent.replace(
                /USERS:\s*'[^']*'/,
                `USERS: '${collectionMap.users}'`
            );
        }
        if (collectionMap.admins) {
            appwriteContent = appwriteContent.replace(
                /ADMINS:\s*'[^']*'/,
                `admins: '${collectionMap.admins}'`
            );
        }

        fs.writeFileSync(appwritePath, appwriteContent);
        console.log('✅ Updated lib/appwrite.ts');

        // Generate summary
        console.log('\n' + '='.repeat(60));
        console.log('✅ COLLECTION IDS UPDATED SUCCESSFULLY!');
        console.log('='.repeat(60));
        console.log('\n📊 Summary:');
        console.log(`   Database: ${DATABASE_ID}`);
        console.log(`   Collections Updated: ${Object.keys(collectionMap).length}`);
        console.log('\n🎯 Updated Collections:');
        Object.entries(collectionMap).forEach(([name, id]) => {
            console.log(`   ✓ ${name.padEnd(15)} → ${id}`);
        });

        console.log('\n🚀 Next Steps:');
        console.log('   1. Test login/signup on each portal');
        console.log('   2. Verify session persistence works');
        console.log('   3. Check all dashboards load correctly');
        console.log('\n✅ Your app is now ready for authentication!\n');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        
        if (error.message.includes('Invalid API key')) {
            console.log('\n💡 Tip: Make sure your API key has the following scopes:');
            console.log('   - databases.read');
            console.log('   - collections.read');
        }
        
        process.exit(1);
    }
}

updateCollectionIds();
