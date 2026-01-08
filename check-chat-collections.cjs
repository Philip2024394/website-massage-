const https = require('https');
const API_KEY = 'standard_1cea58a1e69f6ade2b3583f08ceb9409fb527ec6e38f3d04818d6cf1c1492082a3c153af8d386ddec1faea977502b614e896b69950aea277f592e6b93ffdfc2c3e39c649cc01c0e54af8c7e1b76c6d299921280366a5e78b6cf8cb1179a34fb208c295e0ff554f7739efd206dc958779d52a4ac5474d289b1c5fe53cf3f9b313';

const collections = ['chat_rooms', 'chat_messages', 'admin_messages'];

collections.forEach(id => {
  https.get({
    hostname: 'syd.cloud.appwrite.io',
    path: `/v1/databases/68f76ee1000e64ca8d05/collections/${id}`,
    headers: {
      'X-Appwrite-Project': '68f23b11000d25eb3664',
      'X-Appwrite-Key': API_KEY
    }
  }, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
      if (res.statusCode === 200) {
        const data = JSON.parse(d);
        console.log(`✅ ${id} EXISTS`);
        console.log(`   Attributes: ${data.attributes?.length || 0}`);
      } else {
        console.log(`❌ ${id} NOT FOUND (${res.statusCode})`);
      }
    });
  });
});
