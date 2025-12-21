/**
 * Authentication Routes
 * Login, signup, and registration flows
 */

import React from 'react';

const TherapistLoginPage = React.lazy(() => import('../../pages/TherapistLoginPage'));
const MassagePlaceLoginPage = React.lazy(() => import('../../pages/MassagePlaceLoginPage'));
const FacialPortalPage = React.lazy(() => import('../../pages/FacialPortalPage'));
const SimpleSignupFlow = React.lazy(() => import('../../src/pages/SimpleSignupFlow'));

export const authRoutes = {
  therapistLogin: {
    path: '/therapist-login',
    component: TherapistLoginPage,
    name: 'therapistLogin'
  },
  placeLogin: {
    path: '/place-login',
    component: MassagePlaceLoginPage,
    name: 'placeLogin'
  },
  facialPortal: {
    path: '/facial-portal',
    component: FacialPortalPage,
    name: 'facialPortal'
  },
  simpleSignup: {
    path: '/simple-signup',
    component: SimpleSignupFlow,
    name: 'simpleSignup'
  }
};

export type AuthRouteName = keyof typeof authRoutes;
