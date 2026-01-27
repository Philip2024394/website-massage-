/**
 * ============================================================================
 * 🔗 PUBLIC PROFILE URL UTILITIES
 * ============================================================================
 * 
 * Helper functions for generating and navigating to public profile URLs
 * 
 * URL Format: /therapist-profile/{memberId}
 * Example: https://yourdomain.com/therapist-profile/abc123
 */

/**
 * Generate canonical public profile URL for a member
 * @param memberId - The member's Appwrite document ID
 * @returns Full public profile URL
 */
export function getPublicProfileUrl(memberId: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/#/therapist-profile/${memberId}`;
}

/**
 * Navigate to a member's public profile
 * @param memberId - The member's Appwrite document ID
 * @param setPage - Navigation function from routing context
 */
export function navigateToPublicProfile(memberId: string, setPage: (page: string) => void): void {
  console.log('🔗 Navigating to public profile:', memberId);
  setPage(`therapist-profile`);
  // Note: The actual ID is passed via URL, not page state (HashRouter format)
  window.history.pushState({}, '', `/#/therapist-profile/${memberId}`);
}

/**
 * Extract member ID from a public profile page string or URL
 * @param page - The page string or URL
 * @returns The member ID or null if not a valid public profile page
 */
export function extractMemberIdFromPage(page: string): string | null {
  // Check if it's a therapist-profile route
  if (typeof page === 'string' && page === 'therapist-profile') {
    // Extract from URL
    const match = window.location.pathname.match(/\/therapist-profile\/([^\/]+)/);
    return match ? match[1].split('-')[0] : null;
  }
  return null;
}

/**
 * Check if a page is a public profile page
 * @param page - The page string to check
 * @returns True if it's a public profile page
 */
export function isPublicProfilePage(page: string): boolean {
  return typeof page === 'string' && page === 'therapist-profile';
}

/**
 * Copy public profile URL to clipboard
 * @param memberId - The member's Appwrite document ID
 * @returns Promise that resolves to true if successful
 */
export async function copyPublicProfileUrl(memberId: string): Promise<boolean> {
  const url = getPublicProfileUrl(memberId);
  
  try {
    await navigator.clipboard.writeText(url);
    console.log('📋 Profile link copied:', url);
    return true;
  } catch (error) {
    console.error('Failed to copy link:', error);
    
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (success) {
        console.log('📋 Profile link copied (fallback):', url);
        return true;
      }
    } catch (fallbackError) {
      console.error('Fallback copy also failed:', fallbackError);
    }
    
    return false;
  }
}
