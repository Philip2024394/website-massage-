# Migration Guide: Old Structure → New Modular Architecture

## Overview
This guide helps migrate from the current flat structure to the new modular architecture with separate apps for each user type.

## Migration Steps

### 1. Install Dependencies
```bash
# Install React Router and other new dependencies
npm install react-router-dom@^6.28.0 @tanstack/react-query@^5.0.0
npm install axios date-fns framer-motion react-hook-form react-hot-toast
npm install react-icons zustand clsx tailwind-merge

# Install dev dependencies
npm install -D @types/react@^19.1.1 @types/react-dom@^19.1.1
npm install -D @testing-library/react @testing-library/jest-dom vitest jsdom
```

### 2. File Migration Map

#### Current Files → New Locations

```
# Admin Files
pages/AdminLoginPage.tsx → src/apps/admin/pages/AdminLogin.tsx ✅
pages/AdminDashboardPage.tsx → src/apps/admin/pages/AdminDashboard.tsx ✅

# Agent Files  
pages/AgentAuthPage.tsx → src/apps/agent/pages/AgentAuth.tsx
pages/AgentDashboardPage.tsx → src/apps/agent/pages/AgentDashboard.tsx

# Client Files
pages/AuthPage.tsx → src/apps/client/pages/ClientAuth.tsx
pages/HomePage.tsx → src/apps/client/pages/ClientHome.tsx
pages/BookingPage.tsx → src/apps/client/pages/BookingPage.tsx

# Therapist Files
pages/ProviderAuthPage.tsx → src/apps/therapist/pages/TherapistAuth.tsx
pages/TherapistDashboardPage.tsx → src/apps/therapist/pages/TherapistDashboard.tsx

# Place Files
pages/PlaceDashboardPage.tsx → src/apps/place/pages/PlaceDashboard.tsx
pages/PlaceDetailPage.tsx → src/apps/place/pages/PlaceDetail.tsx

# Hotel Files
pages/HotelDashboardPage.tsx → src/apps/hotel/pages/HotelDashboard.tsx

# Villa Files  
pages/VillaDashboardPage.tsx → src/apps/villa/pages/VillaDashboard.tsx

# Shared Components
components/ → src/shared/components/
types.ts → src/shared/types/index.ts ✅
constants.ts → src/shared/constants/index.ts ✅
lib/supabase.ts → src/shared/services/supabase.ts
```

### 3. Update Import Paths

#### Old Import Style:
```typescript
import { Therapist, Place } from '../types';
import { supabase } from '../lib/supabase';
import Button from '../components/Button';
```

#### New Import Style:
```typescript
import { Therapist, Place } from '@/shared/types';
import { supabase } from '@/shared/services/supabase';
import Button from '@/shared/components/Button';
```

### 4. App-Specific Imports:
```typescript
// Admin app imports
import { useAdminAuth } from '@/admin/hooks/useAdminAuth';
import AdminDashboard from '@/admin/pages/AdminDashboard';

// Therapist app imports  
import { useTherapistAuth } from '@/therapist/hooks/useTherapistAuth';
import TherapistDashboard from '@/therapist/pages/TherapistDashboard';
```

### 5. Configuration Updates

#### Replace package.json:
```bash
cp package-new.json package.json
```

#### Replace tsconfig.json:
```bash  
cp tsconfig-new.json tsconfig.json
```

#### Replace vite.config.ts:
```bash
cp vite.config-new.ts vite.config.ts
```

### 6. Create New Entry Point

#### Update index.tsx:
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './src/AppRouter';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>,
);
```

### 7. Migration Checklist

#### Phase 1: Setup New Structure ✅
- [x] Create src/apps/ directories
- [x] Create src/shared/ directories  
- [x] Move shared types and constants
- [x] Create base admin app structure

#### Phase 2: Migrate Components
- [ ] Move all components to src/shared/components/
- [ ] Update import paths in components
- [ ] Test component functionality

#### Phase 3: Migrate Pages by App Type
- [ ] Migrate admin pages
- [ ] Migrate agent pages  
- [ ] Migrate client pages
- [ ] Migrate therapist pages
- [ ] Migrate place pages
- [ ] Migrate hotel pages
- [ ] Migrate villa pages

#### Phase 4: Update Routing
- [ ] Implement app-specific routing
- [ ] Test navigation between apps
- [ ] Update authentication flows

#### Phase 5: Mobile Preparation
- [ ] Extract business logic to shared services
- [ ] Create mobile-friendly APIs
- [ ] Setup React Native project structure

### 8. Testing Strategy

#### Component Testing:
```bash
npm test -- components
```

#### App Integration Testing:  
```bash
npm test -- apps/admin
npm test -- apps/therapist
# etc.
```

#### E2E Testing:
```bash
npm run test:e2e
```

### 9. Deployment Strategy

#### Development:
```bash
npm run dev
```

#### Production Build:
```bash
npm run build
npm run preview
```

#### Mobile Development:
```bash
npm run mobile:start
npm run mobile:android
npm run mobile:ios
```

### 10. Benefits After Migration

1. **Cleaner Code Organization**
   - Clear separation between user types
   - Easier to find and maintain code
   - Better team collaboration

2. **Improved Performance** 
   - Code splitting by app type
   - Smaller bundle sizes
   - Faster initial load times

3. **Better Scalability**
   - Easy to add new user types
   - Independent feature development
   - Modular deployment options

4. **Mobile Ready**
   - Shared business logic
   - API-first architecture
   - React Native compatibility

5. **Enhanced Security**
   - Role-based access control
   - App-level permissions
   - Isolated authentication

### 11. Common Migration Issues

#### Import Errors:
- Update all relative imports to use alias paths
- Check tsconfig.json path mappings
- Restart TypeScript service in IDE

#### Component Conflicts:
- Check for duplicate component names
- Ensure proper export/import statements
- Verify component locations

#### Routing Issues:
- Test each app route individually  
- Verify nested routing works correctly
- Check authentication redirects

### 12. Post-Migration Validation

- [ ] All apps load without errors
- [ ] Authentication works for each user type
- [ ] Navigation between pages works
- [ ] Shared components render correctly
- [ ] API calls function properly
- [ ] Build process completes successfully

## Support

For migration assistance or issues:
1. Check the ARCHITECTURE.md documentation
2. Review the error logs for specific issues  
3. Test each app independently
4. Verify import paths and configurations