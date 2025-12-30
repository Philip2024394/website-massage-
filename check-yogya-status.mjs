import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_1cea58a1e69f6ade2b3583f08ceb9409fb527ec6e38f3d04818d6cf1c1492082a3c153af8d386ddec1faea977502b614e896b69950aea277f592e6b93ffdfc2c3e39c649cc01c0e54af8c7e1b76c6d299921280366a5e78b6cf8cb1179a34fb208c295e0ff554f7739efd206dc958779d52a4ac5474d289b1c5fe53cf3f9b313');

const databases = new Databases(client);

console.log('🔍 Checking status of Yogyakarta therapists...\n');

try {
    const response = await databases.listDocuments(
        '68f76ee1000e64ca8d05',
        'therapists_collection_id',
        [
            Query.contains('location', 'Yogyakarta'),
            Query.limit(100)
        ]
    );

    const statusCounts = {};
    
    console.log(`📊 Found ${response.documents.length} Yogyakarta therapists\n`);
    
    response.documents.forEach((therapist, index) => {
        const status = therapist.status || 'undefined';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
        
        console.log(`${index + 1}. ${therapist.name} (${therapist.$id})`);
        console.log(`   Status: ${status}`);
        console.log(`   Location: ${therapist.location}`);
        console.log('');
    });
    
    console.log('\n📊 Status Summary:');
    Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   ${status}: ${count} therapists`);
    });
    
} catch (error) {
    console.error('❌ Error:', error.message);
}
