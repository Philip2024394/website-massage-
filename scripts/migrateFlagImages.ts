/**
 * Flag Images Migration Utility
 * Migrates flag images to Appwrite storage
 */

import { storage } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import { ID } from 'appwrite';

const FLAG_IMAGES = {
    'gb': 'https://ik.imagekit.io/7grri5v7d/gb.png?updatedAt=1761494010956',
    'id': 'https://ik.imagekit.io/7grri5v7d/id.png?updatedAt=1761494030753',
    'cn': 'https://ik.imagekit.io/7grri5v7d/cn.png?updatedAt=1761494047731',
    'jp': 'https://ik.imagekit.io/7grri5v7d/jp.png?updatedAt=1761494063009',
    'kp': 'https://ik.imagekit.io/7grri5v7d/kp.png?updatedAt=1761494081146',
    'kr': 'https://ik.imagekit.io/7grri5v7d/kr.png?updatedAt=1761494099196',
    'ru': 'https://ik.imagekit.io/7grri5v7d/ru.png?updatedAt=1761494116896',
    'fr': 'https://ik.imagekit.io/7grri5v7d/fr.png?updatedAt=1761494131786',
    'de': 'https://ik.imagekit.io/7grri5v7d/de.png?updatedAt=1761494147167',
    'es': 'https://ik.imagekit.io/7grri5v7d/es.png?updatedAt=1761494164463'
};

async function migrateImageToAppwrite(imageUrl: string, fileName: string) {
    try {
        console.log(`📥 Downloading: ${fileName}`);
        
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        
        const blob = await response.blob();
        console.log(`✅ Downloaded (${(blob.size / 1024).toFixed(2)} KB)`);
        
        const file = new File([blob], fileName, { type: blob.type });
        
        console.log(`☁️ Uploading to Appwrite: ${fileName}`);
        const uploadResult = await storage.createFile(
            APPWRITE_CONFIG.bucketId,
            ID.unique(),
            file
        );
        
        const appwriteUrl = `https://syd.cloud.appwrite.io/v1/storage/buckets/${APPWRITE_CONFIG.bucketId}/files/${uploadResult.$id}/view?project=${APPWRITE_CONFIG.projectId}`;
        
        console.log(`✅ Uploaded successfully!`);
        console.log(`   File ID: ${uploadResult.$id}`);
        
        return {
            code: fileName.replace('.png', ''),
            url: appwriteUrl,
            fileId: uploadResult.$id
        };
        
    } catch (error) {
        console.error(`❌ Error migrating ${fileName}:`, error);
        throw error;
    }
}

async function migrateFlagImages() {
    console.log('🚀 Starting flag images migration to Appwrite...\n');
    
    const results: any[] = [];
    
    for (const [code, url] of Object.entries(FLAG_IMAGES)) {
        try {
            const result = await migrateImageToAppwrite(url, `${code}.png`);
            results.push(result);
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (_error) {
            console.error(`Failed to migrate ${code} flag`);
        }
    }
    
    console.log('\n\n✅ MIGRATION COMPLETE!\n');
    console.log('📝 Flag image URLs:\n');
    
    results.forEach(({ code, url }) => {
        console.log(`${code}: '${url}',`);
    });
    
    console.log('\n🎉 All flag images are now stored in your Appwrite bucket!');
    
    return results;
}

migrateFlagImages().catch(console.error);
