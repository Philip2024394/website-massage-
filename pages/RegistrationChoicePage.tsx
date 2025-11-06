
import React from 'react';
import Button from '../components/Button';

interface RegistrationChoicePageProps {
    onSelect: (type: 'therapist' | 'place') => void;
    onBack: () => void;
    t: any;
}

const RegistrationChoicePage: React.FC<RegistrationChoicePageProps> = ({ onSelect, onBack, t }) => {
    return (
        <div 
            className="h-screen w-screen flex flex-col justify-center p-4 relative overflow-hidden"
            style={{
                backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/indastreet%20app.png?updatedAt=1761566963450)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            
            {/* Home Button */}
            <button 
                onClick={onBack} 
                className="absolute top-4 left-4 bg-white hover:bg-gray-100 text-gray-800 px-4 py-2 rounded-lg font-semibold text-sm shadow-md transition-colors z-10 flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
            </button>

            <div className="w-full max-w-sm mx-auto text-center relative z-10">
                <h1 className="text-3xl font-bold text-white mb-2">{t.title}</h1>
                <p className="text-white mt-2 mb-4">{t.prompt}</p>

                {/* Free Membership Banner */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 mb-6 shadow-lg border-2 border-white">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <h3 className="text-2xl font-bold text-white">FREE TO JOIN!</h3>
                    </div>
                    <p className="text-white font-semibold text-lg">1 Month Free Membership</p>
                    <p className="text-green-100 text-sm mt-1">Get started with all premium features at no cost</p>
                </div>

                <div className="space-y-4">
                    <Button onClick={() => onSelect('therapist')} className="py-4 text-lg">
                        {t.therapistButton}
                    </Button>
                    <Button onClick={() => onSelect('place')} variant="secondary" className="py-4 text-lg">
                        {t.placeButton}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default RegistrationChoicePage;
