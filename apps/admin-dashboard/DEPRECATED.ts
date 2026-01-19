/**
 * =====================================================================
 * ⚠️ DEPRECATED - ADMIN DASHBOARD HAS BEEN MERGED
 * =====================================================================
 * 
 * This standalone admin-dashboard app has been MERGED into the main application.
 * 
 * NEW LOCATION:
 * - Admin Dashboard: /admin or /#/admin
 * - Admin Services: lib/adminServices.ts
 * - Admin Guards: lib/adminGuard.tsx
 * - Unified Client: lib/appwriteClient.ts
 * 
 * WHY MERGED:
 * 1. Single Appwrite client instance (no duplicate connections)
 * 2. Shared authentication flow
 * 3. Role-based access control
 * 4. Reduced bundle size
 * 5. Consistent codebase
 * 
 * HOW TO ACCESS ADMIN:
 * 1. Navigate to /#/admin or /admin
 * 2. Login with admin credentials
 * 3. AdminGuard protects routes automatically
 * 
 * REMOVAL SCHEDULE:
 * This folder can be safely deleted after confirming the merge works.
 * 
 * @deprecated Use main app /admin route instead
 * @version DEPRECATED
 */

console.warn('⚠️ DEPRECATED: apps/admin-dashboard has been merged into the main app.');
console.warn('📍 Access admin at: /#/admin');
console.warn('🗑️ This folder can be removed.');

export {};
