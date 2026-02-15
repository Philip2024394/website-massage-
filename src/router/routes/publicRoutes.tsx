/**
 * Public Routes Configuration
 * Landing, marketing, and informational pages
 */

import { lazy } from 'react';

// Lazy-loaded page components
// Critical entry page: import directly to avoid chunk load errors
import LandingPage from '../../pages/MainLandingPage'; // ✅ RESTORED: Original landing page with city selection
import HomePage from '../../pages/HomePage';
import AboutUsPage from '../../pages/AboutUsPage';
const ContactUsPage = lazy(() => import('../../pages/ContactUsPage'));
const CompanyProfilePage = lazy(() => import('../../pages/CompanyProfilePage'));
const HowItWorksPage = lazy(() => import('../../pages/HowItWorksPage'));
const FAQPage = lazy(() => import('../../pages/FAQPage'));
const MassageTypesPage = lazy(() => import('../../pages/MassageTypesPage'));
const FacialTypesPage = lazy(() => import('../../pages/FacialTypesPage'));
const CustomerProvidersPage = lazy(() => import('../../pages/CustomerProvidersPage'));
const FacialProvidersPage = lazy(() => import('../../pages/FacialProvidersPage'));
const TodaysDiscountsPage = lazy(() => import('../../pages/TodaysDiscountsPage'));
const WomenReviewsPage = lazy(() => import('../../pages/WomenReviewsPage'));
const AdvancedSearchPage = lazy(() => import('../../pages/AdvancedSearchPage'));
const HelpFaqPage = lazy(() => import('../../pages/HelpFaqPage'));
const TopTherapistsPage = lazy(() => import('../../pages/TopTherapistsPage'));
const SpecialOffersPage = lazy(() => import('../../pages/SpecialOffersPage'));
const VideoCenterPage = lazy(() => import('../../pages/VideoCenterPage'));
const HotelsVillasPage = lazy(() => import('../../pages/HotelsVillasPage'));
const HotelVillaSafePassPage = lazy(() => import('../../pages/HotelVillaSafePassPage'));

export const publicRoutes = {
  landing: {
    path: '/',
    component: LandingPage,
    name: 'landing'
  },
  home: {
    path: '/home',
    component: HomePage,
    name: 'home'
  },
  about: {
    path: '/about',
    component: AboutUsPage,
    name: 'about'
  },
  contact: {
    path: '/contact',
    component: ContactUsPage,
    name: 'contact'
  },
  company: {
    path: '/company',
    component: CompanyProfilePage,
    name: 'company'
  },
  howItWorks: {
    path: '/how-it-works',
    component: HowItWorksPage,
    name: 'howItWorks'
  },
  faq: {
    path: '/faq',
    component: FAQPage,
    name: 'faq'
  },
  massageTypes: {
    path: '/massage-types',
    component: MassageTypesPage,
    name: 'massageTypes'
  },
  facialTypes: {
    path: '/facial-types',
    component: FacialTypesPage,
    name: 'facialTypes'
  },
  providers: {
    path: '/providers',
    component: CustomerProvidersPage,
    name: 'providers'
  },
  facialProviders: {
    path: '/facial-providers',
    component: FacialProvidersPage,
    name: 'facialProviders'
  },
  discounts: {
    path: '/discounts',
    component: TodaysDiscountsPage,
    name: 'discounts'
  },
  womenReviews: {
    path: '/women-reviews',
    component: WomenReviewsPage,
    name: 'womenReviews'
  },
  advancedSearch: {
    path: '/advanced-search',
    component: AdvancedSearchPage,
    name: 'advancedSearch'
  },
  helpFaq: {
    path: '/help-faq',
    component: FAQPage,
    name: 'helpFaq'
  },
  topTherapists: {
    path: '/top-therapists',
    component: TopTherapistsPage,
    name: 'topTherapists'
  },
  specialOffers: {
    path: '/special-offers',
    component: SpecialOffersPage,
    name: 'specialOffers'
  },
  videoCenter: {
    path: '/video-center',
    component: VideoCenterPage,
    name: 'videoCenter'
  },
  hotelsVillas: {
    path: '/hotels-and-villas',
    component: HotelsVillasPage,
    name: 'hotelsVillas'  },
  safePass: {
    path: '/hotel-villa-safe-pass',
    component: HotelVillaSafePassPage,
    name: 'safePass'  }
};

export type PublicRouteName = keyof typeof publicRoutes;
