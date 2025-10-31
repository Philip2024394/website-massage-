/**
 * Appwrite Storage Cleanup Script
 * 
 * This script scans all files in Appwrite storage and identifies files
 * that are not referenced in any database collection, then optionally removes them.
 * 
 * Run with: npx tsx scripts/cleanupUnusedFiles.ts
 */

import { Client, Databases, Storage, Query } from 'node-appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';

// Initialize Appwrite Client
const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId)
    .setKey(process.env.APPWRITE_API_KEY || ''); // Set your API key in .env

const databases = new Databases(client);
const storage = new Storage(client);

interface FileInfo {
    $id: string;
    name: string;
    sizeOriginal: number;
    $createdAt: string;
}

interface ScanResult {
    totalFiles: number;
    usedFiles: Set<string>;
    unusedFiles: FileInfo[];
    totalSize: number;
    unusedSize: number;
}

/**
 * Get all files from Appwrite storage bucket
 */
async function getAllStorageFiles(): Promise<FileInfo[]> {
    try {
        console.log('📦 Fetching all files from storage bucket...');
        const files: FileInfo[] = [];
        let offset = 0;
        const limit = 100;
        
        while (true) {
            const response = await storage.listFiles(
                APPWRITE_CONFIG.bucketId,
                [Query.limit(limit), Query.offset(offset)]
            );
            
            files.push(...response.files as FileInfo[]);
            console.log(`   Retrieved ${files.length} files so far...`);
            
            if (response.files.length < limit) {
                break; // No more files
            }
            offset += limit;
        }
        
        console.log(`✅ Found ${files.length} total files in storage\n`);
        return files;
    } catch (error) {
        console.error('❌ Error fetching storage files:', error);
        return [];
    }
}

/**
 * Extract file IDs from a URL
 */
function extractFileIdFromUrl(url: string): string | null {
    if (!url || typeof url !== 'string') return null;
    
    // Match pattern: /files/{fileId}/view or /files/{fileId}/download
    const match = url.match(/\/files\/([a-zA-Z0-9_-]+)\/(view|download)/);
    return match ? match[1] : null;
}

/**
 * Scan a collection and extract all file references
 */
async function scanCollectionForFiles(collectionId: string, collectionName: string): Promise<Set<string>> {
    try {
        console.log(`🔍 Scanning ${collectionName}...`);
        const fileIds = new Set<string>();
        let offset = 0;
        const limit = 100;
        let totalDocs = 0;
        
        while (true) {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                collectionId,
                [Query.limit(limit), Query.offset(offset)]
            );
            
            totalDocs += response.documents.length;
            
            // Scan each document for file URLs
            response.documents.forEach((doc: any) => {
                Object.values(doc).forEach((value: any) => {
                    if (typeof value === 'string') {
                        const fileId = extractFileIdFromUrl(value);
                        if (fileId) fileIds.add(fileId);
                    } else if (Array.isArray(value)) {
                        value.forEach((item: any) => {
                            if (typeof item === 'string') {
                                const fileId = extractFileIdFromUrl(item);
                                if (fileId) fileIds.add(fileId);
                            }
                        });
                    } else if (typeof value === 'object' && value !== null) {
                        // Handle JSON objects
                        const jsonStr = JSON.stringify(value);
                        const matches = jsonStr.matchAll(/\/files\/([a-zA-Z0-9_-]+)\/(view|download)/g);
                        for (const match of matches) {
                            fileIds.add(match[1]);
                        }
                    }
                });
            });
            
            if (response.documents.length < limit) {
                break;
            }
            offset += limit;
        }
        
        console.log(`   ✓ Scanned ${totalDocs} documents, found ${fileIds.size} file references`);
        return fileIds;
    } catch (error) {
        console.error(`   ❌ Error scanning ${collectionName}:`, error);
        return new Set<string>();
    }
}

/**
 * Scan all collections for file references
 */
async function scanAllCollectionsForFiles(): Promise<Set<string>> {
    console.log('🔍 Scanning all database collections for file references...\n');
    
    const allFileIds = new Set<string>();
    const collections = Object.entries(APPWRITE_CONFIG.collections);
    
    for (const [name, id] of collections) {
        const fileIds = await scanCollectionForFiles(id, name);
        fileIds.forEach(fileId => allFileIds.add(fileId));
    }
    
    console.log(`\n✅ Total unique file IDs found in database: ${allFileIds.size}\n`);
    return allFileIds;
}

/**
 * Format bytes to human readable size
 */
function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Scan storage and identify unused files
 */
async function scanStorageForUnusedFiles(): Promise<ScanResult> {
    const [storageFiles, usedFileIds] = await Promise.all([
        getAllStorageFiles(),
        scanAllCollectionsForFiles()
    ]);
    
    const unusedFiles: FileInfo[] = [];
    let totalSize = 0;
    let unusedSize = 0;
    
    storageFiles.forEach(file => {
        totalSize += file.sizeOriginal;
        
        if (!usedFileIds.has(file.$id)) {
            unusedFiles.push(file);
            unusedSize += file.sizeOriginal;
        }
    });
    
    return {
        totalFiles: storageFiles.length,
        usedFiles: usedFileIds,
        unusedFiles,
        totalSize,
        unusedSize
    };
}

/**
 * Delete unused files from storage
 */
async function deleteUnusedFiles(files: FileInfo[], dryRun: boolean = true): Promise<void> {
    if (files.length === 0) {
        console.log('✅ No files to delete!\n');
        return;
    }
    
    if (dryRun) {
        console.log('🔍 DRY RUN MODE - No files will be deleted\n');
        console.log('Files that WOULD be deleted:');
        files.forEach((file, index) => {
            console.log(`${index + 1}. ${file.name} (${formatBytes(file.sizeOriginal)}) - ${file.$id}`);
            console.log(`   Created: ${new Date(file.$createdAt).toLocaleString()}`);
        });
        console.log('\n💡 To actually delete files, run with --delete flag\n');
        return;
    }
    
    console.log('🗑️  DELETING UNUSED FILES...\n');
    
    let deleted = 0;
    let failed = 0;
    
    for (const file of files) {
        try {
            await storage.deleteFile(APPWRITE_CONFIG.bucketId, file.$id);
            deleted++;
            console.log(`✓ Deleted: ${file.name} (${formatBytes(file.sizeOriginal)})`);
        } catch (error) {
            failed++;
            console.error(`✗ Failed to delete: ${file.name} - ${error}`);
        }
    }
    
    console.log(`\n✅ Deleted ${deleted} files`);
    if (failed > 0) {
        console.log(`❌ Failed to delete ${failed} files`);
    }
}

/**
 * Main execution
 */
async function main() {
    console.log('🧹 Appwrite Storage Cleanup Tool\n');
    console.log('═══════════════════════════════════════════════════\n');
    
    // Check for API key
    if (!process.env.APPWRITE_API_KEY) {
        console.error('❌ ERROR: APPWRITE_API_KEY environment variable not set!');
        console.log('\n💡 Set your API key:');
        console.log('   export APPWRITE_API_KEY="your-api-key-here"');
        console.log('   or add it to your .env file\n');
        process.exit(1);
    }
    
    try {
        // Scan storage
        const result = await scanStorageForUnusedFiles();
        
        // Display results
        console.log('📊 SCAN RESULTS');
        console.log('═══════════════════════════════════════════════════');
        console.log(`Total files in storage:     ${result.totalFiles}`);
        console.log(`Files referenced in DB:     ${result.usedFiles.size}`);
        console.log(`Unused files:               ${result.unusedFiles.length}`);
        console.log(`Total storage used:         ${formatBytes(result.totalSize)}`);
        console.log(`Unused storage:             ${formatBytes(result.unusedSize)}`);
        
        if (result.unusedFiles.length > 0) {
            const percentage = ((result.unusedSize / result.totalSize) * 100).toFixed(2);
            console.log(`Potential savings:          ${formatBytes(result.unusedSize)} (${percentage}%)`);
        }
        console.log('═══════════════════════════════════════════════════\n');
        
        if (result.unusedFiles.length === 0) {
            console.log('✨ All files are being used! No cleanup needed.\n');
            return;
        }
        
        // Check for delete flag
        const shouldDelete = process.argv.includes('--delete');
        
        // Delete or show what would be deleted
        await deleteUnusedFiles(result.unusedFiles, !shouldDelete);
        
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        process.exit(1);
    }
}

// Run the script
main();
