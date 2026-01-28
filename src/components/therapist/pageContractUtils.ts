/**
 * Therapist Page Contract Utilities
 * 
 * Helper functions to support the Therapist Page Contract Lock system.
 */

import * as helpContent from '../../pages/therapist/constants/helpContent';

/**
 * Safely retrieves help content from the centralized help content file.
 * 
 * @param helpId - Format: "objectName.key" (e.g., "dashboardHelp.overview")
 * @returns Help content object with title, content, and benefits
 */
export function getHelpContent(helpId: string) {
  try {
    const [objectName, key] = helpId.split('.');
    
    if (!objectName || !key) {
      throw new Error(`Invalid helpId format: "${helpId}". Expected format: "objectName.key"`);
    }

    const helpObject = (helpContent as any)[objectName];
    
    if (!helpObject) {
      throw new Error(`Help object "${objectName}" not found in helpContent`);
    }

    const content = helpObject[key];
    
    if (!content) {
      throw new Error(`Help content key "${key}" not found in "${objectName}"`);
    }

    return content;
  } catch (error) {
    console.error(`[THERAPIST PAGE CONTRACT ERROR] Failed to load help content for "${helpId}":`, error);
    return {
      title: 'Help',
      content: 'Help information is temporarily unavailable',
      benefits: []
    };
  }
}

/**
 * Validates that a therapist page has all required props.
 * Logs errors for contract violations.
 * 
 * @param pageName - Name of the page for error logging
 * @param props - Props to validate
 * @returns true if valid, false if violations found
 */
export function validatePageContract(
  pageName: string,
  props: {
    title?: string;
    helpId?: string;
    currentPage?: string;
    therapist?: any;
  }
): boolean {
  let isValid = true;

  if (!props.title) {
    console.error(`[THERAPIST PAGE CONTRACT VIOLATION] ${pageName}: Missing required prop "title"`);
    isValid = false;
  }

  if (!props.helpId) {
    console.error(`[THERAPIST PAGE CONTRACT VIOLATION] ${pageName}: Missing required prop "helpId"`);
    isValid = false;
  }

  if (!props.currentPage) {
    console.error(`[THERAPIST PAGE CONTRACT VIOLATION] ${pageName}: Missing required prop "currentPage"`);
    isValid = false;
  }

  if (!props.therapist) {
    console.warn(`[THERAPIST PAGE CONTRACT WARNING] ${pageName}: Missing therapist data`);
  }

  return isValid;
}

/**
 * Creates a consistent page error handler for therapist pages.
 * 
 * @param pageName - Name of the page for error logging
 * @returns Error handler function
 */
export function createPageErrorHandler(pageName: string) {
  return (error: any, errorInfo?: any) => {
    console.error(`[THERAPIST PAGE ERROR] ${pageName}:`, error);
    if (errorInfo) {
      console.error(`[THERAPIST PAGE ERROR INFO] ${pageName}:`, errorInfo);
    }
  };
}

/**
 * Logs successful page render for monitoring.
 * 
 * @param pageName - Name of the page
 * @param props - Page props for debugging
 */
export function logPageRender(pageName: string, props: Record<string, any>) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[THERAPIST PAGE RENDER] ${pageName}`, {
      hasTherapist: !!props.therapist,
      currentPage: props.currentPage,
      title: props.title
    });
  }
}

/**
 * Contract enforcement constants
 */
export const CONTRACT_RULES = {
  REQUIRED_COMPONENTS: [
    'TherapistLayout',
    'TherapistPageHeader', 
    'HelpTooltip'
  ],
  REQUIRED_PROPS: [
    'title',
    'helpId',
    'currentPage',
    'therapist'
  ],
  FLEXIBLE_AREAS: [
    'UI styling',
    'Feature logic',
    'Content sections',
    'API connections'
  ],
  LOCKED_AREAS: [
    'Route configuration',
    'Navigation structure',
    'Layout wrapper',
    'Header component',
    'Help icon'
  ]
} as const;
