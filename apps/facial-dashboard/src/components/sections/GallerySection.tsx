/**
 * Gallery Section Component
 * Handles gallery image uploads with captions and descriptions
 * Max size: 15KB (Facebook/Amazon standard)
 */

import React from 'react';
import ImageUpload from '../../../../../components/ImageUpload';
// import { Upload } from 'lucide-react';

interface GalleryImage {
  imageUrl: string;
  caption: string;
  description: string;
}

interface GallerySectionProps {
  galleryImages: GalleryImage[];
  handleGalleryImageChange: (index: number, imageUrl: string) => void;
  handleGalleryCaptionChange: (index: number, caption: string) => void;
  handleGalleryDescriptionChange: (index: number, description: string) => void;
  t: any;
}

const GallerySection: React.FC<GallerySectionProps> = ({
  galleryImages,
  handleGalleryImageChange,
  handleGalleryCaptionChange,
  handleGalleryDescriptionChange,
  t: _t,
}): JSX.Element => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          📸 Gallery Images
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload up to 5 images with a title and description. These appear on your public profile.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {galleryImages.map((image, index) => (
            <div key={index} className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-orange-300 transition-all">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-700">
                  Image {index + 1}
                </h4>
                {image.imageUrl && (
                  <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Uploaded
                  </span>
                )}
              </div>

              {/* Image Upload */}
              <div className="mb-3">
                <ImageUpload
                  id={`gallery-image-${index}`}
                  label=""
                  currentImage={image.imageUrl}
                  onImageChange={(url) => handleGalleryImageChange(index, url)}
                />
              </div>

              {/* Caption Input */}
              {image.imageUrl && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Caption (optional)
                    </label>
                    <input
                      type="text"
                      value={image.caption}
                      onChange={(e) => handleGalleryCaptionChange(index, e.target.value)}
                      placeholder="e.g., Traditional Thai Massage Room"
                      className="block w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      maxLength={50}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {image.caption.length}/50 characters
                    </p>
                  </div>

                  {/* Description Input */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Description (optional)
                    </label>
                    <textarea
                      value={image.description}
                      onChange={(e) => handleGalleryDescriptionChange(index, e.target.value)}
                      placeholder="Add a brief description..."
                      rows={2}
                      className="block w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      maxLength={150}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {image.description.length}/150 characters
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-xs text-blue-900">
              <p className="font-semibold mb-1">Tips for great gallery photos:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Use high-quality images (min 800x600px)</li>
                <li>Show clean, well-lit treatment rooms</li>
                <li>Include your team and facilities</li>
                <li>Avoid blurry or dark photos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GallerySection;
