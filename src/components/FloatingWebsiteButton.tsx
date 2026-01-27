import React from 'react';

const FloatingWebsiteButton: React.FC = () => {
    const handleClick = () => {
        window.open('https://www.indastreet.id', '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="fixed bottom-20 right-4 z-50 flex flex-col items-center">
            <button
                onClick={handleClick}
                className="
                    relative bg-black/20 backdrop-blur-md border border-white/10
                    text-white rounded-2xl shadow-2xl
                    transition-all duration-500 transform 
                    hover:scale-110 hover:bg-black/40 hover:border-white/20
                    active:scale-95 active:bg-black/60
                    w-14 h-14 flex items-center justify-center
                    group overflow-hidden
                    before:absolute before:inset-0 before:bg-gradient-to-br 
                    before:from-white/5 before:to-transparent before:rounded-2xl
                    after:absolute after:inset-0 after:bg-gradient-to-t 
                    after:from-black/20 after:to-transparent after:rounded-2xl
                "
                style={{
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    boxShadow: `
                        0 8px 32px rgba(0, 0, 0, 0.3),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1),
                        inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                    `
                }}
                aria-label="Visit IndaStreet Website"
            >
                <svg 
                    className="w-7 h-7 text-white relative z-10 drop-shadow-lg" 
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
                
                {/* Glass shine effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            <span className="text-xs font-semibold text-white mt-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full shadow-lg border border-white/10"
                style={{
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)'
                }}>
                IndaStreet
            </span>
        </div>
    );
};

export default FloatingWebsiteButton;
