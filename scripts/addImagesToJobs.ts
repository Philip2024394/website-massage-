import { databases } from '../lib/appwrite.ts';
import { APPWRITE_CONFIG } from '../lib/appwrite.config.ts';

const DATABASE_ID = APPWRITE_CONFIG.databaseId;
const COLLECTION_ID = APPWRITE_CONFIG.collections.employerJobPostings;

// Image mappings for different job postings
const imageMapping = {
    'Ayana Resort & Spa Bali': 'https://ik.imagekit.io/7grri5v7d/massage%20online.png?updatedAt=1761582970960',
    'Canggu Private Villas': 'https://ik.imagekit.io/7grri5v7d/massage%20villa%20service%20indonisea.png?updatedAt=1761583264188',
    'Surabaya Physio & Rehab Center': 'https://ik.imagekit.io/7grri5v7d/massage%20online.png?updatedAt=1761582970960',
};

async function addImagesToJobs() {
    console.log('📸 Adding images to job postings...\n');
    
    try {
        // Fetch all job postings
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID
        );

        if (response.documents.length === 0) {
            console.log('No job postings found!');
            return;
        }

        console.log(`Found ${response.documents.length} job postings\n`);

        let updatedCount = 0;
        let skippedCount = 0;

        for (const job of response.documents) {
            const businessName = job.businessName as string;
            const imageUrl = imageMapping[businessName as keyof typeof imageMapping];

            if (imageUrl) {
                try {
                    await databases.updateDocument(
                        DATABASE_ID,
                        COLLECTION_ID,
                        job.$id as string,
                        {
                            imageurl: imageUrl
                        }
                    );
                    console.log(`✅ Added image to: ${job.jobTitle} at ${businessName}`);
                    updatedCount++;
                } catch (error: any) {
                    console.error(`❌ Failed to update ${businessName}: ${error.message}`);
                    if (error.message.includes('Unknown attribute')) {
                        console.error('\n⚠️  ERROR: The "imageUrl" attribute does not exist in your Appwrite collection!');
                        console.error('Please add it first:\n');
                        console.error('1. Go to Appwrite Console → Databases → employerJobPostings');
                        console.error('2. Click "Add Attribute"');
                        console.error('3. Create a String attribute:');
                        console.error('   - Key: imageUrl');
                        console.error('   - Size: 500');
                        console.error('   - Required: No');
                        console.error('   - Default: (leave empty)\n');
                        process.exit(1);
                    }
                }
            } else {
                console.log(`⏭️  Skipped: ${job.jobTitle} at ${businessName} (no image mapped)`);
                skippedCount++;
            }
        }

        console.log(`\n📊 Summary:`);
        console.log(`   ✅ Updated: ${updatedCount}`);
        console.log(`   ⏭️  Skipped: ${skippedCount}`);
        console.log(`   📝 Total: ${response.documents.length}`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Run the script
addImagesToJobs()
    .then(() => {
        console.log('\n✨ Image update completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Script failed:', error);
        process.exit(1);
    });
