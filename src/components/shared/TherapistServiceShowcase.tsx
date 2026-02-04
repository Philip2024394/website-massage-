/**
 * TherapistServiceShowcase Component
 * 
 * PURPOSE: Unified "Professional Massage Services" section for therapist profiles
 * 
 * FEATURES:
 * ✅ Single primary image (no grid)
 * ✅ Click-to-enlarge lightbox
 * ✅ Centered, responsive layout
 * ✅ Works on both regular & shared profiles
 * ✅ Dynamic therapist name
 * 
 * USAGE:
 * <TherapistServiceShowcase therapist={therapist} />
 */

import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Therapist } from '../../types';

interface TherapistServiceShowcaseProps {
    therapist: Therapist;
}

const TherapistServiceShowcase: React.FC<TherapistServiceShowcaseProps> = ({ therapist }) => {
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    // Image priority logic: showcaseImage > profileImage > fallback
    const getPrimaryImage = (): string => {
        const showcaseImage = (therapist as any).showcaseImage;
        const profileImage = (therapist as any).profilePicture || (therapist as any).mainImage;
        const fallbackImage = '/fallback-therapy.jpg';

        return showcaseImage || profileImage || fallbackImage;
    };

    const primaryImage = getPrimaryImage();

    const openLightbox = () => {
        setIsLightboxOpen(true);
        // Prevent body scroll when lightbox is open
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setIsLightboxOpen(false);
        // Restore body scroll
        document.body.style.overflow = 'unset';
    };

    return (
        <>
            {/* Main Container */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800">
                        Professional Massage Services
                    </h3>
                    <p className="text-sm text-gray-600">
                        Experience quality therapy with {therapist.name}
                    </p>
                </div>
                
                {/* Single Image - Click to Enlarge */}
                <div className="p-4">
                    <div 
                        className="w-full aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden cursor-pointer group"
                        onClick={openLightbox}
                    >
                        <img
                            src={primaryImage}
                            alt={`${therapist.name} - Professional massage therapy service`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                            onError={(e) => {
                                // Fallback if image fails to load
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x450/f3f4f6/374151?text=Professional+Massage+Service';
                            }}
                        />
                    </div>
                    
                    {/* Caption */}
                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-500">
                            Traditional Indonesian massage techniques • Professional service • Relaxing environment
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            Tap image to enlarge
                        </p>
                    </div>
                </div>
            </div>

            {/* Lightbox Modal */}
            {isLightboxOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-90 z-[9999] flex items-center justify-center p-4 animate-fadeIn"
                    onClick={closeLightbox}
                >
                    {/* Close Button */}
                    <button
                        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-[10000]"
                        onClick={closeLightbox}
                        aria-label="Close lightbox"
                    >
                        <X size={32} strokeWidth={2} />
                    </button>

                    {/* Enlarged Image */}
                    <div 
                        className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()} // Prevent close when clicking on image
                    >
                        <img
                            src={primaryImage}
                            alt={`${therapist.name} - Professional massage therapy service (enlarged)`}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-scaleIn"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x450/f3f4f6/374141?text=Professional+Massage+Service';
                            }}
                        />
                    </div>
                </div>
            )}

            {/* CSS Animations */}
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }

                .animate-scaleIn {
                    animation: scaleIn 0.3s ease-out;
                }
            `}</style>
        </>
    );
};

export default TherapistServiceShowcase;
