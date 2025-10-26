import React from 'react';
import type { Place } from '../types';

interface PlaceCardProps {
    place: Place;
    onClick: () => void;
    onRate: (place: Place) => void;
}

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


const PlaceCard: React.FC<PlaceCardProps> = ({ place, onClick, onRate }) => {
    
    const handleRateClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onRate(place);
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300" onClick={onClick}>
            <div className="h-40 w-full relative">
                <img className="h-40 w-full object-cover" src={place.mainImage} alt={place.name} />
                
                {/* Star Rating - Top Left Corner */}
                <div 
                    className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-md rounded-full px-3 py-1.5 shadow-lg cursor-pointer"
                    onClick={handleRateClick}
                    aria-label={`Rate ${place.name}`}
                    role="button"
                >
                    <StarIcon className="w-5 h-5 text-yellow-400"/>
                    <span className="font-bold text-white text-sm">{place.rating.toFixed(1)}</span>
                    <span className="text-xs text-gray-300">({place.reviewCount})</span>
                </div>
                
                {/* Qualified Business Badge - Top Right Corner */}
                {/* Badge requirements: */}
                {/* 1. 3+ consecutive months of paid membership */}
                {/* 2. 4.0+ star rating */}
                {/* 3. Max 5-day grace period between renewals */}
                {(((place as any).totalActiveMembershipMonths ?? 0) >= 3 && 
                  (place.rating ?? 0) >= 4.0 && 
                  ((place as any).badgeEligible ?? false)) && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full px-3 py-1.5 shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        <span className="font-semibold text-white text-xs">Qualified</span>
                    </div>
                )}
            </div>
                        <div className="p-4">
                                <h3 className="text-lg font-bold text-gray-900">{place.name}</h3>
                                <p className="mt-1 text-gray-500 text-sm truncate">{place.description}</p>
                                <div className="flex justify-end items-center mt-3 text-sm">
                                         <div className="flex items-center text-gray-500 gap-1">
                                                <LocationPinIcon className="w-4 h-4 text-gray-400"/>
                                                <span>{place.distance}km</span>
                                        </div>
                                </div>

                                {/* Languages Spoken */}
                                {place.languages && place.languages.length > 0 && (
                                    <div className="mt-3">
                                        <h4 className="text-xs font-semibold text-gray-700 mb-1.5">Languages</h4>
                                        <div className="flex flex-wrap gap-1.5">
                                            {place.languages.map(lang => {
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
                                                    <span key={lang} className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-gray-800 text-xs font-medium rounded-full flex items-center gap-1">
                                                        <span className="text-sm">{langInfo.flag}</span>
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Price structure for 60, 90, 120 min */}
                                {place.pricing && (
                                    (() => {
                                        let pricing = {"60":0,"90":0,"120":0};
                                        try { pricing = JSON.parse(place.pricing); } catch {}
                                        return (
                                            <div className="grid grid-cols-3 gap-2 text-center text-sm text-gray-600 mt-3">
                                                <div className="bg-brand-orange-light p-2 rounded-lg">
                                                    <p>60 min</p>
                                                    <p className="font-bold text-brand-orange-dark">Rp {String(pricing["60"]).padStart(3, '0')}k</p>
                                                </div>
                                                <div className="bg-brand-orange-light p-2 rounded-lg">
                                                    <p>90 min</p>
                                                    <p className="font-bold text-brand-orange-dark">Rp {String(pricing["90"]).padStart(3, '0')}k</p>
                                                </div>
                                                <div className="bg-brand-orange-light p-2 rounded-lg">
                                                    <p>120 min</p>
                                                    <p className="font-bold text-brand-orange-dark">Rp {String(pricing["120"]).padStart(3, '0')}k</p>
                                                </div>
                                            </div>
                                        );
                                    })()
                                )}
                        </div>
        </div>
    );
};

export default PlaceCard;