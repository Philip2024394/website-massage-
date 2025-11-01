import React from 'react';
import { X } from 'lucide-react';

interface GalleryImage {
    imageUrl: string;
    caption: string;
    description: string;
}

interface ExpandedImageModalProps {
    image: GalleryImage;
    onClose: () => void;
}

/**
 * Reusable Expanded Image Modal component
 * Displays a full-screen modal with the selected image
 */
export const ExpandedImageModal: React.FC<ExpandedImageModalProps> = ({ image, onClose }) => {
    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-colors"
            >
                <X className="w-8 h-8 text-white" />
            </button>
            
            <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
                <img
                    src={image.imageUrl}
                    alt={image.caption}
                    className="w-full h-auto rounded-lg shadow-2xl mb-4"
                />
                <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{image.caption}</h3>
                    <p className="text-white text-opacity-90 leading-relaxed">{image.description}</p>
                </div>
            </div>
        </div>
    );
};
