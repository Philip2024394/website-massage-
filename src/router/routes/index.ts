/**
 * Centralized Route Configuration
 * Exports all route modules
 */

export { publicRoutes, type PublicRouteName } from './publicRoutes';
export { legalRoutes, type LegalRouteName } from './legalRoutes';
export { blogRoutes, type BlogRouteName } from './blogRoutes';
export { authRoutes, type AuthRouteName } from './authRoutes';
export { profileRoutes, type ProfileRouteName } from './profileRoutes';
export { adminRoutes } from './adminRoutes';

// Combined route types
export type RouteName = 
  | import('./publicRoutes').PublicRouteName
  | import('./legalRoutes').LegalRouteName
  | import('./blogRoutes').BlogRouteName
  | import('./authRoutes').AuthRouteName
  | import('./profileRoutes').ProfileRouteName;
