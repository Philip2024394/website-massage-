/**
 * 🔧 MOBILE SCROLL ARCHITECTURE FIXER
 * 
 * Scans and fixes common scroll-breaking patterns across the codebase.
 * Run this to identify all components that need mobile scroll fixes.
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

class MobileScrollFixer {
  constructor() {
    this.violations = [];
    this.fixes = [];
  }

  // Patterns that break mobile scroll
  getProblematicPatterns() {
    return [
      {
        pattern: /className="[^"]*h-screen[^"]*"/g,
        description: 'h-screen class breaks mobile keyboard',
        fix: 'Replace with min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] or remove'
      },
      {
        pattern: /className="[^"]*min-h-screen[^"]*"/g,
        description: 'min-h-screen class breaks mobile keyboard',
        fix: 'Replace with min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))]'
      },
      {
        pattern: /height:\s*['"`]100vh['"`]/g,
        description: 'height: 100vh breaks mobile keyboard',
        fix: 'Replace with calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))'
      },
      {
        pattern: /minHeight:\s*['"`]100vh['"`]/g,
        description: 'minHeight: 100vh breaks mobile keyboard',
        fix: 'Replace with calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))'
      },
      {
        pattern: /overflow-y:\s*['"`](auto|scroll)['"`]/g,
        description: 'overflow-y auto/scroll violates global scroll authority',
        fix: 'Remove or replace with visible - let body handle all scrolling'
      },
      {
        pattern: /overflow-x:\s*['"`](auto|scroll)['"`]/g,
        description: 'overflow-x auto/scroll violates global scroll authority',
        fix: 'Remove or replace with visible'
      },
      {
        pattern: /overflowY:\s*['"`](auto|scroll)['"`]/g,
        description: 'overflowY auto/scroll violates global scroll authority',
        fix: 'Remove or replace with visible'
      },
      {
        pattern: /overflowX:\s*['"`](auto|scroll)['"`]/g,
        description: 'overflowX auto/scroll violates global scroll authority',
        fix: 'Remove or replace with visible'
      },
      {
        pattern: /body\.style\.overflow\s*=\s*['"`]hidden['"`]/g,
        description: 'Setting body overflow to hidden breaks mobile scroll',
        fix: 'Never set body overflow - violates global scroll architecture'
      },
      {
        pattern: /html\.style\.overflow\s*=\s*['"`]hidden['"`]/g,
        description: 'Setting html overflow to hidden breaks mobile scroll',
        fix: 'Never set html overflow - violates global scroll architecture'
      },
      {
        pattern: /className="[^"]*overflow-hidden[^"]*"/g,
        description: 'overflow-hidden class can break scroll in containers',
        fix: 'Review if this container needs to allow content overflow for mobile'
      }
    ];
  }

  scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const patterns = this.getProblematicPatterns();
      const fileViolations = [];

      patterns.forEach(({ pattern, description, fix }) => {
        const matches = [...content.matchAll(pattern)];
        if (matches.length > 0) {
          matches.forEach(match => {
            const lineNumber = content.substring(0, match.index).split('\n').length;
            fileViolations.push({
              file: filePath,
              line: lineNumber,
              pattern: match[0],
              description,
              fix
            });
          });
        }
      });

      return fileViolations;
    } catch (error) {
      console.error(`Error scanning ${filePath}:`, error.message);
      return [];
    }
  }

  scanDirectory(directory = 'src') {
    console.log('🔍 Scanning for mobile scroll violations...');
    
    const patterns = [
      `${directory}/**/*.tsx`,
      `${directory}/**/*.ts`,
      `${directory}/**/*.jsx`,
      `${directory}/**/*.js`
    ];

    const files = patterns.reduce((acc, pattern) => {
      return acc.concat(glob.sync(pattern));
    }, []);

    let totalViolations = 0;

    files.forEach(file => {
      const violations = this.scanFile(file);
      if (violations.length > 0) {
        this.violations.push(...violations);
        totalViolations += violations.length;
        
        console.log(`\n📄 ${file}:`);
        violations.forEach(violation => {
          console.log(`  ⚠️  Line ${violation.line}: ${violation.description}`);
          console.log(`     Pattern: ${violation.pattern}`);
          console.log(`     Fix: ${violation.fix}`);
        });
      }
    });

    return {
      files: files.length,
      violations: totalViolations,
      details: this.violations
    };
  }

  generateReport() {
    const results = this.scanDirectory();
    
    console.log('\n📊 MOBILE SCROLL ARCHITECTURE VIOLATION REPORT');
    console.log('================================================');
    console.log(`Files scanned: ${results.files}`);
    console.log(`Violations found: ${results.violations}`);
    
    if (results.violations > 0) {
      console.log('\n🚨 CRITICAL FIXES NEEDED:');
      console.log('1. Replace h-screen/min-h-screen with mobile-safe alternatives');
      console.log('2. Remove overflow: auto/scroll from containers (let body scroll)');
      console.log('3. Never set body/html overflow to hidden');
      console.log('4. Use calc(100vh - env(safe-area-inset-*)) instead of 100vh');
      
      // Group violations by type
      const groupedViolations = {};
      this.violations.forEach(violation => {
        if (!groupedViolations[violation.description]) {
          groupedViolations[violation.description] = [];
        }
        groupedViolations[violation.description].push(violation);
      });
      
      console.log('\n📋 VIOLATIONS BY TYPE:');
      Object.entries(groupedViolations).forEach(([type, violations]) => {
        console.log(`\n${type}: ${violations.length} instances`);
        const files = [...new Set(violations.map(v => v.file))];
        console.log(`   Files affected: ${files.length}`);
        files.slice(0, 5).forEach(file => {
          console.log(`   - ${file}`);
        });
        if (files.length > 5) {
          console.log(`   ... and ${files.length - 5} more`);
        }
      });
    } else {
      console.log('\n✅ No mobile scroll violations found! Architecture is compliant.');
    }
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Fix violations using the provided guidance');
    console.log('2. Test mobile scrolling on actual devices');
    console.log('3. Run scroll lock detection utility in development');
    console.log('4. Ensure chat windows and modals work with global scroll');
    
    return results;
  }

  // Generate automated fixes for common patterns
  generateFixes(filePath, violations) {
    const fixes = [];
    
    violations.forEach(violation => {
      switch (violation.description) {
        case 'h-screen class breaks mobile keyboard':
          fixes.push({
            search: violation.pattern,
            replace: violation.pattern.replace('h-screen', 'min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))]'),
            type: 'className'
          });
          break;
          
        case 'min-h-screen class breaks mobile keyboard':
          fixes.push({
            search: violation.pattern,
            replace: violation.pattern.replace('min-h-screen', 'min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))]'),
            type: 'className'
          });
          break;
          
        case 'height: 100vh breaks mobile keyboard':
        case 'minHeight: 100vh breaks mobile keyboard':
          fixes.push({
            search: violation.pattern,
            replace: violation.pattern.replace('100vh', 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))'),
            type: 'style'
          });
          break;
      }
    });
    
    return fixes;
  }
}

// Run the scanner
const fixer = new MobileScrollFixer();
const results = fixer.generateReport();

// Export for programmatic use
export {
  MobileScrollFixer,
  results
};