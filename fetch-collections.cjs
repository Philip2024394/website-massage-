const https = require('https');
const fs = require('fs');

const API_KEY = 'standard_1cea58a1e69f6ade2b3583f08ceb9409fb527ec6e38f3d04818d6cf1c1492082a3c153af8d386ddec1faea977502b614e896b69950aea277f592e6b93ffdfc2c3e39c649cc01c0e54af8c7e1b76c6d299921280366a5e78b6cf8cb1179a34fb208c295e0ff554f7739efd206dc958779d52a4ac5474d289b1c5fe53cf3f9b313';
const PROJECT = '68f23b11000d25eb3664';
const DATABASE = '68f76ee1000e64ca8d05';

async function fetchAllCollections() {
  const allCollections = [];
  let offset = 0;
  const limit = 25;
  
  while (true) {
    const data = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'syd.cloud.appwrite.io',
        path: `/v1/databases/${DATABASE}/collections?limit=${limit}&offset=${offset}`,
        headers: {
          'X-Appwrite-Project': PROJECT,
          'X-Appwrite-Key': API_KEY
        }
      };
      
      https.get(options, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
        res.on('error', reject);
      });
    });
    
    allCollections.push(...data.collections);
    console.log(`Fetched ${allCollections.length}/${data.total} collections...`);
    
    if (allCollections.length >= data.total) break;
    offset += limit;
  }
  
  return allCollections;
}

fetchAllCollections().then(collections => {
  // Generate backup JSON
  const backup = {
    generatedAt: new Date().toISOString(),
    database: {
      id: DATABASE,
      project: PROJECT,
      endpoint: 'https://syd.cloud.appwrite.io/v1'
    },
    totalCollections: collections.length,
    collections: collections.map(c => ({
      id: c.$id,
      name: c.name,
      isTextId: !/^[0-9a-f]{20,}$/.test(c.$id) // Check if ID is text-based (not alphanumeric hash)
    }))
  };
  
  // Save backup
  fs.writeFileSync('APPWRITE_COLLECTIONS_BACKUP.json', JSON.stringify(backup, null, 2));
  console.log('');
  console.log('✅ Backup saved to APPWRITE_COLLECTIONS_BACKUP.json');
  console.log('');
  
  // Print all collections
  console.log('=== ALL APPWRITE COLLECTIONS (76 total) ===');
  collections.forEach(c => {
    const isTextId = !/^[0-9a-f]{20,}$/.test(c.$id);
    console.log(`${isTextId ? '✅' : '⚠️'} ${c.$id}`);
  });
  
  // Find chat-related collections
  console.log('');
  console.log('=== CHAT-RELATED COLLECTIONS ===');
  const chatCollections = collections.filter(c => 
    c.$id.toLowerCase().includes('chat') || 
    c.$id.toLowerCase().includes('message') ||
    c.name.toLowerCase().includes('chat') ||
    c.name.toLowerCase().includes('message')
  );
  if (chatCollections.length === 0) {
    console.log('⚠️ NO CHAT COLLECTIONS FOUND - Need to create chat_rooms and chat_messages');
  } else {
    chatCollections.forEach(c => console.log(`  ${c.$id} | ${c.name}`));
  }
});
