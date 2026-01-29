// List all Appwrite collections
import { Client, Databases } from 'appwrite';

const client = new Client()
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('68f23b11000d25eb3664')
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

databases.listCollections('68f76ee1000e64ca8d05')
  .then(response => {
    console.log('\n📚 All Collections in Database:\n');
    response.collections.forEach(col => {
      console.log(`  - ${col.name} (ID: ${col.$id})`);
    });
    console.log('\n');
  })
  .catch(error => {
    console.error('❌ Error:', error.message);
  });
