import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_8e3351c815f281efb56a2606ca7d96032c3d6c9f5c0111c0702f12f745715247aa0298fb295bc0a1d84719be11e7c22e4ad2ff35861262ea095b5d6af964983cebf9b0db9797bfb7c835944ba243e55e720b6943280d7c0b93b52001d48c2a2aec4af7668bffe6337053fe28a026b4c1546a6c4a0e711195e152bc6f801d50df');

const databases = new Databases(client);
const databaseId = '68f76ee1000e64ca8d05';
const therapistsCollectionId = 'therapists_collection_id';

console.log('🔍 Checking for unused attributes...\n');

// Fields that look like duplicates or unused
const suspectFields = [
    'coodinates',  // typo of coordinates (we have 'coordinates')
    'massagetype', // duplicate of massageTypes
    'yearsofexperince', // typo of yearsOfExperience
    'lastmembershipupdatedate', // might be unused
    'totalactivemembershipmonths', // might be unused
    'villadiscount', // might be unused
    'distance', // calculated field, not stored
    'hotelId', // probably unused
    'agentId', // probably unused
];

async function checkFieldUsage() {
    try {
        const response = await databases.listDocuments(
            databaseId,
            therapistsCollectionId,
            [Query.limit(500)]
        );

        console.log(`Checking ${response.documents.length} therapists...\n`);

        const fieldUsage = {};
        suspectFields.forEach(field => {
            fieldUsage[field] = { used: 0, hasValue: 0 };
        });

        response.documents.forEach(doc => {
            suspectFields.forEach(field => {
                if (field in doc) {
                    fieldUsage[field].used++;
                    if (doc[field] && doc[field] !== '' && doc[field] !== null) {
                        fieldUsage[field].hasValue++;
                    }
                }
            });
        });

        console.log('Field Usage Analysis:\n');
        suspectFields.forEach(field => {
            const usage = fieldUsage[field];
            const status = usage.hasValue === 0 ? '❌ UNUSED' : `⚠️  ${usage.hasValue} have values`;
            console.log(`${field.padEnd(30)} ${status}`);
        });

        console.log('\n💡 Safe to delete (no values used):');
        suspectFields.forEach(field => {
            if (fieldUsage[field].hasValue === 0) {
                console.log(`   - ${field}`);
            }
        });

    } catch (error) {
        console.error('❌ Failed:', error.message);
        process.exit(1);
    }
}

checkFieldUsage();
