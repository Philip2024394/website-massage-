import React, { useState } from 'react';

interface AnonymousReviewModalProps {
    providerName: string;
    providerId: string | number;
    providerType: 'therapist' | 'place';
    providerImage?: string;
    onClose: () => void;
    onSubmit: (reviewData: {
        name: string;
        whatsappNumber: string;
        rating: number;
        providerId: string | number;
        providerType: 'therapist' | 'place';
    }) => Promise<void>;
}

const AnonymousReviewModal: React.FC<AnonymousReviewModalProps> = ({
    providerName,
    providerId,
    providerType,
    providerImage,
    onClose,
    onSubmit
}) => {
    const [name, setName] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('+62');
    const [selectedRating, setSelectedRating] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const ratingEmojis = [
        { emoji: '😢', label: 'Sad', rating: 3, color: 'text-red-500' },
        { emoji: '😊', label: 'Happy', rating: 4, color: 'text-yellow-500' },
        { emoji: '🤩', label: 'Excited', rating: 5, color: 'text-green-500' }
    ];

    const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        
        // Always ensure +62 prefix
        if (!value.startsWith('+62')) {
            value = '+62';
        }
        
        // Only allow numbers after +62
        const digitsOnly = value.slice(3).replace(/\D/g, '');
        setWhatsappNumber('+62' + digitsOnly);
    };

    const handleSubmit = async () => {
        // Validation
        if (!name.trim()) {
            alert('Please enter your name');
            return;
        }

        if (whatsappNumber.length < 10) {
            alert('Please enter a valid WhatsApp number');
            return;
        }

        if (selectedRating === null) {
            alert('Please select a rating emoji');
            return;
        }

        setSubmitting(true);
        try {
            await onSubmit({
                name: name.trim(),
                whatsappNumber,
                rating: selectedRating,
                providerId,
                providerType
            });
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Failed to submit review. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-[90vw] sm:max-w-md w-full p-4 sm:p-6 relative animate-fade-in overflow-hidden">
                {/* Background Image */}
                <div 
                    className="absolute inset-0 opacity-10 bg-cover bg-center rounded-xl sm:rounded-2xl"
                    style={{ backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/refer%20a%20friends.png)' }}
                />
                
                {/* Content wrapper with relative positioning */}
                <div className="relative z-10">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-0 right-0 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                {/* Header */}
                <div className="text-center mb-4 sm:mb-6">
                    <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">⭐</div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">Leave a Review</h2>
                    
                    {/* Provider Info with Image */}
                    <div className="flex items-center justify-center gap-2 sm:gap-3 mt-2">
                        {providerImage && (
                            <img 
                                src={providerImage} 
                                alt={providerName}
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-gray-300"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://ik.imagekit.io/7grri5v7d/balineese%20massage%20indonisea.png?updatedAt=1761918521382';
                                }}
                            />
                        )}
                        <p className="text-gray-700 font-semibold text-sm sm:text-lg">for {providerName}</p>
                    </div>
                </div>

                {/* Form */}
                <div className="space-y-3 sm:space-y-4">
                    {/* Name Input */}
                    <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                            👤 Your Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors text-sm sm:text-base"
                            maxLength={50}
                        />
                    </div>

                    {/* WhatsApp Number Input */}
                    <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                            📱 WhatsApp Number
                        </label>
                        <input
                            type="tel"
                            value={whatsappNumber}
                            onChange={handleWhatsappChange}
                            placeholder="+62812345678"
                            className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors font-mono text-sm sm:text-base"
                            maxLength={17}
                        />
                        <p className="text-xs text-gray-500 mt-1">Format: +62 followed by your number</p>
                    </div>

                    {/* Rating Emojis */}
                    <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 text-center">
                            How was your experience?
                        </label>
                        <div className="flex justify-center gap-2 sm:gap-6">
                            {ratingEmojis.map((emoji) => (
                                <button
                                    key={emoji.rating}
                                    onClick={() => setSelectedRating(emoji.rating)}
                                    className={`flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4 rounded-lg sm:rounded-xl transition-all transform hover:scale-110 ${
                                        selectedRating === emoji.rating
                                            ? 'bg-blue-100 border-2 border-blue-500 shadow-lg scale-110'
                                            : 'bg-gray-50 border-2 border-gray-200 hover:bg-gray-100'
                                    }`}
                                >
                                    <span className="text-3xl sm:text-5xl">{emoji.emoji}</span>
                                    <span className={`text-xs sm:text-sm font-semibold ${selectedRating === emoji.rating ? 'text-blue-600' : 'text-gray-600'}`}>
                                        {emoji.label}
                                    </span>
                                    <div className="flex gap-0.5">
                                        {[...Array(emoji.rating)].map((_, i) => (
                                            <span key={i} className={`text-xs ${emoji.color}`}>⭐</span>
                                        ))}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !name.trim() || whatsappNumber.length < 10 || selectedRating === null}
                        className={`w-full py-3 sm:py-4 rounded-lg font-bold text-white transition-all transform text-sm sm:text-base ${
                            submitting || !name.trim() || whatsappNumber.length < 10 || selectedRating === null
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg active:scale-95'
                        }`}
                    >
                        {submitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Submitting...
                            </span>
                        ) : (
                            'Submit Review'
                        )}
                    </button>
                </div>
                </div>
            </div>
        </div>
    );
};

export default AnonymousReviewModal;
