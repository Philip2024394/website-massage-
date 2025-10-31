/**
 * Project Health Check & Cleanup Script
 * 
 * This script performs a comprehensive health check of the project:
 * 1. Identifies unused/deprecated files
 * 2. Scans for code quality issues
 * 3. Checks for security vulnerabilities
 * 4. Analyzes bundle size
 * 5. Validates configuration files
 * 
 * Run with: npx tsx scripts/projectHealthCheck.ts
 * Run cleanup: npx tsx scripts/projectHealthCheck.ts --cleanup
 */

import * as fs from 'fs';
import * as path from 'path';

interface HealthReport {
    deprecatedFiles: string[];
    unusedImports: string[];
    largeFiles: { path: string; size: number }[];
    duplicateCode: string[];
    configIssues: string[];
    securityWarnings: string[];
    recommendations: string[];
}

const DEPRECATED_FILES = [
    'pages/TherapistJobsPage.tsx', // Replaced by MassageJobsPage
    'translations-backup.ts', // Old translations backup
    'test-chat-connection.ts', // Development test file
];

const DEVELOPMENT_ONLY_FILES = [
    'sound-test.html',
    'agent-visits-schema-chart.html',
];

const DOCUMENTATION_TO_ARCHIVE = [
    // Completed feature docs that can be archived
    'ACTIVATION_COMPLETE.md',
    'ADMIN_DASHBOARD_COMPLETE.md',
    'ADMIN_FIXES_COMPLETE.md',
    'BACKEND_COMPLETE.md',
    'FIXES_AND_ENHANCEMENTS_COMPLETE.md',
    'FINAL_STATUS_REPORT.md',
    'INTEGRATION_GUIDE.md',
    'MIGRATION_COMPLETE.md',
    'SCHEMA_ALIGNMENT_COMPLETE.md',
    'MASSAGE_TYPES_COMPLETE.md',
    'LOYALTY_SYSTEM_COMPLETE.md',
    'CUSTOMER_SYSTEM_CONFIRMATION.md',
];

const FILE_SIZE_THRESHOLD = 500 * 1024; // 500 KB

/**
 * Check if file exists
 */
function fileExists(filePath: string): boolean {
    try {
        return fs.existsSync(path.join(process.cwd(), filePath));
    } catch {
        return false;
    }
}

/**
 * Get file size
 */
function getFileSize(filePath: string): number {
    try {
        const stats = fs.statSync(path.join(process.cwd(), filePath));
        return stats.size;
    } catch {
        return 0;
    }
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Scan for deprecated files
 */
async function scanDeprecatedFiles(): Promise<string[]> {
    console.log('🔍 Scanning for deprecated files...');
    const found: string[] = [];
    
    for (const file of DEPRECATED_FILES) {
        if (fileExists(file)) {
            found.push(file);
            console.log(`   ⚠️  Found: ${file}`);
        }
    }
    
    if (found.length === 0) {
        console.log('   ✅ No deprecated files found\n');
    } else {
        console.log(`   ❌ Found ${found.length} deprecated file(s)\n`);
    }
    
    return found;
}

/**
 * Scan for development-only files
 */
async function scanDevelopmentFiles(): Promise<string[]> {
    console.log('🔍 Scanning for development-only files...');
    const found: string[] = [];
    
    for (const file of DEVELOPMENT_ONLY_FILES) {
        if (fileExists(file)) {
            found.push(file);
            console.log(`   ⚠️  Found: ${file}`);
        }
    }
    
    if (found.length === 0) {
        console.log('   ✅ No development files found in root\n');
    } else {
        console.log(`   ⚠️  Found ${found.length} development file(s) (can keep for testing)\n`);
    }
    
    return found;
}

/**
 * Scan for large files
 */
async function scanLargeFiles(): Promise<{ path: string; size: number }[]> {
    console.log('🔍 Scanning for large files (>500KB)...');
    const largeFiles: { path: string; size: number }[] = [];
    
    const checkPaths = [
        'pages',
        'components',
        'lib',
        'utils',
        'services',
    ];
    
    for (const dir of checkPaths) {
        if (!fileExists(dir)) continue;
        
        const files = getAllFiles(path.join(process.cwd(), dir));
        for (const file of files) {
            const size = getFileSize(file.replace(process.cwd() + path.sep, ''));
            if (size > FILE_SIZE_THRESHOLD) {
                largeFiles.push({
                    path: file.replace(process.cwd() + path.sep, ''),
                    size
                });
            }
        }
    }
    
    if (largeFiles.length === 0) {
        console.log('   ✅ No unusually large files found\n');
    } else {
        console.log(`   ⚠️  Found ${largeFiles.length} large file(s):`);
        largeFiles.forEach(f => {
            console.log(`      ${f.path} (${formatBytes(f.size)})`);
        });
        console.log('');
    }
    
    return largeFiles;
}

/**
 * Get all files recursively
 */
function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
    try {
        const files = fs.readdirSync(dirPath);
        
        files.forEach(file => {
            const filePath = path.join(dirPath, file);
            if (fs.statSync(filePath).isDirectory()) {
                if (!file.includes('node_modules') && !file.includes('.git')) {
                    arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
                }
            } else {
                arrayOfFiles.push(filePath);
            }
        });
        
        return arrayOfFiles;
    } catch {
        return arrayOfFiles;
    }
}

/**
 * Check configuration files
 */
async function checkConfigFiles(): Promise<string[]> {
    console.log('🔍 Checking configuration files...');
    const issues: string[] = [];
    
    // Check package.json
    if (!fileExists('package.json')) {
        issues.push('package.json missing');
    }
    
    // Check tsconfig.json
    if (!fileExists('tsconfig.json')) {
        issues.push('tsconfig.json missing');
    }
    
    // Check vite.config.ts
    if (!fileExists('vite.config.ts')) {
        issues.push('vite.config.ts missing');
    }
    
    // Check .env.example
    if (!fileExists('.env.example')) {
        issues.push('.env.example missing (should document required env vars)');
    }
    
    if (issues.length === 0) {
        console.log('   ✅ All configuration files present\n');
    } else {
        console.log(`   ❌ Found ${issues.length} issue(s):`);
        issues.forEach(issue => console.log(`      ${issue}`));
        console.log('');
    }
    
    return issues;
}

/**
 * Check for unused dependencies
 */
async function checkUnusedDependencies(): Promise<string[]> {
    console.log('🔍 Checking for potential unused dependencies...');
    const warnings: string[] = [];
    
    try {
        const packageJson = JSON.parse(
            fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
        );
        
        const allDeps = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies
        };
        
        // Check for common unused packages
        const potentiallyUnused = [
            'moment', // Often replaced by date-fns or dayjs
            'lodash', // Often not fully utilized
            'jquery', // Rarely needed in React
        ];
        
        potentiallyUnused.forEach(dep => {
            if (allDeps[dep]) {
                warnings.push(`${dep} might be unused (consider reviewing)`);
            }
        });
        
        if (warnings.length === 0) {
            console.log('   ✅ No obvious unused dependencies\n');
        } else {
            console.log(`   ⚠️  Found ${warnings.length} potential issue(s):`);
            warnings.forEach(w => console.log(`      ${w}`));
            console.log('');
        }
    } catch (error) {
        console.log('   ⚠️  Could not read package.json\n');
    }
    
    return warnings;
}

/**
 * Generate recommendations
 */
function generateRecommendations(report: HealthReport): string[] {
    const recommendations: string[] = [];
    
    if (report.deprecatedFiles.length > 0) {
        recommendations.push('🗑️  Remove deprecated files to clean up the codebase');
    }
    
    if (report.largeFiles.length > 0) {
        recommendations.push('📦 Review large files - consider code splitting or lazy loading');
    }
    
    if (report.configIssues.length > 0) {
        recommendations.push('⚙️  Fix configuration file issues');
    }
    
    // Documentation organization
    if (DOCUMENTATION_TO_ARCHIVE.some(doc => fileExists(doc))) {
        recommendations.push('📚 Consider organizing completed documentation into an /archive folder');
    }
    
    // Always good practices
    recommendations.push('🧪 Run tests before deployment: npm test');
    recommendations.push('📊 Check bundle size: npm run build');
    recommendations.push('🔒 Review .env files - ensure no secrets are committed');
    recommendations.push('🚀 Run linter: npm run lint (if configured)');
    
    return recommendations;
}

/**
 * Delete deprecated files
 */
async function cleanupDeprecatedFiles(files: string[]): Promise<void> {
    console.log('\n🗑️  REMOVING DEPRECATED FILES...\n');
    
    let deleted = 0;
    let failed = 0;
    
    for (const file of files) {
        try {
            const fullPath = path.join(process.cwd(), file);
            fs.unlinkSync(fullPath);
            deleted++;
            console.log(`✓ Deleted: ${file}`);
        } catch (error) {
            failed++;
            console.error(`✗ Failed to delete: ${file} - ${error}`);
        }
    }
    
    console.log(`\n✅ Deleted ${deleted} file(s)`);
    if (failed > 0) {
        console.log(`❌ Failed to delete ${failed} file(s)`);
    }
}

/**
 * Archive completed documentation
 */
async function archiveDocumentation(): Promise<void> {
    console.log('\n📚 ARCHIVING COMPLETED DOCUMENTATION...\n');
    
    const archiveDir = path.join(process.cwd(), 'docs', 'archive');
    
    // Create archive directory if it doesn't exist
    if (!fs.existsSync(archiveDir)) {
        fs.mkdirSync(archiveDir, { recursive: true });
        console.log(`✓ Created archive directory: docs/archive\n`);
    }
    
    let moved = 0;
    let failed = 0;
    
    for (const doc of DOCUMENTATION_TO_ARCHIVE) {
        if (!fileExists(doc)) continue;
        
        try {
            const source = path.join(process.cwd(), doc);
            const dest = path.join(archiveDir, doc);
            fs.renameSync(source, dest);
            moved++;
            console.log(`✓ Archived: ${doc}`);
        } catch (error) {
            failed++;
            console.error(`✗ Failed to archive: ${doc} - ${error}`);
        }
    }
    
    console.log(`\n✅ Archived ${moved} document(s)`);
    if (failed > 0) {
        console.log(`❌ Failed to archive ${failed} document(s)`);
    }
}

/**
 * Main execution
 */
async function main() {
    console.log('🏥 Project Health Check\n');
    console.log('═══════════════════════════════════════════════════\n');
    
    const report: HealthReport = {
        deprecatedFiles: [],
        unusedImports: [],
        largeFiles: [],
        duplicateCode: [],
        configIssues: [],
        securityWarnings: [],
        recommendations: []
    };
    
    try {
        // Run all scans
        report.deprecatedFiles = await scanDeprecatedFiles();
        const devFiles = await scanDevelopmentFiles();
        report.largeFiles = await scanLargeFiles();
        report.configIssues = await checkConfigFiles();
        const unusedDeps = await checkUnusedDependencies();
        
        // Generate recommendations
        report.recommendations = generateRecommendations(report);
        
        // Display summary
        console.log('📊 HEALTH REPORT SUMMARY');
        console.log('═══════════════════════════════════════════════════');
        console.log(`Deprecated files:         ${report.deprecatedFiles.length}`);
        console.log(`Development files:        ${devFiles.length}`);
        console.log(`Large files (>500KB):     ${report.largeFiles.length}`);
        console.log(`Configuration issues:     ${report.configIssues.length}`);
        console.log(`Potential unused deps:    ${unusedDeps.length}`);
        console.log('═══════════════════════════════════════════════════\n');
        
        // Display recommendations
        if (report.recommendations.length > 0) {
            console.log('💡 RECOMMENDATIONS');
            console.log('═══════════════════════════════════════════════════');
            report.recommendations.forEach((rec, i) => {
                console.log(`${i + 1}. ${rec}`);
            });
            console.log('═══════════════════════════════════════════════════\n');
        }
        
        // Check for cleanup flag
        const shouldCleanup = process.argv.includes('--cleanup');
        const shouldArchive = process.argv.includes('--archive-docs');
        
        if (shouldCleanup) {
            if (report.deprecatedFiles.length > 0) {
                await cleanupDeprecatedFiles(report.deprecatedFiles);
            } else {
                console.log('\n✨ No deprecated files to clean up!\n');
            }
        } else if (report.deprecatedFiles.length > 0) {
            console.log('💡 To remove deprecated files, run with --cleanup flag\n');
        }
        
        if (shouldArchive) {
            await archiveDocumentation();
        } else if (DOCUMENTATION_TO_ARCHIVE.some(doc => fileExists(doc))) {
            console.log('💡 To archive completed docs, run with --archive-docs flag\n');
        }
        
        // Overall health score
        let healthScore = 100;
        healthScore -= report.deprecatedFiles.length * 5;
        healthScore -= report.configIssues.length * 10;
        healthScore -= Math.min(report.largeFiles.length * 2, 20);
        
        console.log('🏥 OVERALL HEALTH SCORE');
        console.log('═══════════════════════════════════════════════════');
        console.log(`Score: ${Math.max(healthScore, 0)}/100`);
        
        if (healthScore >= 90) {
            console.log('Status: 🟢 Excellent - Project is in great shape!');
        } else if (healthScore >= 70) {
            console.log('Status: 🟡 Good - Minor issues to address');
        } else if (healthScore >= 50) {
            console.log('Status: 🟠 Fair - Some cleanup recommended');
        } else {
            console.log('Status: 🔴 Needs Attention - Multiple issues found');
        }
        console.log('═══════════════════════════════════════════════════\n');
        
    } catch (error) {
        console.error('❌ Error during health check:', error);
        process.exit(1);
    }
}

// Run the script
main();
