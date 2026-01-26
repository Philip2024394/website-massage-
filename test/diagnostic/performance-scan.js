// Performance optimization script to reduce resource usage
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting performance optimization...');

// Check for heavy imports and large files
const checkFileSize = (filePath) => {
  try {
    const stats = fs.statSync(filePath);
    return Math.round(stats.size / 1024); // Size in KB
  } catch {
    return 0;
  }
};

// Check dist assets
const distPath = path.join(process.cwd(), 'dist/assets');
if (fs.existsSync(distPath)) {
  const files = fs.readdirSync(distPath)
    .filter(f => f.endsWith('.js'))
    .map(f => ({
      name: f,
      sizeKB: checkFileSize(path.join(distPath, f))
    }))
    .sort((a, b) => b.sizeKB - a.sizeKB);

  console.log('\n📊 Largest JavaScript bundles:');
  files.slice(0, 5).forEach(f => {
    console.log(`   ${f.name}: ${f.sizeKB}KB`);
  });

  // Flag problematic bundles
  files.forEach(f => {
    if (f.sizeKB > 500) {
      console.log(`⚠️  Large bundle detected: ${f.name} (${f.sizeKB}KB)`);
    }
  });
}

// Check for common performance issues
const checkFile = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  // Check for performance anti-patterns
  if (content.includes('useEffect(() => {')) {
    const effectCount = (content.match(/useEffect\(/g) || []).length;
    if (effectCount > 10) {
      issues.push(`High useEffect count: ${effectCount}`);
    }
  }
  
  if (content.includes('setInterval') && !content.includes('clearInterval')) {
    issues.push('Potential memory leak: setInterval without cleanup');
  }
  
  if (content.includes('console.log') || content.includes('console.error')) {
    const logCount = (content.match(/console\.(log|error|warn)/g) || []).length;
    if (logCount > 5) {
      issues.push(`High console output: ${logCount} statements`);
    }
  }
  
  return issues;
};

// Check key files
const keyFiles = [
  'pages/HomePage.tsx',
  'components/PersistentChatWindow.tsx',
  'components/BookingCountdown.tsx'
];

keyFiles.forEach(file => {
  const issues = checkFile(file);
  if (issues.length > 0) {
    console.log(`\n⚠️  Issues in ${file}:`);
    issues.forEach(issue => console.log(`   - ${issue}`));
  }
});

console.log('\n✅ Performance scan complete!');
console.log('\n💡 Recommendations:');
console.log('   1. Remove debug components from production');
console.log('   2. Lazy load heavy components');
console.log('   3. Clean up unused console statements');
console.log('   4. Add resource preloading hints');
console.log('   5. Enable gzip compression');