/**
 * Public Routes Configuration
 * Landing, marketing, and informational pages
 */

import { lazy } from 'react';

// Lazy-loaded page components
// Critical entry page: import directly to avoid chunk load errors
import LandingPage from '../../pages/LandingPage';
import HomePage from '../../pages/HomePage';
const AboutUsPage = lazy(() => import('../../pages/AboutUsPage'));
const ContactUsPage = lazy(() => import('../../pages/ContactUsPage'));
const CompanyProfilePage = lazy(() => import('../../pages/CompanyProfilePage'));
const HowItWorksPage = lazy(() => import('../../pages/HowItWorksPage'));
const FAQPage = lazy(() => import('../../pages/FAQPage'));
const MassageTypesPage = lazy(() => import('../../pages/MassageTypesPage'));
const FacialTypesPage = lazy(() => import('../../pages/FacialTypesPage'));
const CustomerProvidersPage = lazy(() => import('../../pages/CustomerProvidersPage'));
const FacialProvidersPage = lazy(() => import('../../pages/FacialProvidersPage'));
const TodaysDiscountsPage = React.lazy(() => import('../../pages/TodaysDiscountsPage'));

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
  }
};

export type PublicRouteName = keyof typeof publicRoutes;
