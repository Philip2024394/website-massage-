#!/usr/bin/env node
/**
 * Merge Therapist Dashboard Dist into Main Dist
 * 
 * This script copies the therapist dashboard build output into the main
 * dist folder at /dist/therapist/ so Netlify deploys both apps together.
 * 
 * Usage: node scripts/merge-therapist-dist.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE = path.join(__dirname, '..', 'apps', 'therapist-dashboard', 'dist');
const TARGET = path.join(__dirname, '..', 'dist', 'therapist');

console.log('📦 Merging therapist dashboard dist...');
console.log(`   Source: ${SOURCE}`);
console.log(`   Target: ${TARGET}`);

// Check if source exists
if (!fs.existsSync(SOURCE)) {
  console.error('❌ Error: Therapist dashboard dist not found');
  console.error(`   Expected at: ${SOURCE}`);
  console.error('   Run "cd apps/therapist-dashboard && pnpm run build" first');
  process.exit(1);
}

// Check if target parent exists
const targetParent = path.dirname(TARGET);
if (!fs.existsSync(targetParent)) {
  console.error('❌ Error: Main dist folder not found');
  console.error(`   Expected at: ${targetParent}`);
  console.error('   Run main app build first');
  process.exit(1);
}

// Create target directory
if (!fs.existsSync(TARGET)) {
  fs.mkdirSync(TARGET, { recursive: true });
  console.log('✅ Created target directory');
}

// Copy recursively
function copyRecursive(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  copyRecursive(SOURCE, TARGET);
  console.log('✅ Successfully merged therapist dashboard dist');
  console.log('');
  console.log('📁 Deployment structure:');
  console.log('   /dist/');
  console.log('   ├── index.html          (main app)');
  console.log('   ├── assets/             (main app assets)');
  console.log('   └── therapist/');
  console.log('       ├── index.html      (therapist dashboard)');
  console.log('       └── assets/         (therapist assets)');
  console.log('');
  console.log('🚀 Ready for Netlify deployment!');
} catch (error) {
  console.error('❌ Error copying files:', error.message);
  process.exit(1);
}
