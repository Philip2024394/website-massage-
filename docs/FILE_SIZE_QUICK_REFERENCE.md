# File Size Optimization - Quick Reference

## 🎯 File Size Limits (Facebook/Amazon Standards)

| File Type | Max Size | Average Target |
|-----------|----------|----------------|
| Components | 15 KB | 10-12 KB |
| Services | 20 KB | 12-15 KB |
| Pages | 25 KB | 18-20 KB |
| Hooks | 8 KB | 5-6 KB |
| Utils | 10 KB | 6-8 KB |
| Types | 15 KB | 8-10 KB |

## ⚡ Quick Commands

```bash
# Check file sizes
npm run monitor:files

# Run before committing
npm run precheck

# Check service migration progress
npm run migrate:services

# Lint with size checks
npm run lint
```

## 🚨 Warning Signs

Your file is too large if:
- ✅ ESLint shows file-size errors
- ✅ VS Code feels slow when editing
- ✅ File is > 50 KB
- ✅ Scrolling lags
- ✅ IntelliSense is delayed

## 🔧 Quick Fixes

### Component Too Large?
```typescript
// ❌ Before: One huge component
const HugeComponent = () => {
  // 500+ lines
}

// ✅ After: Split into smaller ones
const MainComponent = () => (
  <>
    <Header />
    <Content />
    <Footer />
  </>
);
```

### Service Too Large?
```typescript
// ❌ Before: One service for everything
export const megaService = {
  // 100+ methods
}

// ✅ After: Domain-specific services
export const userService = { /* user methods */ };
export const bookingService = { /* booking methods */ };
```

### Hook Too Large?
```typescript
// ❌ Before: God hook
const useEverything = () => {
  // All app logic
}

// ✅ After: Focused hooks
const useUserData = () => { /* ... */ };
const useBooking = () => { /* ... */ };
```

## 📦 Refactoring Checklist

When file exceeds limit:

1. **Extract Components**
   - [ ] Identify repeating UI patterns
   - [ ] Create reusable sub-components
   - [ ] Move to separate files

2. **Extract Logic**
   - [ ] Move state logic to custom hooks
   - [ ] Extract pure functions to utils/
   - [ ] Separate business logic from UI

3. **Split by Feature**
   - [ ] Group related functionality
   - [ ] Create feature modules
   - [ ] Use barrel exports (index.ts)

4. **Test**
   - [ ] Run `npm run type-check`
   - [ ] Run `npm run lint`
   - [ ] Test functionality
   - [ ] Run `npm run monitor:files`

## 🎨 Best Practices

### DO ✅
- Keep components focused (single responsibility)
- Extract repeated code
- Use composition over complexity
- Split by business domain
- Run size checks regularly

### DON'T ❌
- Put everything in one file
- Mix concerns (UI + logic + data)
- Ignore ESLint warnings
- Skip refactoring when file grows
- Delay splitting until it's huge

## 🆘 Quick Help

### "My component is 50KB, where do I start?"
1. Extract all sub-components
2. Move hooks to separate files
3. Extract utilities
4. Split by sections (header, body, footer)

### "My service is 100KB, help!"
1. List all methods
2. Group by domain (user, booking, payment, etc.)
3. Create separate service files
4. Update imports

### "VS Code is slow on this file"
1. Check file size: `ls -lh <filename>`
2. If > 50KB, immediate refactoring needed
3. Follow refactoring checklist above
4. Restart VS Code after refactoring

## 📱 Import Patterns

### Good Import Structure
```typescript
// Specific imports (tree-shakeable)
import { therapistService } from '@/lib/appwrite/services/therapist.service';
import { bookingService } from '@/lib/appwrite/services/booking.service';

// Or through index (also tree-shakeable)
import { therapistService, bookingService } from '@/lib/appwrite';
```

### Bad Import Structure
```typescript
// Importing entire monolith
import * as services from '@/lib/appwriteService';

// Circular dependencies
import { ComponentA } from './ComponentA';
// ComponentA also imports this file
```

## 🎯 Goals Per File Type

### React Components
- **Target**: 10-15 KB
- **Max**: 15 KB
- **If larger**: Extract sub-components

### Service Files
- **Target**: 12-18 KB
- **Max**: 20 KB
- **If larger**: Split by domain

### Custom Hooks
- **Target**: 4-6 KB
- **Max**: 8 KB
- **If larger**: Split by concern

### Utility Files
- **Target**: 6-8 KB
- **Max**: 10 KB
- **If larger**: Group into modules

## 🔍 Monitoring

### Daily
```bash
npm run monitor:files  # Check for new violations
```

### Before Commit
```bash
npm run precheck      # Automated check
```

### Weekly
```bash
npm run size:report   # Generate full report
npm run migrate:services  # Check migration progress
```

## 📊 Success Indicators

You're doing well if:
- ✅ All files < 25 KB
- ✅ No ESLint file-size errors
- ✅ VS Code feels snappy
- ✅ IntelliSense is instant
- ✅ No crashes or freezes

---

**Quick Tip**: When in doubt, split it out! Smaller files are always better than larger ones.

**Remember**: These limits aren't arbitrary - they're based on VS Code performance and developer experience research by Facebook, Amazon, and Google.