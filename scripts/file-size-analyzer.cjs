const fs = require('fs');
const path = require('path');

console.log('🔍 Analyzing file sizes...\n');

function getFilesRecursive(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = [];
  
  function scan(currentDir) {
    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        
        if (entry.isDirectory()) {
          // Skip these directories
          if (['node_modules', 'dist', 'build', '.vite', '.git', 'coverage'].includes(entry.name)) {
            continue;
          }
          scan(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (extensions.includes(ext)) {
            const stats = fs.statSync(fullPath);
            const relativePath = path.relative(process.cwd(), fullPath);
            files.push({
              path: relativePath,
              size: stats.size,
              sizeKB: Math.round(stats.size / 1024 * 100) / 100
            });
          }
        }
      }
    } catch (err) {
      console.warn(`Warning: Could not read directory ${currentDir}:`, err.message);
    }
  }
  
  scan(dir);
  return files;
}

function categorizeFile(filePath) {
  const basename = path.basename(filePath);
  
  if (filePath.includes('components/') || /^[A-Z].*\.(tsx|jsx)$/.test(basename)) {
    return 'component';
  }
  if (filePath.includes('pages/') || basename.includes('Page')) {
    return 'page';
  }
  if (filePath.includes('services/') || basename.includes('service') || basename.includes('Service')) {
    return 'service';
  }
  if (filePath.includes('hooks/') || basename.startsWith('use')) {
    return 'hook';
  }
  if (basename.includes('type') || basename === 'types') {
    return 'type';
  }
  if (basename.includes('config')) {
    return 'config';
  }
  if (filePath.includes('utils/') || filePath.includes('lib/')) {
    return 'utility';
  }
  
  return 'other';
}

function analyzeFiles() {
  const files = getFilesRecursive(process.cwd());
  
  // Add analysis data
  const analyzed = files.map(file => {
    const category = categorizeFile(file.path);
    let maxSize = 15 * 1024; // Default 15KB
    
    switch (category) {
      case 'component': maxSize = 15 * 1024; break;
      case 'service': maxSize = 20 * 1024; break;
      case 'page': maxSize = 25 * 1024; break;
      case 'hook': maxSize = 8 * 1024; break;
      case 'utility': maxSize = 10 * 1024; break;
      case 'type': maxSize = 15 * 1024; break;
      case 'config': maxSize = 12 * 1024; break;
    }
    
    let status = 'good';
    if (file.size > maxSize) {
      status = 'error';
    } else if (file.size > maxSize * 0.8) {
      status = 'warning';
    }
    
    return { ...file, category, maxSize, status };
  });
  
  // Sort by size
  analyzed.sort((a, b) => b.size - a.size);
  
  const errors = analyzed.filter(f => f.status === 'error');
  const warnings = analyzed.filter(f => f.status === 'warning');
  const large = analyzed.filter(f => f.sizeKB > 50);
  
  console.log('📊 FILE SIZE ANALYSIS REPORT');
  console.log('='.repeat(50));
  
  console.log(`\n📈 SUMMARY:`);
  console.log(`Total files analyzed: ${analyzed.length}`);
  console.log(`🔴 Files requiring immediate action: ${errors.length}`);
  console.log(`🟡 Files needing attention: ${warnings.length}`);
  console.log(`⚡ Large files (>50KB): ${large.length}`);
  
  if (large.length > 0) {
    console.log(`\n🐌 VS CODE PERFORMANCE IMPACT:`);
    console.log(`${large.length} files may cause VS Code slowdowns`);
  }
  
  console.log(`\n🎯 TOP 15 LARGEST FILES:`);
  console.log('─'.repeat(80));
  
  analyzed.slice(0, 15).forEach((file, index) => {
    const icon = file.status === 'error' ? '🔴' : file.status === 'warning' ? '🟡' : '🟢';
    console.log(`${index + 1}. ${icon} ${file.path}`);
    console.log(`   Size: ${file.sizeKB}KB | Category: ${file.category} | Limit: ${Math.round(file.maxSize/1024)}KB`);
    console.log();
  });
  
  if (errors.length > 0) {
    console.log(`\n🚨 FILES REQUIRING IMMEDIATE REFACTORING:`);
    console.log('─'.repeat(80));
    
    errors.forEach((file, index) => {
      console.log(`${index + 1}. ${file.path} (${file.sizeKB}KB)`);
      console.log(`   Exceeds ${file.category} limit of ${Math.round(file.maxSize/1024)}KB`);
      
      // Recommendations based on category
      switch (file.category) {
        case 'component':
          console.log(`   💡 Recommendations:`);
          console.log(`   • Extract sub-components for reusability`);
          console.log(`   • Move business logic to custom hooks`);
          console.log(`   • Extract utility functions to separate files`);
          break;
        case 'service':
          console.log(`   💡 Recommendations:`);
          console.log(`   • Split by domain boundaries (auth, booking, payment)`);
          console.log(`   • Create feature-specific service modules`);
          console.log(`   • Extract common utilities to shared module`);
          break;
        case 'page':
          console.log(`   💡 Recommendations:`);
          console.log(`   • Extract sections into separate components`);
          console.log(`   • Move data fetching to custom hooks`);
          console.log(`   • Split complex forms into smaller components`);
          break;
      }
      console.log();
    });
  }
  
  console.log(`\n🚀 NEXT STEPS:`);
  console.log('─'.repeat(40));
  console.log('1. Start with the largest files first');
  console.log('2. Follow domain-driven design principles');
  console.log('3. Use component composition patterns');
  console.log('4. Implement proper separation of concerns');
  console.log('5. Add pre-commit hooks to prevent regression');
  
  // Save report
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: analyzed.length,
      errors: errors.length,
      warnings: warnings.length,
      averageSize: Math.round(analyzed.reduce((sum, f) => sum + f.size, 0) / analyzed.length / 1024 * 100) / 100
    },
    files: analyzed
  };
  
  fs.writeFileSync('file-size-report.json', JSON.stringify(reportData, null, 2));
  console.log(`\n📄 Detailed report saved to: file-size-report.json`);
}

analyzeFiles();