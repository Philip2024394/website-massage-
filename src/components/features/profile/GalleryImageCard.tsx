import React from 'react';

interface GalleryImage {
    imageUrl: string;
    caption: string;
    description: string;
}

interface GalleryImageCardProps {
    image: GalleryImage;
    onImageClick: (image: GalleryImage) => void;
}

/**
 * Reusable Gallery Image Card component
 * Displays a single gallery image with hover effects
 */
export const GalleryImageCard: React.FC<GalleryImageCardProps> = ({ image, onImageClick }) => {
    return (
        <div
            onClick={() => onImageClick(image)}
            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
        >
            <img
                src={image.imageUrl}
                alt={image.caption}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                <span className="text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    View
                </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                <p className="text-white text-xs font-semibold truncate">{image.caption}</p>
            </div>
        </div>
    );
};
