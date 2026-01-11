/**
 * ESLint Plugin for File Size Enforcement
 * Based on Facebook/Amazon standards
 */
import path from 'node:path';

const plugin = {
  rules: {
    'max-file-size': {
      meta: {
        type: 'problem',
        docs: {
          description: 'enforce maximum file size based on file type',
          category: 'Best Practices',
          recommended: true
        },
        fixable: null,
        schema: [
          {
            type: 'object',
            properties: {
              component: { type: 'number' },
              service: { type: 'number' },
              page: { type: 'number' },
              hook: { type: 'number' },
              utility: { type: 'number' },
              type: { type: 'number' },
              config: { type: 'number' }
            },
            additionalProperties: false
          }
        ]
      },
      create(context) {
        const filename = context.getFilename();
        const sourceCode = context.getSourceCode();
        const fileSize = sourceCode.getText().length;
        
        // Default limits (15KB for most files)
        const options = context.options[0] || {};
        const defaultLimits = {
          component: options.component || 15 * 1024, // 15KB
          service: options.service || 20 * 1024,     // 20KB  
          page: options.page || 25 * 1024,           // 25KB
          hook: options.hook || 8 * 1024,            // 8KB
          utility: options.utility || 10 * 1024,     // 10KB
          type: options.type || 15 * 1024,           // 15KB
          config: options.config || 12 * 1024,       // 12KB
          default: options.default || 15 * 1024      // 15KB
        };

        function getFileCategory(filename) {
          const basename = path.basename(filename);
          
          // Component files
          if (filename.includes('components/') || 
              /^[A-Z].*\.(tsx|jsx)$/.test(basename)) {
            return 'component';
          }
          
          // Page files  
          if (filename.includes('pages/') || basename.includes('Page')) {
            return 'page';
          }
          
          // Service files
          if (filename.includes('services/') || 
              basename.includes('service') ||
              basename.includes('Service')) {
            return 'service';
          }
          
          // Hook files
          if (filename.includes('hooks/') || basename.startsWith('use')) {
            return 'hook';
          }
          
          // Type files
          if (basename.includes('type') || basename === 'types') {
            return 'type';
          }
          
          // Config files
          if (basename.includes('config')) {
            return 'config';
          }
          
          // Utility files
          if (filename.includes('utils/') || filename.includes('lib/')) {
            return 'utility';
          }
          
          return 'default';
        }

        function formatBytes(bytes) {
          return Math.round(bytes / 1024 * 100) / 100 + 'KB';
        }

        function getRefactoringTips(category, currentSize, limit) {
          const tips = [];
          
          switch (category) {
            case 'component':
              tips.push('Extract sub-components');
              tips.push('Move logic to custom hooks');
              tips.push('Extract utility functions');
              break;
            case 'service':
              tips.push('Split by domain boundaries');
              tips.push('Create feature modules');
              tips.push('Extract common utilities');
              break;
            case 'page':
              tips.push('Extract page sections');
              tips.push('Move data fetching to hooks');
              tips.push('Split complex forms');
              break;
          }
          
          return tips.length > 0 ? `\nRefactoring tips:\n${tips.map(tip => `  • ${tip}`).join('\n')}` : '';
        }

        return {
          Program(node) {
            const category = getFileCategory(filename);
            const limit = defaultLimits[category] || defaultLimits.default;
            
            if (fileSize > limit) {
              const overage = fileSize - limit;
              const tips = getRefactoringTips(category, fileSize, limit);
              
              context.report({
                node,
                message: `File size ${formatBytes(fileSize)} exceeds ${category} limit of ${formatBytes(limit)} by ${formatBytes(overage)}.${tips}\n\nIndustry standards:\n  • Facebook avg: 12KB\n  • Amazon avg: 10KB\n  • Google avg: 8KB`
              });
            }
          }
        };
      }
    },
    
    'warn-large-file': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'warn when approaching file size limits',
          category: 'Best Practices'
        },
        schema: []
      },
      create(context) {
        const filename = context.getFilename();
        const sourceCode = context.getSourceCode();
        const fileSize = sourceCode.getText().length;
        
        // Warning at 80% of limit
        const warningThreshold = 12 * 1024; // 12KB warning threshold
        
        return {
          Program(node) {
            if (fileSize > warningThreshold && fileSize <= 15 * 1024) {
              context.report({
                node,
                message: `File size ${Math.round(fileSize/1024*100)/100}KB is approaching the recommended limit. Consider refactoring before it grows larger.`
              });
            }
          }
        };
      }
    }
  },
  
  configs: {
    recommended: {
      plugins: ['file-size'],
      rules: {
        'file-size/max-file-size': ['error', {
          component: 15 * 1024,  // 15KB
          service: 20 * 1024,    // 20KB
          page: 25 * 1024,       // 25KB
          hook: 8 * 1024,        // 8KB
          utility: 10 * 1024,    // 10KB
          type: 15 * 1024,       // 15KB
          config: 12 * 1024      // 12KB
        }],
        'file-size/warn-large-file': 'warn'
      }
    },
    
    strict: {
      plugins: ['file-size'],
      rules: {
        'file-size/max-file-size': ['error', {
          component: 10 * 1024,  // 10KB - stricter
          service: 15 * 1024,    // 15KB - stricter  
          page: 20 * 1024,       // 20KB - stricter
          hook: 6 * 1024,        // 6KB - stricter
          utility: 8 * 1024,     // 8KB - stricter
          type: 12 * 1024,       // 12KB - stricter
          config: 10 * 1024      // 10KB - stricter
        }],
        'file-size/warn-large-file': 'warn'
      }
    }
  }
};

export default plugin;