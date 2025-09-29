
import React from 'react';
import Button from '../components/Button';
import LogoIcon from '../components/icons/LogoIcon';

interface RegistrationChoicePageProps {
    onSelect: (type: 'therapist' | 'place') => void;
    onBack: () => void;
    t: any;
}

const RegistrationChoicePage: React.FC<RegistrationChoicePageProps> = ({ onSelect, onBack, t }) => {
    return (
        <div className="min-h-screen flex flex-col justify-center bg-gray-50 p-4 relative">
             <button onClick={onBack} className="absolute top-4 left-4 text-gray-600 hover:text-gray-800">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <div className="w-full max-w-sm mx-auto text-center">
                <LogoIcon className="h-20 w-20 text-brand-green mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-800">{t.title}</h1>
                <p className="text-gray-600 mt-2 mb-8">{t.prompt}</p>

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
