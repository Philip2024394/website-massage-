import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_f5de1d1e0c63bfe24b948b5d70c3e6b45d7e07a44a7c51b5ec94d2d0d2e4c47e0efcb7cf89ae8a79c31e5ed30af6d8c67e6d30f1fc20f66f79c6b2f41accc3f4fa1ffdf9cc72d1d3f01c68fb77a9303bccca7f8d6e6db62d2e5dbbed0a93fa59');

const databases = new Databases(client);

console.log('🔍 Checking share link for Wiwid (694ed78e002b0c06171e)...\n');

try {
    const result = await databases.listDocuments(
        '68f76ee1000e64ca8d05', // Database ID
        '6762c1aa002ced8d6ed5', // share_links collection
        [
            Query.equal('entityType', 'therapist'),
            Query.equal('entityId', '694ed78e002b0c06171e')
        ]
    );
    
    console.log(`Found ${result.total} share link(s):\n`);
    
    if (result.total > 0) {
        result.documents.forEach(doc => {
            console.log('📋 Share Link Details:');
            console.log('   Short ID:', doc.shortId);
            console.log('   Slug:', doc.slug);
            console.log('   Short URL:', `https://www.indastreetmassage.com/share/${doc.shortId}`);
            console.log('   Views:', doc.views || 0);
            console.log('   Shares:', doc.shares || 0);
            console.log('');
        });
    } else {
        console.log('❌ No share link found for Wiwid!');
        console.log('This means TherapistCard will fall back to long URL format:');
        console.log(`   https://www.indastreetmassage.com/therapist-profile/694ed78e002b0c06171e-pijat-yogyakarta-wiwid`);
    }
    
} catch (error) {
    console.error('❌ Error checking share link:', error.message);
}
