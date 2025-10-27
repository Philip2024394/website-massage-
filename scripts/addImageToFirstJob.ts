import { databases } from '../lib/appwrite.ts';
import { APPWRITE_CONFIG } from '../lib/appwrite.config.ts';

const DATABASE_ID = APPWRITE_CONFIG.databaseId;
const COLLECTION_ID = APPWRITE_CONFIG.collections.employerJobPostings;

async function addImageToFirstJob() {
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

        // Get the first job posting (Ayana Resort)
        const firstJob = response.documents[0];
        console.log(`Found job: ${firstJob.jobTitle} at ${firstJob.businessName}`);
        console.log(`Job ID: ${firstJob.$id}\n`);

        // Update with the image URL
        const imageUrl = 'https://ik.imagekit.io/7grri5v7d/massage%20online.png?updatedAt=1761582970960';
        
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTION_ID,
            firstJob.$id,
            {
                imageUrl: imageUrl
            }
        );

        console.log('✅ Successfully added image to job posting!');
        console.log(`Image URL: ${imageUrl}`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Run the script
addImageToFirstJob()
    .then(() => {
        console.log('\n✨ Image update completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Script failed:', error);
        process.exit(1);
    });
