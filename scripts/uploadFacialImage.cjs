const { Client, Storage, ID } = require('node-appwrite');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Appwrite Configuration
const APPWRITE_ENDPOINT = 'https://syd.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '68f23b11000d25eb3664';
const APPWRITE_API_KEY = 'standard_119fa2568669a282b6165b25f53fb8b18991ba76d2e13efa3af9e73d9db214f592521f7f9800264f04e28daec46d21ee23c93ad8e7166002253ee3dd014e835b875db7ba47ab451fd1c7bff78f9f053c3cf6056a107fe51f6df5c479b2f100f56aaf90d6506ee31e5b68f9d1afcd0fe54abf30d8be6a799194487e15c38f9212';
const FACIAL_BUCKET_ID = '6932f43700113926eb80';

// Image to download and upload
const IMAGE_URL = 'https://ik.imagekit.io/7grri5v7d/Microdermabrasion.png';
const IMAGE_NAME = 'Microdermabrasion.png';
const TEMP_DIR = path.join(__dirname, 'temp');
const TEMP_FILE = path.join(TEMP_DIR, IMAGE_NAME);

// Initialize Appwrite client
const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

const storage = new Storage(client);

/**
 * Download image from URL
 */
function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        // Create temp directory if it doesn't exist
        if (!fs.existsSync(TEMP_DIR)) {
            fs.mkdirSync(TEMP_DIR, { recursive: true });
        }

        const file = fs.createWriteStream(filepath);
        
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download image: ${response.statusCode}`));
                return;
            }

            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                console.log('✅ Image downloaded successfully:', filepath);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => {}); // Delete incomplete file
            reject(err);
        });
    });
}

/**
 * Upload image to Appwrite bucket
 */
async function uploadToAppwrite(filepath, filename) {
    try {
        console.log('📤 Uploading image to Appwrite bucket:', FACIAL_BUCKET_ID);
        
        const fileBuffer = fs.readFileSync(filepath);
        const fileBlob = new Blob([fileBuffer], { type: 'image/png' });
        
        // Create File object from Blob
        const file = new File([fileBlob], filename, { type: 'image/png' });
        
        const response = await storage.createFile(
            FACIAL_BUCKET_ID,
            ID.unique(),
            file
        );
        
        console.log('✅ Image uploaded successfully!');
        console.log('   File ID:', response.$id);
        
        // Get file URL
        const fileUrl = `${APPWRITE_ENDPOINT}/storage/buckets/${FACIAL_BUCKET_ID}/files/${response.$id}/view?project=${APPWRITE_PROJECT_ID}`;
        console.log('   File URL:', fileUrl);
        
        return {
            fileId: response.$id,
            fileUrl: fileUrl
        };
    } catch (error) {
        console.error('❌ Error uploading to Appwrite:', error.message);
        throw error;
    }
}

/**
 * Clean up temporary file
 */
function cleanup(filepath) {
    try {
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
            console.log('🧹 Cleaned up temporary file');
        }
    } catch (error) {
        console.error('Warning: Could not delete temp file:', error.message);
    }
}

/**
 * Main execution
 */
async function main() {
    try {
        console.log('🚀 Starting facial image upload process...');
        console.log('   Source URL:', IMAGE_URL);
        console.log('   Target Bucket:', FACIAL_BUCKET_ID);
        console.log('');
        
        // Step 1: Download image
        console.log('📥 Step 1: Downloading image...');
        await downloadImage(IMAGE_URL, TEMP_FILE);
        console.log('');
        
        // Step 2: Upload to Appwrite
        console.log('📤 Step 2: Uploading to Appwrite...');
        const result = await uploadToAppwrite(TEMP_FILE, IMAGE_NAME);
        console.log('');
        
        // Step 3: Display result
        console.log('✨ SUCCESS! Image uploaded to Appwrite bucket');
        console.log('');
        console.log('📋 Use this information:');
        console.log('   File ID:', result.fileId);
        console.log('   Public URL:', result.fileUrl);
        console.log('');
        console.log('💡 Next steps:');
        console.log('   1. Add this URL to your facial place document as "mainImage"');
        console.log('   2. Or update the facial_places_collection with this fileId');
        console.log('');
        
        // Cleanup
        cleanup(TEMP_FILE);
        
    } catch (error) {
        console.error('');
        console.error('❌ ERROR:', error.message);
        console.error('');
        cleanup(TEMP_FILE);
        process.exit(1);
    }
}

// Run the script
main();
