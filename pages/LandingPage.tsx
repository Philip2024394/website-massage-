import React, { useState, useEffect } from 'react';
import Button from '../components/Button';

interface LandingPageProps {
    onLanguageSelect: (lang: 'en' | 'id') => void;
}

const imageSrc = 'https://ik.imagekit.io/7grri5v7d/indo%20street%20massage.png?updatedAt=1760119669463';

const LandingPage: React.FC<LandingPageProps> = ({ onLanguageSelect }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => setImageLoaded(true);
        img.onerror = () => {
            console.error(`Failed to preload landing page image at: ${imageSrc}. It might be unavailable or blocked.`);
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
            <div className="relative z-10 flex-grow flex flex-col items-center justify-center bg-black bg-opacity-50 text-white p-4 text-center">
                                <h1 className="text-5xl font-bold">
                                    <span className="text-white">Indo</span>
                                    <span className="text-orange-400">Street</span>
                                </h1>
                <p className="text-xl mt-2 mb-12">Your personal wellness companion.</p>
                
                <div className="w-full max-w-xs space-y-4">
                    <h2 className="text-lg font-semibold">Please select your language:</h2>
                    <Button onClick={() => onLanguageSelect('en')} variant="primary">English</Button>
                    <Button onClick={() => onLanguageSelect('id')} variant="primary">Bahasa Indonesia</Button>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
