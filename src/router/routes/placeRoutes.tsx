import React from 'react';

const PlaceApp = React.lazy(() => import('../../../apps/place-dashboard/src/App'));
const PlaceSafePassWrapper = React.lazy(() => import('../../pages/place/PlaceSafePassWrapper'));

export const placeRoutes = {
  dashboard: {
    path: '/place',
    component: PlaceApp,
    name: 'place-dashboard',
    requiresAuth: true
  },
  safePassApplication: {
    path: '/place/safepass-apply',
    component: PlaceSafePassWrapper,
    name: 'place-safepass-apply',
    requiresAuth: true
  }
};
