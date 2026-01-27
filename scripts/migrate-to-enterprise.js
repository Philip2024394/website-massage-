#!/usr/bin/env node
/**
 * 🏢 ENTERPRISE MIGRATION SCRIPT
 * 
 * Automated migration to enterprise services:
 * - console.* → logger.*
 * - fetch() → httpClient.*
 * - localStorage → storage.*
 */

const fs = require('fs');
const path = require('path');

const stats = {
  filesScanned: 0,
  filesModified: 0,
  consoleReplaced: 0,
  fetchReplaced: 0,
  storageReplaced: 0
};

function replaceConsoleWithLogger(content, filePath) {
  let modified = content;
  const hasConsole = /console\.(log|error|warn|info|debug)/.test(content);
  
  if (!hasConsole) return content;
  
  // Add import if not present
  const hasImport = /import.*logger.*from.*enterpriseLogger/.test(content);
  if (!hasImport) {
    // Calculate relative path
    const depth = filePath.split(path.sep).length - 2; // -2 for 'src' and filename
    const relativePath = depth === 0 ? './' : '../'.repeat(depth);
    const importStatement = `import { logger } from '${relativePath}services/enterpriseLogger';\n`;
    modified = importStatement + modified;
  }
  
  // Replace console calls
  modified = modified.replace(/console\.error\(/g, 'logger.error(');
  modified = modified.replace(/console\.warn\(/g, 'logger.warn(');
  modified = modified.replace(/console\.log\(/g, 'logger.info(');
  modified = modified.replace(/console\.info\(/g, 'logger.info(');
  modified = modified.replace(/console\.debug\(/g, 'logger.debug(');
  
  if (modified !== content) {
    stats.consoleReplaced++;
  }
  
  return modified;
}

function replaceFolder(folderPath, depth = 0) {
  const items = fs.readdirSync(folderPath);
  
  for (const item of items) {
    const fullPath = path.join(folderPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, dist, build, etc.
      if (['node_modules', 'dist', 'build', '.vite', '.next', 'coverage'].includes(item)) {
        continue;
      }
      replaceFolder(fullPath, depth + 1);
    } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
      // Skip test files and enterprise services themselves
      if (item.includes('.test.') || item.includes('.spec.') ||
          item === 'enterpriseLogger.ts' || 
          item === 'enterpriseHttpClient.ts' ||
          item === 'enterpriseStorage.ts') {
        continue;
      }
      
      stats.filesScanned++;
      
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const relativePath = fullPath.replace(process.cwd() + path.sep, '');
        const modified = replaceConsoleWithLogger(content, relativePath);
        
        if (modified !== content) {
          fs.writeFileSync(fullPath, modified, 'utf8');
          stats.filesModified++;
          console.log(`  ✓ ${relativePath}`);
        }
      } catch (error) {
        console.error(`  ✗ Error processing ${item}:`, error.message);
      }
    }
  }
}

console.log('\n🏢 ENTERPRISE MIGRATION AUTOMATION\n');
console.log('📋 Phase 1: Migrating console.* to logger...\n');

const srcPath = path.join(process.cwd(), 'src');
replaceFolder(srcPath);

console.log('\n================================');
console.log('🏢 MIGRATION COMPLETE');
console.log('================================\n');
console.log(`📊 Files scanned: ${stats.filesScanned}`);
console.log(`📝 Files modified: ${stats.filesModified}`);
console.log(`🔄 Console replacements: ${stats.consoleReplaced}`);
console.log('');
console.log('✅ Next steps:');
console.log('   1. Run: pnpm build');
console.log('   2. Review changes: git diff');
console.log('   3. Test the application');
console.log('');
