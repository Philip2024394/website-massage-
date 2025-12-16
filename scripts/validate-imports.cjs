/**
 * IMPORT VALIDATION SCRIPT
 * Validates that all imported files exist to prevent "missing file" errors
 * Run before commits to catch issues early
 * 
 * Usage: node scripts/validate-imports.js
 */

const fs = require('fs');
const path = require('path');

// Color codes for terminal output
const COLORS = {
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[36m',
  RESET: '\x1b[0m'
};

// Configuration
const CONFIG = {
  rootDir: process.cwd(),
  extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
  ignoreDirs: ['node_modules', 'dist', 'build', '.vite', 'deleted', '.git'],
  ignoreFiles: ['.disabled', '-backup.', '-old.'],
};

// Counters
let stats = {
  filesScanned: 0,
  importsChecked: 0,
  missingFiles: [],
  errors: []
};

/**
 * Check if a path should be ignored
 */
const shouldIgnore = (filePath) => {
  // Check ignore directories
  for (const dir of CONFIG.ignoreDirs) {
    if (filePath.includes(`/${dir}/`) || filePath.includes(`\\${dir}\\`)) {
      return true;
    }
  }
  
  // Check ignore file patterns
  for (const pattern of CONFIG.ignoreFiles) {
    if (filePath.includes(pattern)) {
      return true;
    }
  }
  
  return false;
};

/**
 * Resolve import path to actual file path
 */
const resolveImportPath = (importPath, sourceFile) => {
  // Handle path aliases
  if (importPath.startsWith('@/')) {
    importPath = importPath.replace('@/', './');
  } else if (importPath.startsWith('@/components')) {
    importPath = importPath.replace('@/components', './components');
  } else if (importPath.startsWith('@/pages')) {
    importPath = importPath.replace('@/pages', './pages');
  } else if (importPath.startsWith('@/lib')) {
    importPath = importPath.replace('@/lib', './lib');
  } else if (importPath.startsWith('@/hooks')) {
    importPath = importPath.replace('@/hooks', './hooks');
  } else if (importPath.startsWith('@/utils')) {
    importPath = importPath.replace('@/utils', './utils');
  } else if (importPath.startsWith('@/types')) {
    importPath = importPath.replace('@/types', './types');
  }
  
  // Resolve relative to source file
  const sourceDir = path.dirname(sourceFile);
  const resolvedPath = path.resolve(sourceDir, importPath);
  
  // Try with different extensions
  for (const ext of CONFIG.extensions) {
    const fullPath = resolvedPath + ext;
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }
  
  // Try as directory with index file
  for (const ext of CONFIG.extensions) {
    const indexPath = path.join(resolvedPath, `index${ext}`);
    if (fs.existsSync(indexPath)) {
      return indexPath;
    }
  }
  
  // Try exact path (might be a directory or node_modules)
  if (fs.existsSync(resolvedPath)) {
    return resolvedPath;
  }
  
  return null;
};

/**
 * Extract imports from file content
 */
const extractImports = (content) => {
  const imports = [];
  
  // Match: import ... from 'path'
  const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    
    // Skip external packages (no relative/absolute paths)
    if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
      continue;
    }
    
    imports.push(importPath);
  }
  
  // Match: React.lazy(() => import('path'))
  const lazyRegex = /React\.lazy\(\s*\(\)\s*=>\s*import\(['"]([^'"]+)['"]\)/g;
  
  while ((match = lazyRegex.exec(content)) !== null) {
    const importPath = match[1];
    
    if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
      continue;
    }
    
    imports.push(importPath);
  }
  
  // Match: dynamic import()
  const dynamicRegex = /import\(['"]([^'"]+)['"]\)/g;
  
  while ((match = dynamicRegex.exec(content)) !== null) {
    const importPath = match[1];
    
    if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
      continue;
    }
    
    imports.push(importPath);
  }
  
  return imports;
};

/**
 * Validate imports in a single file
 */
const validateFile = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const imports = extractImports(content);
    
    stats.importsChecked += imports.length;
    
    for (const importPath of imports) {
      const resolvedPath = resolveImportPath(importPath, filePath);
      
      if (!resolvedPath) {
        stats.missingFiles.push({
          sourceFile: filePath,
          importPath: importPath
        });
      }
    }
  } catch (error) {
    stats.errors.push({
      file: filePath,
      error: error.message
    });
  }
};

/**
 * Recursively scan directory for TypeScript/JavaScript files
 */
const scanDirectory = (dirPath) => {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (shouldIgnore(fullPath)) {
        continue;
      }
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (['.tsx', '.ts', '.jsx', '.js'].includes(ext)) {
          stats.filesScanned++;
          validateFile(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`${COLORS.RED}Error scanning directory ${dirPath}:${COLORS.RESET}`, error.message);
  }
};

/**
 * Print results
 */
const printResults = () => {
  console.log(`\n${COLORS.BLUE}═══════════════════════════════════════════════${COLORS.RESET}`);
  console.log(`${COLORS.BLUE}  IMPORT VALIDATION RESULTS${COLORS.RESET}`);
  console.log(`${COLORS.BLUE}═══════════════════════════════════════════════${COLORS.RESET}\n`);
  
  console.log(`Files scanned: ${COLORS.YELLOW}${stats.filesScanned}${COLORS.RESET}`);
  console.log(`Imports checked: ${COLORS.YELLOW}${stats.importsChecked}${COLORS.RESET}`);
  console.log(`Missing files: ${stats.missingFiles.length > 0 ? COLORS.RED : COLORS.GREEN}${stats.missingFiles.length}${COLORS.RESET}`);
  console.log(`Errors: ${stats.errors.length > 0 ? COLORS.RED : COLORS.GREEN}${stats.errors.length}${COLORS.RESET}\n`);
  
  if (stats.missingFiles.length > 0) {
    console.log(`${COLORS.RED}❌ MISSING FILES:${COLORS.RESET}\n`);
    
    for (const missing of stats.missingFiles) {
      const relativeSource = path.relative(CONFIG.rootDir, missing.sourceFile);
      console.log(`${COLORS.YELLOW}File:${COLORS.RESET} ${relativeSource}`);
      console.log(`${COLORS.RED}  Missing import:${COLORS.RESET} ${missing.importPath}\n`);
    }
  }
  
  if (stats.errors.length > 0) {
    console.log(`${COLORS.RED}❌ ERRORS:${COLORS.RESET}\n`);
    
    for (const error of stats.errors) {
      const relativeFile = path.relative(CONFIG.rootDir, error.file);
      console.log(`${COLORS.YELLOW}File:${COLORS.RESET} ${relativeFile}`);
      console.log(`${COLORS.RED}  Error:${COLORS.RESET} ${error.error}\n`);
    }
  }
  
  if (stats.missingFiles.length === 0 && stats.errors.length === 0) {
    console.log(`${COLORS.GREEN}✅ All imports are valid!${COLORS.RESET}\n`);
    return true;
  } else {
    console.log(`${COLORS.RED}❌ Import validation failed!${COLORS.RESET}\n`);
    return false;
  }
};

/**
 * Main execution
 */
const main = () => {
  console.log(`${COLORS.BLUE}Starting import validation...${COLORS.RESET}\n`);
  
  const startTime = Date.now();
  
  // Scan main directories
  const dirsToScan = ['pages', 'components', 'lib', 'hooks', 'utils', 'src'];
  
  for (const dir of dirsToScan) {
    const dirPath = path.join(CONFIG.rootDir, dir);
    if (fs.existsSync(dirPath)) {
      scanDirectory(dirPath);
    }
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  const success = printResults();
  
  console.log(`${COLORS.BLUE}Completed in ${duration}s${COLORS.RESET}\n`);
  
  // Exit with error code if validation failed
  process.exit(success ? 0 : 1);
};

// Run validation
main();
