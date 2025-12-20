# Component Refactoring Guidelines
## Facebook & Amazon File Size Standards

## 🎯 Quick Reference

| Component Type | Max Size | Target Size | When to Split |
|----------------|----------|-------------|---------------|
| **React Component** | 15 KB | 10-12 KB | > 12 KB |
| **Page Component** | 25 KB | 18-20 KB | > 20 KB |
| **Custom Hook** | 8 KB | 5-6 KB | > 6 KB |
| **Utility File** | 10 KB | 6-8 KB | > 8 KB |
| **Service File** | 20 KB | 12-15 KB | > 15 KB |

## 📋 Component Refactoring Checklist

### Step 1: Analyze the Component
- [ ] Check file size (`ls -lh filename.tsx`)
- [ ] Identify distinct sections/features
- [ ] List all state variables
- [ ] Map component dependencies
- [ ] Identify reusable patterns

### Step 2: Create Extraction Plan
- [ ] Group related functionality
- [ ] Identify sub-components
- [ ] List extractable hooks
- [ ] Plan folder structure
- [ ] Define interfaces/types

### Step 3: Extract Sub-Components
- [ ] Create component files
- [ ] Move JSX and props
- [ ] Add proper TypeScript types
- [ ] Update imports
- [ ] Test component isolation

### Step 4: Extract Custom Hooks
- [ ] Identify state logic
- [ ] Group related state
- [ ] Create hook files
- [ ] Move effects and handlers
- [ ] Test hook behavior

### Step 5: Extract Utilities
- [ ] Find pure functions
- [ ] Extract constants
- [ ] Create helper files
- [ ] Add JSDoc comments
- [ ] Test utilities

### Step 6: Update Main Component
- [ ] Replace inline code with imports
- [ ] Simplify component structure
- [ ] Verify all functionality
- [ ] Run type checking
- [ ] Performance test

## 🔧 Common Refactoring Patterns

### Pattern 1: Extract UI Sections
```typescript
// Before: 500 lines in one component
const HugeDashboard = () => {
  return (
    <div>
      {/* Profile section - 100 lines */}
      {/* Stats section - 150 lines */}
      {/* Settings section - 200 lines */}
      {/* More sections... */}
    </div>
  );
};

// After: Multiple focused components
const Dashboard = () => {
  return (
    <div>
      <ProfileSection />
      <StatsSection />
      <SettingsSection />
    </div>
  );
};
```

### Pattern 2: Extract State to Hooks
```typescript
// Before: 50+ useState calls
const Component = () => {
  const [state1, setState1] = useState('');
  const [state2, setState2] = useState(0);
  // ... 48 more state variables
  
  return <div>...</div>;
};

// After: Custom hook
const Component = () => {
  const state = useComponentState();
  return <div>...</div>;
};
```

### Pattern 3: Extract Form Sections
```typescript
// Before: One massive form
const HugeForm = () => {
  return (
    <form>
      {/* Personal info - 50 fields */}
      {/* Address info - 30 fields */}
      {/* Payment info - 40 fields */}
    </form>
  );
};

// After: Section components
const Form = () => {
  return (
    <form>
      <PersonalInfoSection />
      <AddressSection />
      <PaymentSection />
    </form>
  );
};
```

### Pattern 4: Extract Card/List Items
```typescript
// Before: Inline rendering
const List = () => {
  return items.map(item => (
    <div>
      {/* 100+ lines of card JSX */}
    </div>
  ));
};

// After: Separate component
const List = () => {
  return items.map(item => (
    <ItemCard key={item.id} item={item} />
  ));
};
```

## 🎨 Component Organization

### Folder Structure
```
components/
├── feature-name/
│   ├── FeatureMain.tsx          # Main component
│   ├── FeatureHeader.tsx        # Sub-component
│   ├── FeatureContent.tsx       # Sub-component
│   ├── FeatureFooter.tsx        # Sub-component
│   ├── useFeatureState.ts       # State hook
│   ├── useFeatureLogic.ts       # Logic hook
│   ├── featureHelpers.ts        # Utilities
│   ├── featureConstants.ts      # Constants
│   ├── types.ts                 # Type definitions
│   └── index.ts                 # Barrel export
```

### Import Organization
```typescript
// 1. External dependencies
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Internal dependencies (types)
import type { User, Profile } from '@/types';

// 3. Internal components
import { Button, Card } from '@/components';

// 4. Local components
import ProfileHeader from './ProfileHeader';
import ProfileForm from './ProfileForm';

// 5. Hooks
import { useAuth } from '@/hooks';
import { useProfileState } from './useProfileState';

// 6. Utils and constants
import { validateProfile } from './helpers';
import { DEFAULT_VALUES } from './constants';

// 7. Styles
import './styles.css';
```

## 🚀 Refactoring Examples

### Example 1: Large Dashboard (151KB → 12KB)

**Before** (151KB, 2543 lines):
- All code in one file
- 50+ state variables
- 20+ sub-sections
- Complex business logic mixed with UI

**After** (12KB main, 24 smaller files):
- Main file orchestrates
- State in custom hooks
- Sections as components
- Clear separation of concerns

**Files Created**:
- 10 section components (~8-12 KB each)
- 6 custom hooks (~5-7 KB each)
- 4 utility files (~3-5 KB each)
- 3 layout components (~5-8 KB each)

### Example 2: Large Form Component (85KB → 10KB)

**Before**:
```typescript
const MassiveForm = () => {
  // 200 lines of state
  // 500 lines of handlers
  // 1000 lines of JSX
  return <form>{/* Everything */}</form>;
};
```

**After**:
```typescript
const Form = () => {
  const state = useFormState();
  const handlers = useFormHandlers(state);
  
  return (
    <form>
      <BasicInfoSection {...state} {...handlers} />
      <AddressSection {...state} {...handlers} />
      <PreferencesSection {...state} {...handlers} />
      <SubmitButton onSubmit={handlers.handleSubmit} />
    </form>
  );
};
```

## 📊 Measuring Success

### Before Refactoring
```bash
# Check file size
npm run monitor:files

# Typical issues:
- VS Code lag when editing
- Slow IntelliSense
- Long file load times
- Difficult code navigation
```

### After Refactoring
```bash
# Verify improvements
npm run monitor:files

# Expected results:
✅ All files < 25KB
✅ Fast VS Code performance
✅ Quick IntelliSense
✅ Easy code navigation
```

### Performance Metrics
- **File Load Time**: Should be < 100ms
- **IntelliSense Speed**: < 50ms
- **Type Checking**: < 500ms per file
- **Build Time**: 20-30% faster

## 🛠️ Tools & Commands

### Analysis
```bash
# Check file sizes
npm run monitor:files

# Check specific file
ls -lh path/to/file.tsx

# Generate report
npm run size:report
```

### Validation
```bash
# Type check
npm run type-check

# Lint with size rules
npm run lint

# Pre-commit check
npm run precheck
```

### Testing
```bash
# Unit tests
npm test ComponentName

# Integration tests
npm test -- --coverage

# E2E tests
npm run test:e2e
```

## ⚠️ Common Pitfalls

### DON'T ❌
- Extract too early (wait until > 20KB)
- Create too many tiny files (< 2KB)
- Split mid-function
- Break logical groupings
- Forget to test after extraction

### DO ✅
- Keep related code together
- Extract by feature/domain
- Maintain clear boundaries
- Test thoroughly
- Document changes

## 📚 Additional Resources

- [Facebook Engineering Blog](https://engineering.fb.com/)
- [Amazon Builder's Library](https://aws.amazon.com/builders-library/)
- [Google Style Guide](https://google.github.io/styleguide/)
- [React Best Practices](https://react.dev/learn)

---

**Remember**: The goal is maintainability and performance, not just smaller files. Always prioritize code clarity and logical organization over strict size limits.