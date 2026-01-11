/**
 * Therapist Helper Utilities
 * 
 * Extracted from TherapistCard.tsx as part of Phase 2 modularization.
 * Contains utility functions for therapist card formatting and calculations.
 */

/**
 * Calculate dynamic spacing based on description length
 */
export const getDynamicSpacing = (high: string, medium: string, low: string, descriptionLength: number): string => {
    if (descriptionLength > 200) return high;
    if (descriptionLength > 100) return medium;
    return low;
};

/**
 * Format price for display with Indonesian locale
 */
export const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return 'N/A';
    return (numPrice * 1000).toLocaleString('id-ID');
};

/**
 * Format countdown timer display
 */
export const formatCountdownDisplay = (time: string): string => {
    return time || '~1h';
};

/**
 * Get initial booking count from therapist ID
 */
export const getInitialBookingCount = (therapistId: string): number => {
    if (!therapistId) return Math.floor(Math.random() * 50) + 10;
    
    // Create a simple hash from the therapist ID for consistency
    let hash = 0;
    for (let i = 0; i < therapistId.length; i++) {
        const char = therapistId.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Use the hash to generate a consistent booking count between 10-60
    const bookingCount = Math.abs(hash % 51) + 10;
    return bookingCount;
};