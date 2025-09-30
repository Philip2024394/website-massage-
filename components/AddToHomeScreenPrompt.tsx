import React, { useState, useEffect } from 'react';

interface AddToHomeScreenPromptProps {
    t: any;
}

const AddToHomeScreenPrompt: React.FC<AddToHomeScreenPromptProps> = ({ t }) => {
    const [isVisible, setIsVisible] = useState(false);
    
    useEffect(() => {
        const promptDismissed = localStorage.getItem('a2hs-dismissed');
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

        if (!promptDismissed && !isStandalone) {
            // Delay the prompt slightly to not overwhelm the user on first load
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, []);

    const dismiss = () => {
        localStorage.setItem('a2hs-dismissed', 'true');
        setIsVisible(false);
    };

    const getInstructions = () => {
        const userAgent = window.navigator.userAgent;
        const isIOS = /iPad|iPhone|iPod/.test(userAgent);
        
        if (isIOS) {
            return (
                <>
                    <p>{t.iosInstruction}</p>
                    <div className="flex justify-center items-center gap-1 font-semibold mt-1">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12U6 6 10 2 14 6 16 12M10 2V13M14 17H6"/></svg>
                        <span className="text-xs">&#8594;</span>
                        <span>{t.iosAction}</span>
                    </div>
                </>
            );
        }
        // Generic instructions for Android/Chrome
        return <p>{t.androidInstruction}</p>;
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-50">
            <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 animate-fade-in-up">
                <div className="flex items-start gap-3">
                    <img src="/logo192.png" alt="App Logo" className="w-12 h-12 rounded-lg" />
                    <div className="flex-grow">
                        <h3 className="font-bold text-gray-800">{t.title}</h3>
                        <div className="text-sm text-gray-600 mt-1">{getInstructions()}</div>
                    </div>
                    <button onClick={dismiss} className="text-gray-400 hover:text-gray-600 flex-shrink-0" aria-label="Close">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
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
            `}</style>
        </div>
    );
};

export default AddToHomeScreenPrompt;
