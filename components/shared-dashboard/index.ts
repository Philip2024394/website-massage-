/**
 * Shared Dashboard Components - Enterprise Component Library
 * Reusable components for all dashboard types (Place, Facial, Therapist)
 * 
 * Architecture:
 * - Shared tab components
 * - Shared card components
 * - Shared form components
 * - Type-safe props
 * - Consistent styling
 */

export { default as AnalyticsCard } from './cards/AnalyticsCard';
export { default as BookingCard } from './cards/BookingCard';
export { default as NotificationCard } from './cards/NotificationCard';
export { default as ReviewCard } from './cards/ReviewCard';
export { default as ImageUploadCard } from './cards/ImageUploadCard';
export { default as ProfileCard } from './cards/ProfileCard';

export { default as ProfileTab } from './tabs/ProfileTab';
export { default as BookingsTab } from './tabs/BookingsTab';
export { default as AnalyticsTab } from './tabs/AnalyticsTab';
export { default as NotificationsTab } from './tabs/NotificationsTab';
export { default as PWATab } from './tabs/PWATab';

export { default as DashboardLayout } from './layout/DashboardLayout';
export { default as DashboardHeader } from './layout/DashboardHeader';
export { default as DashboardNav } from './layout/DashboardNav';

export type { AnalyticsCardProps } from './cards/AnalyticsCard';
export type { BookingCardProps } from './cards/BookingCard';
export type { NotificationCardProps } from './cards/NotificationCard';
export type { ReviewCardProps } from './cards/ReviewCard';
export type { ImageUploadCardProps } from './cards/ImageUploadCard';
export type { ProfileCardProps } from './cards/ProfileCard';

export type { ProfileTabProps } from './tabs/ProfileTab';
export type { BookingsTabProps } from './tabs/BookingsTab';
export type { AnalyticsTabProps } from './tabs/AnalyticsTab';
export type { NotificationsTabProps } from './tabs/NotificationsTab';
export type { PWATabProps } from './tabs/PWATab';

export type { DashboardLayoutProps } from './layout/DashboardLayout';
export type { DashboardHeaderProps } from './layout/DashboardHeader';
export type { DashboardNavProps } from './layout/DashboardNav';
