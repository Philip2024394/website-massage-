import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import type { UserLocation } from '../types';

interface LandingPageProps {
    onLanguageSelect: (lang: 'en' | 'id') => void;
    onEnterApp: (language: 'en' | 'id', location: UserLocation) => void;
}

const imageSrc = 'https://ik.imagekit.io/7grri5v7d/indastreet%20massage.png?updatedAt=1761978080830';

// Language options with flags - Indonesian first, then English, then others
const languages = [
    { code: 'id', name: 'Bahasa Indonesia', flag: '��' },
    { code: 'en', name: 'English', flag: '��' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'th', name: 'ไทย', flag: '🇹🇭' },
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'pl', name: 'Polski', flag: '🇵🇱' },
    { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
    { code: 'da', name: 'Dansk', flag: '🇩🇰' },
];

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
    console.log('🎨 LandingPage: Component rendering');
    console.log('onEnterApp prop received:', !!onEnterApp);
    
    const [imageLoaded, setImageLoaded] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'id'>('id'); // Default to Indonesian
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
            setImageLoaded(true);
        };
    }, []);

    const handleEnterApp = () => {
        console.log('🔘 Enter button clicked!');
        console.log('Selected language:', selectedLanguage);
        // Create a default location - user will set it on home page
        const defaultLocation: UserLocation = {
            address: 'Not Set',
            lat: 0,
            lng: 0,
        };
        console.log('Calling onEnterApp with:', selectedLanguage, defaultLocation);
        onEnterApp(selectedLanguage, defaultLocation);
        console.log('✅ onEnterApp called');
    };

    const selectedLang = languages.find(lang => lang.code === selectedLanguage) || languages[0];

    return (
        <div className="h-screen flex relative overflow-hidden">
            <div
                className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out"
                style={{
                    backgroundImage: `url('${imageSrc}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    opacity: imageLoaded ? 1 : 0,
                }}
            />
            <div className="relative z-10 flex-grow flex flex-col items-center justify-center bg-black bg-opacity-50 text-white p-4 sm:p-6 text-center">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold">
                    <span className="text-white">Inda</span>
                    <span className="text-orange-400">Street</span>
                </h1>
                <p className="text-lg sm:text-xl mt-2 mb-4 px-4">Your personal wellness companion.</p>
                
                {/* Therapist Promotional Banner */}
                <div className="bg-gradient-to-r from-green-500 via-green-400 to-emerald-500 border-2 border-white rounded-xl p-6 mb-6 shadow-2xl max-w-lg mx-auto transform hover:scale-105 transition-transform duration-300">
                    <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-30">
                        <div className="flex items-center justify-center mb-3">
                            <div className="bg-white rounded-full p-2 mr-3">
                                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-white">🌟 Therapist Special Offer!</h2>
                        </div>
                        
                        <div className="text-center space-y-2">
                            <div className="bg-white bg-opacity-90 text-green-800 rounded-lg py-2 px-4 font-bold text-lg">
                                Only IDR 5,000/day = IDR 150,000/month
                            </div>
                            
                            <div className="bg-yellow-400 bg-opacity-95 text-green-900 rounded-lg py-2 px-4 font-bold text-base animate-pulse">
                                🎁 FREE 1-Month Trial for First 100 Therapists!
                            </div>
                            
                            <div className="text-white text-sm mt-3 space-y-1">
                                <p className="flex items-center justify-center gap-2">
                                    <span className="text-green-200">✓</span> Unlimited Bookings
                                </p>
                                <p className="flex items-center justify-center gap-2">
                                    <span className="text-green-200">✓</span> Professional Platform
                                </p>
                                <p className="flex items-center justify-center gap-2">
                                    <span className="text-green-200">✓</span> No Commission Fees
                                </p>
                            </div>
                            
                            <div className="mt-4">
                                <button className="bg-white text-green-600 font-bold py-2 px-6 rounded-full hover:bg-green-50 transition-colors shadow-lg text-sm">
                                    🚀 Join Now - Limited Spots!
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Join Today Free Limited Spaces Badge */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-full px-6 py-2 mb-8 shadow-lg animate-pulse">
                    <p className="text-white font-bold text-base sm:text-lg flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Join Today Free Limited Spaces
                    </p>
                </div>
                
                <div className="w-full max-w-md px-4 space-y-4">
                    <h2 className="text-base sm:text-lg font-semibold mb-4">Get Started</h2>
                    
                    {/* Language Dropdown */}
                    <div className="relative">
                        <label className="block text-sm font-medium mb-2 text-left">Select Language</label>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full bg-black text-white rounded-lg px-4 py-3 flex items-center justify-between hover:bg-gray-900 transition-colors shadow-lg border border-gray-800"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl w-8 h-8 flex items-center justify-center bg-gray-900 rounded-full">
                                    {selectedLang.flag}
                                </span>
                                <span className="font-medium">{selectedLang.name}</span>
                            </div>
                            <svg
                                className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <>
                                {/* Backdrop to close dropdown when clicking outside */}
                                <div 
                                    className="fixed inset-0 z-40" 
                                    onClick={() => {
                                        console.log('Dropdown backdrop clicked - closing dropdown');
                                        setIsDropdownOpen(false);
                                    }}
                                />
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl max-h-64 overflow-y-auto z-50">
                                    {languages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => {
                                                console.log('Language selected:', lang.name);
                                                setSelectedLanguage(lang.code as 'en' | 'id');
                                                setIsDropdownOpen(false);
                                            }}
                                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-orange-50 transition-colors text-left"
                                        >
                                            <span className="text-2xl w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                                                {lang.flag}
                                            </span>
                                            <span className="text-gray-800 font-medium">{lang.name}</span>
                                            {lang.code === selectedLanguage && (
                                                <svg className="w-5 h-5 ml-auto text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Enter App Button */}
                    <Button
                        type="button"
                        onClick={(e) => {
                            console.log('🔘 Enter button CLICKED event triggered!');
                            console.log('Event:', e);
                            console.log('Dropdown open?', isDropdownOpen);
                            if (isDropdownOpen) {
                                console.log('⚠️ Dropdown is still open! Closing it first...');
                                setIsDropdownOpen(false);
                            }
                            handleEnterApp();
                        }}
                        variant="primary"
                        className="!py-4 !text-lg font-bold relative z-10"
                    >
                        <div className="flex items-center justify-center gap-2">
                            Enter
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </div>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
