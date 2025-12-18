/**
 * Sync FAQ Page Translations to Appwrite
 * Run: node scripts/syncFAQTranslations.cjs
 */

const { Client, Databases, ID, Query } = require('node-appwrite');
require('dotenv').config();

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_119fa2568669a282b6165b25f53fb8b18991ba76d2e13efa3af9e73d9db214f592521f7f9800264f04e28daec46d21ee23c93ad8e7166002253ee3dd014e835b875db7ba47ab451fd1c7bff78f9f053c3cf6056a107fe51f6df5c479b2f100f56aaf90d6506ee31e5b68f9d1afcd0fe54abf30d8be6a799194487e15c38f9212');

const databases = new Databases(client);
const DATABASE_ID = '68f76ee1000e64ca8d05';
const TRANSLATIONS_COLLECTION_ID = '68fcc065001120901028';

// FAQ page translations
const translations = [
    // English (en)
    { language: 'en', key: 'faq.title', value: 'Frequently Asked Questions' },
    { language: 'en', key: 'faq.subtitle', value: 'Everything you need to know about using IndaStreet' },
    { language: 'en', key: 'faq.stillHaveQuestions', value: 'Still Have Questions?' },
    { language: 'en', key: 'faq.contactSupport', value: 'Our support team is here to help you succeed on IndaStreet' },
    { language: 'en', key: 'faq.contactSupportButton', value: 'Contact Support' },
    { language: 'en', key: 'faq.whatsappButton', value: 'WhatsApp Us' },
    { language: 'en', key: 'faq.categories.booking', value: 'Bookings' },
    { language: 'en', key: 'faq.categories.therapist', value: 'For Therapists' },
    { language: 'en', key: 'faq.categories.hotel', value: 'For Hotels' },
    { language: 'en', key: 'faq.categories.employer', value: 'For Employers' },
    { language: 'en', key: 'faq.categories.agent', value: 'For Agents' },
    { language: 'en', key: 'faq.categories.payment', value: 'Payments' },
    { language: 'en', key: 'faq.categories.technical', value: 'Technical' },

    // Indonesian (id)
    { language: 'id', key: 'faq.title', value: 'Pertanyaan yang Sering Diajukan' },
    { language: 'id', key: 'faq.subtitle', value: 'Semua yang perlu Anda ketahui tentang menggunakan IndaStreet' },
    { language: 'id', key: 'faq.stillHaveQuestions', value: 'Masih Ada Pertanyaan?' },
    { language: 'id', key: 'faq.contactSupport', value: 'Tim dukungan kami siap membantu Anda sukses di IndaStreet' },
    { language: 'id', key: 'faq.contactSupportButton', value: 'Hubungi Dukungan' },
    { language: 'id', key: 'faq.whatsappButton', value: 'WhatsApp Kami' },
    { language: 'id', key: 'faq.categories.booking', value: 'Pemesanan' },
    { language: 'id', key: 'faq.categories.therapist', value: 'Untuk Terapis' },
    { language: 'id', key: 'faq.categories.hotel', value: 'Untuk Hotel' },
    { language: 'id', key: 'faq.categories.employer', value: 'Untuk Pemberi Kerja' },
    { language: 'id', key: 'faq.categories.agent', value: 'Untuk Agen' },
    { language: 'id', key: 'faq.categories.payment', value: 'Pembayaran' },
    { language: 'id', key: 'faq.categories.technical', value: 'Teknis' },
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
    console.log('🚀 Starting FAQ page translations sync to Appwrite...\n');

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
    console.log('\n✨ FAQ translations sync completed!');
}

main().catch(console.error);
