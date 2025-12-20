/**
 * File Size Standards Configuration
 * Based on Facebook, Amazon, and Google best practices
 * 
 * This configuration ensures VS Code performance and maintainable codebase
 */

export const FILE_SIZE_STANDARDS = {
  // Source code files (TypeScript/JavaScript)
  SOURCE_FILES: {
    // Strict limits for maintainability
    COMPONENT_MAX: 15 * 1024, // 15KB - React components should be focused
    SERVICE_MAX: 20 * 1024,   // 20KB - Service files can be slightly larger
    UTILITY_MAX: 10 * 1024,   // 10KB - Utility functions should be small
    PAGE_MAX: 25 * 1024,      // 25KB - Page components (with routing logic)
    HOOK_MAX: 8 * 1024,       // 8KB - Custom hooks should be focused
    TYPE_MAX: 15 * 1024,      // 15KB - Type definition files
    CONFIG_MAX: 12 * 1024,    // 12KB - Configuration files
    
    // Warning thresholds (80% of max)
    WARNING_THRESHOLD: 0.8,
  },
  
  // Asset files
  ASSETS: {
    IMAGE_MAX: 500 * 1024,    // 500KB - Compressed images
    AUDIO_MAX: 1024 * 1024,   // 1MB - Audio files
    VIDEO_MAX: 5 * 1024 * 1024, // 5MB - Short video clips
    FONT_MAX: 200 * 1024,     // 200KB - Font files
  },
  
  // Bundle size limits
  BUNDLES: {
    INITIAL_CHUNK: 500 * 1024,  // 500KB - Main bundle
    LAZY_CHUNK: 100 * 1024,     // 100KB - Lazy-loaded chunks  
    VENDOR_CHUNK: 300 * 1024,   // 300KB - Third-party libraries
  },
  
  // VS Code performance thresholds
  VSCODE_LIMITS: {
    // Files larger than these will slow down VS Code
    EDITOR_WARNING: 50 * 1024,   // 50KB - Editor starts slowing
    INTELLISENSE_WARNING: 75 * 1024, // 75KB - IntelliSense degradation
    SYNTAX_WARNING: 100 * 1024,  // 100KB - Syntax highlighting issues
  }
};

export const REFACTORING_STRATEGIES = {
  // Component refactoring patterns
  LARGE_COMPONENT: {
    extractSubComponents: 'Break into smaller, focused components',
    extractCustomHooks: 'Move logic into custom hooks',
    extractUtilities: 'Move pure functions to utility files',
    useComposition: 'Prefer composition over large single components',
  },
  
  // Service refactoring patterns  
  LARGE_SERVICE: {
    domainSeparation: 'Split by business domain boundaries',
    featureModules: 'Group related functions into feature modules',
    interfaceSegregation: 'Create focused interfaces for different concerns',
    dependencyInjection: 'Use dependency injection for better separation',
  },
  
  // File organization patterns
  ORGANIZATION: {
    featureFirst: 'Organize by feature, not by file type',
    barrelExports: 'Use index files for clean imports',
    layeredArchitecture: 'Separate presentation, business, and data layers',
    coLocation: 'Keep related files close together',
  }
};

// Industry benchmark file sizes (for reference)
export const INDUSTRY_BENCHMARKS = {
  FACEBOOK: {
    averageComponent: 12 * 1024,    // 12KB
    maxComponent: 20 * 1024,        // 20KB
    averageService: 15 * 1024,      // 15KB
  },
  
  AMAZON: {
    averageComponent: 10 * 1024,    // 10KB
    maxComponent: 18 * 1024,        // 18KB
    averageService: 12 * 1024,      // 12KB
  },
  
  GOOGLE: {
    averageComponent: 8 * 1024,     // 8KB
    maxComponent: 15 * 1024,        // 15KB
    averageService: 10 * 1024,      // 10KB
  }
};

export const PERFORMANCE_IMPACT = {
  // VS Code performance degradation by file size
  EDITOR_PERFORMANCE: [
    { size: 0, impact: 'Excellent' },
    { size: 20 * 1024, impact: 'Good' },
    { size: 50 * 1024, impact: 'Noticeable' },
    { size: 100 * 1024, impact: 'Slow' },
    { size: 200 * 1024, impact: 'Very Slow' },
    { size: 300 * 1024, impact: 'Unusable' },
  ]
};