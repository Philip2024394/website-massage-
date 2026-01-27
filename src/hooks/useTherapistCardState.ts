/**
 * useTherapistCardState - UI state management for TherapistCard
 * Extracted from TherapistCard.tsx to reduce file size
 */

import { useState, useEffect } from 'react';

export function useTherapistCardState() {
    const [menuData, setMenuData] = useState<any[]>([]);
    const [userReferralCode, setUserReferralCode] = useState<string>('');
    const [selectedServiceIndex, setSelectedServiceIndex] = useState<number | null>(null);
    const [selectedDuration, setSelectedDuration] = useState<'60' | '90' | '120' | null>(null);
    const [priceSliderBookingSource, setPriceSliderBookingSource] = useState<string>('quick-book');
    const [highlightedCell, setHighlightedCell] = useState<{serviceIndex: number, duration: '60' | '90' | '120'} | null>(null);
    const [arrivalCountdown, setArrivalCountdown] = useState<number>(3600); // 1 hour in seconds
    const [shortShareUrl, setShortShareUrl] = useState<string>('');
    const [animatedPriceIndex, setAnimatedPriceIndex] = useState<number>(0); // 0=60min, 1=90min, 2=120min
    const [countdown, setCountdown] = useState<string>('');
    const [isOvertime, setIsOvertime] = useState(false);
    
    // Animated price frame that moves randomly between containers
    useEffect(() => {
        const interval = setInterval(() => {
            setAnimatedPriceIndex(prev => {
                // Generate random next index (0-2) different from current
                const options = [0, 1, 2].filter(i => i !== prev);
                return options[Math.floor(Math.random() * options.length)];
            });
        }, 2000); // Move every 2 seconds
        
        return () => clearInterval(interval);
    }, []);

    const handleSelectService = (index: number, duration: '60' | '90' | '120') => {
        setSelectedServiceIndex(index);
        setSelectedDuration(duration);
        setHighlightedCell(null);
    };

    return {
        menuData,
        setMenuData,
        userReferralCode,
        setUserReferralCode,
        selectedServiceIndex,
        setSelectedServiceIndex,
        selectedDuration,
        setSelectedDuration,
        priceSliderBookingSource,
        setPriceSliderBookingSource,
        highlightedCell,
        setHighlightedCell,
        arrivalCountdown,
        setArrivalCountdown,
        shortShareUrl,
        setShortShareUrl,
        animatedPriceIndex,
        countdown,
        setCountdown,
        isOvertime,
        setIsOvertime,
        handleSelectService
    };
}
