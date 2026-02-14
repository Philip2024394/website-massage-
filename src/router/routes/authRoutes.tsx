/**
 * Authentication Routes
 * Login, signup, and registration flows
 * Organized in dedicated pages/auth/ folder for maintainability
 */

import { lazy } from 'react';

// Direct imports to fix component load errors
import AuthPage from '../../pages/auth/AuthPage';
import TherapistLoginPage from '../../pages/auth/TherapistLoginPage';
import MassagePlaceLoginPage from '../../pages/auth/MassagePlaceLoginPage';
import EmployerLoginPage from '../../pages/auth/EmployerLoginPage';
import ServicePersonnelLoginPage from '../../pages/auth/ServicePersonnelLoginPage';

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
  employerLogin: {
    path: '/employer-login',
    component: EmployerLoginPage,
    name: 'employerLogin'
  },
  servicePersonnelLogin: {
    path: '/service-personnel-login',
    component: ServicePersonnelLoginPage,
    name: 'servicePersonnelLogin'
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
