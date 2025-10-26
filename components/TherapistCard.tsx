import React, { useState } from 'react';
import type { Therapist, Analytics } from '../types';
import { AvailabilityStatus } from '../types';
import { parsePricing, parseMassageTypes } from '../utils/appwriteHelpers';

interface TherapistCardProps {
    therapist: Therapist;
    onRate: (therapist: Therapist) => void;
    onBook: (therapist: Therapist) => void;
    onIncrementAnalytics: (metric: keyof Analytics) => void;
    t: any;
}

// Utility function to determine display status
// 80% of offline therapists will display as busy
const getDisplayStatus = (therapist: Therapist): AvailabilityStatus => {
    if (therapist.status === AvailabilityStatus.Available) {
        return AvailabilityStatus.Available;
    }
    
    if (therapist.status === AvailabilityStatus.Busy) {
        return AvailabilityStatus.Busy;
    }
    
    // Offline status: 80% chance to display as Busy
    if (therapist.status === AvailabilityStatus.Offline) {
        // Use therapist ID to create consistent randomization
        const hash = String(therapist.id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const shouldShowBusy = (hash % 100) < 80; // 80% will be < 80
        return shouldShowBusy ? AvailabilityStatus.Busy : AvailabilityStatus.Offline;
    }
    
    return therapist.status;
};

const WhatsAppIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.614-1.486L.057 24zM6.591 17.419c.404.652.812 1.272 1.242 1.85 1.58 2.116 3.663 3.22 5.953 3.218 5.55-.006 10.038-4.488 10.043-10.038.005-5.55-4.488-10.038-10.038-10.043-5.55.005-10.038 4.488-10.043 10.038.002 2.13.642 4.148 1.822 5.898l-1.03 3.766 3.844-1.025z"/>
    </svg>
);

const CalendarIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const LocationPinIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
);

const StarIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);


const statusStyles: { [key in AvailabilityStatus]: { text: string; bg: string; dot: string } } = {
    [AvailabilityStatus.Available]: { text: 'text-green-700', bg: 'bg-green-100', dot: 'bg-green-500' },
    [AvailabilityStatus.Busy]: { text: 'text-yellow-700', bg: 'bg-yellow-100', dot: 'bg-yellow-500' },
    [AvailabilityStatus.Offline]: { text: 'text-gray-700', bg: 'bg-gray-100', dot: 'bg-gray-500' },
};

const TherapistCard: React.FC<TherapistCardProps> = ({ therapist, onRate, onBook, onIncrementAnalytics }) => {
    const [showBusyModal, setShowBusyModal] = useState(false);
    
    // Debug: Log profile picture URL
    console.log('🎴 TherapistCard rendering for:', therapist.name);
    console.log('📸 ProfilePicture URL:', therapist.profilePicture);
    console.log('📸 URL Length:', therapist.profilePicture?.length);
    console.log('📸 Is Valid URL:', therapist.profilePicture?.startsWith('http'));
    console.log('📊 Status:', therapist.status);
    
    // Map any status value to valid AvailabilityStatus
    let validStatus = AvailabilityStatus.Offline;
    const statusStr = String(therapist.status || '');
    
    if (statusStr === 'Available' || statusStr === AvailabilityStatus.Available) {
        validStatus = AvailabilityStatus.Available;
    } else if (statusStr === 'Busy' || statusStr === AvailabilityStatus.Busy) {
        validStatus = AvailabilityStatus.Busy;
    } else if (statusStr === 'Offline' || statusStr === AvailabilityStatus.Offline) {
        validStatus = AvailabilityStatus.Offline;
    }
    // Default to Offline for any other value (like 'active', null, undefined)
    
    // Ensure therapist has a valid status
    const therapistWithStatus = {
        ...therapist,
        status: validStatus
    };
    
    // Get the display status (may differ from actual status)
    const displayStatus = getDisplayStatus(therapistWithStatus);
    const style = statusStyles[displayStatus];
    
    // Parse Appwrite string fields with fallbacks
    const pricing = parsePricing(therapist.pricing) || { "60": 0, "90": 0, "120": 0 };
    const massageTypes = parseMassageTypes(therapist.massageTypes) || [];
    
    // Get main image from therapist data
    const mainImage = (therapist as any).mainImage;

    const openWhatsApp = () => {
        // If displaying as Busy, show confirmation modal
        if (displayStatus === AvailabilityStatus.Busy) {
            setShowBusyModal(true);
        } else {
            // Available or Offline (the 20% that show as offline)
            onIncrementAnalytics('whatsappClicks');
            window.open(`https://wa.me/${therapist.whatsappNumber}`, '_blank');
        }
    };
    
    const handleConfirmBusyContact = () => {
        onIncrementAnalytics('whatsappClicks');
        window.open(`https://wa.me/${therapist.whatsappNumber}`, '_blank');
        setShowBusyModal(false);
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-visible relative">
            {/* Main Image Banner */}
            <div className="h-48 w-full bg-gradient-to-r from-orange-400 to-orange-600 overflow-hidden relative rounded-t-xl">
                <img 
                    src={mainImage || 'https://ik.imagekit.io/7grri5v7d/massage%20image%201.png?updatedAt=1760186885261'} 
                    alt={`${therapist.name} cover`} 
                    className="w-full h-full object-cover"
                />
                {/* Star Rating - Top Left Corner */}
                <div 
                    className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-md rounded-full px-3 py-1.5 shadow-lg cursor-pointer"
                    onClick={() => onRate(therapist)}
                    aria-label={`Rate ${therapist.name}`}
                    role="button"
                >
                    <StarIcon className="w-4 h-4 text-yellow-400"/>
                    <span className="font-bold text-white text-sm">{(therapist.rating || 0).toFixed(1)}</span>
                    <span className="text-xs text-gray-300">({therapist.reviewCount || 0})</span>
                </div>
                
                {/* Qualified Therapist Badge - Top Right Corner */}
                {/* Badge requirements: */}
                {/* 1. 3+ consecutive months of paid membership */}
                {/* 2. 4.0+ star rating */}
                {/* 3. Max 5-day grace period between renewals */}
                {((therapist.totalActiveMembershipMonths ?? 0) >= 3 && 
                  (therapist.rating ?? 0) >= 4.0 && 
                  (therapist.badgeEligible ?? false)) && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full px-3 py-1.5 shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        <span className="font-semibold text-white text-xs">Qualified</span>
                    </div>
                )}
            </div>
            
            {/* Profile Picture - Positioned below banner, overlapping */}
            <div className="absolute top-40 left-4 z-10">
                <img 
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg bg-gray-100" 
                    src={therapist.profilePicture || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23e5e7eb" width="80" height="80"/%3E%3Cpath fill="%239ca3af" d="M40 20c5.5 0 10 4.5 10 10s-4.5 10-10 10-10-4.5-10-10 4.5-10 10-10zm0 26c6.7 0 20 3.4 20 10v4H20v-4c0-6.6 13.3-10 20-10z"/%3E%3C/svg%3E'} 
                    alt={therapist.name}
                    onLoad={() => {
                        console.log('✅ Image loaded successfully for:', therapist.name);
                    }}
                    onError={(e) => {
                        console.error('❌ Failed to load profile image for:', therapist.name);
                        console.error('❌ Image URL was:', therapist.profilePicture);
                        console.error('❌ Error event:', e);
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23e5e7eb" width="80" height="80"/%3E%3Cpath fill="%239ca3af" d="M40 20c5.5 0 10 4.5 10 10s-4.5 10-10 10-10-4.5-10-10 4.5-10 10-10zm0 26c6.7 0 20 3.4 20 10v4H20v-4c0-6.6 13.3-10 20-10z"/%3E%3C/svg%3E';
                    }}
                />
            </div>
            
            {/* Therapist Name and Distance - Positioned to the right of profile picture */}
            <div className="absolute top-52 left-28 right-4 z-10">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">{therapist.name}</h3>
                    <div className="flex items-center text-sm text-gray-500 gap-1">
                        <LocationPinIcon className="w-4 h-4 text-red-500"/>
                        <span>{therapist.distance}km</span>
                    </div>
                </div>
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text} mt-1`}>
                    <span className="relative mr-1.5">
                        {displayStatus === AvailabilityStatus.Available && (
                            <span className="absolute inset-0 w-4 h-4 -left-1 -top-1 rounded-full bg-white opacity-60"></span>
                        )}
                        <span className={`w-2 h-2 rounded-full block ${style.dot}`}></span>
                    </span>
                    {displayStatus}
                </div>
            </div>
            
            {/* Content */}
            <div className="p-4 pt-12 flex flex-col gap-4">
                <div className="flex items-start gap-4">
                    <div className="flex-grow">
                        <div className="flex justify-between items-start">
                            <div className="flex-grow">
                            </div>
                        </div>
                         <p className="text-sm text-gray-600 mt-10">{therapist.description}</p>
                    </div>
                </div>

            <div>
                <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-semibold text-gray-700">Massage Types</h4>
                    {therapist.yearsOfExperience && (
                        <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            {therapist.yearsOfExperience} Years Experience
                        </span>
                    )}
                </div>
                <div className="flex flex-wrap gap-2">
                    {massageTypes.map(type => (
                        <span key={type} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">{type}</span>
                    ))}
                </div>
            </div>

            {/* Languages Spoken */}
            {therapist.languages && therapist.languages.length > 0 && (
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Therapist Speaks</h4>
                    <div className="flex flex-wrap gap-2">
                        {therapist.languages.map(lang => {
                            const langMap: Record<string, {flag: string, name: string}> = {
                                'en': {flag: '🇬🇧', name: 'English'},
                                'id': {flag: '🇮🇩', name: 'Indonesian'},
                                'zh': {flag: '🇨🇳', name: 'Chinese'},
                                'ja': {flag: '🇯🇵', name: 'Japanese'},
                                'ko': {flag: '🇰🇷', name: 'Korean'},
                                'ru': {flag: '🇷🇺', name: 'Russian'},
                                'fr': {flag: '🇫🇷', name: 'French'},
                                'de': {flag: '🇩🇪', name: 'German'},
                                'es': {flag: '🇪🇸', name: 'Spanish'}
                            };
                            const langInfo = langMap[lang] || {flag: '🌐', name: lang};
                            return (
                                <span key={lang} className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-gray-800 text-xs font-medium rounded-full flex items-center gap-1">
                                    <span className="text-base">{langInfo.flag}</span>
                                    <span>{langInfo.name}</span>
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-3 gap-2 text-center text-sm text-gray-600">
                <div className="bg-brand-orange-light p-2 rounded-lg">
                    <p>60 min</p>
                    <p className="font-bold text-brand-orange-dark">Rp {Number(pricing["60"]).toLocaleString('en-US', {minimumIntegerDigits: 3, useGrouping: false})}K</p>
                </div>
                <div className="bg-brand-orange-light p-2 rounded-lg">
                    <p>90 min</p>
                    <p className="font-bold text-brand-orange-dark">Rp {Number(pricing["90"]).toLocaleString('en-US', {minimumIntegerDigits: 3, useGrouping: false})}K</p>
                </div>
                <div className="bg-brand-orange-light p-2 rounded-lg">
                    <p>120 min</p>
                    <p className="font-bold text-brand-orange-dark">Rp {Number(pricing["120"]).toLocaleString('en-US', {minimumIntegerDigits: 3, useGrouping: false})}K</p>
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={openWhatsApp}
                    className="w-1/2 flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors duration-300"
                >
                    <WhatsAppIcon className="w-5 h-5"/>
                    <span>Chat Now</span>
                </button>
                 <button 
                    onClick={() => onBook(therapist)} 
                    className="w-1/2 flex items-center justify-center gap-2 bg-orange-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors duration-300"
                >
                    <CalendarIcon className="w-5 h-5"/>
                    <span>Schedule</span>
                </button>
            </div>

            {/* Leave Review Link */}
            <div className="text-center mt-3">
                <button
                    onClick={() => onRate(therapist)}
                    className="text-sm text-orange-600 hover:text-orange-700 font-semibold underline"
                >
                    Reviews Help The Community
                </button>
            </div>
            </div>
            
            {/* Busy Therapist Confirmation Modal */}
            {showBusyModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fadeIn">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">⏳</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Therapist Currently Busy</h3>
                            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                                This therapist is booked at present and we cannot ensure how many hours they will be busy. 
                                Please send a message and when the therapist is available, they will reply.
                            </p>
                            <p className="text-sm font-semibold text-orange-600 mb-6">- IndoStreet Admin</p>
                            
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowBusyModal(false)}
                                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmBusyContact}
                                    className="flex-1 px-4 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <WhatsAppIcon className="w-4 h-4" />
                                    Send Message
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TherapistCard;