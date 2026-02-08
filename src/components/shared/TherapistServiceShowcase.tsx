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
import { MASSAGE_TYPE_DETAILS, getMassageTypeImage } from '../../constants';
import { MassageTypeCard } from './MassageTypeCard';

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
    const [expandedCards, setExpandedCards] = useState<{ [key: string]: boolean }>({});

    // 🎯 CRITICAL DEBUG: Log EVERY render to catch state resets
    logger.debug('🔄 TherapistServiceShowcase RENDER');
    logger.debug('   isMassageTypesOpen:', isMassageTypesOpen);
    logger.debug('   Therapist ID:', (therapist as any).id || (therapist as any).$id);
    logger.debug('   Therapist Name:', therapist.name);

    // 🔍 DEBUG: Component mount/unmount tracking
    React.useEffect(() => {
        logger.debug('🟢 TherapistServiceShowcase MOUNTED');
        return () => {
            logger.debug('🔴 TherapistServiceShowcase UNMOUNTED');
            logger.debug('   🚨 If slider was open, unmount destroyed it!');
        };
    }, []);

    // 🔍 DEBUG: Track therapist prop changes (could cause re-render)
    React.useEffect(() => {
        logger.debug('👤 Therapist prop changed');
        logger.debug('   This re-render could be the cause if it happens when slider opens');
    }, [therapist]);

    const openLightbox = (imageSrc: string, imageAlt: string) => {
        setSelectedImage({ src: imageSrc, alt: imageAlt });
        setIsLightboxOpen(true);
        // Keep body scrollable on mobile
        document.body.style.overflow = 'auto';
    };

    const closeLightbox = () => {
        setIsLightboxOpen(false);
        setSelectedImage(null);
        // Restore body scroll
        document.body.style.overflow = 'auto';
    };

    const openMassageTypes = () => {
        logger.debug('✅ openMassageTypes() called at', new Date().toISOString());
        setIsMassageTypesOpen(true);
        setExpandedCards({}); // Reset expansion state when opening modal
        document.body.style.overflow = 'auto';
    };

    const closeMassageTypes = () => {
        logger.debug('🚨 closeMassageTypes() called at', new Date().toISOString());
        setIsMassageTypesOpen(false);
        setExpandedCards({}); // Reset expansion state when closing modal
        document.body.style.overflow = 'auto';
    };

    const toggleCardExpansion = (massageName: string) => {
        setExpandedCards(prev => ({
            ...prev,
            [massageName]: !prev[massageName]
        }));
    };

    // Cycle through popularity ratings
    const popularityRatings = [4.2, 4.5, 4.7, 4.8];
    const getPopularity = (index: number) => {
        return popularityRatings[index % popularityRatings.length];
    };

    // Close modals on ESC key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isLightboxOpen) {
                    closeLightbox();
                }
                if (isMassageTypesOpen) {
                    console.trace('🔑 ESC key - closing slider');
                    closeMassageTypes();
                }
            }
        };
        
        window.addEventListener('keydown', handleEscape);
        return () => {
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isLightboxOpen, isMassageTypesOpen]);

    return (
        <>
            {/* Main Container */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800">
                        Panduan Fokus & Sensitivitas Pijat
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        Panduan visual ini memungkinkan Anda untuk berkomunikasi dengan jelas tentang preferensi pijat Anda kepada terapis.
                        Dengan merujuk pada nama gambar dan titik-titik yang diberi nomor, Anda dapat menunjukkan area tertentu untuk difokuskan atau dihindari, memastikan pengalaman pijat yang personal, nyaman, dan efektif.
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        Anda cukup menyebutkan nama gambar dan nomor titik (misalnya, "Punggung Belakang – Titik 6") untuk membimbing terapis.
                    </p>
                    <p className="text-xs text-gray-500 mt-2 italic">
                        Panduan ini mendukung komunikasi tetapi tidak menggantikan diskusi verbal dengan terapis Anda.
                    </p>
                </div>
                
                {/* Multi-Image Reference Layout */}
                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Left Side: 2 Tall Images (Body Front & Back) */}
                        <div className="grid grid-cols-2 gap-3 min-h-[400px]">
                            {/* Body Front */}
                            <div 
                                className="bg-gray-100 rounded-lg overflow-hidden cursor-pointer group relative h-full min-h-[400px]"
                                onClick={() => openLightbox(MASSAGE_GUIDE_IMAGES.bodyFront, 'Tubuh Depan - Titik referensi pijat')}
                            >
                                <img
                                    src={MASSAGE_GUIDE_IMAGES.bodyFront}
                                    alt="Tubuh Depan - Panduan referensi pijat"
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400/f3f4f6/374151?text=Tubuh+Depan';
                                    }}
                                />
                                <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                                    Tubuh Depan
                                </div>
                            </div>

                            {/* Body Back */}
                            <div 
                                className="bg-gray-100 rounded-lg overflow-hidden cursor-pointer group relative h-full min-h-[400px]"
                                onClick={() => openLightbox(MASSAGE_GUIDE_IMAGES.bodyBack, 'Punggung Belakang - Titik referensi pijat')}
                            >
                                <img
                                    src={MASSAGE_GUIDE_IMAGES.bodyBack}
                                    alt="Punggung Belakang - Panduan referensi pijat"
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400/f3f4f6/374151?text=Punggung+Belakang';
                                    }}
                                />
                                <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                                    Punggung Belakang
                                </div>
                            </div>
                        </div>

                        {/* Right Side: 3 Landscape Images Stacked */}
                        <div className="space-y-3">
                            {/* Arm and Hand */}
                            <div 
                                className="aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden cursor-pointer group relative"
                                onClick={() => openLightbox(MASSAGE_GUIDE_IMAGES.armHand, 'Lengan dan Tangan - Titik referensi pijat')}
                            >
                                <img
                                    src={MASSAGE_GUIDE_IMAGES.armHand}
                                    alt="Lengan dan Tangan - Panduan referensi pijat"
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x225/f3f4f6/374151?text=Lengan+dan+Tangan';
                                    }}
                                />
                                <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                                    Lengan dan Tangan
                                </div>
                            </div>

                            {/* Head and Face */}
                            <div 
                                className="aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden cursor-pointer group relative"
                                onClick={() => openLightbox(MASSAGE_GUIDE_IMAGES.headFace, 'Kepala dan Wajah - Titik referensi pijat')}
                            >
                                <img
                                    src={MASSAGE_GUIDE_IMAGES.headFace}
                                    alt="Kepala dan Wajah - Panduan referensi pijat"
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x225/f3f4f6/374151?text=Kepala+dan+Wajah';
                                    }}
                                />
                                <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                                    Kepala dan Wajah
                                </div>
                            </div>

                            {/* Foot and Calf */}
                            <div 
                                className="aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden cursor-pointer group relative"
                                onClick={() => openLightbox(MASSAGE_GUIDE_IMAGES.footCalf, 'Kaki dan Betis - Titik referensi pijat')}
                            >
                                <img
                                    src={MASSAGE_GUIDE_IMAGES.footCalf}
                                    alt="Kaki dan Betis - Panduan referensi pijat"
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x225/f3f4f6/374151?text=Kaki+dan+Betis';
                                    }}
                                />
                                <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                                    Kaki dan Betis
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Helper Text */}
                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-500">
                            Klik gambar apa pun untuk melihat titik referensi detail • Gunakan panduan ini untuk mengkomunikasikan preferensi Anda dengan jelas
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
                        <span className="font-medium">Jenis Pijat Apa</span>
                    </button>
                </div>
            </div>

            {/* Massage Types Full-Screen Modal */}
            {isMassageTypesOpen && (
                <div 
                    className="fixed inset-0 bg-white z-[9999] overflow-y-auto animate-slideUp"
                >
                    {/* Close Button */}
                    <button
                        className="fixed top-4 right-4 z-10 p-2 bg-orange-500 rounded-full shadow-lg hover:bg-orange-600 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            console.trace('❌ X button - closing slider');
                            closeMassageTypes();
                        }}
                        aria-label="Close massage types"
                    >
                        <X size={24} strokeWidth={2} className="text-black" />
                    </button>

                    {/* Content - Reusing MassageTypesPage cards */}
                    <div 
                        className="max-w-4xl mx-auto px-4 py-12 sm:px-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Massage Types Grid - Same layout as directory page */}
                        <div className="flex flex-col gap-4">
                            {MASSAGE_TYPE_DETAILS.map((massageTypeDetail, index) => {
                                const massage = {
                                    name: massageTypeDetail.name,
                                    description: massageTypeDetail.shortDescription,
                                    fullDescription: massageTypeDetail.fullDescription,
                                    benefits: massageTypeDetail.benefits || [],
                                    duration: massageTypeDetail.duration || '60-90 min',
                                    intensity: massageTypeDetail.intensity || 'Medium',
                                    bestFor: massageTypeDetail.bestFor || [],
                                    image: getMassageTypeImage(massageTypeDetail.name),
                                    popularity: getPopularity(index)
                                };

                                return (
                                    <MassageTypeCard
                                        key={massage.name}
                                        massage={massage}
                                        expanded={expandedCards[massage.name] || false}
                                        onToggleExpanded={() => toggleCardExpansion(massage.name)}
                                        showActionButtons={false}
                                    />
                                );
                            })}
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
                        className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-orange-50 transition-colors z-[10000]"
                        onClick={closeLightbox}
                        aria-label="Close lightbox"
                    >
                        <X size={32} strokeWidth={2} className="text-orange-500" />
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
