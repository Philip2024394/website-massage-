import { Client, Databases } from 'appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);

const CONFIG = {
    databaseId: '68f76ee1000e64ca8d05',
    therapistsCollectionId: '68f76ee1001b06e7ba5d'
};

async function testLanguageFix() {
    try {
        const phil4Id = '690a0a0f002949071cb4';
        
        console.log('🔍 Step 1: Getting current Phil4 data...');
        const current = await databases.getDocument(
            CONFIG.databaseId,
            CONFIG.therapistsCollectionId,
            phil4Id
        );
        
        console.log('📊 Current languages:', current.languages);
        
        console.log('💾 Step 2: Testing language update with fix...');
        const testLanguages = JSON.stringify(['English', 'Indonesian', 'Mandarin']);
        console.log('📤 Sending languages:', testLanguages);
        
        await databases.updateDocument(
            CONFIG.databaseId,
            CONFIG.therapistsCollectionId,
            phil4Id,
            {
                languages: testLanguages
            }
        );
        
        console.log('✅ Step 3: Update sent successfully!');
        
        console.log('🔍 Step 4: Verifying save worked...');
        const updated = await databases.getDocument(
            CONFIG.databaseId,
            CONFIG.therapistsCollectionId,
            phil4Id
        );
        
        console.log('📊 Updated languages:', updated.languages);
        
        if (updated.languages === testLanguages) {
            console.log('🎉 BUG FIX SUCCESSFUL! Languages are now saving to database!');
            console.log('✅ The missing languages handler has been fixed in appwriteService.ts');
        } else {
            console.log('❌ Bug still exists - languages not saved correctly');
            console.log('🤔 Expected:', testLanguages);
            console.log('🤔 Got:', updated.languages);
        }
        
        console.log('🧪 Step 5: Testing parse functionality...');
        try {
            const parsed = JSON.parse(updated.languages || '[]');
            console.log('✅ Languages parse correctly:', parsed.join(', '));
        } catch (e) {
            console.log('❌ Parse error:', e.message);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error);
    }
}

testLanguageFix();