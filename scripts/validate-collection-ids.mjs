#!/usr/bin/env node
/**
 * APPWRITE COLLECTION ID VALIDATOR
 * 
 * This script validates that all Appwrite collection IDs follow proper naming conventions
 * to prevent 400/404 errors caused by spaces in collection names.
 * 
 * Run: node scripts/validate-collection-ids.mjs
 */

import fs from 'fs';
import path from 'path';

const CONFIG_PATH = './lib/appwrite.config.ts';

function validateCollectionIds() {
    console.log('🔍 Validating Appwrite collection IDs...\n');
    
    if (!fs.existsSync(CONFIG_PATH)) {
        console.error(`❌ Config file not found: ${CONFIG_PATH}`);
        process.exit(1);
    }
    
    const configContent = fs.readFileSync(CONFIG_PATH, 'utf8');
    
    // Extract collection definitions
    const collectionsMatch = configContent.match(/collections:\s*{([^}]+)}/s);
    if (!collectionsMatch) {
        console.error('❌ Could not find collections object in config');
        process.exit(1);
    }
    
    const collectionsContent = collectionsMatch[1];
    const lines = collectionsContent.split('\n');
    
    let hasErrors = false;
    let validCount = 0;
    let disabledCount = 0;
    
    lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        
        // Skip comments and empty lines
        if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('*')) {
            return;
        }
        
        // Match collection definitions: key: 'value',
        const match = trimmedLine.match(/(\w+):\s*'([^']*)',?\s*(\/\/.*)?/);
        if (!match) return;
        
        const [, key, value, comment] = match;
        
        // Skip disabled collections (empty string values)
        if (value === '') {
            console.log(`⚪ ${key}: DISABLED (empty string)`);
            disabledCount++;
            return;
        }
        
        // Check for spaces in collection ID
        if (value.includes(' ')) {
            console.log(`❌ ${key}: "${value}" - CONTAINS SPACES! This will cause 400/404 errors.`);
            console.log(`   💡 Fix: Change to "${value.replace(/\s+/g, '_')}"`);
            hasErrors = true;
        } else {
            console.log(`✅ ${key}: "${value}"`);
            validCount++;
        }
    });
    
    console.log('\n📊 VALIDATION SUMMARY:');
    console.log(`✅ Valid collections: ${validCount}`);
    console.log(`⚪ Disabled collections: ${disabledCount}`);
    console.log(`❌ Invalid collections: ${hasErrors ? 'FOUND ERRORS' : '0'}`);
    
    if (hasErrors) {
        console.log('\n🚨 CRITICAL: Fix collection ID spaces before deployment!');
        console.log('📖 See THERAPIST_MENU_SYSTEM_SAFEGUARDS.md for details');
        process.exit(1);
    } else {
        console.log('\n🎉 All collection IDs are valid!');
    }
}

// Additional checks
function validateServiceImports() {
    console.log('\n🔍 Checking therapist menu service integration...\n');
    
    const filesToCheck = [
        './components/TherapistCard.tsx',
        './apps/therapist-dashboard/src/pages/TherapistMenu.tsx',
        './lib/appwriteService.LEGACY.ts'
    ];
    
    let importIssues = 0;
    
    filesToCheck.forEach(filePath => {
        if (!fs.existsSync(filePath)) {
            console.log(`⚪ ${filePath}: FILE NOT FOUND (skipping)`);
            return;
        }
        
        const content = fs.readFileSync(filePath, 'utf8');
        
        if (content.includes('therapistMenusService')) {
            console.log(`✅ ${filePath}: Uses therapistMenusService`);
        } else {
            console.log(`⚪ ${filePath}: No therapistMenusService usage`);
        }
        
        // Check for direct collection access with spaces (ignore comments)
        const lines = content.split('\n');
        lines.forEach((line, lineNum) => {
            const trimmedLine = line.trim();
            // Skip comments
            if (trimmedLine.startsWith('//') || trimmedLine.startsWith('*') || trimmedLine.startsWith('/*')) {
                return;
            }
            
            if (line.includes('Therapist Menus') || line.includes('"Therapist Menus"') || line.includes("'Therapist Menus'")) {
                console.log(`❌ ${filePath}:${lineNum + 1}: CONTAINS HARDCODED COLLECTION WITH SPACES!`);
                console.log(`   Line: ${line.trim()}`);
                importIssues++;
            }
        });
    });
    
    if (importIssues > 0) {
        console.log('\n🚨 Found hardcoded collection names with spaces!');
        process.exit(1);
    } else {
        console.log('\n✅ No hardcoded collection issues found');
    }
}

// Run validations
try {
    validateCollectionIds();
    validateServiceImports();
    
    console.log('\n🛡️ All safeguards validated successfully!');
    console.log('🔗 Menu data flow: Dashboard → therapistMenusService → therapist_menus → TherapistCard');
    
} catch (error) {
    console.error('\n💥 Validation failed:', error.message);
    process.exit(1);
}