import React, { useState, useEffect } from 'react';
import Button from '../components/Button';

interface LandingPageProps {
    onLanguageSelect: (lang: 'en' | 'id') => void;
}

const imageSrc = 'https://ik.imagekit.io/7grri5v7d/indo%20street%20massage.png?updatedAt=1760119669463';

const LandingPage: React.FC<LandingPageProps> = ({ onLanguageSelect }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        console.log('🖼️ LandingPage: Attempting to load image:', imageSrc);
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
            console.log('✅ LandingPage: Image loaded successfully');
            setImageLoaded(true);
        };
        img.onerror = (error) => {
            console.error(`❌ LandingPage: Failed to load image at: ${imageSrc}`, error);
            console.error('Image might be unavailable, blocked by CORS, or URL is incorrect.');
            // Fallback: if preloading fails, still try to show the page.
            setImageLoaded(true);
        };
    }, []);

    return (
        <div className="min-h-screen flex relative overflow-hidden">
            <div
                className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out"
                style={{
                    backgroundImage: `url('${imageSrc}')`,
                    opacity: imageLoaded ? 1 : 0,
                }}
            />
            <div className="relative z-10 flex-grow flex flex-col items-center justify-center bg-black bg-opacity-50 text-white p-4 sm:p-6 text-center">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold">
                    <span className="text-white">Inda</span>
                    <span className="text-orange-400">Street</span>
                </h1>
                <p className="text-lg sm:text-xl mt-2 mb-8 sm:mb-12 px-4">Your personal wellness companion.</p>
                
                <div className="w-full max-w-xs px-4 space-y-3 sm:space-y-4">
                    <h2 className="text-base sm:text-lg font-semibold">Please select your language:</h2>
                    <Button onClick={() => onLanguageSelect('en')} variant="primary">English</Button>
                    <Button onClick={() => onLanguageSelect('id')} variant="primary">Bahasa Indonesia</Button>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
