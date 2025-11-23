// Page numbering system for development and admin management
export const PAGE_REGISTRY = {
    // Core Pages (1-20)
    1: { name: 'LandingPage', file: 'pages/LandingPage.tsx', locked: true },
    2: { name: 'HomePage', file: 'pages/HomePage.tsx', locked: false },
    3: { name: 'UnifiedLoginPage', file: 'pages/UnifiedLoginPage.tsx', locked: false },
    4: { name: 'TherapistLoginPage', file: 'pages/TherapistLoginPage.tsx', locked: false },
    
    // Therapist Pages (21-40)
    21: { name: 'TherapistDashboardPage', file: 'pages/TherapistDashboardPage.tsx', locked: false },
    22: { name: 'TherapistStatusPage', file: 'pages/TherapistStatusPage.tsx', locked: false },
    23: { name: 'TherapistProfileForm', file: 'components/therapist/TherapistProfileForm.tsx', locked: false },
    
    // Customer Pages (61-80)
    61: { name: 'CustomerAuthPage', file: 'pages/CustomerAuthPage.tsx', locked: false },
    62: { name: 'CustomerDashboardPage', file: 'pages/CustomerDashboardPage.tsx', locked: false },
    
    // Place Pages (81-100)
    81: { name: 'PlaceDashboardPage', file: 'pages/PlaceDashboardPage.tsx', locked: false },
    82: { name: 'PlaceDetailPage', file: 'pages/PlaceDetailPage.tsx', locked: false },
    83: { name: 'MassagePlaceProfilePage', file: 'pages/MassagePlaceProfilePage.tsx', locked: false },
    
    // Agent Pages (101-120)
    101: { name: 'AgentPage', file: 'pages/AgentPage.tsx', locked: false },
    102: { name: 'AgentAuthPage', file: 'pages/AgentAuthPage.tsx', locked: false },
    103: { name: 'AgentDashboardPage', file: 'pages/AgentDashboardPage.tsx', locked: false },
    
    // Booking & Payment (121-140)
    121: { name: 'BookingPage', file: 'pages/BookingPage.tsx', locked: false },
    122: { name: 'JobPostingPaymentPage', file: 'pages/JobPostingPaymentPage.tsx', locked: false },
    
    // Hotel & Villa (141-160)
    141: { name: 'HotelDashboardPage', file: 'deleted/hotel-dashboard/HotelDashboardPage.tsx', locked: true },
    142: { name: 'VillaDashboardPage', file: 'pages/VillaDashboardPage.tsx', locked: false },
    143: { name: 'HotelVillaMenuPage', file: 'pages/HotelVillaMenuPage.tsx', locked: false },
    
    // Components (161-200)
    161: { name: 'AppDrawer', file: 'components/AppDrawer.tsx', locked: true },
    162: { name: 'TherapistCard', file: 'components/TherapistCard.tsx', locked: false },
    163: { name: 'MassagePlaceCard', file: 'components/MassagePlaceCard.tsx', locked: false },
    164: { name: 'DashboardComponents', file: 'components/shared/DashboardComponents.tsx', locked: true },
    
    // Blog Pages (201-250)
    201: { name: 'BlogIndexPage', file: 'pages/BlogIndexPage.tsx', locked: false },
    202: { name: 'BaliSpaIndustryTrends2025', file: 'pages/blog/BaliSpaIndustryTrends2025Page.tsx', locked: false },
    203: { name: 'Top10MassageTechniques', file: 'pages/blog/Top10MassageTechniquesPage.tsx', locked: false },
    
    // Info Pages (251-300)
    251: { name: 'AboutUsPage', file: 'pages/AboutUsPage.tsx', locked: false },
    252: { name: 'HowItWorksPage', file: 'pages/HowItWorksPage.tsx', locked: false },
    253: { name: 'FAQPage', file: 'pages/FAQPage.tsx', locked: false },
    254: { name: 'PrivacyPolicyPage', file: 'pages/PrivacyPolicyPage.tsx', locked: false },
    255: { name: 'ServiceTermsPage', file: 'pages/ServiceTermsPage.tsx', locked: false }
} as const;

// Admin configuration for showing/hiding page numbers
export interface PageNumberConfig {
    showNumbers: boolean;
    onlyInDevelopment: boolean;
    showLockedIndicator: boolean;
}

export const DEFAULT_PAGE_CONFIG: PageNumberConfig = {
    showNumbers: true, // Show by default in development
    onlyInDevelopment: true, // Hide in production
    showLockedIndicator: true // Show lock icons
};

// Helper functions
export const getPageInfo = (pageNumber: number) => {
    return PAGE_REGISTRY[pageNumber as keyof typeof PAGE_REGISTRY];
};

export const findPageByName = (pageName: string) => {
    const entries = Object.entries(PAGE_REGISTRY);
    const found = entries.find(([_, info]) => info.name === pageName);
    return found ? { number: parseInt(found[0]), ...found[1] } : null;
};

export const getLockedPages = () => {
    return Object.entries(PAGE_REGISTRY)
        .filter(([_, info]) => info.locked)
        .map(([num, info]) => ({ number: parseInt(num), ...info }));
};

export const getUnlockedPages = () => {
    return Object.entries(PAGE_REGISTRY)
        .filter(([_, info]) => !info.locked)
        .map(([num, info]) => ({ number: parseInt(num), ...info }));
};