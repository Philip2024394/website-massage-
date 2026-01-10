/**
 * Share URL configuration
 * Controls whether generated share URLs use SEO format or standard profile route.
 */

export type ShareUrlFormat = 'seo' | 'standard';

// Change this to 'standard' to use /therapist-profile/:id for sharing
export const SHARE_URL_FORMAT: ShareUrlFormat = 'standard';

// Live site base for absolute URLs
export const LIVE_SITE_URL = 'https://www.indastreetmassage.com';
