import React, { useState, useRef, useEffect } from 'react';
import { imageUploadService } from '../lib/appwriteService';

interface ImageUploadProps {
    id: string;
    label: string;
    currentImage: string | null;
    onImageChange: (imageDataUrl: string) => void;
    className?: string;
    heightClass?: string;
    imageClassName?: string; // Custom styling for the image element
    variant?: 'default' | 'profile'; // Add variant prop for profile pictures
}

const UploadIcon = ({ className = "w-6 h-6" }: { className?: string }): JSX.Element => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const UserIcon = ({ className = "w-16 h-16" }: { className?: string }): JSX.Element => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
);

const ImageUpload = ({ id, label, currentImage, onImageChange, className, heightClass = 'h-48', imageClassName, variant = 'default' }: ImageUploadProps): JSX.Element => {
    const [preview, setPreview] = useState<string | null>(currentImage);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        console.log('🖼️ ImageUpload: currentImage changed to:', currentImage?.substring(0, 100) + '...');
        setPreview(currentImage);
    }, [currentImage]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log('📂 File input change event triggered');
        const file = event.target.files?.[0];
        console.log('📂 Selected file:', file);
        if (file) {
            console.log('📸 Image selected:', file.name, 'Size:', file.size, 'Type:', file.type);
            
            const reader = new FileReader();
            reader.onloadend = async () => {
                const result = reader.result as string;
                console.log('📸 Image read as base64, length:', result.length);
                
                // Set preview immediately for better UX
                setPreview(result);
                
                // Upload to Appwrite Storage and get URL
                try {
                    console.log('📤 Starting upload to Appwrite Storage...');
                    const imageUrl = await imageUploadService.uploadProfileImage(result);
                    console.log('✅ Upload successful! URL:', imageUrl);
                    
                    // Update preview to the uploaded URL
                    setPreview(imageUrl);
                    
                    // Notify parent component
                    onImageChange(imageUrl);
                } catch (error) {
                    console.error('❌ Error uploading image:', error);
                    alert(`Error uploading image: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
                    setPreview(null);
                }
            };
            reader.onerror = (error) => {
                console.error('❌ Error reading file:', error);
                alert('Error reading file. Please try again.');
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        console.log('🖱️ ImageUpload: File input triggered for:', id);
        console.log('🖱️ File input ref:', fileInputRef.current);
        if (!fileInputRef.current) {
            console.error('❌ File input ref is null!');
            return;
        }
        fileInputRef.current?.click();
    };

    // Render profile variant (round with mock user icon)
    if (variant === 'profile') {
        return (
            <div className={className}>
                <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                <div className="flex justify-center">
                    <div
                        className="relative w-32 h-32 rounded-full border-4 border-dashed border-gray-300 hover:border-brand-orange cursor-pointer transition-colors overflow-hidden bg-gray-100"
                        onClick={triggerFileInput}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && triggerFileInput()}
                        role="button"
                        tabIndex={0}
                    >
                        {preview && preview.length > 0 ? (
                            <img 
                                src={preview} 
                                alt="Profile Preview" 
                                className={imageClassName || "w-full h-full object-cover"}
                                onError={() => {
                                    console.error('❌ Failed to load image preview:', preview.substring(0, 100));
                                    setPreview(null);
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                <UserIcon className="w-16 h-16" />
                                <span className="text-xs mt-1">Upload</span>
                            </div>
                        )}
                    </div>
                </div>
                <input
                    id={id}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>
        );
    }

    // Default variant (rectangular)

    return (
        <div className={className}>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div
                className={`relative w-full ${heightClass} border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-center text-gray-500 cursor-pointer hover:border-brand-green hover:text-brand-green transition-colors bg-gray-50 group`}
                onClick={triggerFileInput}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && triggerFileInput()}
                role="button"
                tabIndex={0}
            >
                {preview && preview.length > 0 ? (
                    <>
                        <img src={preview} alt="Preview" className={imageClassName || "w-full h-full object-cover rounded-lg"} />
                        {/* Upload button overlay - visible on hover */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <div className="bg-white rounded-lg px-4 py-2 flex items-center gap-2 shadow-lg">
                                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                <span className="text-sm font-semibold text-gray-900">Change Image</span>
                            </div>
                        </div>
                    </>
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