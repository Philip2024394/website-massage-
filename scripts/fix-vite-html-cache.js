#!/usr/bin/env node
/**
 * VITE HTML CACHE WORKAROUND
 * 
 * Issue: Vite doesn't detect changes to index.html during builds
 * This script manually patches the built HTML after Vite completes
 * 
 * Usage: Add to package.json build script:
 *   "build": "vite build && node scripts/fix-vite-html-cache.js"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_HTML = path.join(__dirname, '..', 'index.html');
const DIST_HTML = path.join(__dirname, '..', 'dist', 'index.html');

console.log('\n🔧 Applying Vite HTML cache workaround...\n');

try {
  // Read source HTML
  const sourceContent = fs.readFileSync(SOURCE_HTML, 'utf-8');
  
  // Extract splash screen HTML from source
  const splashHTMLMatch = sourceContent.match(/<!-- PWA Splash Screen[\s\S]*?<div id="pwa-splash">[\s\S]*?<\/div>/);
  if (!splashHTMLMatch) {
    console.error('❌ Could not find splash screen HTML in source');
    process.exit(1);
  }
  
  // Extract splash screen CSS from source
  const splashCSSMatch = sourceContent.match(/\/\* PWA Splash Screen[\s\S]*?@keyframes fadeIn[\s\S]*?}\s*}/);
  if (!splashCSSMatch) {
    console.error('❌ Could not find splash screen CSS in source');
    process.exit(1);
  }
  
  // Read built HTML
  let distContent = fs.readFileSync(DIST_HTML, 'utf-8');
  
  // Replace splash HTML
  distContent = distContent.replace(
    /<!-- PWA Splash Screen[\s\S]*?<div id="pwa-splash">[\s\S]*?<\/div>/,
    splashHTMLMatch[0]
  );
  
  // Replace splash CSS
  distContent = distContent.replace(
    /\/\* PWA Splash Screen[\s\S]*?}\s*<\/style>/,
    splashCSSMatch[0] + '\n    </style>'
  );
  
  // Write back to dist
  fs.writeFileSync(DIST_HTML, distContent, 'utf-8');
  
  console.log('✅ Splash screen HTML patched successfully');
  console.log('✅ Splash screen CSS patched successfully\n');
  
} catch (error) {
  console.error('❌ Error applying workaround:', error.message);
  process.exit(1);
}
