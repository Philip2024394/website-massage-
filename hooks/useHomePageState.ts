/**
 * useHomePageState - Core UI state management for HomePage
 * Extracted from HomePage.tsx to reduce file size
 */

import { useState, useEffect } from 'react';
import { THERAPIST_MAIN_IMAGES } from '../lib/services/imageService';

export function useHomePageState() {
    const [activeTab, setActiveTab] = useState('home');
    const [showComingSoonModal, setShowComingSoonModal] = useState(false);
    const [comingSoonSection, setComingSoonSection] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [selectedCity, setSelectedCity] = useState<string>('all');
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
    
    // Reshuffle images when viewing Home tab
    useEffect(() => {
        if (activeTab === 'home') {
            const baseImages = [...THERAPIST_MAIN_IMAGES];
            const shuffled = shuffleArray(baseImages);
            setShuffledHomeImages(shuffled);
        }
    }, [activeTab]);
    
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
        activeTab,
        setActiveTab,
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
