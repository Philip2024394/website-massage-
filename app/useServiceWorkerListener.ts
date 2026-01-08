import { useEffect } from 'react';

/**
 * Service Worker message listener - handles sound playback, forced booking views, and expiration
 * Extracted from App.tsx lines 39-72
 */
export function useServiceWorkerListener(
    fetchAndShowForcedBooking: (bookingId: string) => void,
    handleBookingExpiration: (bookingId: string, reason: string) => void
) {
    useEffect(() => {        // 🔒 SKIP SERVICE WORKER IN DEV MODE
        if (import.meta.env.DEV) {
            console.log('⚠️ Service worker disabled in dev mode');
            return;
        }
                console.log('🔊 Setting up service worker message listeners');
        
        const handleServiceWorkerMessage = (event: MessageEvent) => {
            // Sound playback
            if (event.data?.type === 'play-notification-sound') {
                console.log('🔊 Playing notification sound:', event.data.soundUrl);
                const audio = new Audio(event.data.soundUrl);
                audio.volume = 1.0; // Max volume
                audio.play().catch(err => console.error('Sound play failed:', err));
            }
            
            // Force booking view (when notification clicked)
            if (event.data?.type === 'force-booking-view') {
                console.log('🔴 Forcing booking view:', event.data.bookingId);
                // Fetch booking details and show forced modal
                fetchAndShowForcedBooking(event.data.bookingId);
            }
            
            // Booking expired (5-minute timeout)
            if (event.data?.type === 'booking-expired') {
                console.log('⏰ Booking expired:', event.data.bookingId);
                handleBookingExpiration(event.data.bookingId, event.data.reason);
            }
        };
        
        navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage);
        
        return () => {
            navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage);
        };
    }, [fetchAndShowForcedBooking, handleBookingExpiration]);
}
