/**
 * Clear All Caches Script
 * 
 * This script removes all cached files, build artifacts, and temporary files
 * to ensure a completely clean build environment.
 * 
 * Run with: npx tsx scripts/clearAllCaches.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const CACHE_DIRECTORIES = [
    'node_modules/.vite',
    'node_modules/.cache',
    'dist',
    '.next',
    '.turbo',
    '.parcel-cache',
    'build',
];

const CACHE_FILES = [
    '.tsbuildinfo',
    'tsconfig.tsbuildinfo',
    '.eslintcache',
];

const CACHE_PATTERNS = [
    /\.cache$/,
    /\.tmp$/,
    /\.log$/,
    /\.tsbuildinfo$/,
];

/**
 * Remove a directory recursively
 */
function removeDirectory(dirPath: string): boolean {
    const fullPath = path.join(process.cwd(), dirPath);
    
    if (!fs.existsSync(fullPath)) {
        return false;
    }
    
    try {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`✓ Removed: ${dirPath}`);
        return true;
    } catch (error) {
        console.error(`✗ Failed to remove ${dirPath}:`, error);
        return false;
    }
}

/**
 * Remove a single file
 */
function removeFile(filePath: string): boolean {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
        return false;
    }
    
    try {
        fs.unlinkSync(fullPath);
        console.log(`✓ Removed: ${filePath}`);
        return true;
    } catch (error) {
        console.error(`✗ Failed to remove ${filePath}:`, error);
        return false;
    }
}

/**
 * Kill all Node.js processes
 */
function killNodeProcesses(): void {
    try {
        if (process.platform === 'win32') {
            // Don't kill the current process, just dev servers
            execSync('powershell -Command "Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { $_.Id -ne $PID } | Stop-Process -Force"', { stdio: 'ignore' });
        } else {
            execSync('pkill -9 node 2>/dev/null || true', { stdio: 'ignore' });
        }
        console.log('✓ Stopped development servers');
    } catch {
        // Ignore errors - no Node processes running
        console.log('✓ No development servers to stop');
    }
}

/**
 * Find and remove files matching patterns
 */
function removeMatchingFiles(dir: string, depth: number = 0): number {
    if (depth > 3) return 0; // Limit recursion depth
    
    let removed = 0;
    
    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relativePath = path.relative(process.cwd(), fullPath);
            
            // Skip node_modules and .git
            if (relativePath.includes('node_modules') || relativePath.includes('.git')) {
                continue;
            }
            
            if (entry.isDirectory()) {
                removed += removeMatchingFiles(fullPath, depth + 1);
            } else {
                // Check if file matches any cache pattern
                const shouldRemove = CACHE_PATTERNS.some(pattern => 
                    pattern.test(entry.name)
                );
                
                if (shouldRemove) {
                    try {
                        fs.unlinkSync(fullPath);
                        console.log(`✓ Removed: ${relativePath}`);
                        removed++;
                    } catch {
                        console.error(`✗ Failed to remove ${relativePath}`);
                    }
                }
            }
        }
    } catch {
        // Ignore errors for directories we can't read
    }
    
    return removed;
}

/**
 * Main execution
 */
async function main() {
    console.log('🧹 Clearing All Caches\n');
    console.log('═══════════════════════════════════════════════════\n');
    
    let totalRemoved = 0;
    
    // Step 1: Kill Node processes
    console.log('Step 1: Killing Node.js processes...');
    killNodeProcesses();
    console.log('');
    
    // Step 2: Remove cache directories
    console.log('Step 2: Removing cache directories...');
    for (const dir of CACHE_DIRECTORIES) {
        if (removeDirectory(dir)) {
            totalRemoved++;
        }
    }
    console.log('');
    
    // Step 3: Remove cache files
    console.log('Step 3: Removing cache files...');
    for (const file of CACHE_FILES) {
        if (removeFile(file)) {
            totalRemoved++;
        }
    }
    console.log('');
    
    // Step 4: Scan for additional cache files
    console.log('Step 4: Scanning for additional cache files...');
    const additionalFiles = removeMatchingFiles(process.cwd());
    totalRemoved += additionalFiles;
    
    if (additionalFiles === 0) {
        console.log('✓ No additional cache files found');
    }
    console.log('');
    
    // Summary
    console.log('═══════════════════════════════════════════════════');
    console.log(`✅ Cache cleanup complete!`);
    console.log(`   Removed ${totalRemoved} cache locations`);
    console.log('═══════════════════════════════════════════════════\n');
    
    console.log('💡 Next steps:');
    console.log('   1. Run: npm run build');
    console.log('   2. Or run: npm run dev\n');
}

// Run the script
main().catch(error => {
    console.error('❌ Error during cache cleanup:', error);
    process.exit(1);
});
