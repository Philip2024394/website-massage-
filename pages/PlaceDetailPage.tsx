import React, { useState, useEffect } from 'react';
import type { Place, Analytics } from '../types';
import Button from '../components/Button';
import { analyticsService } from '../services/analyticsService';
import { notificationService } from '../lib/appwriteService';

interface PlaceDetailPageProps {
    place: Place;
    onBack: () => void;
    onBook: (place: Place) => void;
    onIncrementAnalytics: (metric: keyof Analytics) => void;
    t: any;
    loggedInProviderId?: number; // To prevent self-notification
}

const WhatsAppIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.614-1.486L.057 24zM6.591 17.419c.404.652.812 1.272 1.242 1.85 1.58 2.116 3.663 3.22 5.953 3.218 5.55-.006 10.038-4.488 10.043-10.038.005-5.55-4.488-10.038-10.038-10.043-5.55.005-10.038 4.488-10.043 10.038.002 2.13.642 4.148 1.822 5.898l-1.03 3.766 3.844-1.025z"/>
    </svg>
);


const PlaceDetailPage: React.FC<PlaceDetailPageProps> = ({ place, onBack, onBook, onIncrementAnalytics, t, loggedInProviderId }) => {
    const [currentMainImage, setCurrentMainImage] = useState(place.mainImage);

    // Parse JSON strings
    const massageTypes = typeof place.massageTypes === 'string' ? JSON.parse(place.massageTypes) : place.massageTypes;
    const pricing = typeof place.pricing === 'string' ? JSON.parse(place.pricing) : place.pricing;

    useEffect(() => {
        // Track real analytics
        analyticsService.trackProfileView(
            place.id,
            'place',
            undefined // userId if available
        ).catch(err => console.error('Analytics tracking error:', err));
        
        // Keep legacy tracking for backwards compatibility
        onIncrementAnalytics('profileViews');
    }, [place.id]);

    const openWhatsApp = () => {
        // Play click sound
        const audio = new Audio('/sounds/success-notification.mp3');
        audio.volume = 0.3; // Quiet click sound
        audio.play().catch(err => console.log('Sound play failed:', err));

        // Convert place.id to number for comparison
        const placeIdNumber = typeof place.id === 'string' ? parseInt(place.id) : place.id;

        // Send notification to place ONLY if it's not them clicking their own button
        if (loggedInProviderId !== placeIdNumber) {
            notificationService.createWhatsAppContactNotification(
                placeIdNumber,
                place.name
            ).catch(err => console.log('Notification failed:', err));
        } else {
            console.log('🔇 Skipping self-notification (you clicked your own button)');
        }

        // Track real analytics
        analyticsService.trackWhatsAppClick(
            place.id,
            'place',
            undefined // userId if available
        ).catch(err => console.error('Analytics tracking error:', err));
        
        // Keep legacy tracking
        onIncrementAnalytics('whatsappClicks');
        window.open(`https://wa.me/${place.whatsappNumber}`, '_blank');
    };

    const getStatus = (): { text: string; color: string } => {
        if (!place.openingTime || !place.closingTime) {
            return { text: 'N/A', color: 'bg-gray-500' };
        }
        
        try {
            const now = new Date();
            const currentTime = now.getHours() * 60 + now.getMinutes();

            const [openHour, openMinute] = place.openingTime.split(':').map(Number);
            const openTime = openHour * 60 + openMinute;

            const [closeHour, closeMinute] = place.closingTime.split(':').map(Number);
            const closeTime = closeHour * 60 + closeMinute;

            if (currentTime >= openTime && currentTime <= closeTime) {
                return { text: 'Open', color: 'bg-green-500' };
            }
            return { text: 'Closed', color: 'bg-red-500' };
        } catch (error) {
            console.error("Error parsing time:", error);
            return { text: 'N/A', color: 'bg-gray-500' };
        }
    };

    const status = getStatus();
    
    return (
        <div className="min-h-screen bg-white">
             <div className="relative">
                <img className="w-full h-64 object-cover" src={currentMainImage} alt={place.name} />
                <div className="absolute inset-0 bg-black/20"></div>
                <button onClick={onBack} className="absolute top-4 left-4 bg-white/70 rounded-full p-2 text-gray-800 hover:bg-white transition-colors z-10">
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-white font-bold text-sm ${status.color} z-10 shadow-lg`}>
                    {status.text}
                </span>
            </div>
            
            <div className="p-4">
                <div className="grid grid-cols-3 gap-2 mb-4">
                    {place.thumbnailImages.map((img, index) => (
                        <img 
                            key={index} 
                            src={img} 
                            alt={`${place.name} thumbnail ${index+1}`} 
                            className="w-full h-24 object-cover rounded-lg shadow-sm cursor-pointer hover:opacity-80 transition-opacity" 
                            onClick={() => setCurrentMainImage(img)}
                        />
                    ))}
                </div>

                <h1 className="text-3xl font-bold text-gray-900">{place.name}</h1>
                {place.openingTime && place.closingTime && (
                    <p className="text-sm text-gray-500 mt-1 font-medium">
                        Today's Hours: {place.openingTime} - {place.closingTime}
                    </p>
                )}
                <p className="mt-2 text-gray-600">{place.description}</p>
            </div>

            <div className="px-4 py-2">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Services Offered</h3>
                <div className="flex flex-wrap gap-2">
                    {massageTypes && Array.isArray(massageTypes) && massageTypes.map((type: string) => (
                        <span key={type} className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">{type}</span>
                    ))}
                </div>
            </div>

            <div className="px-4 py-2 mt-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{t.pricingTitle}</h3>
                 <div className="grid grid-cols-3 gap-2 text-center text-sm text-gray-600">
                    <div className="bg-brand-green-light p-3 rounded-lg">
                        <p>60 min</p>
                        <p className="font-bold text-lg text-brand-green-dark">Rp {Number(pricing[60]).toLocaleString('en-US', {minimumIntegerDigits: 3, useGrouping: false})}K</p>
                    </div>
                    <div className="bg-brand-green-light p-3 rounded-lg">
                        <p>90 min</p>
                        <p className="font-bold text-lg text-brand-green-dark">Rp {Number(pricing[90]).toLocaleString('en-US', {minimumIntegerDigits: 3, useGrouping: false})}K</p>
                    </div>
                    <div className="bg-brand-green-light p-3 rounded-lg">
                        <p>120 min</p>
                        <p className="font-bold text-lg text-brand-green-dark">Rp {Number(pricing[120]).toLocaleString('en-US', {minimumIntegerDigits: 3, useGrouping: false})}K</p>
                    </div>
                </div>
            </div>

            <div className="p-4 mt-4 sticky bottom-0 bg-white border-t flex gap-2">
                 <button
                    onClick={openWhatsApp}
                    className="w-1/2 flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors duration-300"
                >
                    <WhatsAppIcon className="w-5 h-5"/>
                    <span>{t.contactButton}</span>
                </button>
                <Button onClick={() => onBook(place)} className="w-1/2">
                    {t.bookButton}
                </Button>
            </div>
        </div>
    );
};

export default PlaceDetailPage;