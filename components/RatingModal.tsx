
import React, { useState } from 'react';
import Button from './Button';
import { COUNTRIES } from '../countries';

interface RatingModalProps {
    onClose: () => void;
    onSubmit: (rating: number, whatsapp: string) => void;
    itemName: string;
    t: {
        title: string;
        prompt: string;
        whatsappLabel: string;
        whatsappPlaceholder: string;
        submitButton: string;
        selectRatingError: string;
        whatsappRequiredError: string;
    };
}

const emojis = [
    { emoji: '😠', label: 'Angry', rating: 1 },
    { emoji: '😞', label: 'Sad', rating: 2 },
    { emoji: '😐', label: 'Neutral', rating: 3 },
    { emoji: '😊', label: 'Happy', rating: 4 },
    { emoji: '🤩', label: 'Amazing', rating: 5 },
];

const RatingModal: React.FC<RatingModalProps> = ({ onClose, onSubmit, itemName, t }) => {
    const [selectedRating, setSelectedRating] = useState<number | null>(null);
    const [countryCode, setCountryCode] = useState('+62');
    const [whatsapp, setWhatsapp] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (selectedRating === null) {
            setError(t.selectRatingError);
            return;
        }
        if (!whatsapp.trim()) {
            setError(t.whatsappRequiredError);
            return;
        }
        setError('');
        // Remove leading zeros from the phone number part
        const fullWhatsappNumber = `${countryCode}${whatsapp.replace(/^0+/, '')}`;
        onSubmit(selectedRating, fullWhatsappNumber);
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                 <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{t.title.replace('{itemName}', itemName)}</h2>
                        <p className="text-gray-600 text-sm mt-1">{t.prompt}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex justify-around items-center my-6">
                    {emojis.map(({ emoji, label, rating }) => (
                        <button
                            key={rating}
                            onClick={() => setSelectedRating(rating)}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-transform duration-200 ${selectedRating === rating ? 'transform scale-125' : 'opacity-60 hover:opacity-100'}`}
                            aria-label={label}
                        >
                            <span className="text-4xl">{emoji}</span>
                        </button>
                    ))}
                </div>

                <div className="mb-4">
                     <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">{t.whatsappLabel}</label>
                     <div className="flex items-center">
                        <select 
                            value={countryCode} 
                            onChange={e => setCountryCode(e.target.value)}
                            className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-3 text-sm font-medium text-center text-gray-900 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-green focus:border-brand-green"
                            aria-label="Country Code"
                        >
                            {COUNTRIES.map(country => (
                                <option key={country.code} value={country.dial_code}>{country.code} {country.dial_code}</option>
                            ))}
                        </select>
                        <input 
                            id="whatsapp"
                            type="tel"
                            value={whatsapp}
                            onChange={e => setWhatsapp(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-r-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-green focus:border-brand-green"
                            placeholder={t.whatsappPlaceholder}
                        />
                     </div>
                </div>
                 {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                <Button onClick={handleSubmit}>
                    {t.submitButton}
                </Button>
            </div>
        </div>
    );
};

export default RatingModal;
