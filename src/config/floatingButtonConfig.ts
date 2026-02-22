/**
 * Floating Button URL Mapping Configuration
 * Maps floating buttons to their own URLs for deep linking and navigation
 */

import type { Page } from '../types/pageTypes';

export interface FloatingButtonConfig {
  id: string;
  name: string;
  icon: string;
  url: string;
  page: Page;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  color: string;
  hoverColor: string;
  description: string;
  enabled: boolean;
  roles?: string[]; // Which user roles can see this button
  pages?: Page[]; // Which pages this button should appear on
}

export const floatingButtonConfigs: FloatingButtonConfig[] = [
  {
    id: 'support-chat',
    name: 'Support Chat',
    icon: 'MessageCircle',
    url: '/chat/support',
    page: 'chat',
    position: 'bottom-right',
    color: 'bg-amber-500',
    hoverColor: 'hover:bg-amber-600',
    description: 'Open support chat window',
    enabled: true,
    roles: ['customer', 'therapist', 'place'],
    pages: ['home', 'therapist-dashboard', 'place-dashboard']
  },
  {
    id: 'booking-quick',
    name: 'Quick Booking',
    icon: 'Calendar',
    url: '/booking/quick',
    page: 'booking-flow',
    position: 'bottom-right',
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600',
    description: 'Quick booking shortcut',
    enabled: true,
    roles: ['customer'],
    pages: ['home', 'providers', 'massage-types']
  },
  {
    id: 'website-link',
    name: 'Website',
    icon: 'ExternalLink',
    url: '/website',
    page: 'website-management',
    position: 'bottom-right',
    color: 'bg-amber-500',
    hoverColor: 'hover:bg-amber-600',
    description: 'Visit IndaStreet Website',
    enabled: true,
    roles: ['customer', 'therapist', 'place', 'guest'],
    pages: ['home']
  },
  {
    id: 'notifications',
    name: 'Notifications',
    icon: 'Bell',
    url: '/notifications',
    page: 'notifications',
    position: 'top-right',
    color: 'bg-purple-500',
    hoverColor: 'hover:bg-purple-600',
    description: 'View notifications',
    enabled: true,
    roles: ['customer', 'therapist', 'place'],
    pages: ['home', 'therapist-dashboard', 'place-dashboard']
  },
  {
    id: 'therapist-availability',
    name: 'Set Availability',
    icon: 'Clock',
    url: '/dashboard/therapist/availability',
    page: 'therapistAvailability',
    position: 'bottom-left',
    color: 'bg-green-500',
    hoverColor: 'hover:bg-green-600',
    description: 'Quickly update your availability',
    enabled: true,
    roles: ['therapist'],
    pages: ['therapist-dashboard', 'therapistStatus']
  },
  {
    id: 'emergency-contact',
    name: 'Emergency Contact',
    icon: 'Phone',
    url: '/emergency/contact',
    page: 'customer-support',
    position: 'bottom-left',
    color: 'bg-red-500',
    hoverColor: 'hover:bg-red-600',
    description: 'Emergency contact support',
    enabled: true,
    roles: ['customer', 'therapist'],
    pages: ['booking-flow', 'therapist-dashboard']
  },
  {
    id: 'feedback',
    name: 'Feedback',
    icon: 'MessageSquare',
    url: '/feedback',
    page: 'customer-support',
    position: 'bottom-right',
    color: 'bg-indigo-500',
    hoverColor: 'hover:bg-indigo-600',
    description: 'Send feedback',
    enabled: true,
    roles: ['customer', 'therapist', 'place'],
    pages: ['home', 'therapist-dashboard', 'place-dashboard']
  },
  {
    id: 'help',
    name: 'Help',
    icon: 'HelpCircle',
    url: '/help',
    page: 'faq',
    position: 'top-right',
    color: 'bg-gray-500',
    hoverColor: 'hover:bg-gray-600',
    description: 'Get help and FAQ',
    enabled: true,
    roles: ['customer', 'therapist', 'place', 'guest'],
    pages: ['home', 'booking-flow']
  }
];

/**
 * Get floating buttons for a specific page and user role
 */
export function getFloatingButtonsForPage(
  currentPage: Page, 
  userRole: string = 'guest'
): FloatingButtonConfig[] {
  return floatingButtonConfigs.filter(button => {
    // Check if button is enabled
    if (!button.enabled) return false;
    
    // Check if user role is allowed
    if (button.roles && !button.roles.includes(userRole)) return false;
    
    // Check if button should appear on current page
    if (button.pages && !button.pages.includes(currentPage)) return false;
    
    return true;
  });
}

/**
 * Get floating button configuration by ID
 */
export function getFloatingButtonById(id: string): FloatingButtonConfig | undefined {
  return floatingButtonConfigs.find(button => button.id === id);
}

/**
 * Get floating button configuration by URL
 */
export function getFloatingButtonByUrl(url: string): FloatingButtonConfig | undefined {
  return floatingButtonConfigs.find(button => button.url === url);
}

/**
 * Update floating button configuration
 */
export function updateFloatingButtonConfig(
  id: string, 
  updates: Partial<FloatingButtonConfig>
): boolean {
  const buttonIndex = floatingButtonConfigs.findIndex(button => button.id === id);
  if (buttonIndex === -1) return false;
  
  floatingButtonConfigs[buttonIndex] = { 
    ...floatingButtonConfigs[buttonIndex], 
    ...updates 
  };
  return true;
}

/**
 * Add new floating button configuration
 */
export function addFloatingButtonConfig(config: FloatingButtonConfig): void {
  floatingButtonConfigs.push(config);
}

/**
 * Remove floating button configuration
 */
export function removeFloatingButtonConfig(id: string): boolean {
  const buttonIndex = floatingButtonConfigs.findIndex(button => button.id === id);
  if (buttonIndex === -1) return false;
  
  floatingButtonConfigs.splice(buttonIndex, 1);
  return true;
}

/**
 * Generate URL with query parameters for floating button tracking
 */
export function getFloatingButtonUrl(
  id: string, 
  additionalParams?: Record<string, string>
): string {
  const button = getFloatingButtonById(id);
  if (!button) return '/';
  
  const url = new URL(button.url, window.location.origin);
  url.searchParams.set('source', 'floating-button');
  url.searchParams.set('button-id', id);
  
  if (additionalParams) {
    Object.entries(additionalParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  
  return url.pathname + url.search;
}