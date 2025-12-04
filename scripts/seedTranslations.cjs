/**
 * Seed Translations to Appwrite
 * 
 * This script uploads all translations from the local translations folder to Appwrite.
 * This ensures the language switcher works properly by storing all translations in the database.
 * 
 * Run: node scripts/seedTranslations.cjs
 */

const sdk = require('node-appwrite');
const { translations } = require('../translations/index.ts');

// Initialize Appwrite client
const client = new sdk.Client();
const databases = new sdk.Databases(client);

// Appwrite configuration
const APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '67ad11370013cea5c66b';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = '67ad12f5003ce2f7bcc2';
const TRANSLATIONS_COLLECTION_ID = 'translations';

// Configure client
client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

async function createTranslationsCollection() {
    try {
        console.log('📦 Creating translations collection...');
        
        const collection = await databases.createCollection(
            DATABASE_ID,
            TRANSLATIONS_COLLECTION_ID,
            'Translations',
            [
                sdk.Permission.read(sdk.Role.any()),
                sdk.Permission.write(sdk.Role.team('admin')),
            ]
        );
        
        console.log('✅ Collection created successfully');
        return collection;
    } catch (error) {
        if (error.code === 409) {
            console.log('ℹ️  Collection already exists, skipping creation');
            return null;
        }
        throw error;
    }
}

async function createAttributes() {
    try {
        console.log('📋 Creating collection attributes...');
        
        // language - 'en' or 'id'
        await databases.createStringAttribute(
            DATABASE_ID,
            TRANSLATIONS_COLLECTION_ID,
            'language',
            10,
            true, // required
            undefined,
            false
        );
        console.log('✅ Created language attribute');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // key - translation key (e.g., 'home.therapistsTitle')
        await databases.createStringAttribute(
            DATABASE_ID,
            TRANSLATIONS_COLLECTION_ID,
            'key',
            500,
            true, // required
            undefined,
            false
        );
        console.log('✅ Created key attribute');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // value - translation value
        await databases.createStringAttribute(
            DATABASE_ID,
            TRANSLATIONS_COLLECTION_ID,
            'value',
            10000,
            true, // required
            undefined,
            false
        );
        console.log('✅ Created value attribute');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // section - top-level section (e.g., 'home', 'dashboard')
        await databases.createStringAttribute(
            DATABASE_ID,
            TRANSLATIONS_COLLECTION_ID,
            'section',
            100,
            false, // not required
            undefined,
            false
        );
        console.log('✅ Created section attribute');
        
        // Wait for attributes to be available
        console.log('⏳ Waiting for attributes to be fully available...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Create index on language + key (unique combination)
        await databases.createIndex(
            DATABASE_ID,
            TRANSLATIONS_COLLECTION_ID,
            'language_key_unique',
            'unique',
            ['language', 'key']
        );
        console.log('✅ Created unique index on language+key');
        
    } catch (error) {
        if (error.code === 409) {
            console.log('ℹ️  Attributes already exist, skipping creation');
        } else {
            throw error;
        }
    }
}

function flattenTranslations(obj, prefix = '', section = '') {
    let result = [];
    
    for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];
        
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            // Nested object - recurse
            const currentSection = section || key;
            result = result.concat(flattenTranslations(value, fullKey, currentSection));
        } else {
            // Leaf value - add to result
            result.push({
                key: fullKey,
                value: typeof value === 'string' ? value : JSON.stringify(value),
                section: section
            });
        }
    }
    
    return result;
}

async function seedTranslations() {
    try {
        console.log('🌱 Seeding translations...');
        console.log(`📦 Total languages: ${Object.keys(translations).length}`);
        
        let totalCreated = 0;
        let totalSkipped = 0;
        let totalErrors = 0;
        
        for (const lang of ['en', 'id']) {
            console.log(`\n🌐 Processing ${lang.toUpperCase()} translations...`);
            
            const langTranslations = translations[lang];
            const flattenedTranslations = flattenTranslations(langTranslations);
            
            console.log(`  📝 Total keys: ${flattenedTranslations.length}`);
            
            for (const translation of flattenedTranslations) {
                try {
                    await databases.createDocument(
                        DATABASE_ID,
                        TRANSLATIONS_COLLECTION_ID,
                        sdk.ID.unique(),
                        {
                            language: lang,
                            key: translation.key,
                            value: translation.value,
                            section: translation.section
                        }
                    );
                    totalCreated++;
                    
                    if (totalCreated % 50 === 0) {
                        console.log(`  ⏳ Progress: ${totalCreated} translations created...`);
                    }
                } catch (error) {
                    if (error.code === 409) {
                        totalSkipped++;
                    } else {
                        totalErrors++;
                        console.error(`  ❌ Error creating ${lang}.${translation.key}:`, error.message);
                    }
                }
            }
            
            console.log(`  ✅ ${lang.toUpperCase()} complete!`);
        }
        
        console.log('\n📊 Summary:');
        console.log(`  ✅ Created: ${totalCreated}`);
        console.log(`  ⏭️  Skipped (existing): ${totalSkipped}`);
        console.log(`  ❌ Errors: ${totalErrors}`);
        console.log('\n✅ Translation seeding complete!');
        
    } catch (error) {
        console.error('❌ Error seeding translations:', error);
        throw error;
    }
}

async function main() {
    try {
        console.log('🚀 Starting Translation Seeding Process...\n');
        
        if (!APPWRITE_API_KEY) {
            console.error('❌ APPWRITE_API_KEY environment variable is required');
            console.log('\nPlease set your API key:');
            console.log('  Windows: $env:APPWRITE_API_KEY="your-api-key"');
            console.log('  Linux/Mac: export APPWRITE_API_KEY="your-api-key"');
            console.log('\nGet your API key from: https://cloud.appwrite.io/console/project-67ad11370013cea5c66b/settings');
            process.exit(1);
        }
        
        // Step 1: Create collection
        await createTranslationsCollection();
        
        // Step 2: Create attributes
        await createAttributes();
        
        // Step 3: Seed translations
        await seedTranslations();
        
        console.log('\n✅ Translation Seeding Complete!');
        console.log('\n📝 Next Steps:');
        console.log('1. Verify translations in Appwrite console');
        console.log('2. Test language switcher in your app');
        console.log('3. Default language: Indonesian (id)');
        console.log('4. Switch to English via header language selector');
        console.log('\n💡 To update translations: Edit files in /translations folder and re-run this script');
        console.log('💡 Existing translations will be skipped (not duplicated)');
        
    } catch (error) {
        console.error('\n❌ Setup failed:', error);
        process.exit(1);
    }
}

main();
