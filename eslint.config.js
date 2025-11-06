import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  {
    ignores: ['dist', 'node_modules', '*.config.js']
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parser: tsparser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser,
        ...globals.es2020,
        ...globals.node,
        React: 'readonly',
        NodeJS: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        NotificationPermission: 'readonly',
        NotificationOptions: 'readonly',
        BufferSource: 'readonly',
        EventListener: 'readonly',
        AddEventListenerOptions: 'readonly',
        HeadersInit: 'readonly',
        RequestInit: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }
      ],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'off', // Allow console statements for debugging
      'prefer-const': 'error',
      'no-useless-escape': 'error',
      'no-prototype-builtins': 'error'
    }
  }
];