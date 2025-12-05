// Add Company Profile Contact translations to Appwrite using the existing translationsService
const { translationsService } = require('../lib/appwriteService');

async function addContactTranslationsToAppwrite() {
  console.log('🔄 Adding Company Profile Contact translations to Appwrite...');
  
  const contactTranslations = [
    {
      language: 'en',
      key: 'companyProfile.contact.title',
      value: 'Get in Touch'
    },
    {
      language: 'id', 
      key: 'companyProfile.contact.title',
      value: 'Hubungi Kami'
    },
    {
      language: 'en',
      key: 'companyProfile.contact.description',
      value: 'We would love to hear from you and discuss your marketing promotional ideas and our team will always provide the best knowledge for your business needs.'
    },
    {
      language: 'id',
      key: 'companyProfile.contact.description', 
      value: 'Kami ingin mendengar dari Anda dan mendiskusikan ide-ide promosi pemasaran Anda. Tim kami akan selalu memberikan pengetahuan terbaik untuk kebutuhan bisnis Anda.'
    }
  ];
  
  let successCount = 0;
  
  for (const translation of contactTranslations) {
    try {
      console.log(`🔄 Adding: ${translation.language}.${translation.key}`);
      await translationsService.set(translation.language, translation.key, translation.value);
      console.log(`✅ Success: ${translation.language}.${translation.key}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error adding ${translation.language}.${translation.key}:`, error.message);
    }
  }
  
  console.log(`🎉 Successfully added ${successCount}/${contactTranslations.length} contact translations to Appwrite`);
  console.log('💡 Translations will be available after cache refresh (1 hour) or app restart');
}

// Run the function
addContactTranslationsToAppwrite().catch(console.error);