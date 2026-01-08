/**
 * useTherapistCardCalculations - Calculation utilities for TherapistCard
 * Extracted from TherapistCard.tsx to reduce file size
 */

import { useState, useEffect } from 'react';
import type { Therapist } from '../types';
import { bookingService } from '../lib/appwriteService';

export function useTherapistCardCalculations(therapist: Therapist) {
    // Orders count sourced from persisted analytics JSON or actual bookings
    const [bookingsCount, setBookingsCount] = useState<number>(() => {
        try {
            if (therapist.analytics) {
                const parsed = JSON.parse(therapist.analytics);
                if (parsed && typeof parsed.bookings === 'number') return parsed.bookings;
            }
        } catch {}
        return 0;
    });

    // Fallback: derive bookings count from bookings collection if analytics not populated
    useEffect(() => {
        const loadBookingsCount = async () => {
            try {
                const providerId = String((therapist as any).id || (therapist as any).$id || '');
                if (!providerId) return;
                const bookingDocs = await bookingService.getByProvider(providerId, 'therapist');
                if (Array.isArray(bookingDocs)) {
                    setBookingsCount(bookingDocs.length);
                }
            } catch (e) {
                // Silent fallback
            }
        };
        loadBookingsCount();
    }, [therapist]);

    // Generate consistent fake booking count for new therapists (18-26)
    const getInitialBookingCount = (therapistId: string): number => {
        // Create a simple hash from therapist ID for consistent random number
        let hash = 0;
        for (let i = 0; i < therapistId.length; i++) {
            hash = ((hash << 5) - hash) + therapistId.charCodeAt(i);
            hash = hash & hash; // Convert to 32bit integer
        }
        // Generate number between 18-26 based on hash
        return 18 + (Math.abs(hash) % 9);
    };

    const joinedDateRaw = therapist.membershipStartDate || therapist.activeMembershipDate || (therapist as any).$createdAt;
    const joinedDisplay = (() => {
        if (!joinedDateRaw) return '—';
        try {
            const d = new Date(joinedDateRaw);
            if (isNaN(d.getTime())) return '—';
            return d.toLocaleDateString('en-GB');
        } catch {
            return '—';
        }
    })();

    // 🌍 DISTANCE CALCULATION
    const calculateDistance = (point1: { lat: number; lng: number }, point2: { lat: number; lng: number }) => {
        const R = 6371000; // Earth's radius in meters
        const φ1 = point1.lat * Math.PI/180;
        const φ2 = point2.lat * Math.PI/180;
        const Δφ = (point2.lat-point1.lat) * Math.PI/180;
        const Δλ = (point2.lng-point1.lng) * Math.PI/180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c; // Distance in meters
    };

    // Format countdown as HH:MM:SS
    const formatCountdown = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Helper function to calculate dynamic spacing based on description length
    const getDynamicSpacing = (longSpacing: string, mediumSpacing: string, shortSpacing: string, descriptionLength: number) => {
        // If description is short (less than 200 chars), use minimum spacing  
        if (descriptionLength < 200) return shortSpacing;
        // If description is medium (200-300 chars), use reduced spacing
        if (descriptionLength < 300) return mediumSpacing;
        // If description is long (300+ chars), use standard spacing
        return longSpacing;
    };

    return {
        bookingsCount,
        setBookingsCount,
        getInitialBookingCount,
        joinedDisplay,
        calculateDistance,
        formatCountdown,
        getDynamicSpacing
    };
}
