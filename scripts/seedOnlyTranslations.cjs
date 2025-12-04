const { Client, Databases, Query } = require('node-appwrite');

// Initialize Appwrite
const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const DATABASE_ID = '68f76ee1000e64ca8d05';
const TRANSLATIONS_COLLECTION_ID = '68fcc065001120901028';

// New translations to add
const newTranslations = {
    'en': {
        'home.therapistCard.schedule': 'Schedule'
    },
    'id': {
        'home.therapistCard.schedule': 'Jadwal'
    }
};

async function seedNewTranslations() {
    console.log('🌱 Seeding new translations...');
    
    for (const [lang, translations] of Object.entries(newTranslations)) {
        console.log(`\n🌐 Processing ${lang.toUpperCase()} translations...`);
        
        for (const [key, value] of Object.entries(translations)) {
            try {
                // Check if translation already exists
                const existing = await databases.listDocuments(DATABASE_ID, TRANSLATIONS_COLLECTION_ID, [
                    Query.equal('language', lang),
                    Query.equal('key', key)
                ]);
                
                if (existing.documents.length > 0) {
                    console.log(`  ⏭️  Skipping existing: ${key}`);
                    continue;
                }
                
                // Create new translation
                await databases.createDocument(DATABASE_ID, TRANSLATIONS_COLLECTION_ID, 'unique()', {
                    language: lang,
                    key: key,
                    value: value
                });
                
                console.log(`  ✅ Created: ${key} = "${value}"`);
                
            } catch (error) {
                console.error(`  ❌ Failed to create ${key}:`, error.message);
            }
        }
    }
    
    console.log('\n✅ New translations seeded successfully!');
}

async function main() {
    try {
        if (!process.env.APPWRITE_API_KEY) {
            console.log('❌ APPWRITE_API_KEY environment variable is required');
            process.exit(1);
        }
        
        await seedNewTranslations();
        
    } catch (error) {
        console.error('\n❌ Seeding failed:', error);
        process.exit(1);
    }
}

main();