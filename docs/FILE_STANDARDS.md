# 📏 File Size & Organization Standards (Facebook/Amazon Grade)

## 🎯 Core Principles

### File Size Limits
- **Components**: MAX 250 lines (Facebook: 200-250)
- **Utils/Helpers**: MAX 150 lines (Amazon: 100-150)
- **Hooks**: MAX 100 lines
- **Types**: MAX 200 lines per file
- **Services**: MAX 300 lines (split into modules)

### Code Splitting Requirements
- Route-based splitting: Each route = separate bundle
- Component lazy loading: Use `React.lazy()` for heavy components
- Dynamic imports: Load on-demand features
- Vendor chunk optimization: Separate framework code

---

## 📁 Recommended File Structure

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx (< 150 lines)
│   │   ├── Button.styles.ts (< 50 lines)
│   │   ├── Button.test.tsx
│   │   └── index.ts
│   └── [ComponentName]/ (same pattern)
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   └── [feature-name]/
├── shared/
│   ├── hooks/ (< 100 lines each)
│   ├── utils/ (< 150 lines each)
│   ├── constants/
│   └── types/
├── services/ (< 300 lines, split by domain)
└── pages/ (minimal, only routing)
```

---

## ⚡ Performance Standards

### Bundle Size Targets (Production)
- **Initial Load**: < 200 KB (gzip)
- **Per Route**: < 100 KB (gzip)
- **Total App**: < 1 MB (gzip)

### Mobile Performance
- **First Contentful Paint (FCP)**: < 1.8s
- **Time to Interactive (TTI)**: < 3.9s
- **Largest Contentful Paint (LCP)**: < 2.5s

### Code Splitting Strategy
```tsx
// ✅ GOOD: Lazy load heavy features
const AdminDashboard = React.lazy(() => import('./features/admin/Dashboard'));
const TherapistApp = React.lazy(() => import('./apps/therapist/TherapistApp'));

// ✅ GOOD: Route-based splitting
const routes = [
  { path: '/admin', component: lazy(() => import('./pages/AdminPage')) },
  { path: '/therapist', component: lazy(() => import('./pages/TherapistPage')) }
];

// ❌ BAD: Loading everything upfront
import AdminDashboard from './features/admin/Dashboard';
import TherapistApp from './apps/therapist/TherapistApp';
```

---

## 🔧 Refactoring Rules

### When to Split a File

#### 1. **Components > 250 lines**
```tsx
// BEFORE: MassiveComponent.tsx (500 lines) ❌

// AFTER: Split into ✅
MassiveComponent/
├── MassiveComponent.tsx (main, < 150 lines)
├── MassiveComponentHeader.tsx (< 100 lines)
├── MassiveComponentBody.tsx (< 150 lines)
├── MassiveComponentFooter.tsx (< 100 lines)
└── useMassiveComponentLogic.ts (< 100 lines)
```

#### 2. **Utils > 150 lines**
```typescript
// BEFORE: helpers.ts (400 lines) ❌

// AFTER: Split into ✅
utils/
├── dateHelpers.ts (< 100 lines)
├── stringHelpers.ts (< 80 lines)
├── arrayHelpers.ts (< 90 lines)
└── validationHelpers.ts (< 130 lines)
```

#### 3. **Multiple Responsibilities**
```tsx
// ❌ BAD: One file doing everything
export const UserManagement = () => {
  // Authentication logic
  // Profile management
  // Notifications
  // Settings
};

// ✅ GOOD: Separate concerns
features/user/
├── UserAuth.tsx
├── UserProfile.tsx
├── UserNotifications.tsx
└── UserSettings.tsx
```

---

## 📊 Monitoring & Metrics

### Bundle Analysis Command
```bash
npm run build && npx vite-bundle-visualizer
```

### Size Limits (package.json)
```json
{
  "size-limit": [
    {
      "path": "dist/index.js",
      "limit": "200 KB"
    }
  ]
}
```

---

## 🚀 Migration Checklist

- [ ] Move all .md files to `/docs` folder
- [ ] Split components > 250 lines
- [ ] Split utils > 150 lines
- [ ] Implement lazy loading for routes
- [ ] Add code splitting for heavy features
- [ ] Configure VS Code to ignore build artifacts
- [ ] Close unused terminals (close 90+ terminals)
- [ ] Run `npm run clean:all` to remove caches
- [ ] Verify bundle sizes after optimization

---

## 📱 Mobile Optimization Rules

### Image Optimization
- Use WebP format
- Max size: 200 KB per image
- Lazy load images below fold
- Use srcset for responsive images

### CSS Optimization
- Use CSS Modules or Tailwind
- Remove unused styles
- Critical CSS inline
- Defer non-critical CSS

### JavaScript Optimization
- Tree shaking enabled
- Remove console.logs in production
- Minify and compress
- Use Brotli compression

---

## 🎯 Action Items for Current Project

### Immediate Fixes
1. **Close 90+ terminals** - Memory leak!
2. **Move 142 .md files** to `/docs`
3. **Run cleanup**: `npm run clean:all`
4. **Split large files** (see analysis below)

### Files to Refactor (Priority)
Run this to find large files:
```powershell
Get-ChildItem -Path "src" -Recurse -Filter "*.tsx" | 
  Where-Object { (Get-Content $_.FullName | Measure-Object -Line).Lines -gt 250 } | 
  Select-Object Name, @{N='Lines';E={(Get-Content $_.FullName | Measure-Object -Line).Lines}}
```

---

## 📚 References
- Facebook React Codebase Standards
- Amazon Code Review Guidelines  
- Google Web Vitals
- Lighthouse Performance Scoring
