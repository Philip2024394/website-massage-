// Script to sync local translations to Appwrite
// Run this once to upload all translations to Appwrite database

import { translationsService } from '../lib/appwriteService';
import { translations } from '../translations/index';

async function syncTranslations() {
    console.log('🚀 Starting translation sync to Appwrite...');
    console.log('📦 Total languages:', Object.keys(translations).length);
    
    const enKeys = Object.keys(translations.en || {});
    const idKeys = Object.keys(translations.id || {});
    console.log('📝 English translations:', enKeys.length);
    console.log('📝 Indonesian translations:', idKeys.length);
    console.log('');
    console.log('⏳ This may take a few minutes...');
    console.log('');
    
    try {
        await translationsService.syncFromLocal(translations);
        console.log('');
        console.log('✅ All translations synced successfully!');
        console.log('🎉 You can now update translations in Appwrite console');
    } catch (error) {
        console.log('');
        console.error('❌ Error syncing translations:', error);
        console.log('💡 Make sure you have proper permissions in Appwrite');
    }
}

// Run the sync
syncTranslations();
