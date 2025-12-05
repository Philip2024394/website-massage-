const { Client, Databases, ID } = require('node-appwrite');

// Appwrite configuration
const client = new Client();
const databases = new Databases(client);

client
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('68f23b11000d25eb3664')
  .setKey('standard_d876b6cc715e982d7a41e6b5b2b886af66b1843b4b19b0075f8529b0a0fb531a0fc0671256bd9838a6b0c9c8b2e03367b1b228455dc0d54ccf5dddc38b29a8e610b6c9bda96a777ade23d4caab6e1496901fb98b5c9cac1f7c6e377c87b0e2324157d83fdf2e8ef2e6fa2fe0527f85b33c5286754f8ddf027e93e6206fe3595');

const DATABASE_ID = '68f23b11000d25eb3664';

async function addCompanyProfileContactTranslations() {
  try {
    console.log('🔍 Adding Company Profile Contact translations to Appwrite...');
    
    // Get the existing translations collection ID from config
    const TRANSLATIONS_COLLECTION_ID = '675092f60030f16044c6'; // This should be the translations collection ID
    
    const contactTranslations = [
      {
        language: 'en',
        Key: 'companyProfile.contact.title',
        value: 'Get in Touch',
        lastUpdated: new Date().toISOString(),
        autoTranslated: false
      },
      {
        language: 'id', 
        Key: 'companyProfile.contact.title',
        value: 'Hubungi Kami',
        lastUpdated: new Date().toISOString(),
        autoTranslated: false
      },
      {
        language: 'en',
        Key: 'companyProfile.contact.description',
        value: 'We would love to hear from you and discuss your marketing promotional ideas and our team will always provide the best knowledge for your business needs.',
        lastUpdated: new Date().toISOString(),
        autoTranslated: false
      },
      {
        language: 'id',
        Key: 'companyProfile.contact.description', 
        value: 'Kami ingin mendengar dari Anda dan mendiskusikan ide-ide promosi pemasaran Anda. Tim kami akan selalu memberikan pengetahuan terbaik untuk kebutuhan bisnis Anda.',
        lastUpdated: new Date().toISOString(),
        autoTranslated: false
      }
    ];
    
    let successCount = 0;
    
    for (const translation of contactTranslations) {
      try {
        // Create the translation document with proper schema format
        const docData = {
          language: translation.language,
          Key: translation.Key,
          value: translation.value,
          lastUpdated: translation.lastUpdated,
          autoTranslated: translation.autoTranslated,
          // Set the required language columns based on the language
          en: translation.language === 'en' ? translation.value : '',
          id: translation.language === 'id' ? translation.value : ''
        };
        
        const result = await databases.createDocument(
          DATABASE_ID,
          TRANSLATIONS_COLLECTION_ID,
          ID.unique(),
          docData
        );
        
        console.log(`✅ Added translation: ${translation.language}.${translation.Key}`);
        successCount++;
        
      } catch (error) {
        console.error(`❌ Error adding ${translation.language}.${translation.Key}:`, error.message);
      }
    }
    
    console.log(`🎉 Successfully added ${successCount}/${contactTranslations.length} contact translations`);
    
  } catch (error) {
    console.error('❌ Error adding contact translations:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
  }
}

addCompanyProfileContactTranslations();