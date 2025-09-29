import React from 'react';
import Button from '../components/Button';

interface LandingPageProps {
    onLanguageSelect: (lang: 'en' | 'id') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLanguageSelect }) => {
    return (
        <div
            className="min-h-screen bg-cover bg-center flex"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1512290923902-8a9f31c83659?q=80&w=2070&auto=format&fit=crop')" }}
        >
            <div className="flex-grow flex flex-col items-center justify-center bg-black bg-opacity-50 text-white p-4 text-center">
                <h1 className="text-5xl font-bold">Indonesia Massage</h1>
                <p className="text-xl mt-2 mb-12">Your personal wellness companion.</p>
                
                <div className="w-full max-w-xs space-y-4">
                    <h2 className="text-lg font-semibold">Please select your language:</h2>
                    <Button onClick={() => onLanguageSelect('en')} variant="secondary" className="bg-white/90 text-brand-green-dark hover:bg-white">English</Button>
                    <Button onClick={() => onLanguageSelect('id')} variant="secondary" className="bg-white/90 text-brand-green-dark hover:bg-white">Bahasa Indonesia</Button>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;