import React, { useState, useEffect } from 'react';
import Button from '../components/Button';

interface LandingPageProps {
    onLanguageSelect: (lang: 'en' | 'id') => void;
}

const imageSrc = 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1080&h=1920&fit=crop&q=80';

const LandingPage: React.FC<LandingPageProps> = ({ onLanguageSelect }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => setImageLoaded(true);
        img.onerror = (err) => {
            console.error("Error preloading landing page image:", err);
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
                <h1 className="text-5xl font-bold">2Go Massage</h1>
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