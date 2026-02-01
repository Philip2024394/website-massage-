/**
 * 🎯 GLOBAL SCROLL ARCHITECTURE UTILITIES
 * 
 * Enforces the ONE SCROLL AUTHORITY rule across all components
 * - Only body can scroll on mobile
 * - All components must respect global scroll control
 * - Provides utilities for scroll-safe component design
 */

export class ScrollArchitecture {
  private static violations: string[] = [];
  
  /**
   * Check if an element violates global scroll architecture
   */
  static validateElement(element: HTMLElement, componentName: string): boolean {
    const computedStyle = window.getComputedStyle(element);
    const violations: string[] = [];
    
    // Check for scroll violations
    if (computedStyle.overflowY === 'auto' || computedStyle.overflowY === 'scroll') {
      violations.push(`overflow-y: ${computedStyle.overflowY}`);
    }
    
    if (computedStyle.overflowX === 'auto' || computedStyle.overflowX === 'scroll') {
      violations.push(`overflow-x: ${computedStyle.overflowX}`);
    }
    
    // Check for height violations that break mobile
    if (computedStyle.height === '100vh') {
      violations.push('height: 100vh (breaks mobile keyboard)');
    }
    
    if (computedStyle.minHeight === '100vh') {
      violations.push('min-height: 100vh (breaks mobile keyboard)');
    }
    
    // Check for position fixed with height 100vh
    if (computedStyle.position === 'fixed' && computedStyle.height === '100vh') {
      violations.push('position: fixed + height: 100vh (mobile scroll killer)');
    }
    
    if (violations.length > 0) {
      const violationKey = `${componentName}: ${violations.join(', ')}`;
      if (!this.violations.includes(violationKey)) {
        this.violations.push(violationKey);
        console.warn(`🚫 SCROLL ARCHITECTURE VIOLATION in ${componentName}:`, violations);
        console.warn('Fix: Use global scroll architecture or mobile-safe alternatives');
      }
      return false;
    }
    
    return true;
  }
  
  /**
   * Apply scroll-safe styles to an element
   */
  static makeScrollSafe(element: HTMLElement, options: {
    allowVerticalScroll?: boolean;
    allowHorizontalScroll?: boolean;
    mobileKeyboardSafe?: boolean;
  } = {}) {
    const { 
      allowVerticalScroll = false, 
      allowHorizontalScroll = false, 
      mobileKeyboardSafe = true 
    } = options;
    
    // Remove scroll violations
    element.style.overflowY = allowVerticalScroll ? 'visible' : 'visible';
    element.style.overflowX = allowHorizontalScroll ? 'visible' : 'visible';
    
    // Make mobile keyboard safe
    if (mobileKeyboardSafe) {
      // Replace 100vh with mobile-safe alternatives
      if (element.style.height === '100vh') {
        element.style.height = 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))';
      }
      if (element.style.minHeight === '100vh') {
        element.style.minHeight = 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))';
      }
    }
  }
  
  /**
   * Get all scroll violations found so far
   */
  static getViolations(): string[] {
    return [...this.violations];
  }
  
  /**
   * Clear violation log
   */
  static clearViolations(): void {
    this.violations = [];
  }
  
  /**
   * Check if body is the sole scroll authority (as it should be)
   */
  static validateGlobalScrollState(): boolean {
    const body = document.body;
    const html = document.documentElement;
    
    const bodyStyle = window.getComputedStyle(body);
    const htmlStyle = window.getComputedStyle(html);
    
    const issues: string[] = [];
    
    // Body should be able to scroll
    if (bodyStyle.overflowY === 'hidden') {
      issues.push('body overflow-y is hidden (breaks mobile scroll)');
    }
    
    // HTML should not interfere
    if (htmlStyle.overflowY === 'hidden') {
      issues.push('html overflow-y is hidden (breaks mobile scroll)');
    }
    
    if (issues.length > 0) {
      console.error('🚨 GLOBAL SCROLL ARCHITECTURE VIOLATED:', issues);
      console.error('Fix: Ensure only body can scroll, remove overflow:hidden from body/html');
      return false;
    }
    
    return true;
  }
  
  /**
   * Safe scroll to top that works with global architecture
   */
  static scrollToTop(smooth: boolean = true): void {
    // Always scroll the body (the ONE scroll authority)
    document.body.scrollTo({
      top: 0,
      behavior: smooth ? 'smooth' : 'auto'
    });
    
    // Fallback for older browsers
    if (document.body.scrollTop === 0) {
      window.scrollTo({
        top: 0,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  }
  
  /**
   * Get mobile-safe height value
   */
  static getMobileSafeHeight(fallback: string = '100vh'): string {
    // Use viewport height units that account for mobile browsers
    return 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))';
  }
  
  /**
   * Check if current device needs mobile scroll protection
   */
  static isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
           || window.innerWidth <= 768;
  }
}

/**
 * Hook for React components to enforce scroll architecture
 */
export function useScrollCompliance(componentName: string, elementRef?: React.RefObject<HTMLElement>) {
  React.useEffect(() => {
    if (elementRef?.current) {
      ScrollArchitecture.validateElement(elementRef.current, componentName);
    }
    
    // Validate global state
    ScrollArchitecture.validateGlobalScrollState();
  }, [componentName, elementRef]);
  
  return {
    makeScrollSafe: (element: HTMLElement, options?: Parameters<typeof ScrollArchitecture.makeScrollSafe>[1]) => {
      ScrollArchitecture.makeScrollSafe(element, options);
    },
    scrollToTop: ScrollArchitecture.scrollToTop,
    getMobileSafeHeight: ScrollArchitecture.getMobileSafeHeight,
    isMobile: ScrollArchitecture.isMobileDevice()
  };
}

// Import React for the hook
import React from 'react';