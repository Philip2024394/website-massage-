import type { Page } from '../../types/pageTypes';

/**
 * Authentication Routes Helper
 * Simple utility to identify authentication-related routes for better organization
 */

export const isAuthRoute = (page: Page): boolean => {
    const authRoutes = [
        'unifiedLogin',
        'therapistLogin', 
        'adminLogin',
        'hotelLogin',
        'villaLogin',
        'massagePlaceLogin',
        'customerAuth',
        'providerAuth',
        'registrationChoice'
    ];
    return authRoutes.includes(page);
};

export const isDashboardRoute = (page: Page): boolean => {
    const dashboardRoutes = [
        'therapistDashboard',
        'placeDashboard',
        'villaDashboard',
        'adminDashboard',
        'customerDashboard'
    ];
    return dashboardRoutes.includes(page);
};

export const isContentRoute = (page: Page): boolean => {
    const contentRoutes = [
        'blog',
        'faq',
        'about',
        'how-it-works',
        'terms',
        'privacy',
        'massage-bali',
        'balinese-massage',
        'deep-tissue-massage',
        'thai-massage',
        'swedish-massage',
        'reflexology-massage',
        'shiatsu-massage',
        'sports-massage',
        'pregnancy-massage'
    ];
    return contentRoutes.includes(page);
};