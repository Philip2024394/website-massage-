// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
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
            className="fixed inset-0 bg-black bg-opacity-90 z-[100] flex items-center justify-center p-2 sm:p-4"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-colors z-10"
            >
                <X className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </button>
            
            <div className="max-w-[95vw] sm:max-w-4xl w-full max-h-[90vh] " onClick={(e) => e.stopPropagation()}>
                <img
                    src={image.imageUrl}
                    alt={image.caption}
                    className="w-full max-h-[70vh] sm:max-h-[75vh] object-contain rounded-lg shadow-2xl mb-3 sm:mb-4"
                />
                <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-4 sm:p-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{image.caption}</h3>
                    <p className="text-sm sm:text-base text-white text-opacity-90 leading-relaxed">{image.description}</p>
                </div>
            </div>
        </div>
    );
};
