/**
 * Text Scanner & Auto-Translator
 * Crawls app files to find untranslated text and automatically translates it
 * 
 * Features:
 * 1. Scans all .tsx/.ts files for hardcoded text
 * 2. Detects new text that needs translation
 * 3. Auto-translates using Google Translate API
 * 4. Stores translations in Appwrite
 * 5. Generates translation keys automatically
 * 
 * Usage:
 *   node scripts/scanAndTranslate.mjs scan    # Scan and report
 *   node scripts/scanAndTranslate.mjs translate # Scan and auto-translate
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { Client, Databases, ID } from 'appwrite';

// Appwrite configuration
const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);
const DATABASE_ID = '68f76ee1000e64ca8d05';
const TRANSLATIONS_COLLECTION_ID = '675092f60030f16044c6';

// Google Translate API key (set in environment)
const GOOGLE_TRANSLATE_API_KEY = process.env.VITE_GOOGLE_TRANSLATE_API_KEY || '';

// Directories to scan
const SCAN_DIRS = [
    'pages',
    'components',
    'apps/therapist-dashboard/src',
    'apps/massage-dashboard/src',
    'apps/facial-dashboard/src'
];

// Patterns to detect hardcoded text
const TEXT_PATTERNS = [
    // Simple strings in JSX
    />([A-Z][a-zA-Z\s]{3,})</g,
    // Button/label text
    /(?:label|placeholder|title|aria-label)=["']([^"']{3,})["']/g,
    // Direct text in components
    /<span[^>]*>([A-Z][a-zA-Z\s]{3,})<\/span>/g,
    /<button[^>]*>([A-Z][a-zA-Z\s]{3,})<\/button>/g,
    /<h[1-6][^>]*>([A-Z][a-zA-Z\s]{3,})<\/h[1-6]>/g
];

class TextScanner {
    constructor() {
        this.foundTexts = new Set();
        this.fileCount = 0;
        this.translatedCount = 0;
    }

    /**
     * Recursively scan directory for files
     */
    scanDirectory(dir) {
        const files = [];
        
        try {
            const items = readdirSync(dir);
            
            for (const item of items) {
                const fullPath = join(dir, item);
                const stat = statSync(fullPath);
                
                if (stat.isDirectory()) {
                    // Skip node_modules, dist, build
                    if (!['node_modules', 'dist', 'build', '.git'].includes(item)) {
                        files.push(...this.scanDirectory(fullPath));
                    }
                } else if (stat.isFile()) {
                    // Only scan .tsx and .ts files
                    const ext = extname(fullPath);
                    if (['.tsx', '.ts'].includes(ext)) {
                        files.push(fullPath);
                    }
                }
            }
        } catch (error) {
            console.error(`Error scanning ${dir}:`, error.message);
        }
        
        return files;
    }

    /**
     * Extract text from file content
     */
    extractTexts(content, filePath) {
        const texts = new Set();
        
        for (const pattern of TEXT_PATTERNS) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const text = match[1].trim();
                
                // Filter out:
                // - Too short (< 3 chars)
                // - Variable names (camelCase, SCREAMING_CASE)
                // - Numbers only
                // - Already has translation syntax
                if (
                    text.length >= 3 &&
                    !text.match(/^[a-z]+[A-Z]/) && // Not camelCase
                    !text.match(/^[A-Z_]+$/) &&    // Not SCREAMING_CASE
                    !text.match(/^\d+$/) &&         // Not just numbers
                    !text.includes('language ===') && // Not conditional render
                    !text.includes('translationsObject') && // Not translation call
                    !text.includes('t?.') &&        // Not translation function
                    text.match(/[a-zA-Z]/)          // Has letters
                ) {
                    texts.add(text);
                }
            }
        }
        
        return Array.from(texts);
    }

    /**
     * Scan all files and extract hardcoded text
     */
    async scan() {
        console.log('🔍 Scanning files for hardcoded text...\n');
        
        const allFiles = [];
        for (const dir of SCAN_DIRS) {
            try {
                const files = this.scanDirectory(dir);
                allFiles.push(...files);
            } catch (error) {
                console.log(`⚠️  Could not scan ${dir}: ${error.message}`);
            }
        }
        
        console.log(`📁 Found ${allFiles.length} files to scan\n`);
        
        const fileTexts = new Map();
        
        for (const filePath of allFiles) {
            try {
                const content = readFileSync(filePath, 'utf-8');
                const texts = this.extractTexts(content, filePath);
                
                if (texts.length > 0) {
                    fileTexts.set(filePath, texts);
                    texts.forEach(text => this.foundTexts.add(text));
                    this.fileCount++;
                }
            } catch (error) {
                // Skip files that can't be read
            }
        }
        
        return fileTexts;
    }

    /**
     * Translate text using Google Translate API
     */
    async translateText(text, targetLang = 'id') {
        if (!GOOGLE_TRANSLATE_API_KEY) {
            console.error('❌ Google Translate API key not configured');
            return text;
        }

        try {
            const url = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    q: text,
                    source: 'en',
                    target: targetLang,
                    format: 'text'
                })
            });

            const data = await response.json();
            return data.data.translations[0].translatedText;
        } catch (error) {
            console.error(`Translation error: ${error.message}`);
            return text;
        }
    }

    /**
     * Generate translation key from text
     */
    generateKey(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '')
            .substring(0, 50);
    }

    /**
     * Save translation to Appwrite
     */
    async saveTranslation(text, indonesian) {
        try {
            const key = this.generateKey(text);
            
            // Check if exists
            const existing = await databases.listDocuments(
                DATABASE_ID,
                TRANSLATIONS_COLLECTION_ID,
                [`Key="${key}"`]
            );

            if (existing.documents.length > 0) {
                console.log(`  ⏭️  Already exists: ${key}`);
                return;
            }

            // Create new
            await databases.createDocument(
                DATABASE_ID,
                TRANSLATIONS_COLLECTION_ID,
                ID.unique(),
                {
                    language: 'en',
                    Key: key,
                    value: text,
                    lastUpdated: new Date().toISOString(),
                    autoTranslated: false
                }
            );

            await databases.createDocument(
                DATABASE_ID,
                TRANSLATIONS_COLLECTION_ID,
                ID.unique(),
                {
                    language: 'id',
                    Key: key,
                    value: indonesian,
                    lastUpdated: new Date().toISOString(),
                    autoTranslated: true
                }
            );

            console.log(`  ✅ Saved: ${key}`);
            this.translatedCount++;
            
            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
            console.error(`  ❌ Error saving: ${error.message}`);
        }
    }

    /**
     * Auto-translate all found texts
     */
    async translateAll(fileTexts) {
        console.log('\n🌐 Auto-translating texts...\n');
        
        const uniqueTexts = Array.from(this.foundTexts);
        console.log(`📝 Found ${uniqueTexts.length} unique texts to translate\n`);
        
        for (const text of uniqueTexts) {
            console.log(`\n📤 Translating: "${text}"`);
            
            const indonesian = await this.translateText(text, 'id');
            console.log(`  🇮🇩 Indonesian: "${indonesian}"`);
            
            await this.saveTranslation(text, indonesian);
        }
        
        console.log(`\n✨ Translation complete!`);
        console.log(`📊 Translated: ${this.translatedCount} new texts`);
    }

    /**
     * Generate report
     */
    generateReport(fileTexts) {
        console.log('\n📊 SCAN REPORT\n');
        console.log('═'.repeat(60));
        console.log(`Files scanned: ${this.fileCount}`);
        console.log(`Unique texts found: ${this.foundTexts.size}`);
        console.log('═'.repeat(60));
        
        if (fileTexts.size > 0) {
            console.log('\n📝 Texts by file:\n');
            
            for (const [filePath, texts] of fileTexts) {
                console.log(`\n📄 ${filePath}`);
                texts.forEach(text => console.log(`   - "${text}"`));
            }
            
            console.log('\n💡 TIP: Run with "translate" argument to auto-translate these texts:');
            console.log('   node scripts/scanAndTranslate.mjs translate');
        } else {
            console.log('\n✅ No hardcoded text found! All text is translated.');
        }
    }
}

// Main execution
async function main() {
    const mode = process.argv[2] || 'scan';
    const scanner = new TextScanner();
    
    console.log('╔═══════════════════════════════════════════╗');
    console.log('║   Text Scanner & Auto-Translator          ║');
    console.log('╚═══════════════════════════════════════════╝\n');
    
    const fileTexts = await scanner.scan();
    
    if (mode === 'translate') {
        if (!GOOGLE_TRANSLATE_API_KEY) {
            console.error('\n❌ ERROR: Google Translate API key not found!');
            console.error('Set VITE_GOOGLE_TRANSLATE_API_KEY in your environment\n');
            process.exit(1);
        }
        
        await scanner.translateAll(fileTexts);
    } else {
        scanner.generateReport(fileTexts);
    }
}

main().catch(console.error);
