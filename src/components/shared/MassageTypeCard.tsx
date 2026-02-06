import React from 'react';
import { ArrowDown as ChevronDownIcon, ArrowUp as ChevronUpIcon } from 'lucide-react';

interface MassageType {
    name: string;
    description: string;
    fullDescription: string;
    benefits: string[];
    duration: string;
    intensity: string;
    bestFor: string[];
    image: string;
    popularity: number;
}

interface MassageTypeCardProps {
    massage: MassageType;
    expanded: boolean;
    onToggleExpanded: () => void;
    showActionButtons?: boolean;
    onFindTherapists?: (name: string) => void;
    onFindPlaces?: (name: string) => void;
    onPopularityClick?: () => void;
}

// Star Icon Component
const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

// Building Icon Component
const BuildingIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
);

export const MassageTypeCard: React.FC<MassageTypeCardProps> = ({
    massage,
    expanded,
    onToggleExpanded,
    showActionButtons = false,
    onFindTherapists,
    onFindPlaces,
    onPopularityClick
}) => {
    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 max-w-full">
            <div className="relative">
                <img 
                    src={massage.image} 
                    alt={massage.name}
                    className="w-full h-40 object-cover"
                    loading="lazy"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200/f97316/FFFFFF?text=' + encodeURIComponent(massage.name);
                    }}
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                
                {/* Massage Type Name on Image */}
                <h3 className="absolute bottom-3 left-3 text-white font-bold text-lg drop-shadow-lg">
                    {massage.name}
                </h3>
                
                {/* Popularity Badge */}
                <button
                    onClick={onPopularityClick}
                    className="absolute top-2 left-2 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 flex items-center gap-1 hover:bg-black/50 transition-colors cursor-pointer"
                    aria-label={`${massage.popularity} stars`}
                >
                    <StarIcon className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="font-semibold text-white text-xs">{massage.popularity}</span>
                </button>
            </div>
            
            {/* Description and Links Below Image */}
            <div className="p-4">
                {/* Short Description */}
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                    {massage.description}
                </p>

                {/* Quick Info Pills */}
                <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                        {massage.duration}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                        {massage.intensity} Pressure
                    </span>
                </div>

                {/* Read More Button */}
                {massage.fullDescription && (
                    <button 
                        onClick={onToggleExpanded}
                        className="text-orange-500 font-semibold text-sm hover:text-orange-600 transition-colors mb-3 flex items-center gap-1"
                    >
                        {expanded ? (
                            <>
                                <ChevronUpIcon className="w-4 h-4" />
                                <span>Read Less</span>
                            </>
                        ) : (
                            <>
                                <ChevronDownIcon className="w-4 h-4" />
                                <span>Read More</span>
                            </>
                        )}
                    </button>
                )}

                {/* Expanded Content */}
                {expanded && (
                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-4">
                        {/* Full Description */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-2">About {massage.name}</h4>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                {massage.fullDescription}
                            </p>
                        </div>

                        {/* Benefits */}
                        {massage.benefits && massage.benefits.length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 mb-2">Key Benefits</h4>
                                <ul className="space-y-1">
                                    {massage.benefits.map((benefit, idx) => (
                                        <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                                            <span className="text-orange-500 mt-0.5">✓</span>
                                            <span>{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Best For */}
                        {massage.bestFor && massage.bestFor.length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 mb-2">Best For</h4>
                                <div className="flex flex-wrap gap-2">
                                    {massage.bestFor.map((item, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Action Buttons - Only show if enabled */}
                {showActionButtons && (
                    <div className="flex gap-3 text-xs mt-3 pt-3 border-t border-gray-100">
                        {/* Find Therapists - Left */}
                        <button 
                            onClick={() => onFindTherapists?.(massage.name)}
                            className="flex items-center gap-2 text-orange-500 font-semibold hover:text-orange-600 transition-colors"
                        >
                            Find Therapists →
                        </button>
                        
                        {/* Spacer */}
                        <div className="flex-1"></div>
                        
                        {/* Find Massage Places - Right with circular icon */}
                        <button 
                            onClick={() => onFindPlaces?.(massage.name)}
                            className="flex items-center gap-2 text-orange-500 font-semibold hover:text-orange-600 transition-colors"
                        >
                            <span className="flex items-center justify-center w-6 h-6 bg-orange-100 rounded-full">
                                <BuildingIcon className="w-4 h-4" />
                            </span>
                            Find Massage Places →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
