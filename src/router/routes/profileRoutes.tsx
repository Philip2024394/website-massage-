/**
 * 🔒 PROTECTED FILE - CRITICAL ROUTING CONFIGURATION 🔒
 * 
 * Provider Profile Routes
 * Individual provider and place detail pages
 * 
 * ⚠️ WARNING: Changes here affect ALL profile URLs platform-wide
 * ⚠️ TESTED & WORKING: January 10, 2026
 * 
 * CRITICAL ROUTES:
 * - /therapist-profile/:id → SharedTherapistProfile (NEW, WORKING)
 * - /share/therapist/:id → SharedTherapistProfile (NEW, WORKING)
 * - /share/place/:id → SharedPlaceProfile (NEW, WORKING)
 * - /share/facial/:id → SharedFacialProfile (NEW, WORKING)
 * 
 * 🚨 DO NOT change component imports without thorough testing
 */

import { lazy } from 'react';

// Direct import to prevent dynamic loading errors
import TherapistProfilePage from '../../pages/TherapistProfilePage';
import MassagePlaceProfilePage from '../../pages/MassagePlaceProfilePage';
const FacialPlaceProfilePage = lazy(() => import('../../pages/FacialPlaceToClinicProfileAdapter'));
const BeautyPlaceProfilePage = lazy(() => import('../../pages/BeautyPlaceProfilePage'));
const PlaceDetailPage = lazy(() => import('../../pages/PlaceDetailPage'));

// New shared profile components (bulletproof, guaranteed to work)
const SharedTherapistProfile = lazy(() => import('../../features/shared-profiles/SharedTherapistProfile'));
const SharedPlaceProfile = lazy(() => import('../../features/shared-profiles/SharedPlaceProfile'));
const SharedFacialProfile = lazy(() => import('../../features/shared-profiles/SharedFacialProfile'));

// Legacy - for backwards compatibility (using the same component as above)
const SharedTherapistProfilePage = SharedTherapistProfile;

export const profileRoutes = {
  therapist: {
    path: '/therapist/:id',
    component: TherapistProfilePage,
    name: 'therapist'
  },
  // NEW: Profile page with reviews (internal + shareable URL)
  therapistProfile: {
    path: '/profile/therapist/:id',
    component: TherapistProfilePage,
    name: 'therapistProfile'
  },
  // NEW: Simple, clean share URLs
  shareTherapist: {
    path: '/share/therapist/:id',
    component: SharedTherapistProfile,
    name: 'shareTherapist'
  },
  // NEW: SEO-optimized share URLs with location keywords
  shareTherapistSEO: {
    path: '/share/:slug/:id',
    component: SharedTherapistProfile,
    name: 'shareTherapistSEO'
  },
  sharePlace: {
    path: '/share/place/:id',
    component: SharedPlaceProfile,
    name: 'sharePlace'
  },
  shareFacial: {
    path: '/share/facial/:id',
    component: SharedFacialProfile,
    name: 'shareFacial'
  },
  // LEGACY: Keep old URLs working (now uses new component)
  sharedTherapist: {
    path: '/therapist-profile/:id',
    component: SharedTherapistProfile,
    name: 'sharedTherapist'
  },
  massagePlace: {
    path: '/massage-place/:id',
    component: MassagePlaceProfilePage,
    name: 'massagePlace'
  },
  facialPlace: {
    path: '/facial-place/:id',
    component: FacialPlaceProfilePage,
    name: 'facialPlace'
  },
  beautyPlace: {
    path: '/beauty-place/:id',
    component: BeautyPlaceProfilePage,
    name: 'beautyPlace'
  },
  placeDetail: {
    path: '/place/:id',
    component: PlaceDetailPage,
    name: 'placeDetail'
  }
};

export type ProfileRouteName = keyof typeof profileRoutes;
