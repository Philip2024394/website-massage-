#!/usr/bin/env node
/**
 * Automated Import Path Fixer
 * Fixes all import paths after moving folders to /src
 * 
 * Usage: node scripts/fix-imports-after-move.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Automated Import Path Fixer\n');

// Folders that were moved to /src
const movedFolders = [
  'components',
  'pages',
  'hooks',
  'utils',
  'context',
  'types',
  'lib',
  'services',
  'config',
  'constants',
  'providers',
  'routes',
  'router',
  'handlers',
  'features',
  'modules',
  'translations',
  'schemas',
  'schema',
  'data',
  'styles'
];

// Files to process (all TS/TSX/JS/JSX files)
const extensions = ['.ts', '.tsx', '.js', '.jsx'];

/**
 * Get all files recursively
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    
    // Skip node_modules, dist, and other build artifacts
    if (file === 'node_modules' || file === 'dist' || file === '.git' || 
        file === 'build' || file === 'coverage') {
      return;
    }
    
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else if (extensions.includes(path.extname(file))) {
      arrayOfFiles.push(filePath);
    }
  });
  
  return arrayOfFiles;
}

/**
 * Fix imports in a single file
 */
function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Get the directory of the current file relative to project root
  const fileDir = path.dirname(filePath);
  const isInSrc = filePath.includes(path.sep + 'src' + path.sep);
  
  // Pattern to match import/export statements
  const importRegex = /(?:import|export)(?:\s+(?:type\s+)?(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"]([^'"]+)['"]/g;
  
  let match;
  const replacements = [];
  
  while ((match = importRegex.exec(content)) !== null) {
    const originalPath = match[1];
    
    // Skip if it's not a relative import
    if (!originalPath.startsWith('.')) continue;
    
    // Check if this import references a moved folder
    for (const folder of movedFolders) {
      const patterns = [
        `../${folder}/`,
        `./${folder}/`,
        `../../${folder}/`,
        `../../../${folder}/`,
      ];
      
      for (const pattern of patterns) {
        if (originalPath.includes(pattern)) {
          let newPath = originalPath;
          
          // If file is in /src, adjust relative path
          if (isInSrc) {
            // Calculate how many levels up we need to go
            const fileDepth = fileDir.split(path.sep).filter(p => p).length;
            const srcIndex = fileDir.split(path.sep).indexOf('src');
            const levelsFromSrc = fileDepth - srcIndex - 1;
            
            // Build new relative path
            const upLevels = '../'.repeat(levelsFromSrc);
            newPath = originalPath.replace(pattern, `${upLevels}${folder}/`);
          } else {
            // If file is in root, update to point to /src
            newPath = originalPath.replace(pattern, `./src/${folder}/`);
          }
          
          if (newPath !== originalPath) {
            replacements.push({ old: originalPath, new: newPath });
            modified = true;
          }
          
          break;
        }
      }
    }
  }
  
  // Apply replacements
  replacements.forEach(({ old, new: newPath }) => {
    const oldImport = `'${old}'`;
    const newImport = `'${newPath}'`;
    content = content.replace(new RegExp(oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newImport);
    
    const oldImportDouble = `"${old}"`;
    const newImportDouble = `"${newPath}"`;
    content = content.replace(new RegExp(oldImportDouble.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newImportDouble);
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return replacements.length;
  }
  
  return 0;
}

/**
 * Main execution
 */
async function main() {
  const startTime = Date.now();
  
  console.log('📂 Scanning project files...');
  const files = getAllFiles('.');
  console.log(`   Found ${files.length} files to process\n`);
  
  console.log('🔄 Fixing import paths...');
  let totalFixed = 0;
  let filesModified = 0;
  
  files.forEach(file => {
    const fixed = fixImportsInFile(file);
    if (fixed > 0) {
      filesModified++;
      totalFixed += fixed;
      console.log(`   ✅ ${file}: ${fixed} imports fixed`);
    }
  });
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log('\n📊 Summary:');
  console.log(`   Files scanned: ${files.length}`);
  console.log(`   Files modified: ${filesModified}`);
  console.log(`   Total imports fixed: ${totalFixed}`);
  console.log(`   Duration: ${duration}s`);
  
  if (filesModified === 0) {
    console.log('\n✅ No import paths needed fixing!');
  } else {
    console.log('\n✅ Import paths fixed successfully!');
    console.log('\n⚠️  IMPORTANT: Run "pnpm build" to verify all imports work correctly');
  }
}

main().catch(console.error);
