import { databases } from '../lib/appwrite.ts';
import { APPWRITE_CONFIG } from '../lib/appwrite.config.ts';

const DATABASE_ID = APPWRITE_CONFIG.databaseId;
const COLLECTION_ID = APPWRITE_CONFIG.collections.employerJobPostings;

async function addImageToVillaJob() {
    console.log('Fetching job postings...\n');
    
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

        // Find the Canggu Private Villas job
        const villaJob = response.documents.find((doc: any) => 
            doc.businessName.includes('Canggu Private Villas') || 
            doc.jobTitle.includes('Private Villa')
        );

        if (!villaJob) {
            console.log('❌ Could not find Private Villa job posting!');
            console.log('Available jobs:');
            response.documents.forEach((doc: any) => {
                console.log(`  - ${doc.jobTitle} at ${doc.businessName}`);
            });
            return;
        }

        console.log(`Found job: ${villaJob.jobTitle} at ${villaJob.businessName}`);
        console.log(`Job ID: ${villaJob.$id}\n`);

        // Update with the image URL
        const imageUrl = 'https://ik.imagekit.io/7grri5v7d/massage%20villa%20service%20indonisea.png?updatedAt=1761583264188';
        
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTION_ID,
            villaJob.$id,
            {
                imageUrl: imageUrl
            }
        );

        console.log('✅ Successfully added image to Private Villa job posting!');
        console.log(`Image URL: ${imageUrl}`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Run the script
addImageToVillaJob()
    .then(() => {
        console.log('\n✨ Image update completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Script failed:', error);
        process.exit(1);
    });
