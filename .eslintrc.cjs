// 🔒 PRODUCTION LOCK - ESLint Configuration
// Prevents dangerous imports and patterns in locked files

module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    
    // 🔒 PRODUCTION LOCK: Prevent dangerous imports in locked files
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['**/lib/appwrite*', '**/lib/appwriteService*'],
            message: '❌ Production lock: Landing/Loading pages cannot directly access backend services',
          },
          {
            group: ['**/database*', '**/db*'],
            message: '❌ Production lock: Landing/Loading pages cannot access database',
          },
        ],
      },
    ],
  },
  
  // 🔒 Specific overrides for locked files
  overrides: [
    {
      files: [
        '**/pages/LoadingGate.tsx',
        '**/pages/MainLandingPage.tsx',
        '**/pages/LandingPage.tsx',
        '**/pages/HomePage.tsx',
      ],
      rules: {
        // Extra strict rules for locked files
        'no-console': 'warn',
        'complexity': ['error', 15], // Prevent complex logic
        'max-depth': ['error', 3], // Prevent deep nesting
        'max-lines-per-function': ['warn', { max: 150, skipBlankLines: true, skipComments: true }],
        
        // Prevent dangerous patterns
        'no-restricted-syntax': [
          'error',
          {
            selector: 'CallExpression[callee.object.name="window"][callee.property.name="location"]',
            message: '❌ Direct window.location usage can cause navigation loops',
          },
        ],
      },
    },
  ],
};
