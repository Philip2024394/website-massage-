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

import React, { useState, useEffect } from 'react';
import { X, Info } from 'lucide-react';
import type { Therapist } from '../../types';
import { MASSAGE_TYPES } from '../../constants';

interface TherapistServiceShowcaseProps {
    therapist: Therapist;
}

// Massage guide reference images from ImageKit CDN
const MASSAGE_GUIDE_IMAGES = {
    bodyFront: 'https://ik.imagekit.io/7grri5v7d/body%20part%205.png?updatedAt=1770240547579',
    bodyBack: 'https://ik.imagekit.io/7grri5v7d/body%20part%204.png?updatedAt=1770240670476',
    armHand: 'https://ik.imagekit.io/7grri5v7d/body%20part%203.png?updatedAt=1770240730008',
    headFace: 'https://ik.imagekit.io/7grri5v7d/body%20part%202.png?updatedAt=1770240801336',
    footCalf: 'https://ik.imagekit.io/7grri5v7d/body%20part%201.png?updatedAt=1770240868167'
};

const TherapistServiceShowcase: React.FC<TherapistServiceShowcaseProps> = ({ therapist }) => {
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);
    const [isMassageTypesOpen, setIsMassageTypesOpen] = useState(false);

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

    const openMassageTypes = () => {
        setIsMassageTypesOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeMassageTypes = () => {
        setIsMassageTypesOpen(false);
        document.body.style.overflow = 'unset';
    };

    // Close modals on ESC key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isLightboxOpen) closeLightbox();
                if (isMassageTypesOpen) closeMassageTypes();
            }
        };
        
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isLightboxOpen, isMassageTypesOpen]);

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
                        This visual guide allows you if need to clearly communicate your massage preferences to the therapist.
                        By referencing the image name and numbered key points, you can indicate specific areas to focus on or avoid, ensuring a personalized, comfortable, and effective massage experience.
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        You may simply reference the image name and point number (eg, "Body Back – Point 6") to guide the therapist.
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

                {/* Bottom Action Link */}
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={openMassageTypes}
                        className="flex items-center justify-center gap-2 text-sm text-gray-700 hover:text-indigo-600 transition-colors mx-auto group"
                    >
                        <Info size={18} className="text-gray-500 group-hover:text-indigo-600 transition-colors" />
                        <span className="font-medium">Which Massage Type</span>
                    </button>
                </div>
            </div>

            {/* Massage Types Full-Screen Modal */}
            {isMassageTypesOpen && (
                <div 
                    className="fixed inset-0 bg-white z-[9999] overflow-y-auto animate-slideUp"
                    onClick={closeMassageTypes}
                >
                    {/* Close Button */}
                    <button
                        className="fixed top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                        onClick={closeMassageTypes}
                        aria-label="Close massage types"
                    >
                        <X size={24} strokeWidth={2} />
                    </button>

                    {/* Content */}
                    <div 
                        className="max-w-4xl mx-auto px-4 py-6 sm:px-6 sm:py-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
                            Massage Type Overview
                        </h2>
                        <p className="text-sm text-gray-600 mb-8 text-center max-w-2xl mx-auto">
                            Explore different massage styles to find the perfect treatment for your needs
                        </p>

                        {/* Massage Types Grid */}
                        <div className="grid gap-6 sm:grid-cols-2">
                            {MASSAGE_TYPES.map((massageType) => (
                                <div 
                                    key={massageType.name}
                                    className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                                        {massageType.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                                        {massageType.shortDescription}
                                    </p>

                                    {/* Benefits */}
                                    {massageType.benefits && massageType.benefits.length > 0 && (
                                        <div className="mb-3">
                                            <p className="text-xs font-semibold text-gray-700 mb-1">Key Benefits:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {massageType.benefits.slice(0, 3).map((benefit, idx) => (
                                                    <span 
                                                        key={idx}
                                                        className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full"
                                                    >
                                                        {benefit}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Details */}
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        {massageType.duration && (
                                            <span className="flex items-center gap-1">
                                                ⏱️ {massageType.duration}
                                            </span>
                                        )}
                                        {massageType.intensity && (
                                            <span className="flex items-center gap-1">
                                                💪 {massageType.intensity}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer Note */}
                        <div className="mt-8 text-center">
                            <p className="text-xs text-gray-500 italic">
                                Discuss your preferences with your therapist to customize your experience
                            </p>
                        </div>
                    </div>
                </div>
            )}

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

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }

                .animate-scaleIn {
                    animation: scaleIn 0.3s ease-out;
                }

                .animate-slideUp {
                    animation: slideUp 0.3s ease-out;
                }
            `}</style>
        </>
    );
};

export default TherapistServiceShowcase;
