import React from 'react';

const PlaceApp = React.lazy(() => import('../../../apps/place-dashboard/src/App'));

export const placeRoutes = {
  dashboard: {
    path: '/place',
    component: PlaceApp,
    name: 'place-dashboard',
    requiresAuth: true
  }
};
