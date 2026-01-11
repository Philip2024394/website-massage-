/**
 * Authentication Routes
 * Login, signup, and registration flows
 * Organized in dedicated pages/auth/ folder for maintainability
 */

import { lazy } from 'react';

const AuthPage = lazy(() => import('../../pages/auth/AuthPage'));
const TherapistLoginPage = lazy(() => import('../../pages/auth/TherapistLoginPage'));
const MassagePlaceLoginPage = lazy(() => import('../../pages/auth/MassagePlaceLoginPage'));
const FacialPortalPage = lazy(() => import('../../pages/FacialPortalPage'));
const PackageOnboarding = lazy(() => import('../../pages/PackageOnboarding'));

export const authRoutes = {
  auth: {
    path: '/auth',
    component: AuthPage,
    name: 'auth'
  },
  signin: {
    path: '/signin',
    component: AuthPage,
    name: 'signin'
  },
  signIn: {
    path: '/sign-in',
    component: AuthPage,
    name: 'signIn'
  },
  login: {
    path: '/login',
    component: AuthPage,
    name: 'login'
  },
  signup: {
    path: '/signup',
    component: AuthPage,
    name: 'signup'
  },
  onboardingPackage: {
    path: '/onboarding/package',
    component: PackageOnboarding,
    name: 'onboarding-package'
  },
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
    component: AuthPage,
    name: 'simpleSignup'
  }
};

export type AuthRouteName = keyof typeof authRoutes;
