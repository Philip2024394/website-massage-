import React, { useState, useEffect } from 'react';

interface AddToHomeScreenPromptProps {
    t: any;
    hasLocation?: boolean;
}

const AddToHomeScreenPrompt: React.FC<AddToHomeScreenPromptProps> = ({ t: _t, hasLocation = false }) => {
    const [isVisible, setIsVisible] = useState(false);
    
    useEffect(() => {
        const promptDismissed = localStorage.getItem('a2hs-dismissed');
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

        // Only show if location is set, prompt not dismissed, and not in standalone mode
        if (hasLocation && !promptDismissed && !isStandalone) {
            // Delay the prompt slightly after location is set
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [hasLocation]);

    // Auto-dismiss after 15 seconds
    useEffect(() => {
        if (isVisible) {
            const autoDismissTimer = setTimeout(() => {
                setIsVisible(false);
            }, 15000); // 15 seconds
            
            return () => clearTimeout(autoDismissTimer);
        }
    }, [isVisible]);

    // Close prompt when user clicks anywhere on the page
    useEffect(() => {
        if (isVisible) {
            const handlePageClick = (e: MouseEvent) => {
                // Check if click is outside the prompt
                const target = e.target as HTMLElement;
                const promptElement = document.getElementById('a2hs-prompt');
                if (promptElement && !promptElement.contains(target)) {
                    setIsVisible(false);
                }
            };

            // Add click listener to document
            document.addEventListener('click', handlePageClick);
            
            return () => {
                document.removeEventListener('click', handlePageClick);
            };
        }
    }, [isVisible]);

    const dismiss = () => {
        localStorage.setItem('a2hs-dismissed', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-50">
            <div 
                id="a2hs-prompt"
                className="bg-white p-5 rounded-2xl shadow-2xl border-2 border-orange-200 animate-fade-in-up"
            >
                <div className="flex items-start gap-3">
                    {/* App Download Image */}
                    <img 
                        src="https://ik.imagekit.io/7grri5v7d/indastreet%20app%20button.png?updatedAt=1761609465200" 
                        alt="Download IndaStreet App" 
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0" 
                    />
                    <div className="flex-grow">
                        <h3 className="font-bold text-gray-800 text-lg mb-2">Add to Home Screen</h3>
                        <div className="text-sm text-gray-600">
                            <p className="mb-1">Tap the menu button and select</p>
                            <p className="font-semibold text-orange-600">"Add to Home Screen"</p>
                        </div>
                    </div>
                    <button 
                        onClick={dismiss} 
                        className="text-gray-400 hover:text-gray-600 flex-shrink-0 transition-colors" 
                        aria-label="Close"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                {/* Progress bar for 15 second countdown */}
                <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 animate-countdown"></div>
                </div>
            </div>
            
            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.5s ease-out forwards;
                }
                @keyframes countdown {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                .animate-countdown {
                    animation: countdown 15s linear forwards;
                }
            `}</style>
        </div>
    );
};

export default AddToHomeScreenPrompt;
