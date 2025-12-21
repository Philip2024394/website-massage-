/**
 * Provider Profile Routes
 * Individual provider and place detail pages
 */

import React from 'react';

const TherapistProfilePage = React.lazy(() => import('../../pages/TherapistProfilePage'));
const MassagePlaceProfilePage = React.lazy(() => import('../../pages/MassagePlaceProfilePage'));
const FacialPlaceProfilePage = React.lazy(() => import('../../pages/FacialPlaceProfilePage'));
const PlaceDetailPage = React.lazy(() => import('../../pages/PlaceDetailPage'));
const SharedTherapistProfilePage = React.lazy(() => import('../../pages/SharedTherapistProfilePage'));

export const profileRoutes = {
  therapist: {
    path: '/therapist/:id',
    component: TherapistProfilePage,
    name: 'therapist'
  },
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
