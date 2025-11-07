/**
 * Image Migration Utility
 * Migrates external URL images to Appwrite storage
 * Run this once to transfer all images from imagekit.io to your Appwrite bucket
 */

import { storage } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import { ID } from 'appwrite';

// Images to migrate
const IMAGES_TO_MIGRATE = {
    // Home page therapist main images (18 images)
    homePageImages: [
        'https://ik.imagekit.io/7grri5v7d/hotel%20massage%20indoniseas.png?updatedAt=1761154913720',
        'https://ik.imagekit.io/7grri5v7d/massage%20room.png?updatedAt=1760975249566',
        'https://ik.imagekit.io/7grri5v7d/massage%20hoter%20villa.png?updatedAt=1760965742264',
        'https://ik.imagekit.io/7grri5v7d/massage%20agents.png?updatedAt=1760968250776',
        'https://ik.imagekit.io/7grri5v7d/massage%20image%2016.png?updatedAt=1760187700624',
        'https://ik.imagekit.io/7grri5v7d/massage%20image%2014.png?updatedAt=1760187606823',
        'https://ik.imagekit.io/7grri5v7d/massage%20image%2013.png?updatedAt=1760187547313',
        'https://ik.imagekit.io/7grri5v7d/massage%20image%2012.png?updatedAt=1760187511503',
        'https://ik.imagekit.io/7grri5v7d/massage%20image%2011.png?updatedAt=1760187471233',
        'https://ik.imagekit.io/7grri5v7d/massage%20image%2010.png?updatedAt=1760187307232',
        'https://ik.imagekit.io/7grri5v7d/massage%20image%209.png?updatedAt=1760187266868',
        'https://ik.imagekit.io/7grri5v7d/massage%20image%207.png?updatedAt=1760187181168',
        'https://ik.imagekit.io/7grri5v7d/massage%20image%206.png?updatedAt=1760187126997',
        'https://ik.imagekit.io/7grri5v7d/massage%20image%205.png?updatedAt=1760187081702',
        'https://ik.imagekit.io/7grri5v7d/massage%20image%204.png?updatedAt=1760187040909',
        'https://ik.imagekit.io/7grri5v7d/massage%20image%203.png?updatedAt=1760186993639',
        'https://ik.imagekit.io/7grri5v7d/massage%20image%202.png?updatedAt=1760186944882',
        'https://ik.imagekit.io/7grri5v7d/massage%20image%201.png?updatedAt=1760186885261',
    ],
    
    // Live menu therapist images (7 images)
    liveMenuImages: [
        'https://ik.imagekit.io/7grri5v7d/massage%20image%2015.png?updatedAt=1760187650860',
        'https://ik.imagekit.io/7grri5v7d/massage%20image%2014.png?updatedAt=1760187606823',
        'https://ik.imagekit.io/7grri5v7d/massage%20image%2012.png?updatedAt=1760187511503',
        'https://ik.imagekit.io/7grri5v7d/massage%20image%2011.png?updatedAt=1760187471233',
        'https://ik.imagekit.io/7grri5v7d/massage%20image%209.png?updatedAt=1760187266868',
        'https://ik.imagekit.io/7grri5v7d/massage%20image%206.png?updatedAt=1760187126997',
        'https://ik.imagekit.io/7grri5v7d/massage%20image%202.png?updatedAt=1760186944882',
    ],
    
    // Landing page images
    landingPageImages: [
        {
            url: 'https://ik.imagekit.io/7grri5v7d/massage%20pictures.png?updatedAt=1761492827092',
            name: 'landing-page-background.png'
        },
        {
            url: 'https://ik.imagekit.io/7grri5v7d/massage_picture-removebg-preview.png?updatedAt=1761492974749',
            name: 'landing-page-massage-icon.png'
        }
    ]
};

interface MigrationResult {
    originalUrl: string;
    appwriteUrl: string;
    fileId: string;
    fileName: string;
}

/**
 * Downloads an image from URL and uploads to Appwrite storage
 */
async function migrateImageToAppwrite(imageUrl: string, customFileName?: string): Promise<MigrationResult> {
    try {
        console.log(`📥 Downloading: ${imageUrl}`);
        
        // Fetch image from URL
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        
        // Get blob
        const blob = await response.blob();
        console.log(`✅ Downloaded (${(blob.size / 1024).toFixed(2)} KB)`);
        
        // Extract filename or use custom name
        let fileName = customFileName;
        if (!fileName) {
            const urlParts = imageUrl.split('/');
            fileName = urlParts[urlParts.length - 1].split('?')[0];
            // Decode URL encoding
            fileName = decodeURIComponent(fileName);
        }
        
        // Create File object
        const file = new File([blob], fileName, { type: blob.type });
        
        // Upload to Appwrite
        console.log(`☁️ Uploading to Appwrite: ${fileName}`);
        const uploadResult = await storage.createFile(
            APPWRITE_CONFIG.bucketId,
            ID.unique(),
            file
        );
        
        // Generate Appwrite URL
        const appwriteUrl = `https://syd.cloud.appwrite.io/v1/storage/buckets/${APPWRITE_CONFIG.bucketId}/files/${uploadResult.$id}/view?project=${APPWRITE_CONFIG.projectId}`;
        
        console.log(`✅ Uploaded successfully!`);
        console.log(`   File ID: ${uploadResult.$id}`);
        console.log(`   Appwrite URL: ${appwriteUrl}`);
        
        return {
            originalUrl: imageUrl,
            appwriteUrl,
            fileId: uploadResult.$id,
            fileName
        };
        
    } catch (error) {
        console.error(`❌ Error migrating ${imageUrl}:`, error);
        throw error;
    }
}

/**
 * Migrates all images and generates new code
 */
async function migrateAllImages() {
    console.log('🚀 Starting image migration to Appwrite...\n');
    
    const results: {
        homePageImages: MigrationResult[];
        liveMenuImages: MigrationResult[];
        landingPageImages: MigrationResult[];
    } = {
        homePageImages: [],
        liveMenuImages: [],
        landingPageImages: []
    };
    
    // Migrate home page images
    console.log('\n📋 Migrating HOME PAGE images (18 images)...');
    for (let i = 0; i < IMAGES_TO_MIGRATE.homePageImages.length; i++) {
        const url = IMAGES_TO_MIGRATE.homePageImages[i];
        try {
            const result = await migrateImageToAppwrite(url, `home-therapist-${i + 1}.png`);
            results.homePageImages.push(result);
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch {
            console.error(`Failed to migrate home page image ${i + 1}`);
        }
    }
    
    // Migrate live menu images
    console.log('\n📋 Migrating LIVE MENU images (7 images)...');
    for (let i = 0; i < IMAGES_TO_MIGRATE.liveMenuImages.length; i++) {
        const url = IMAGES_TO_MIGRATE.liveMenuImages[i];
        try {
            const result = await migrateImageToAppwrite(url, `live-menu-therapist-${i + 1}.png`);
            results.liveMenuImages.push(result);
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch {
            console.error(`Failed to migrate live menu image ${i + 1}`);
        }
    }
    
    // Migrate landing page images
    console.log('\n📋 Migrating LANDING PAGE images (2 images)...');
    for (const image of IMAGES_TO_MIGRATE.landingPageImages) {
        try {
            const result = await migrateImageToAppwrite(image.url, image.name);
            results.landingPageImages.push(result);
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch {
            console.error(`Failed to migrate landing page image: ${image.name}`);
        }
    }
    
    // Generate updated code
    console.log('\n\n✅ MIGRATION COMPLETE!\n');
    console.log('📝 Copy these updated arrays to appwriteService.ts:\n');
    
    console.log('// Home page images:');
    console.log('const THERAPIST_MAIN_IMAGES = [');
    results.homePageImages.forEach(img => {
        console.log(`    '${img.appwriteUrl}',`);
    });
    console.log('];\n');
    
    console.log('// Live menu images:');
    console.log('const LIVE_MENU_THERAPIST_IMAGES = [');
    results.liveMenuImages.forEach(img => {
        console.log(`    '${img.appwriteUrl}',`);
    });
    console.log('];\n');
    
    console.log('// Landing page images:');
    results.landingPageImages.forEach(img => {
        console.log(`export const ${img.fileName.replace(/[-.]/g, '_').replace('.png', '').toUpperCase()} = '${img.appwriteUrl}';`);
    });
    
    console.log('\n🎉 All images are now stored in your Appwrite bucket!');
    console.log('📦 No more dependency on external imagekit.io URLs');
    
    return results;
}

// Run migration
migrateAllImages().catch(console.error);
