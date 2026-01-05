// Upload home page translations to Appwrite
const { Client, Databases, ID } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey(process.env.APPWRITE_API_KEY || ''); // You'll need to set this

const databases = new Databases(client);
const databaseId = '68f76ee1000e64ca8d05';
const translationsCollectionId = 'translations'; // Update if different

async function uploadTranslation(language, key, value) {
    try {
        const documentId = `${language}_${key}`.replace(/\./g, '_');
        
        // Try to update first
        try {
            await databases.updateDocument(
                databaseId,
                translationsCollectionId,
                documentId,
                { language, key, value }
            );
            console.log(`✅ Updated: ${language}.${key}`);
        } catch (updateError) {
            // If update fails, create new document
            await databases.createDocument(
                databaseId,
                translationsCollectionId,
                documentId,
                { language, key, value }
            );
            console.log(`✅ Created: ${language}.${key}`);
        }
    } catch (error) {
        console.error(`❌ Error for ${language}.${key}:`, error.message);
    }
}

async function uploadHomeTranslations() {
    console.log('🚀 Uploading home page translations to Appwrite...\n');
    
    const translations = [
        // Indonesian
        { lang: 'id', key: 'home.therapistsTitle', value: 'Terapis Pijat Rumahan' },
        { lang: 'id', key: 'home.therapistsSubtitleAll', value: 'Temukan terapis terbaik di seluruh Indonesia' },
        { lang: 'id', key: 'home.therapistsSubtitleCity', value: 'Temukan terapis terbaik di {city}' },
        { lang: 'id', key: 'home.browseRegionNote', value: 'Jelajahi wilayah (jarak tetap berlaku)' },
        { lang: 'id', key: 'home.viewProfile', value: 'Lihat Profil' },
        { lang: 'id', key: 'home.viewOnly', value: 'Lihat Saja' },
        
        // English
        { lang: 'en', key: 'home.therapistsTitle', value: 'Home Service Therapists' },
        { lang: 'en', key: 'home.therapistsSubtitleAll', value: 'Find the best therapists across Indonesia' },
        { lang: 'en', key: 'home.therapistsSubtitleCity', value: 'Find the best therapists in {city}' },
        { lang: 'en', key: 'home.browseRegionNote', value: 'Browse Region dropdown (distance still applies)' },
        { lang: 'en', key: 'home.viewProfile', value: 'View Profile' },
        { lang: 'en', key: 'home.viewOnly', value: 'View Only' },
    ];
    
    for (const t of translations) {
        await uploadTranslation(t.lang, t.key, t.value);
    }
    
    console.log('\n✅ Upload complete!');
}

uploadHomeTranslations().catch(console.error);
