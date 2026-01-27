/**
 * React 19 AsyncMode Compatibility Fix
 * Prevents "Cannot set properties of undefined (setting 'AsyncMode')" error
 */

import React from 'react';

// Polyfill for React AsyncMode compatibility
if (typeof (React as any).AsyncMode === 'undefined') {
  console.log('🔧 Applying React 19 AsyncMode compatibility fix');
  (React as any).AsyncMode = React.Fragment;
}

// Also fix any other React compatibility issues
if (typeof (React as any).StrictMode === 'undefined') {
  (React as any).StrictMode = React.Fragment;
}

export const reactCompatibilityFixed = true;