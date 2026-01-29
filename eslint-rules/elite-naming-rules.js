/**
 * 🛡️ ELITE FILE NAMING ENFORCEMENT RULES
 * Prevents any non-compliant file names from being committed
 */

module.exports = {
  rules: {
    // Enforce elite domain-based file naming
    'elite-file-naming': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Enforce elite Domain.Feature.Layer.Component.Version.tsx naming pattern',
          category: 'Stylistic Issues',
          recommended: true
        },
        messages: {
          invalidFileNaming: 'File must follow Domain.Feature.Layer.Component.Version.tsx pattern. Got: {{filename}}'
        }
      },
      create(context) {
        return {
          Program(node) {
            const filename = context.getFilename();
            const basename = path.basename(filename);
            
            // Elite naming pattern: Domain.Feature.Layer.Component.Version.tsx
            const elitePattern = /^[A-Z][a-zA-Z]*Domain\.[A-Z][a-zA-Z]*\.(Presentation|Application|Domain|Infrastructure)\.(Page|Component|Service|Entity)\.v\d+\.tsx$/;
            
            // Legacy acceptable patterns (temporary)
            const legacyPatterns = [
              /^[A-Z][a-zA-Z]*Page\.tsx$/,  // TherapistDashboardPage.tsx
              /^[A-Z][a-zA-Z]*Component\.tsx$/  // LoadingComponent.tsx
            ];
            
            if (basename.endsWith('.tsx') || basename.endsWith('.ts')) {
              const isElite = elitePattern.test(basename);
              const isLegacyAcceptable = legacyPatterns.some(pattern => pattern.test(basename));
              
              if (!isElite && !isLegacyAcceptable) {
                context.report({
                  node,
                  messageId: 'invalidFileNaming',
                  data: { filename: basename }
                });
              }
            }
          }
        };
      }
    },

    // Prevent relative imports (force absolute imports)
    'no-relative-imports': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Prevent relative imports, enforce domain-based absolute imports',
          category: 'Best Practices',
          recommended: true
        },
        messages: {
          noRelativeImports: 'Use absolute imports via @domains/* instead of relative paths. Got: {{source}}'
        }
      },
      create(context) {
        return {
          ImportDeclaration(node) {
            const source = node.source.value;
            
            // Detect relative imports
            if (source.startsWith('./') || source.startsWith('../')) {
              context.report({
                node,
                messageId: 'noRelativeImports',
                data: { source }
              });
            }
          }
        };
      }
    },

    // Enforce barrel imports only
    'enforce-barrel-imports': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Enforce imports through domain barrel exports only',
          category: 'Best Practices', 
          recommended: true
        },
        messages: {
          useBarrelImports: 'Import from domain barrels (@domains/DomainName) instead of direct file paths. Got: {{source}}'
        }
      },
      create(context) {
        return {
          ImportDeclaration(node) {
            const source = node.source.value;
            
            // Allow only barrel imports and external libraries
            const allowedPatterns = [
              /^@domains\/\w+$/,           // @domains/TherapistDomain
              /^@platform\/\w+$/,         // @platform/ErrorHandling
              /^[a-zA-Z]/,                 // External libraries (react, lodash, etc.)
              /^@\w+\/\w+$/               // Scoped packages (@types/node)
            ];
            
            const isAllowed = allowedPatterns.some(pattern => pattern.test(source));
            
            if (!isAllowed && (source.includes('/') || source.startsWith('.'))) {
              context.report({
                node,
                messageId: 'useBarrelImports',
                data: { source }
              });
            }
          }
        };
      }
    }
  }
};