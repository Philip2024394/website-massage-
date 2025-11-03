// Quick diagnostic script - Run this in browser console
// Go to http://localhost:3001 and paste this in console:

async function diagnoseLandingPageTranslations() {
    console.log('🔍 Diagnosing Landing Page Translation Issue...');
    
    try {
        // Import the translation service
        const { translationsService } = await import('/lib/appwriteService.js');
        
        // Get all translations from Appwrite
        console.log('📡 Fetching translations from Appwrite...');
        const translations = await translationsService.getAll();
        
        if (!translations) {
            console.log('❌ No translations found in Appwrite');
            return;
        }
        
        console.log('📊 Available languages in Appwrite:', Object.keys(translations));
        
        // Check Chinese specifically
        if (translations.zh) {
            console.log('🇨🇳 Chinese translations found!');
            console.log('Chinese keys count:', Object.keys(translations.zh).length);
            
            // Check for landing page translations
            const landingKeys = Object.keys(translations.zh).filter(key => key.startsWith('landing.'));
            console.log('🏠 Landing page keys in Chinese:', landingKeys);
            
            if (landingKeys.length > 0) {
                console.log('✅ Chinese landing translations exist:');
                landingKeys.forEach(key => {
                    console.log(`  ${key}: "${translations.zh[key]}"`);
                });
            } else {
                console.log('❌ No landing page translations in Chinese found');
                console.log('📝 Available Chinese keys:', Object.keys(translations.zh).slice(0, 10));
            }
        } else {
            console.log('❌ No Chinese translations found in Appwrite');
            console.log('Available languages:', Object.keys(translations));
        }
        
        // Check English for comparison
        if (translations.en && translations.en.landing) {
            console.log('🇺🇸 English landing translations (for comparison):');
            console.log(translations.en.landing);
        }
        
        return translations;
        
    } catch (error) {
        console.error('❌ Error diagnosing translations:', error);
    }
}

// Auto-run the diagnostic
diagnoseLandingPageTranslations();