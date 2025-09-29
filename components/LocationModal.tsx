import React from 'react';
import Button from './Button';

interface LocationModalProps {
    onClose: () => void;
    t: {
        title: string;
        prompt: string;
        placeholder: string;
        confirmButton: string;
    };
}

const LocationModal: React.FC<LocationModalProps> = ({ onClose, t }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
                <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">{t.title}</h2>
                <p className="text-gray-600 mb-6 text-center">{t.prompt}</p>
                
                <div className="h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Google Map View</span>
                </div>

                <div className="mb-6">
                     <input 
                        type="text" 
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-green focus:border-brand-green"
                        placeholder={t.placeholder}
                    />
                </div>

                <Button onClick={onClose}>
                    {t.confirmButton}
                </Button>
            </div>
        </div>
    );
};

export default LocationModal;
