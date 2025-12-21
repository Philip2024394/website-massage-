/**
 * Legal & Compliance Routes
 * Terms, policies, and legal documents
 */

import React from 'react';

const PrivacyPolicyPage = React.lazy(() => import('../../pages/PrivacyPolicyPage'));
const CookiesPolicyPage = React.lazy(() => import('../../pages/CookiesPolicyPage'));
const ServiceTermsPage = React.lazy(() => import('../../pages/ServiceTermsPage'));
const PlaceTermsPage = React.lazy(() => import('../../pages/PlaceTermsPage'));
const PackageTermsPage = React.lazy(() => import('../../pages/PackageTermsPage'));
const MembershipTermsPage = React.lazy(() => import('../../pages/MembershipTermsPage'));
const MobileTermsAndConditionsPage = React.lazy(() => import('../../pages/MobileTermsAndConditionsPage'));

export const legalRoutes = {
  privacy: {
    path: '/privacy-policy',
    component: PrivacyPolicyPage,
    name: 'privacy'
  },
  cookies: {
    path: '/cookies-policy',
    component: CookiesPolicyPage,
    name: 'cookies'
  },
  serviceTerms: {
    path: '/service-terms',
    component: ServiceTermsPage,
    name: 'serviceTerms'
  },
  placeTerms: {
    path: '/place-terms',
    component: PlaceTermsPage,
    name: 'placeTerms'
  },
  packageTerms: {
    path: '/package-terms',
    component: PackageTermsPage,
    name: 'packageTerms'
  },
  membershipTerms: {
    path: '/membership-terms',
    component: MembershipTermsPage,
    name: 'membershipTerms'
  },
  mobileTerms: {
    path: '/mobile-terms-and-conditions',
    component: MobileTermsAndConditionsPage,
    name: 'mobileTerms'
  }
};

export type LegalRouteName = keyof typeof legalRoutes;
