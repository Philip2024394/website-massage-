import React, { useState, useRef, useEffect } from 'react';

interface ImageUploadProps {
    id: string;
    label: string;
    currentImage: string | null;
    onImageChange: (imageDataUrl: string) => void;
    className?: string;
    heightClass?: string;
}

const UploadIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const ImageUpload: React.FC<ImageUploadProps> = ({ id, label, currentImage, onImageChange, className, heightClass = 'h-48' }) => {
    const [preview, setPreview] = useState<string | null>(currentImage);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        setPreview(currentImage);
    }, [currentImage]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPreview(result);
                onImageChange(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className={className}>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div
                className={`w-full ${heightClass} border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-center text-gray-500 cursor-pointer hover:border-brand-green hover:text-brand-green transition-colors bg-gray-50`}
                onClick={triggerFileInput}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && triggerFileInput()}
                role="button"
                tabIndex={0}
            >
                {preview && preview.length > 0 ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                ) : (
                    <div className="flex flex-col items-center">
                        <UploadIcon className="w-8 h-8 mb-1" />
                        <span className="text-xs">Click to upload</span>
                    </div>
                )}
            </div>
            <input
                id={id}
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
};

export default ImageUpload;