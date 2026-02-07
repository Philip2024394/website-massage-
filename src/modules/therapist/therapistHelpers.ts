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
 * Format countdown timer display (MM:SS format)
 */
export const formatCountdownDisplay = (time: string): string => {
    const seconds = parseInt(time, 10);
    if (isNaN(seconds) || seconds <= 0) return '~1h';
    
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Get initial booking count from therapist ID
 */
export const getInitialBookingCount = (therapistId: string): number => {
    if (!therapistId) return 23;
    
    // Create a simple hash from the therapist ID for consistency
    let hash = 0;
    for (let i = 0; i < therapistId.length; i++) {
        const char = therapistId.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Use the hash to generate a consistent booking count between 23-40
    const bookingCount = Math.abs(hash % 18) + 23;
    return bookingCount;
};