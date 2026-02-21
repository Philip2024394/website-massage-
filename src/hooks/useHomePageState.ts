/**
 * useHomePageState - Core UI state management for HomePage
 * Hero: mainTab (Home Service | City Places) + serviceButton (Massage | Facial | Beauty).
 * activeTab is derived for content routing; setActiveTab maps legacy tab ids to mainTab+serviceButton.
 *
 * Button → Page mapping (must stay in sync with content sections in HomePage):
 * - Home Service + Massage → home (therapists) | Facial → facials (facial therapists) | Beauty → beautician
 * - City Places  + Massage → places (massage spas) | Facial → facial-places (facial clinics) | Beauty → beautician-places
 */

import { useState, useEffect, useMemo } from 'react';
import { THERAPIST_MAIN_IMAGES } from '../lib/services/imageService';

export type MainTabId = 'home-service' | 'places';
export type ServiceButtonId = 'massage' | 'facial' | 'beautician';

function deriveActiveTab(mainTab: MainTabId, serviceButton: ServiceButtonId): string {
    if (mainTab === 'home-service') {
        if (serviceButton === 'massage') return 'home';
        if (serviceButton === 'facial') return 'facials';
        return 'beautician';
    }
    if (serviceButton === 'massage') return 'places';
    if (serviceButton === 'facial') return 'facial-places';
    return 'beautician-places';
}

function parseActiveTabToMainAndService(tab: string): { mainTab: MainTabId; serviceButton: ServiceButtonId } {
    switch (tab) {
        case 'home': return { mainTab: 'home-service', serviceButton: 'massage' };
        case 'places': return { mainTab: 'places', serviceButton: 'massage' };
        case 'facials': return { mainTab: 'home-service', serviceButton: 'facial' };
        case 'facial-places': return { mainTab: 'places', serviceButton: 'facial' };
        case 'beautician': return { mainTab: 'home-service', serviceButton: 'beautician' };
        case 'beautician-places': return { mainTab: 'places', serviceButton: 'beautician' };
        default: return { mainTab: 'home-service', serviceButton: 'massage' };
    }
}

export function useHomePageState() {
    const [mainTab, setMainTab] = useState<MainTabId>('home-service');
    const [serviceButton, setServiceButton] = useState<ServiceButtonId>('massage');
    const activeTab = useMemo(() => deriveActiveTab(mainTab, serviceButton), [mainTab, serviceButton]);
    const setActiveTab = (tab: string) => {
        const { mainTab: m, serviceButton: s } = parseActiveTabToMainAndService(tab);
        setMainTab(m);
        setServiceButton(s);
    };
    const [showFilterDrawer, setShowFilterDrawer] = useState(false);
    const [showComingSoonModal, setShowComingSoonModal] = useState(false);
    const [comingSoonSection, setComingSoonSection] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [selectedCity, setSelectedCity] = useState<string>(() => {
        if (typeof window === 'undefined') return 'all';
        const id = window.localStorage.getItem('user_city_id');
        const name = window.localStorage.getItem('user_city_name');
        return (id || name || 'all').trim();
    });
    const [customLinks, setCustomLinks] = useState<any[]>([]);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [selectedTherapist, setSelectedTherapist] = useState<any | null>(null);
    const [selectedRatingItem, setSelectedRatingItem] = useState<{item: any, type: 'therapist' | 'place'} | null>(null);
    
    // Development mode toggle (Ctrl+Shift+D)
    const [isDevelopmentMode, setIsDevelopmentMode] = useState(() => {
        return localStorage.getItem('massage_dev_mode') === 'true';
    });
    
    // Shuffled unique home page therapist images
    const [shuffledHomeImages, setShuffledHomeImages] = useState<string[]>([]);
    
    // Fisher-Yates shuffle
    const shuffleArray = (arr: string[]) => {
        const shuffled = [...arr];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };
    
    // Reshuffle images when viewing Home Service Massage tab
    useEffect(() => {
        if (mainTab === 'home-service' && serviceButton === 'massage') {
            const baseImages = [...THERAPIST_MAIN_IMAGES];
            const shuffled = shuffleArray(baseImages);
            setShuffledHomeImages(shuffled);
        }
    }, [mainTab, serviceButton]);
    
    // Development mode keyboard shortcut (Ctrl+Shift+D)
    useEffect(() => {
        const handleKeydown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                const newDevMode = !isDevelopmentMode;
                setIsDevelopmentMode(newDevMode);
                localStorage.setItem('massage_dev_mode', newDevMode.toString());
                console.log('🛠️ Development mode:', newDevMode ? 'ENABLED' : 'DISABLED');
            }
        };
        
        window.addEventListener('keydown', handleKeydown);
        return () => window.removeEventListener('keydown', handleKeydown);
    }, [isDevelopmentMode]);
    
    return {
        mainTab,
        setMainTab,
        serviceButton,
        setServiceButton,
        activeTab,
        setActiveTab,
        showFilterDrawer,
        setShowFilterDrawer,
        showComingSoonModal,
        setShowComingSoonModal,
        comingSoonSection,
        setComingSoonSection,
        isMenuOpen,
        setIsMenuOpen,
        isLocationModalOpen,
        setIsLocationModalOpen,
        selectedCity,
        setSelectedCity,
        customLinks,
        setCustomLinks,
        showRatingModal,
        setShowRatingModal,
        selectedTherapist,
        setSelectedTherapist,
        selectedRatingItem,
        setSelectedRatingItem,
        isDevelopmentMode,
        setIsDevelopmentMode,
        shuffledHomeImages,
        shuffleArray // Export utility for HomePage usage
    };
}
