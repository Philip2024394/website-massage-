/**
 * Sync Place Detail Page Translations to Appwrite
 * Run: node scripts/syncPlaceDetailTranslations.cjs
 */

const { Client, Databases, ID, Query } = require('node-appwrite');
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT || 'https://syd.cloud.appwrite.io/v1')
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID || '68f23b11000d25eb3664')
    .setKey(process.env.APPWRITE_API_KEY || 'standard_119fa2568669a282b6165b25f53fb8b18991ba76d2e13efa3af9e73d9db214f592521f7f9800264f04e28daec46d21ee23c93ad8e7166002253ee3dd014e835b875db7ba47ab451fd1c7bff78f9f053c3cf6056a107fe51f6df5c479b2f100f56aaf90d6506ee31e5b68f9d1afcd0fe54abf30d8be6a799194487e15c38f9212');

const databases = new Databases(client);
const DATABASE_ID = process.env.VITE_APPWRITE_DATABASE_ID || '68f76ee1000e64ca8d05';
const TRANSLATIONS_COLLECTION_ID = process.env.VITE_APPWRITE_TRANSLATIONS_COLLECTION_ID || '68fcc065001120901028';

// Place/Clinic detail page translations
const translations = [
    // English (en)
    { language: 'en', key: 'detail.pricingTitle', value: 'Pricing' },
    { language: 'en', key: 'detail.contactButton', value: 'Order Now' },
    { language: 'en', key: 'detail.bookButton', value: 'Schedule' },
    { language: 'en', key: 'detail.backButton', value: 'Back' },
    { language: 'en', key: 'detail.shareButton', value: 'Share' },
    { language: 'en', key: 'detail.open', value: 'Open' },
    { language: 'en', key: 'detail.closed', value: 'Closed' },
    { language: 'en', key: 'detail.todaysHours', value: "Today's Hours" },
    { language: 'en', key: 'detail.servicesOffered', value: 'Services Offered' },
    { language: 'en', key: 'detail.about', value: 'About' },
    { language: 'en', key: 'detail.location', value: 'Location' },
    { language: 'en', key: 'detail.contactInfo', value: 'Contact Information' },
    { language: 'en', key: 'detail.whatsappContact', value: 'Contact via WhatsApp' },
    { language: 'en', key: 'detail.bookNow', value: 'Book Now' },
    { language: 'en', key: 'detail.reviews', value: 'Reviews' },
    { language: 'en', key: 'detail.rating', value: 'Rating' },
    { language: 'en', key: 'detail.writeReview', value: 'Write a Review' },
    { language: 'en', key: 'detail.minuteShort', value: 'min' },
    { language: 'en', key: 'detail.discount', value: 'Discount' },
    { language: 'en', key: 'detail.originalPrice', value: 'Original Price' },
    { language: 'en', key: 'detail.discountedPrice', value: 'Discounted Price' },
    { language: 'en', key: 'detail.linkCopied', value: 'Link copied to clipboard' },
    { language: 'en', key: 'detail.shareTitle', value: '{name} – IndaStreet Massage Place' },
    { language: 'en', key: 'detail.shareText', value: 'Check out {name} on IndaStreet' },

    // Indonesian (id)
    { language: 'id', key: 'detail.pricingTitle', value: 'Harga' },
    { language: 'id', key: 'detail.contactButton', value: 'Pesan Sekarang' },
    { language: 'id', key: 'detail.bookButton', value: 'Jadwalkan' },
    { language: 'id', key: 'detail.backButton', value: 'Kembali' },
    { language: 'id', key: 'detail.shareButton', value: 'Bagikan' },
    { language: 'id', key: 'detail.open', value: 'Buka' },
    { language: 'id', key: 'detail.closed', value: 'Tutup' },
    { language: 'id', key: 'detail.todaysHours', value: 'Jam Buka Hari Ini' },
    { language: 'id', key: 'detail.servicesOffered', value: 'Layanan yang Ditawarkan' },
    { language: 'id', key: 'detail.about', value: 'Tentang' },
    { language: 'id', key: 'detail.location', value: 'Lokasi' },
    { language: 'id', key: 'detail.contactInfo', value: 'Informasi Kontak' },
    { language: 'id', key: 'detail.whatsappContact', value: 'Hubungi via WhatsApp' },
    { language: 'id', key: 'detail.bookNow', value: 'Pesan Sekarang' },
    { language: 'id', key: 'detail.reviews', value: 'Ulasan' },
    { language: 'id', key: 'detail.rating', value: 'Rating' },
    { language: 'id', key: 'detail.writeReview', value: 'Tulis Ulasan' },
    { language: 'id', key: 'detail.minuteShort', value: 'mnt' },
    { language: 'id', key: 'detail.discount', value: 'Diskon' },
    { language: 'id', key: 'detail.originalPrice', value: 'Harga Asli' },
    { language: 'id', key: 'detail.discountedPrice', value: 'Harga Diskon' },
    { language: 'id', key: 'detail.linkCopied', value: 'Link disalin ke clipboard' },
    { language: 'id', key: 'detail.shareTitle', value: '{name} – Tempat Pijat IndaStreet' },
    { language: 'id', key: 'detail.shareText', value: 'Lihat {name} di IndaStreet' },
];

async function syncTranslation(translation) {
    try {
        // Check if translation already exists
        const existing = await databases.listDocuments(
            DATABASE_ID,
            TRANSLATIONS_COLLECTION_ID,
            [
                Query.equal('language', translation.language),
                Query.equal('key', translation.key)
            ]
        );

        if (existing.documents.length > 0) {
            // Update existing translation
            await databases.updateDocument(
                DATABASE_ID,
                TRANSLATIONS_COLLECTION_ID,
                existing.documents[0].$id,
                {
                    value: translation.value,
                    lastUpdated: new Date().toISOString()
                }
            );
            console.log(`✅ Updated: ${translation.language}.${translation.key}`);
        } else {
            // Create new translation
            await databases.createDocument(
                DATABASE_ID,
                TRANSLATIONS_COLLECTION_ID,
                ID.unique(),
                {
                    language: translation.language,
                    key: translation.key,
                    value: translation.value,
                    lastUpdated: new Date().toISOString()
                }
            );
            console.log(`✅ Created: ${translation.language}.${translation.key}`);
        }
    } catch (error) {
        console.error(`❌ Error syncing ${translation.language}.${translation.key}:`, error.message);
    }
}

async function main() {
    console.log('🚀 Starting Place Detail translations sync to Appwrite...\n');

    let successCount = 0;
    let failCount = 0;

    for (const translation of translations) {
        try {
            await syncTranslation(translation);
            successCount++;
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
            failCount++;
            console.error(`Failed to sync: ${translation.language}.${translation.key}`);
        }
    }

    console.log('\n📊 Sync Summary:');
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   📝 Total: ${translations.length}`);
    console.log('\n✨ Place Detail translations sync completed!');
}

main().catch(console.error);
