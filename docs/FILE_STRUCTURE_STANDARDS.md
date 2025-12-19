# File Structure Standards - Enterprise Grade

## Overview
This document defines the file organization standards for the IndaStreet platform, following industry best practices from Facebook (React), Amazon, Google, and other tech giants.

## Core Principles

### 1. **Feature-Based Organization**
- Group files by feature/domain, not by technical type
- Each feature should be self-contained and independently testable
- Reduces cognitive load and makes code easier to find

### 2. **Explicit Dependencies**
- Always use absolute imports with path aliases
- Never use relative imports beyond one level (`../` is acceptable, `../../` is not)
- Makes refactoring safer and imports clearer

### 3. **Single Responsibility**
- Each file should have one clear purpose
- Maximum file size: 500 lines (warning at 300 lines)
- Split large files into smaller, focused modules

### 4. **Consistent Naming**
- PascalCase for components: `MembershipTermsModal.tsx`
- camelCase for utilities: `translationService.ts`
- kebab-case for folders: `membership-system/`
- SCREAMING_SNAKE_CASE for constants: `API_ENDPOINTS.ts`

---

## Directory Structure

```
website-massage--14/
├── src/
│   ├── apps/                    # Multi-app architecture
│   │   ├── admin/              # Admin portal
│   │   ├── client/             # Customer app
│   │   ├── therapist/          # Therapist app
│   │   ├── place/              # Massage place app
│   │   └── shared/             # Shared across apps
│   │
│   └── features/               # Feature modules (NEW - recommended)
│       ├── membership/
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── services/
│       │   ├── types/
│       │   └── index.ts       # Public API
│       │
│       ├── authentication/
│       ├── booking/
│       └── payment/
│
├── components/                 # Shared/global components (CURRENT)
│   ├── Button.tsx
│   ├── Modal.tsx
│   └── index.ts               # Barrel export
│
├── pages/                      # Route components (CURRENT)
│   ├── membership/            # Group related pages
│   │   ├── MembershipPage.tsx
│   │   ├── MembershipPlansPage.tsx
│   │   └── MembershipTermsModal.tsx
│   │
│   ├── auth/
│   │   ├── AuthPage.tsx
│   │   ├── CustomerAuthPage.tsx
│   │   └── ProviderAuthPage.tsx
│   │
│   └── LandingPage.tsx        # Top-level pages
│
├── lib/                        # External integrations
│   ├── appwrite/
│   │   ├── client.ts
│   │   ├── database.ts
│   │   └── collections.ts
│   │
│   ├── stripe/
│   └── google-maps/
│
├── hooks/                      # Custom React hooks
│   ├── useAppState.ts
│   ├── useAuth.ts
│   └── index.ts
│
├── utils/                      # Pure utility functions
│   ├── formatters.ts
│   ├── validators.ts
│   └── constants.ts
│
├── types/                      # TypeScript definitions
│   ├── appwrite.d.ts
│   ├── components.d.ts
│   └── api.d.ts
│
├── config/                     # Configuration files
│   ├── appwrite.config.ts
│   ├── routes.config.ts
│   └── features.config.ts
│
├── .vscode/                    # VS Code workspace settings
│   ├── settings.json
│   ├── extensions.json
│   └── launch.json
│
├── scripts/                    # Build/deployment scripts
│   ├── updateProductNumbers.cjs
│   └── validate-imports.js    # NEW
│
└── docs/                       # Documentation
    ├── architecture/
    ├── api/
    └── guides/
```

---

## File Naming Conventions

### Components
```
✅ CORRECT:
- MembershipTermsModal.tsx       # Component file
- MembershipTermsModal.test.tsx  # Test file
- MembershipTermsModal.css       # Styles (if not using Tailwind)
- index.ts                        # Barrel export

❌ INCORRECT:
- membershipTermsModal.tsx        # Wrong case
- membership-terms-modal.tsx      # Wrong format
- MembershipTermsModalComponent.tsx # Redundant suffix
```

### Services/Utilities
```
✅ CORRECT:
- translationService.ts
- appwriteClient.ts
- formatCurrency.ts

❌ INCORRECT:
- TranslationService.ts           # Should be camelCase
- appwrite_client.ts              # Use camelCase, not snake_case
```

### Hooks
```
✅ CORRECT:
- useAppState.ts
- useAuth.ts
- useDebounce.ts

❌ INCORRECT:
- UseAppState.ts                  # Wrong case
- app-state-hook.ts               # Wrong format
- hookAppState.ts                 # Wrong prefix
```

### Configuration Files
```
✅ CORRECT:
- vite.config.ts
- tsconfig.json
- .eslintrc.js

❌ INCORRECT:
- ViteConfig.ts
- vite-config.ts
```

---

## Import Standards

### Priority Order
```typescript
// 1. External dependencies
import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

// 2. Internal absolute imports (use aliases)
import Button from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/utils/formatters';

// 3. Relative imports (same folder only)
import { MembershipTermsModalProps } from './types';
import styles from './MembershipTermsModal.module.css';

// 4. Type-only imports (last)
import type { Database } from '@/types/appwrite';
```

### Path Aliases (Vite)
```typescript
// vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './components'),
      '@/pages': path.resolve(__dirname, './pages'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/hooks': path.resolve(__dirname, './hooks'),
      '@/utils': path.resolve(__dirname, './utils'),
      '@/types': path.resolve(__dirname, './types'),
    }
  }
});
```

### Barrel Exports (Index Files)
```typescript
// components/index.ts
export { default as Button } from './Button';
export { default as Modal } from './Modal';
export { default as Input } from './Input';

// Usage:
import { Button, Modal, Input } from '@/components';
```

---

## Code Organization Rules

### Component Structure
```typescript
// 1. Imports (grouped by type)
import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from '@/components/Button';
import type { MembershipTermsModalProps } from './types';

// 2. Type definitions
interface MembershipTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 3. Constants (outside component)
const PAYMENT_DEADLINE_HOURS = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// 4. Helper functions (outside component)
const formatDate = (date: Date): string => {
  return date.toLocaleDateString();
};

// 5. Main component
const MembershipTermsModal: React.FC<MembershipTermsModalProps> = ({
  isOpen,
  onClose
}) => {
  // 5a. State declarations
  const [accepted, setAccepted] = useState(false);
  
  // 5b. Hooks
  useEffect(() => {
    // Effect logic
  }, []);
  
  // 5c. Event handlers
  const handleAccept = () => {
    setAccepted(true);
  };
  
  // 5d. Render helpers
  const renderTerms = () => {
    return <div>Terms content</div>;
  };
  
  // 5e. Return JSX
  return (
    <div>
      {renderTerms()}
      <Button onClick={handleAccept}>Accept</Button>
    </div>
  );
};

// 6. Export
export default MembershipTermsModal;
```

### Service/Utility Structure
```typescript
// translationService.ts

// 1. Imports
import { databases, DATABASE_ID } from './appwriteClient';
import type { Translation } from '@/types/translation';

// 2. Constants
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const DEFAULT_LANGUAGE = 'en';

// 3. Types (if not in separate file)
interface TranslationCache {
  [key: string]: {
    data: Translation;
    timestamp: number;
  };
}

// 4. Private variables/state
const cache: TranslationCache = {};

// 5. Private helper functions
const isExpired = (timestamp: number): boolean => {
  return Date.now() - timestamp > CACHE_DURATION;
};

// 6. Public API functions
export const getTranslation = async (
  key: string,
  language: string = DEFAULT_LANGUAGE
): Promise<Translation> => {
  // Implementation
};

export const clearCache = (): void => {
  Object.keys(cache).forEach(key => delete cache[key]);
};

// 7. Default export (if needed)
export default {
  getTranslation,
  clearCache,
};
```

---

## Performance Best Practices

### 1. Code Splitting
```typescript
// ❌ AVOID: Direct imports for large components
import MassiveDashboard from './pages/MassiveDashboard';

// ✅ CORRECT: Lazy load heavy components
const MassiveDashboard = React.lazy(() => import('./pages/MassiveDashboard'));

// Usage with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <MassiveDashboard />
</Suspense>
```

### 2. Proper Memoization
```typescript
// ❌ AVOID: Unnecessary re-renders
const ExpensiveComponent = ({ data }) => {
  const result = computeExpensiveValue(data);
  return <div>{result}</div>;
};

// ✅ CORRECT: Use useMemo
const ExpensiveComponent = ({ data }) => {
  const result = useMemo(() => computeExpensiveValue(data), [data]);
  return <div>{result}</div>;
};
```

### 3. Debounce User Input
```typescript
// hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export const useDebounce = <T,>(value: T, delay: number = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};
```

### 4. Avoid Large Files
```typescript
// ❌ AVOID: 2000-line component
// pages/Dashboard.tsx (2000 lines)

// ✅ CORRECT: Split into modules
// pages/Dashboard/index.tsx (100 lines)
// pages/Dashboard/Header.tsx (80 lines)
// pages/Dashboard/Sidebar.tsx (120 lines)
// pages/Dashboard/Content.tsx (150 lines)
// pages/Dashboard/hooks/useDashboardState.ts (100 lines)
```

---

## Git Best Practices

### .gitignore Additions
```gitignore
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
build/
.vite/
*.tsbuildinfo

# Cache
.cache/
.turbo/
.eslintcache

# Logs
*.log
npm-debug.log*
logs/

# Environment
.env.local
.env.*.local
.env

# IDE
.vscode/*
!.vscode/settings.json
!.vscode/extensions.json
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
desktop.ini

# Temporary files
*.tmp
*.temp
*-backup.*
*-old.*
*-new.*
*.disabled
deleted/

# Test coverage
coverage/
.nyc_output/

# Large files (should be in separate storage)
*.mp4
*.mov
*.avi
uploads/
```

---

## TypeScript Best Practices

### 1. Proper Type Definitions
```typescript
// ❌ AVOID: Using 'any'
const data: any = await fetchData();

// ✅ CORRECT: Define proper types
interface UserData {
  id: string;
  name: string;
  email: string;
}
const data: UserData = await fetchData();
```

### 2. Type Exports
```typescript
// types/membership.d.ts
export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
}

export type PlanType = 'pro' | 'plus';

export interface MembershipState {
  selectedPlan: MembershipPlan | null;
  acceptedTerms: boolean;
}
```

### 3. Avoid Type Assertion
```typescript
// ❌ AVOID: Type assertions
const data = response as UserData;

// ✅ CORRECT: Type guards
const isUserData = (data: unknown): data is UserData => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data
  );
};

if (isUserData(response)) {
  // TypeScript knows response is UserData
  console.log(response.name);
}
```

---

## Error Prevention

### 1. Required Index Files
Every folder with components should have an `index.ts`:
```typescript
// components/membership/index.ts
export { default as MembershipPage } from './MembershipPage';
export { default as MembershipTermsModal } from './MembershipTermsModal';
export { default as MembershipPlansPage } from './MembershipPlansPage';
```

### 2. Validate Imports Script
```javascript
// scripts/validate-imports.js
// Run this before commits to catch missing files
const fs = require('fs');
const path = require('path');

const checkFileExists = (importPath, sourceFile) => {
  const fullPath = path.resolve(path.dirname(sourceFile), importPath);
  const extensions = ['.tsx', '.ts', '.jsx', '.js'];
  
  for (const ext of extensions) {
    if (fs.existsSync(fullPath + ext)) {
      return true;
    }
  }
  
  return fs.existsSync(fullPath);
};

// Implementation to scan all files and verify imports
```

### 3. Pre-commit Hooks
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run validate && npm run lint"
    }
  },
  "scripts": {
    "validate": "node scripts/validate-imports.js",
    "lint": "eslint . --ext .ts,.tsx --max-warnings 0"
  }
}
```

---

## VS Code Settings

### Recommended Extensions
- ESLint
- Prettier
- TypeScript Import Sorter
- Error Lens
- Path Intellisense
- Auto Import

### Workspace Settings (Next step)
See `.vscode/settings.json` for optimized VS Code configuration

---

## Troubleshooting Common Issues

### Issue: "File going missing" / Import errors
**Cause**: Files deleted/renamed without updating imports
**Solution**: 
1. Use absolute imports with path aliases
2. Run `npm run validate` before commits
3. Use VS Code "Find All References" before moving files

### Issue: VS Code crashing
**Cause**: Too many files being watched, memory issues
**Solution**:
1. Add proper `.gitignore` entries
2. Exclude `node_modules` from file watching
3. Increase VS Code memory: `code --max-memory=8192`
4. Use `.vscode/settings.json` optimizations

### Issue: Slow HMR / Vite asking for 'h' or 'r'
**Cause**: Build errors, circular dependencies, too many files
**Solution**:
1. Fix TypeScript errors immediately
2. Avoid circular imports
3. Use proper code splitting
4. Optimize Vite configuration

### Issue: Landing page not loading
**Cause**: Missing lazy-loaded component, runtime errors
**Solution**:
1. Check browser console for errors
2. Verify all lazy imports exist
3. Add error boundaries
4. Use Suspense fallbacks

---

## Migration Guide

### Moving to New Structure (Gradual)
```
Phase 1: Foundation (Week 1)
- ✅ Add .vscode/settings.json
- ✅ Update vite.config.ts with aliases
- ✅ Add validate-imports script
- ✅ Set up pre-commit hooks

Phase 2: Organization (Week 2-3)
- Group related pages into folders
- Add index.ts barrel exports
- Convert relative imports to absolute

Phase 3: Features (Week 4+)
- Gradually move to feature-based structure
- Create src/features/ directory
- Move membership code to features/membership
```

---

## Quick Reference

### File Size Limits
- Components: **300 lines** (warning) / **500 lines** (hard limit)
- Services: **400 lines** (warning) / **600 lines** (hard limit)
- Utilities: **200 lines** (warning) / **300 lines** (hard limit)

### Import Rules
- ✅ `import Button from '@/components/Button'`
- ✅ `import { useState } from 'react'`
- ⚠️ `import Button from '../components/Button'` (only within same feature)
- ❌ `import Button from '../../components/Button'` (use alias)

### Naming Quick Check
- Components: PascalCase (MembershipPage.tsx)
- Hooks: camelCase with 'use' prefix (useAuth.ts)
- Utils: camelCase (formatCurrency.ts)
- Types: PascalCase (UserData.d.ts)
- Folders: kebab-case (membership-system/)
- Constants: SCREAMING_SNAKE_CASE (API_ENDPOINTS.ts)

---

## Resources
- React Best Practices: https://react.dev/learn/thinking-in-react
- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/
- Vite Guide: https://vitejs.dev/guide/
- Monorepo Guide (future): https://monorepo.tools/

---

**Last Updated**: December 16, 2025
**Version**: 1.0.0
**Status**: ✅ Active Standard
