/**
 * ImageUploadCard - Shared image upload component
 */

import React from 'react';

export interface ImageUploadCardProps {
    title: string;
    description?: string;
    currentImage?: string;
    onUpload: (file: File) => void;
    onRemove?: () => void;
    accept?: string;
    maxSizeMB?: number;
}

const ImageUploadCard: React.FC<ImageUploadCardProps> = ({
    title,
    description,
    currentImage,
    onUpload,
    onRemove,
    accept = 'image/*',
    maxSizeMB = 5,
}) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [preview, setPreview] = React.useState<string | undefined>(currentImage);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSizeMB) {
            alert(`File size exceeds ${maxSizeMB}MB limit`);
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        onUpload(file);
    };

    const handleRemove = () => {
        setPreview(undefined);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onRemove?.();
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            {description && <p className="text-sm text-gray-600 mb-4">{description}</p>}
            
            {preview ? (
                <div className="relative">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="mt-4 flex space-x-2">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Change Image
                        </button>
                        {onRemove && (
                            <button
                                onClick={handleRemove}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Remove
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
                >
                    <div className="text-4xl mb-2">📸</div>
                    <p className="text-sm text-gray-600 mb-2">Click to upload image</p>
                    <p className="text-xs text-gray-500">Max size: {maxSizeMB}MB</p>
                </div>
            )}
            
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
};

export default ImageUploadCard;
