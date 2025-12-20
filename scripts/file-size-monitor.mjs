#!/usr/bin/env node

/**
 * File Size Monitor
 * Simple JavaScript version for monitoring file sizes
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// File size standards (Facebook/Amazon based)
const FILE_SIZE_STANDARDS = {
  SOURCE_FILES: {
    COMPONENT_MAX: 15 * 1024, // 15KB
    SERVICE_MAX: 20 * 1024,   // 20KB
    UTILITY_MAX: 10 * 1024,   // 10KB
    PAGE_MAX: 25 * 1024,      // 25KB
    HOOK_MAX: 8 * 1024,       // 8KB
    TYPE_MAX: 15 * 1024,      // 15KB
    CONFIG_MAX: 12 * 1024,    // 12KB
    WARNING_THRESHOLD: 0.8,
  },
  VSCODE_LIMITS: {
    EDITOR_WARNING: 50 * 1024,
    INTELLISENSE_WARNING: 75 * 1024,
    SYNTAX_WARNING: 100 * 1024,
  }
};

const INDUSTRY_BENCHMARKS = {
  FACEBOOK: { averageComponent: 12, averageService: 15 },
  AMAZON: { averageComponent: 10, averageService: 12 },
  GOOGLE: { averageComponent: 8, averageService: 10 }
};

class FileSizeMonitor {
  constructor(rootDir = process.cwd()) {
    this.rootDir = rootDir;
    this.results = [];
  }

  async analyze() {
    console.log('🔍 Analyzing file sizes...\n');

    // Get all source files
    const patterns = [
      '**/*.{ts,tsx,js,jsx}',
      '!node_modules/**',
      '!dist/**', 
      '!build/**',
      '!.vite/**',
      '!coverage/**'
    ];

    try {
      for (const pattern of patterns) {
        const files = await glob(pattern, { cwd: this.rootDir, nodir: true });
        
        for (const file of files) {
          await this.analyzeFile(file);
        }
      }

      this.generateReport();
    } catch (error) {
      console.error('Error analyzing files:', error);
    }
  }

  async analyzeFile(relativePath) {
    try {
      const fullPath = path.join(this.rootDir, relativePath);
      const stats = fs.statSync(fullPath);
      const size = stats.size;
      const sizeKB = Math.round(size / 1024 * 100) / 100;

      const category = this.categorizeFile(relativePath);
      const analysis = this.analyzeFileSize(size, category, relativePath);

      this.results.push({
        filePath: relativePath,
        size,
        sizeKB,
        category,
        ...analysis
      });
    } catch (error) {
      console.warn(`Warning: Could not analyze ${relativePath}:`, error.message);
    }
  }

  categorizeFile(filePath) {
    const ext = path.extname(filePath);
    const basename = path.basename(filePath, ext);
    
    // Component files
    if (filePath.includes('components/') || 
        filePath.includes('Component') ||
        /^[A-Z].*\.(tsx|jsx)$/.test(path.basename(filePath))) {
      return 'component';
    }
    
    // Page files
    if (filePath.includes('pages/') || 
        filePath.includes('Page') ||
        basename.endsWith('Page')) {
      return 'page';
    }
    
    // Service files
    if (filePath.includes('services/') || 
        basename.includes('service') ||
        basename.includes('Service') ||
        basename.includes('api')) {
      return 'service';
    }
    
    // Hook files
    if (filePath.includes('hooks/') || basename.startsWith('use')) {
      return 'hook';
    }
    
    // Type files
    if (basename.includes('type') || basename.includes('Type') || 
        basename === 'types' || filePath.includes('types/')) {
      return 'type';
    }
    
    // Configuration files
    if (basename.includes('config') || basename.includes('Config')) {
      return 'config';
    }
    
    // Utility files
    if (filePath.includes('utils/') || filePath.includes('lib/') ||
        basename.includes('util') || basename.includes('helper')) {
      return 'utility';
    }
    
    return 'other';
  }

  analyzeFileSize(size, category, filePath) {
    const standards = FILE_SIZE_STANDARDS.SOURCE_FILES;
    let maxSize;
    let benchmark = '';

    // Get category-specific limits
    switch (category) {
      case 'component':
        maxSize = standards.COMPONENT_MAX;
        benchmark = `FB: ${INDUSTRY_BENCHMARKS.FACEBOOK.averageComponent}KB, AMZ: ${INDUSTRY_BENCHMARKS.AMAZON.averageComponent}KB`;
        break;
      case 'service':
        maxSize = standards.SERVICE_MAX;
        benchmark = `FB: ${INDUSTRY_BENCHMARKS.FACEBOOK.averageService}KB, AMZ: ${INDUSTRY_BENCHMARKS.AMAZON.averageService}KB`;
        break;
      case 'page':
        maxSize = standards.PAGE_MAX;
        break;
      case 'hook':
        maxSize = standards.HOOK_MAX;
        break;
      case 'type':
        maxSize = standards.TYPE_MAX;
        break;
      case 'config':
        maxSize = standards.CONFIG_MAX;
        break;
      case 'utility':
        maxSize = standards.UTILITY_MAX;
        break;
      default:
        maxSize = standards.COMPONENT_MAX;
    }

    const warningThreshold = maxSize * standards.WARNING_THRESHOLD;
    
    let status;
    let recommendation;

    if (size > maxSize) {
      status = 'error';
      recommendation = this.getRefactoringRecommendation(category, size, filePath);
    } else if (size > warningThreshold) {
      status = 'warning';
      recommendation = 'Consider refactoring before it grows larger';
    } else {
      status = 'good';
    }

    return { status, recommendation, benchmark };
  }

  getRefactoringRecommendation(category, size, filePath) {
    const sizeKB = Math.round(size / 1024);
    
    const recommendations = [`🚨 File is ${sizeKB}KB - needs immediate refactoring`];

    switch (category) {
      case 'component':
        recommendations.push(
          '• Extract sub-components for reusability',
          '• Move business logic to custom hooks',
          '• Extract utility functions to separate files',
          '• Consider using composition pattern'
        );
        break;
        
      case 'service':
        recommendations.push(
          '• Split by domain boundaries (user, booking, payment)',
          '• Create feature-specific service modules',
          '• Extract common utilities to shared module',
          '• Use dependency injection for better separation'
        );
        break;
        
      case 'page':
        recommendations.push(
          '• Extract sections into separate components',
          '• Move data fetching to custom hooks',
          '• Split complex forms into smaller components',
          '• Use lazy loading for heavy sections'
        );
        break;
    }

    return recommendations.join('\n');
  }

  generateReport() {
    // Sort by size descending
    this.results.sort((a, b) => b.size - a.size);
    
    const errors = this.results.filter(r => r.status === 'error');
    const warnings = this.results.filter(r => r.status === 'warning');
    const large = this.results.filter(r => r.sizeKB > 50);

    console.log('📊 FILE SIZE ANALYSIS REPORT');
    console.log('='.repeat(50));
    
    // Summary
    console.log(`\n📈 SUMMARY:`);
    console.log(`Total files analyzed: ${this.results.length}`);
    console.log(`🔴 Files requiring immediate action: ${errors.length}`);
    console.log(`🟡 Files needing attention: ${warnings.length}`);
    console.log(`⚡ Large files (>50KB): ${large.length}`);
    
    // VS Code performance impact
    const veryLarge = this.results.filter(r => r.size > FILE_SIZE_STANDARDS.VSCODE_LIMITS.SYNTAX_WARNING);
    if (veryLarge.length > 0) {
      console.log(`\n🐌 VS CODE PERFORMANCE IMPACT:`);
      console.log(`${veryLarge.length} files may cause VS Code slowdowns`);
    }

    // Top offenders
    console.log(`\n🎯 TOP 10 LARGEST FILES:`);
    console.log('─'.repeat(80));
    
    this.results.slice(0, 10).forEach((file, index) => {
      const icon = file.status === 'error' ? '🔴' : file.status === 'warning' ? '🟡' : '🟢';
      console.log(`${index + 1}. ${icon} ${file.filePath}`);
      console.log(`   Size: ${file.sizeKB}KB | Category: ${file.category}`);
      if (file.benchmark) {
        console.log(`   Industry benchmark: ${file.benchmark}`);
      }
      if (file.recommendation && file.status === 'error') {
        console.log(`   📋 ${file.recommendation.split('\n')[0]}`);
      }
      console.log();
    });

    // Detailed recommendations for errors
    if (errors.length > 0) {
      console.log(`\n🚨 IMMEDIATE ACTION REQUIRED:`);
      console.log('─'.repeat(80));
      
      errors.forEach((file, index) => {
        console.log(`${index + 1}. ${file.filePath} (${file.sizeKB}KB)`);
        if (file.recommendation) {
          console.log(file.recommendation);
        }
        console.log();
      });
    }

    // Performance recommendations
    console.log(`\n🚀 PERFORMANCE RECOMMENDATIONS:`);
    console.log('─'.repeat(40));
    console.log('• Run ESLint with file-size rules enabled');
    console.log('• Set up pre-commit hooks to catch large files');
    console.log('• Consider implementing domain-driven design');
    console.log('• Use code splitting for large components');
    console.log('• Implement lazy loading for heavy features');
    
    this.saveReport();
  }

  saveReport() {
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: this.results.length,
        errors: this.results.filter(r => r.status === 'error').length,
        warnings: this.results.filter(r => r.status === 'warning').length,
        averageSize: Math.round(this.results.reduce((sum, r) => sum + r.size, 0) / this.results.length / 1024 * 100) / 100
      },
      files: this.results
    };

    const reportPath = path.join(this.rootDir, 'file-size-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }
}

// Run if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                    import.meta.url.endsWith(process.argv[1]);

if (isMainModule) {
  const monitor = new FileSizeMonitor();
  monitor.analyze().catch(console.error);
}