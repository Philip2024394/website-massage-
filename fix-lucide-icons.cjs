const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Map of invalid icons to valid ones
const iconMap = {
  'Accessibility': 'Shield',
  'BarChart3': 'BarChart',
  'ChevronDown': 'ChevronDown', // Actually valid in newer versions
  'ChevronUp': 'ChevronUp', // Actually valid in newer versions  
  'ChevronRight': 'ChevronRight', // Actually valid in newer versions
  'TrendingDown': 'TrendingDown', // Actually valid in newer versions
  'Volume2': 'Volume',
  'Palette': 'Brush',
  'Keyboard': 'Hash',
  'Monitor': 'Computer',
  'Smartphone': 'Phone',
  'Tablet': 'Phone',
  'MousePointer': 'Cursor',
  'VolumeX': 'VolumeOff',
  'Contrast': 'Palette',
  'Camera': 'Camera',
  'Wrench': 'Settings',
  'PieChart': 'PieChart',
  'Lightbulb': 'Lightbulb',
  'Percent': 'Percent',
  'ArrowUpDown': 'ArrowUpDown'
};

// Get all TypeScript and TSX files
function getAllTsFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      getAllTsFiles(fullPath, files);
    } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Fix lucide-react imports in a file
function fixLucideImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let updated = content;
  let hasChanges = false;
  
  // Find import statements from lucide-react
  const lucideImportRegex = /import\s*{\s*([^}]+)\s*}\s*from\s*['"]lucide-react['"];?/g;
  
  updated = updated.replace(lucideImportRegex, (match, imports) => {
    const importsList = imports.split(',').map(imp => imp.trim());
    const fixedImports = importsList.map(imp => {
      // Remove any aliases and whitespace
      const cleanImp = imp.split(' as ')[0].trim();
      if (iconMap[cleanImp]) {
        hasChanges = true;
        console.log(`Fixing ${cleanImp} -> ${iconMap[cleanImp]} in ${filePath}`);
        return imp.replace(cleanImp, iconMap[cleanImp]);
      }
      return imp;
    });
    
    return match.replace(imports, fixedImports.join(', '));
  });
  
  // Also fix usages in the code
  Object.keys(iconMap).forEach(oldIcon => {
    const newIcon = iconMap[oldIcon];
    const usageRegex = new RegExp(`<${oldIcon}(\\s|>)`, 'g');
    if (usageRegex.test(updated)) {
      updated = updated.replace(usageRegex, `<${newIcon}$1`);
      hasChanges = true;
      console.log(`Fixing usage ${oldIcon} -> ${newIcon} in ${filePath}`);
    }
  });
  
  if (hasChanges) {
    fs.writeFileSync(filePath, updated);
    console.log(`Updated ${filePath}`);
  }
  
  return hasChanges;
}

// Main execution
console.log('Starting lucide-react icon fixes...');

const tsFiles = getAllTsFiles('./src');
let totalFixed = 0;

tsFiles.forEach(file => {
  if (fixLucideImports(file)) {
    totalFixed++;
  }
});

console.log(`Fixed ${totalFixed} files with lucide-react import issues`);