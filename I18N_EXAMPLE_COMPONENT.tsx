// Example: How to use i18next with i18n-ally in your components

import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * This is an example component showing the best practices
 * for using i18next with i18n-ally monitoring.
 * 
 * i18n-ally will:
 * 1. Flag any missing translations with red underlines
 * 2. Show translation values on hover
 * 3. Track coverage percentage
 * 4. Suggest available keys with autocomplete
 */

export function ExampleComponent() {
  const { t, i18n } = useTranslation();

  // Your component content
  return (
    <div className="example">
      {/* i18n-ally monitors all t() calls */}
      <h1>{t('home.title')}</h1>
      <p>{t('common.welcome')}</p>
      
      {/* Nested translations work too */}
      <button>{t('common.buttons.submit')}</button>

      {/* Language switcher */}
      <div className="language-switcher">
        <button onClick={() => i18n.changeLanguage('en')}>
          English
        </button>
        <button onClick={() => i18n.changeLanguage('id')}>
          Bahasa Indonesia
        </button>
        
        <span>Current: {i18n.language.toUpperCase()}</span>
      </div>

      {/* Coverage info (for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="i18n-debug">
          <p>i18n-ally is monitoring this component!</p>
          <p>Any untranslated keys will appear with red underlines</p>
        </div>
      )}
    </div>
  );
}

/**
 * QUICK REFERENCE:
 * 
 * ✅ DO:
 * - Use t('namespace.key') for all user-visible strings
 * - Import from 'react-i18next'
 * - Keep translations in ./translations/ folder
 * - Use useTranslation() hook for dynamic content
 * 
 * ❌ DON'T:
 * - Hardcode strings instead of using t()
 * - Use old useTranslations() hook
 * - Put translations outside ./translations/ folder
 * - Import i18n directly (use hooks instead)
 * 
 * 📍 SUPPORTED PATTERNS (i18n-ally will detect):
 * - t('key')
 * - t('namespace.key')
 * - t('namespace.nested.key')
 * - useTranslation().t('key')
 * 
 * 🔍 TO CHECK COVERAGE:
 * 1. Look at i18n-ally icon in VS Code status bar
 * 2. Shows: "🌐 EN: 95% ID: 92%"
 * 3. Click to see missing translations
 */
