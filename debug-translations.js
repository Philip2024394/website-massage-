// Debug function to check Appwrite translations
// Paste this in browser console and run: checkAppwriteTranslations()

async function checkAppwriteTranslations() {
    try {
        console.log('🔍 Checking Appwrite translations...');
        
        // Import the translation service
        const { translationsService } = await import('./lib/appwriteService.js');
        
        // Get all translations
        const translations = await translationsService.getAll();
        
        console.log('📊 Translation Summary:');
        console.log('Available languages:', Object.keys(translations));
        
        // Check each language
        Object.keys(translations).forEach(lang => {
            const langData = translations[lang];
            const keyCount = Object.keys(langData).length;
            console.log(`  ${lang}: ${keyCount} translation keys`);
            
            // Check if landing translations exist
            if (langData.landing) {
                console.log(`    - Landing page translations: ✅`);
                console.log(`    - Landing keys:`, Object.keys(langData.landing));
            } else {
                console.log(`    - Landing page translations: ❌`);
            }
        });
        
        // Test Chinese specifically
        if (translations.zh) {
            console.log('🇨🇳 Chinese translations:');
            console.log('  Keys:', Object.keys(translations.zh));
            if (translations.zh.landing) {
                console.log('  Landing:', translations.zh.landing);
            }
        } else {
            console.log('❌ No Chinese translations found');
        }
        
        return translations;
    } catch (error) {
        console.error('❌ Error checking translations:', error);
    }
}

console.log('📋 Debug function ready! Run: checkAppwriteTranslations()');