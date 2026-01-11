/**
 * ⚠️ MOBILE RENDER STABILITY GUARD ⚠️
 * 
 * This file contains ESLint rules to enforce mobile render stability.
 * These rules prevent the mobile UI instability issues we fixed in January 2026.
 * 
 * DO NOT DISABLE THESE RULES WITHOUT APPROVAL
 */

module.exports = {
  rules: {
    // ❌ CRITICAL: Prevent index-based keys
    'react/no-array-index-key': 'error',
    
    // ❌ Prevent Math.random() in render
    'no-restricted-syntax': [
      'error',
      {
        selector: "CallExpression[callee.object.name='Math'][callee.property.name='random']",
        message: '🚨 Math.random() in render causes non-deterministic UI. Use hash-based functions instead.'
      },
      {
        selector: "NewExpression[callee.name='Date']",
        message: '⚠️ new Date() in render may cause hydration issues. Move to data layer or use useMemo.'
      }
    ],
    
    // ❌ Prevent viewport units in critical components
    'no-restricted-properties': [
      'error',
      {
        property: 'innerWidth',
        message: '🚨 window.innerWidth causes non-deterministic renders. Use CSS breakpoints instead.'
      },
      {
        property: 'outerWidth',
        message: '🚨 window.outerWidth causes non-deterministic renders. Use CSS breakpoints instead.'
      }
    ]
  },
  
  overrides: [
    {
      // Extra strict for critical mobile components
      files: [
        '**/TherapistHomeCard.tsx',
        '**/TherapistCard.tsx',
        '**/HomePage.tsx',
        '**/modules/therapist/**/*.tsx'
      ],
      rules: {
        'react/no-array-index-key': 'error',
        'no-console': 'off', // Allow debug logs in development
      }
    }
  ]
};
