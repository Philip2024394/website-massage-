# PROJECT-WIDE COMPONENT STANDARDS

## MANDATORY RULES for ALL Components & Pages

This document establishes **MANDATORY** rules that ALL files and pages in the project MUST follow to prevent crashes and maintain consistency.

### 🚨 CRITICAL RULE 1: Icon Imports

**❌ NEVER DO THIS:**
```tsx
import { CheckCircle, Shield, Star } from 'lucide-react';
```

**✅ ALWAYS DO THIS:**
```tsx
import { SafeIcons } from '../utils/iconValidator';
import { IconErrorBoundary } from '../components/IconErrorBoundary';
```

### 🚨 CRITICAL RULE 2: Icon Usage

**❌ NEVER DO THIS:**
```tsx
<CheckCircle className="w-5 h-5" />
<Shield className="w-6 h-6" />
```

**✅ ALWAYS DO THIS:**
```tsx
<SafeIcons.CheckCircle className="w-5 h-5" />
<SafeIcons.Shield className="w-6 h-6" />
```

### 🚨 CRITICAL RULE 3: Component Structure

**ALL page components MUST be wrapped with IconErrorBoundary:**

```tsx
const MyPageComponent: React.FC<Props> = (props) => {
  return (
    <IconErrorBoundary componentName="MyPageComponent">
      {/* Your component JSX here */}
    </IconErrorBoundary>
  );
};
```

## 📋 MANDATORY IMPLEMENTATION TEMPLATE

Every new component MUST follow this exact structure:

```tsx
// 1. React imports first
import React, { useState, useEffect } from 'react';

// 2. MANDATORY: SafeIcons and IconErrorBoundary
import { SafeIcons } from '../utils/iconValidator';
import { IconErrorBoundary } from '../components/IconErrorBoundary';

// 3. Other imports
import { SomeOtherComponent } from './SomeOtherComponent';

// 4. Component interface
interface MyComponentProps {
  // props here
}

// 5. Component implementation
const MyComponent: React.FC<MyComponentProps> = (props) => {
  // Component logic here
  
  return (
    <IconErrorBoundary componentName="MyComponent">
      <div>
        {/* Use SafeIcons.IconName for all icons */}
        <SafeIcons.Star className="w-5 h-5" />
        <SafeIcons.CheckCircle className="w-6 h-6" />
        {/* Rest of component */}
      </div>
    </IconErrorBoundary>
  );
};

export default MyComponent;
```

## 🔧 AVAILABLE SAFE ICONS

Current SafeIcons available for use:

### Basic Icons
- `SafeIcons.CheckCircle` / `SafeIcons.CheckCircle2`
- `SafeIcons.AlertCircle`
- `SafeIcons.Shield`
- `SafeIcons.Star`
- `SafeIcons.Award`

### Navigation
- `SafeIcons.ArrowLeft`
- `SafeIcons.ChevronLeft` / `SafeIcons.ChevronRight`
- `SafeIcons.ChevronUp` / `SafeIcons.ChevronDown`
- `SafeIcons.Menu`
- `SafeIcons.X`

### UI Elements
- `SafeIcons.User` / `SafeIcons.Users`
- `SafeIcons.Home`
- `SafeIcons.Search`
- `SafeIcons.Bell`
- `SafeIcons.Settings`

### Business
- `SafeIcons.DollarSign`
- `SafeIcons.CreditCard`
- `SafeIcons.Calendar`
- `SafeIcons.Clock`
- `SafeIcons.Building` / `SafeIcons.Building2`

### Communication
- `SafeIcons.Phone`
- `SafeIcons.MessageCircle`
- `SafeIcons.Mail`
- `SafeIcons.MapPin`

### Actions
- `SafeIcons.Upload` / `SafeIcons.Download`
- `SafeIcons.Edit` / `SafeIcons.Edit3`
- `SafeIcons.Save`
- `SafeIcons.Plus`
- `SafeIcons.Trash2`

### Status
- `SafeIcons.Crown`
- `SafeIcons.Lock`
- `SafeIcons.Eye` / `SafeIcons.EyeOff`

## ⚡ PRE-BUILD VALIDATION

**MANDATORY:** Run these commands before committing:

```bash
# 1. Validate icons
npm run validate-icons

# 2. Check TypeScript
npm run type-check

# 3. Test build
npm run pre-build
```

## 🚫 ENFORCEMENT RULES

### For Developers:
1. **ALL new components** must use SafeIcons pattern
2. **ALL existing components** being modified must be updated to SafeIcons
3. **NO EXCEPTIONS** - direct lucide-react imports are forbidden
4. **CODE REVIEWS** must verify SafeIcons usage

### For CI/CD:
1. Automated validation runs on every commit
2. Builds fail if validation fails
3. PRs blocked until validation passes

## 📁 FILE PATHS FOR DIFFERENT LOCATIONS

### Main src components:
```tsx
import { SafeIcons } from '../utils/iconValidator';
import { IconErrorBoundary } from '../components/IconErrorBoundary';
```

### Place dashboard (apps/place-dashboard):
```tsx
import { SafeIcons } from '../../../../src/utils/iconValidator';
import { IconErrorBoundary } from '../../../../src/components/IconErrorBoundary';
```

### Facial dashboard (apps/facial-dashboard):
```tsx
import { SafeIcons } from '../../../../src/utils/iconValidator';
import { IconErrorBoundary } from '../../../../src/components/IconErrorBoundary';
```

### Auth app (apps/auth-app):
```tsx
import { SafeIcons } from '../../../src/utils/iconValidator';
import { IconErrorBoundary } from '../../../src/components/IconErrorBoundary';
```

## 🆘 EMERGENCY PROCEDURES

If you encounter a component crash:

1. **Immediate Fix:**
   ```tsx
   // Wrap with error boundary
   <IconErrorBoundary componentName="ComponentName">
     {/* existing content */}
   </IconErrorBoundary>
   ```

2. **Proper Fix:**
   - Replace direct lucide-react imports with SafeIcons
   - Update all icon usages
   - Test with `npm run validate-icons`

## 🏗️ MIGRATION CHECKLIST

For existing components, follow this checklist:

- [ ] Replace lucide-react import with SafeIcons import
- [ ] Add IconErrorBoundary import  
- [ ] Wrap component return with IconErrorBoundary
- [ ] Replace all `<IconName` with `<SafeIcons.IconName`
- [ ] Run `npm run validate-icons`
- [ ] Test component functionality
- [ ] Commit changes

## 📊 PROJECT STATUS

**Total Components:** ~200+
**Migrated:** HotelVillaSafePassPage ✅, AboutUsPage ✅, PlaceLayout ✅
**Remaining:** ~197 components need migration

**Priority Order:**
1. Page components (highest crash risk)
2. Layout components  
3. UI components
4. Utility components

---

**This is now the PROJECT STANDARD. All future development must follow these rules.**