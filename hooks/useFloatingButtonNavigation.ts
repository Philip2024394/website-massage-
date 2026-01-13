/**
 * useFloatingButtonNavigation - Hook for managing floating button URL navigation
 * Integrates with the existing URL routing system to provide seamless navigation
 */

import { useCallback } from 'react';
import { 
  getFloatingButtonsForPage, 
  getFloatingButtonById, 
  getFloatingButtonUrl,
  type FloatingButtonConfig 
} from '../config/floatingButtonConfig';
import type { Page } from '../types/pageTypes';

interface UseFloatingButtonNavigationProps {
  currentPage: Page;
  setPage: (page: Page) => void;
  userRole?: string;
}

interface FloatingButtonNavigation {
  availableButtons: FloatingButtonConfig[];
  navigateToButton: (buttonId: string, additionalParams?: Record<string, string>) => void;
  openButtonInNewTab: (buttonId: string, additionalParams?: Record<string, string>) => void;
  getButtonUrl: (buttonId: string, additionalParams?: Record<string, string>) => string;
  isButtonVisible: (buttonId: string) => boolean;
}

export const useFloatingButtonNavigation = ({
  currentPage,
  setPage,
  userRole = 'guest'
}: UseFloatingButtonNavigationProps): FloatingButtonNavigation => {

  // Get available buttons for current page and user role
  const availableButtons = getFloatingButtonsForPage(currentPage, userRole);

  // Navigate to a floating button's target page
  const navigateToButton = useCallback((
    buttonId: string, 
    additionalParams?: Record<string, string>
  ) => {
    const button = getFloatingButtonById(buttonId);
    if (!button) {
      console.warn(`Floating button with ID "${buttonId}" not found`);
      return;
    }

    // Generate URL with tracking parameters
    const url = getFloatingButtonUrl(buttonId, additionalParams);
    
    // Update browser URL
    window.history.pushState({ page: button.page, buttonId }, '', url);
    
    // Navigate to the page
    setPage(button.page);
    
    // Analytics tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'floating_button_click', {
        button_id: buttonId,
        button_name: button.name,
        source_page: currentPage,
        target_page: button.page
      });
    }

    console.log(`🎯 Floating Button Navigation: ${buttonId} (${button.name}) → ${button.page}`);
  }, [currentPage, setPage]);

  // Open floating button target in new tab
  const openButtonInNewTab = useCallback((
    buttonId: string, 
    additionalParams?: Record<string, string>
  ) => {
    const button = getFloatingButtonById(buttonId);
    if (!button) {
      console.warn(`Floating button with ID "${buttonId}" not found`);
      return;
    }

    const url = getFloatingButtonUrl(buttonId, additionalParams);
    window.open(url, '_blank', 'noopener,noreferrer');

    // Analytics tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'floating_button_new_tab', {
        button_id: buttonId,
        button_name: button.name,
        source_page: currentPage
      });
    }

    console.log(`🎯 Floating Button New Tab: ${buttonId} (${button.name})`);
  }, [currentPage]);

  // Get URL for a floating button
  const getButtonUrl = useCallback((
    buttonId: string, 
    additionalParams?: Record<string, string>
  ) => {
    return getFloatingButtonUrl(buttonId, additionalParams);
  }, []);

  // Check if a button should be visible on current page
  const isButtonVisible = useCallback((buttonId: string) => {
    return availableButtons.some(button => button.id === buttonId);
  }, [availableButtons]);

  return {
    availableButtons,
    navigateToButton,
    openButtonInNewTab,
    getButtonUrl,
    isButtonVisible
  };
};

/**
 * Helper hook for managing floating button state in components
 */
export const useFloatingButtonState = (buttonId: string) => {
  const button = getFloatingButtonById(buttonId);
  
  return {
    button,
    exists: !!button,
    isEnabled: button?.enabled ?? false,
    config: button
  };
};