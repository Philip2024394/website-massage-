/**
 * Provider Profile Routes
 * Individual provider and place detail pages
 */

import React from 'react';

const TherapistProfilePage = React.lazy(() => import('../../pages/TherapistProfilePage'));
const MassagePlaceProfilePage = React.lazy(() => import('../../pages/MassagePlaceProfilePage'));
const FacialPlaceProfilePage = React.lazy(() => import('../../pages/FacialPlaceProfilePageNew'));
const PlaceDetailPage = React.lazy(() => import('../../pages/PlaceDetailPage'));

// New shared profile components (bulletproof, guaranteed to work)
const SharedTherapistProfile = React.lazy(() => import('../../features/shared-profiles/SharedTherapistProfile'));
const SharedPlaceProfile = React.lazy(() => import('../../features/shared-profiles/SharedPlaceProfile'));
const SharedFacialProfile = React.lazy(() => import('../../features/shared-profiles/SharedFacialProfile'));

// Legacy - for backwards compatibility
const SharedTherapistProfilePage = React.lazy(() => import('../../pages/SharedTherapistProfilePage'));

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
  // LEGACY: Keep old URLs working (redirect to new)
  sharedTherapist: {
    path: '/therapist-profile/:id',
    component: SharedTherapistProfilePage,
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
  placeDetail: {
    path: '/place/:id',
    component: PlaceDetailPage,
    name: 'placeDetail'
  }
};

export type ProfileRouteName = keyof typeof profileRoutes;
