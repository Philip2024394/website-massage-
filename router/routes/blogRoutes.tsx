/**
 * Blog & SEO Content Routes
 * Blog posts and content marketing pages
 */

import { lazy } from 'react';

const BlogIndexPage = lazy(() => import('../../pages/BlogIndexPage'));
const MassageBaliPage = lazy(() => import('../../pages/MassageBaliPage'));
const BalineseMassagePage = lazy(() => import('../../pages/BalineseMassagePage'));
const DeepTissueMassagePage = lazy(() => import('../../pages/DeepTissueMassagePage'));
const PressMediaPage = lazy(() => import('../../pages/PressMediaPage'));

export const blogRoutes = {
  index: {
    path: '/blog',
    component: BlogIndexPage,
    name: 'blogIndex'
  },
  massageBali: {
    path: '/massage-bali',
    component: MassageBaliPage,
    name: 'massageBali'
  },
  balinese: {
    path: '/balinese-massage',
    component: BalineseMassagePage,
    name: 'balinese'
  },
  deepTissue: {
    path: '/deep-tissue-massage',
    component: DeepTissueMassagePage,
    name: 'deepTissue'
  },
  press: {
    path: '/press',
    component: PressMediaPage,
    name: 'press'
  }
};

export type BlogRouteName = keyof typeof blogRoutes;
