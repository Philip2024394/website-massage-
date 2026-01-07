import { useEffect } from 'react';

/**
 * URL booking handler - handles forced booking views and auto-accept from URLs
 * Extracted from App.tsx lines 73-140
 */
export function useUrlBookingHandler(
    fetchAndShowForcedBooking: (bookingId: string) => void,
    handleAutoAcceptBooking: (bookingId: string) => void
) {
    // Check URL for forced booking view on load
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const forceBookingId = urlParams.get('forceBookingView');
        const autoAcceptBookingId = urlParams.get('autoAcceptBooking');
        
        if (forceBookingId) {
            console.log('🔴 URL contains forceBookingView:', forceBookingId);
            fetchAndShowForcedBooking(forceBookingId);
            // Clean URL
            urlParams.delete('forceBookingView');
            window.history.replaceState({}, '', `${window.location.pathname}?${urlParams.toString()}`);
        }
        
        if (autoAcceptBookingId) {
            console.log('✅ URL contains autoAcceptBooking:', autoAcceptBookingId);
            handleAutoAcceptBooking(autoAcceptBookingId);
            // Clean URL
            urlParams.delete('autoAcceptBooking');
            window.history.replaceState({}, '', `${window.location.pathname}?${urlParams.toString()}`);
        }
    }, [fetchAndShowForcedBooking, handleAutoAcceptBooking]);
}
