# ROUTING CONTRACT (LOCKED)

⚠️ **CRITICAL**: This contract defines production routing architecture.
🚫 **DO NOT MODIFY**: AI tools must not alter route definitions without explicit approval.
📋 **SOURCE OF TRUTH**: Always refer to this file for navigation requirements.

---

## ROUTE ARCHITECTURE

### **Main Router**
- **File**: `AppRouter.tsx` (1543 lines)
- **Contract**: Enterprise-grade lazy loading with error boundaries
- **Pattern**: Suspense + LazyLoadErrorBoundary for all components

### **Route Modules**
- **File**: `router/routes/index.ts`
- **Contract**: Centralized route configuration export
- **Modules**: `publicRoutes`, `legalRoutes`, `blogRoutes`, `authRoutes`, `profileRoutes`, `adminRoutes`

---

## ROUTE DEFINITIONS

### **Public Routes**
- **Pattern**: `/#/` hash-based routing
- **Authentication**: None required
- **Examples**: `/#/home`, `/#/therapists`, `/#/places`

### **Admin Routes**
- **File**: `router/routes/adminRoutes.tsx`
- **Contract**: ALL routes require `requiresAuth: true, requiresAdmin: true`
- **Protection**: AdminGuard component MUST wrap all admin routes
- **Base Path**: `/admin`

**Protected Admin Routes**:
```typescript
dashboard: '/admin'
therapists: '/admin/therapists'  
bookings: '/admin/bookings'
chat: '/admin/chat'
revenue: '/admin/revenue'
commissions: '/admin/commissions'
achievements: '/admin/achievements'
systemHealth: '/admin/system-health'
settings: '/admin/settings'
```

### **Dashboard Routes**
- **Therapist**: `apps/therapist-dashboard/`
- **Place**: `apps/place-dashboard/`  
- **Admin**: `pages/admin/AdminDashboardPage.tsx`
- **Contract**: Each dashboard isolated, no cross-contamination

---

## NAVIGATION REQUIREMENTS

### **Route Guards**
- **Admin Routes**: MUST be wrapped with AdminGuard
- **Auth Routes**: Check session state before rendering
- **Protected Routes**: Anonymous session required

### **Error Handling**  
- **Component**: LazyLoadErrorBoundary
- **Behavior**: Fallback UI on lazy load failures
- **Logging**: window.__lazyErrorMessage, window.__lazyErrorStack

### **Loading States**
- **Component**: LoadingSpinner
- **Contract**: Show during Suspense loading
- **Timeout**: 3 seconds maximum

---

## PROHIBITED MODIFICATIONS

### **Never Change**
- Route protection requirements  
- Admin route authentication
- Hash-based routing pattern
- Lazy loading architecture
- Error boundary structure

### **Never Add**
- Unprotected admin routes
- Direct component imports (bypass lazy loading)
- Routes without proper guards
- Client-side route validation bypasses

---

## ROUTE VALIDATION

### **Admin Route Requirements**
```typescript
{
  path: string;
  component: LazyComponent;
  name: string;
  requiresAuth: true;      // REQUIRED
  requiresAdmin: true;     // REQUIRED
}
```

### **Route Component Pattern**
```typescript
const Component = lazy(() => import('path/to/Component'));
// MUST use lazy() for all route components
```

---

**Last Updated**: January 20, 2026  
**Contract Version**: Production v1.0  
**Compliance**: Enterprise Route Architecture