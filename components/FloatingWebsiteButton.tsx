import React from 'react';

const FloatingWebsiteButton: React.FC = () => {
    const handleClick = () => {
        window.open('https://www.indastreet.id', '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="fixed bottom-20 right-4 z-50 flex flex-col items-center">
            <button
                onClick={handleClick}
                className="w-14 h-14 bg-orange-500 hover:bg-orange-600 rounded-full shadow-lg flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 border-2 border-white"
                aria-label="Visit IndaStreet Website"
            >
                <svg 
                    className="w-7 h-7 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" 
                    />
                </svg>
            </button>
            <span className="text-xs font-semibold text-gray-700 mt-1 bg-white/90 px-2 py-0.5 rounded-full shadow-sm">
                IndaStreet
            </span>
        </div>
    );
};

export default FloatingWebsiteButton;
