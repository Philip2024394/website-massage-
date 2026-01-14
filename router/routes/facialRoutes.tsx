import React from 'react';

const FacialApp = React.lazy(() => import('../../apps/facial-dashboard/src/App'));

export const facialRoutes = {
  dashboard: {
    path: '/facial',
    component: FacialApp,
    name: 'facial-dashboard',
    requiresAuth: true
  }
};
