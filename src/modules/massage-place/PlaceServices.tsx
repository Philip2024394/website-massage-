import React, { useState } from 'react';
/**
 * PlaceServices Component
 *
 * Extracted from MassagePlaceCard.tsx as part of Phase 3 modularization.
 * Handles the services and details section including bio, gallery, specializations,
 * languages, and amenities.
 *
 * Features:
 * - Bio text with website link
 * - Photo gallery with modal viewing
 * - Massage specializations display
 * - Languages and experience display
 * - Amenities listing
 */

import { parseMassageTypes, parseLanguages } from '../../utils/appwriteHelpers';
import { isDiscountActive } from '../../constants/cardConstants';

interface PlaceServicesProps {
    place: any;
    description: string;
    isDiscountActive: (place: any) => boolean;
    activeDiscount?: { percentage: number; expiresAt: Date } | null;
    galleryPhotos: any[];
    massageTypesDisplay: string[];
    languagesDisplay: string[];
    yearsOfExperience: number;
    displayAmenities: string[];
    t: any;
    onGalleryPhotoClick: (photo: {url: string; title: string; description: string}) => void;
    onNavigate?: (page: string) => void;
    setShowPriceListModal: (show: boolean) => void;
    amenities: string[];
}

const PlaceServices: React.FC<PlaceServicesProps> = ({
    place,
    description,
    isDiscountActive,
    activeDiscount,
    galleryPhotos,
    massageTypesDisplay,
    languagesDisplay,
    yearsOfExperience,
    displayAmenities,
    t,
    onGalleryPhotoClick,
    onNavigate,
}) => {
    const [selectedGalleryPhoto, setSelectedGalleryPhoto] = useState<string | null>(null);
    const [amenities, setAmenities] = useState<any[]>([]);
    const [showPriceListModal, setShowPriceListModal] = useState(false);
    return (
        <>
            {/* Client Preference Display - Left aligned, matching therapist card */}
            <div className="mx-4 mb-2 mt-4 flex items-center justify-between">
                <p className="text-xs text-gray-600 text-left">
                    <span className="font-bold">Menerima:</span> {(place as any).therapistGender && (place as any).therapistGender !== 'Unisex' ? `${(place as any).therapistGender} Only` : 'Pria / Wanita'}
                </p>
                {/* SafePass Button - Only shows if verified by admin */}
                {(place as any).hotelVillaSafePassStatus === 'active' && (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('🛡️ Opening SafePass verification modal for place:', place.name);
                            // TODO: Add SafePass modal functionality for places
                        }}
                        className="hover:opacity-90 active:scale-95 transition-all duration-200 cursor-pointer relative z-10"
                    >
                        <img 
                            src="https://ik.imagekit.io/7grri5v7d/hotel%205.png?updatedAt=1770362023320" 
                            alt="SafePass Verified"
                            className="w-12 h-12 object-contain"
                            loading="lazy"
                            decoding="async"
                        />
                    </button>
                )}
            </div>

            {/* Massage Place Bio - Natural flow with proper margin */}
            <div className="massage-place-bio-section bg-white/90 backdrop-blur-sm rounded-lg py-2 px-3 shadow-sm mx-4 mb-3">
                <p className="text-sm text-gray-700 leading-5 break-words whitespace-normal line-clamp-6">
                    {description}
                </p>
                {/* Opening/Closing Time Text - Shows when discount IS active */}
                {(isDiscountActive(place)) && place.openingTime && place.closingTime && (
                    <div className="flex items-center gap-1 text-xs text-gray-600 whitespace-nowrap mt-2">
                        <svg className="w-3.5 h-3.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">{place.openingTime}-{place.closingTime}</span>
                    </div>
                )}
                {/* Website Link */}
                {(place as any).websiteUrl && (
                    <a
                        href={(place as any).websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 mt-2 text-xs text-orange-600 hover:text-orange-700 font-medium hover:underline transition-colors"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        Visit Website
                    </a>
                )}
            </div>

            {/* Photo Gallery - 4 Thumbnails */}
            {galleryPhotos.length > 0 && (
                <div className="px-4 mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Gallery</h4>
                    <div className="grid grid-cols-4 gap-2">
                        {galleryPhotos.map((photo: any, index: number) => (
                            <button
                                key={index}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onGalleryPhotoClick({
                                        url: typeof photo === 'string' ? photo : (photo as any).url || photo.imageUrl || '',
                                        title: typeof photo === 'object' ? ((photo as any).title || photo.name || `Photo ${index + 1}`) : `Photo ${index + 1}`,
                                        description: typeof photo === 'object' ? ((photo as any).description || '') : ''
                                    });
                                }}
                                className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-orange-500 transition-all hover:scale-105 active:scale-95"
                            >
                                <img
                                    src={typeof photo === 'string' ? photo : (photo as any).url || photo.imageUrl || ''}
                                    alt={typeof photo === 'object' ? ((photo as any).title || `Gallery photo ${index + 1}`) : `Gallery photo ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://ik.imagekit.io/7grri5v7d/balineese%20massage%20indonisea.png?updatedAt=1761918521382';
                                    }}
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Content Section - Compact layout */}
            <div className="px-4">
                {/* Massage Specializations - Centered */}
                <div className="border-t border-gray-100 pt-3">
                    <div className="mb-2">
                        <h4 className="text-sm font-semibold text-gray-700 text-center">
                            Areas of Expertise
                        </h4>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-center">
                        {massageTypesDisplay.slice(0, 5).map((mt: string) => (
                            <span key={mt} className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs font-medium rounded-full border border-orange-300">{mt}</span>
                        ))}
                        {massageTypesDisplay.length === 0 && (
                            <span className="text-xs text-gray-400">No specialties selected</span>
                        )}
                        {massageTypesDisplay.length > 5 && (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs font-medium rounded-full border border-orange-300">+{massageTypesDisplay.length - 5}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Languages Spoken - Compact */}
            {(languagesDisplay.length > 0 || yearsOfExperience) && (
                <div className="px-4 mt-4">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-xs font-semibold text-gray-700">Languages</h4>
                        {yearsOfExperience && (
                            <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                {yearsOfExperience} years experience
                            </span>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {languagesDisplay.slice(0, 3).map((lang: string) => (
                            <span key={lang} className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-gray-800 text-xs font-medium rounded-full flex items-center gap-1">
                                <span className="text-xs">🌐</span>
                                <span className="text-xs font-semibold">{lang}</span>
                            </span>
                        ))}
                        {languagesDisplay.length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">+{languagesDisplay.length - 3}</span>
                        )}
                    </div>
                </div>
            )}

            {/* Amenities */}
            {displayAmenities.length > 0 && (
                <div className="px-4 mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Amenities</h4>
                    <p className="text-xs text-gray-500 mb-2">Additional services provided during your massage session</p>
                    <div className="flex flex-wrap gap-2">
                        {displayAmenities.map((amenity: string) => (
                            <span key={amenity} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                                {amenity}
                            </span>
                        ))}
                        {amenities.length > 3 && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                                +{amenities.length - 3} more
                            </span>
                        )}
                    </div>
                </div>
            )}



            {/* Gallery Photo Modal */}
            {selectedGalleryPhoto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
                    <div className="relative max-w-4xl w-full bg-white rounded-lg overflow-hidden">
                        <button
                            onClick={() => setSelectedGalleryPhoto(null)}
                            className="absolute top-2 right-2 z-10 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <img
                            src={(selectedGalleryPhoto as any).url}
                            alt={(selectedGalleryPhoto as any).title}
                            className="w-full h-auto max-h-[80vh] object-contain"
                        />
                        {((selectedGalleryPhoto as any).title || (selectedGalleryPhoto as any).description) && (
                            <div className="p-4 border-t">
                                {(selectedGalleryPhoto as any).title && (
                                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{(selectedGalleryPhoto as any).title}</h3>
                                )}
                                {(selectedGalleryPhoto as any).description && (
                                    <p className="text-gray-600">{(selectedGalleryPhoto as any).description}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default PlaceServices;
