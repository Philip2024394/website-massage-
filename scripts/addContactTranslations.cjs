const { Client, Databases, ID } = require('node-appwrite');

// Appwrite configuration
const client = new Client();
const databases = new Databases(client);

client
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('68f23b11000d25eb3664')
  .setKey('standard_d876b6cc715e982d7a41e6b5b2b886af66b1843b4b19b0075f8529b0a0fb531a0fc0671256bd9838a6b0c9c8b2e03367b1b228455dc0d54ccf5dddc38b29a8e610b6c9bda96a777ade23d4caab6e1496901fb98b5c9cac1f7c6e377c87b0e2324157d83fdf2e8ef2e6fa2fe0527f85b33c5286754f8ddf027e93e6206fe3595');

const DATABASE_ID = '68f23b11000d25eb3664';

async function addContactTranslations() {
  try {
    console.log('🔍 Checking for translations collection...');
    
    // Try to list collections to see if translations exist
    const collections = await databases.listCollections(DATABASE_ID);
    console.log('📋 Available collections:', collections.collections.map(c => ({
      id: c.$id,
      name: c.name
    })));
    
    // Look for translations or similar collection
    const translationsCollection = collections.collections.find(c => 
      c.name.toLowerCase().includes('translation') || 
      c.name.toLowerCase().includes('language') ||
      c.$id.includes('translation')
    );
    
    if (translationsCollection) {
      console.log('✅ Found translations collection:', translationsCollection.name);
      
      // Add contact translations
      const contactTranslations = {
        section: 'companyProfile',
        key: 'contactSection',
        english: {
          title: 'Get in Touch',
          description: 'We would love to hear from you and discuss your marketing promotional ideas and our team will always provide the best knowledge for your business needs.'
        },
        indonesian: {
          title: 'Hubungi Kami',
          description: 'Kami ingin mendengar dari Anda dan mendiskusikan ide-ide promosi pemasaran Anda. Tim kami akan selalu memberikan pengetahuan terbaik untuk kebutuhan bisnis Anda.'
        }
      };
      
      const result = await databases.createDocument(
        DATABASE_ID,
        translationsCollection.$id,
        ID.unique(),
        contactTranslations
      );
      
      console.log('✅ Contact translations added successfully:', result.$id);
      
    } else {
      console.log('📝 No translations collection found. Creating translation data structure...');
      
      // Create a simple translations collection schema suggestion
      const translationSchema = {
        name: 'translations',
        attributes: [
          {
            key: 'section',
            type: 'string',
            size: 100,
            required: true
          },
          {
            key: 'key', 
            type: 'string',
            size: 100,
            required: true
          },
          {
            key: 'english',
            type: 'string',
            size: 10000,
            required: false
          },
          {
            key: 'indonesian',
            type: 'string', 
            size: 10000,
            required: false
          }
        ]
      };
      
      console.log('📋 Suggested translation collection schema:');
      console.log(JSON.stringify(translationSchema, null, 2));
      
      console.log('📝 Contact translation data to be added:');
      console.log(JSON.stringify({
        section: 'companyProfile',
        key: 'contactSection',
        english: JSON.stringify({
          title: 'Get in Touch',
          description: 'We would love to hear from you and discuss your marketing promotional ideas and our team will always provide the best knowledge for your business needs.'
        }),
        indonesian: JSON.stringify({
          title: 'Hubungi Kami', 
          description: 'Kami ingin mendengar dari Anda dan mendiskusikan ide-ide promosi pemasaran Anda. Tim kami akan selalu memberikan pengetahuan terbaik untuk kebutuhan bisnis Anda.'
        })
      }, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error checking translations:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
  }
}

addContactTranslations();