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
            <img className="h-40 w-full object-cover" src={place.mainImage} alt={place.name} />
            <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900">{place.name}</h3>
                <p className="mt-1 text-gray-500 text-sm truncate">{place.description}</p>
                <div className="flex justify-between items-center mt-3 text-sm">
                    <div 
                        className="flex items-center gap-1 cursor-pointer"
                        onClick={handleRateClick}
                        aria-label={`Rate ${place.name}`}
                        role="button"
                    >
                        <StarIcon className="w-5 h-5 text-yellow-400"/>
                        <span className="font-bold text-gray-700">{place.rating.toFixed(1)}</span>
                        <span className="text-gray-500">({place.reviewCount})</span>
                    </div>
                     <div className="flex items-center text-gray-500 gap-1">
                        <LocationPinIcon className="w-4 h-4 text-gray-400"/>
                        <span>{place.distance}km</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaceCard;