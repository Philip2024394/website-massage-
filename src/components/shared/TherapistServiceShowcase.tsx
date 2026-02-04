/**
 * TherapistServiceShowcase Component
 * 
 * PURPOSE: Massage Focus & Sensitivity Guide for therapist profiles
 * 
 * FEATURES:
 * ✅ Multi-image reference layout (5 images)
 * ✅ Click-to-enlarge lightbox for individual images
 * ✅ Visual communication aid for clients
 * ✅ Works on both regular & shared profiles
 * ✅ Responsive mobile and desktop layout
 * 
 * LAYOUT:
 * - Left: 2 tall images (Body Front, Body Back)
 * - Right: 3 landscape images (Arm/Hand, Head/Face, Foot/Calf)
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

// Reference images for massage guide (to be replaced with actual images)
const MASSAGE_GUIDE_IMAGES = {
    bodyFront: '/massage-guide/body-front.jpg',
    bodyBack: '/massage-guide/body-back.jpg',
    armHand: '/massage-guide/arm-hand.jpg',
    headFace: '/massage-guide/head-face.jpg',
    footCalf: '/massage-guide/foot-calf.jpg'
};

const TherapistServiceShowcase: React.FC<TherapistServiceShowcaseProps> = ({ therapist }) => {
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);

    const openLightbox = (imageSrc: string, imageAlt: string) => {
        setSelectedImage({ src: imageSrc, alt: imageAlt });
        setIsLightboxOpen(true);
        // Prevent body scroll when lightbox is open
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setIsLightboxOpen(false);
        setSelectedImage(null);
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
                        Massage Focus & Sensitivity Guide
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        This visual guide allows clients to clearly communicate their massage preferences to the therapist.
                        By referencing the image name and numbered key points, clients can indicate specific areas to focus on or avoid, ensuring a personalized, comfortable, and effective massage experience.
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        Clients may simply reference the image name and point number (e.g., "Body Back – Point 6") to guide the therapist.
                    </p>
                    <p className="text-xs text-gray-500 mt-2 italic">
                        This guide supports communication but does not replace verbal discussion with your therapist.
                    </p>
                </div>
                
                {/* Multi-Image Reference Layout */}
                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Left Side: 2 Tall Images (Body Front & Back) */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Body Front */}
                            <div 
                                className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden cursor-pointer group"
                                onClick={() => openLightbox(MASSAGE_GUIDE_IMAGES.bodyFront, 'Body Front - Massage reference points')}
                            >
                                <img
                                    src={MASSAGE_GUIDE_IMAGES.bodyFront}
                                    alt="Body Front - Massage reference guide"
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400/f3f4f6/374151?text=Body+Front';
                                    }}
                                />
                                <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                                    Body Front
                                </div>
                            </div>

                            {/* Body Back */}
                            <div 
                                className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden cursor-pointer group relative"
                                onClick={() => openLightbox(MASSAGE_GUIDE_IMAGES.bodyBack, 'Body Back - Massage reference points')}
                            >
                                <img
                                    src={MASSAGE_GUIDE_IMAGES.bodyBack}
                                    alt="Body Back - Massage reference guide"
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400/f3f4f6/374151?text=Body+Back';
                                    }}
                                />
                                <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                                    Body Back
                                </div>
                            </div>
                        </div>

                        {/* Right Side: 3 Landscape Images Stacked */}
                        <div className="space-y-3">
                            {/* Arm and Hand */}
                            <div 
                                className="aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden cursor-pointer group relative"
                                onClick={() => openLightbox(MASSAGE_GUIDE_IMAGES.armHand, 'Arm and Hand - Massage reference points')}
                            >
                                <img
                                    src={MASSAGE_GUIDE_IMAGES.armHand}
                                    alt="Arm and Hand - Massage reference guide"
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x225/f3f4f6/374151?text=Arm+and+Hand';
                                    }}
                                />
                                <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                                    Arm and Hand
                                </div>
                            </div>

                            {/* Head and Face */}
                            <div 
                                className="aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden cursor-pointer group relative"
                                onClick={() => openLightbox(MASSAGE_GUIDE_IMAGES.headFace, 'Head and Face - Massage reference points')}
                            >
                                <img
                                    src={MASSAGE_GUIDE_IMAGES.headFace}
                                    alt="Head and Face - Massage reference guide"
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x225/f3f4f6/374151?text=Head+and+Face';
                                    }}
                                />
                                <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                                    Head and Face
                                </div>
                            </div>

                            {/* Foot and Calf */}
                            <div 
                                className="aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden cursor-pointer group relative"
                                onClick={() => openLightbox(MASSAGE_GUIDE_IMAGES.footCalf, 'Foot and Calf - Massage reference points')}
                            >
                                <img
                                    src={MASSAGE_GUIDE_IMAGES.footCalf}
                                    alt="Foot and Calf - Massage reference guide"
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x225/f3f4f6/374151?text=Foot+and+Calf';
                                    }}
                                />
                                <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                                    Foot and Calf
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Helper Text */}
                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-500">
                            Click any image to view detailed reference points • Use this guide to communicate your preferences clearly
                        </p>
                    </div>
                </div>
            </div>

            {/* Lightbox Modal */}
            {isLightboxOpen && selectedImage && (
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
                            src={selectedImage.src}
                            alt={selectedImage.alt}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-scaleIn"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600/f3f4f6/374141?text=Massage+Reference+Guide';
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
