import React from 'react';
import { getMultipleRandomSharedProfileImages } from '../../lib/sharedProfileImages';

interface SharedProfileImageGalleryProps {
    therapistName: string;
    count?: number; // Number of images to display
}

const SharedProfileImageGallery: React.FC<SharedProfileImageGalleryProps> = ({ 
    therapistName, 
    count = 4 
}) => {
    const images = getMultipleRandomSharedProfileImages(count);

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8">
            <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">
                    Professional Massage Services
                </h3>
                <p className="text-sm text-gray-600">
                    Experience quality therapy with {therapistName}
                </p>
            </div>
            
            <div className="p-4">
                <div className="grid grid-cols-2 gap-3">
                    {images.map((imageUrl, index) => (
                        <div 
                            key={index}
                            className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300"
                        >
                            <img
                                src={imageUrl}
                                alt={`Massage therapy service ${index + 1}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={(e) => {
                                    // Fallback to placeholder if image fails to load
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300/f3f4f6/374151?text=Massage+Service';
                                }}
                            />
                        </div>
                    ))}
                </div>
                
                {/* Optional: Add a caption or description */}
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500">
                        Traditional Indonesian massage techniques • Professional service • Relaxing environment
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SharedProfileImageGallery;