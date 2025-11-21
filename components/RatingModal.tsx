

import React, { useState, useEffect } from 'react';
import Button from './Button';
import { COUNTRIES } from '../countries';
import { reviewService, type Review } from '../lib/reviewService';
import { Star } from 'lucide-react';

import type { ReviewStatus, Therapist, Place } from '../types';

interface RatingModalProps {
    onClose: () => void;
    onSubmit: () => void;
    itemName: string;
    itemType: 'therapist' | 'place';
    itemId: number | string;
    provider?: Therapist | Place; // Full provider object for profile image and reviews
    t: {
        title: string;
        prompt: string;
        whatsappLabel: string;
        whatsappPlaceholder: string;
        submitButton: string;
        selectRatingError: string;
        whatsappRequiredError: string;
        confirmationV2: string;
    };
}

const emojis = [
    { emoji: '😠', label: 'Angry', rating: 1 },
    { emoji: '😞', label: 'Sad', rating: 2 },
    { emoji: '😐', label: 'Neutral', rating: 3 },
    { emoji: '😊', label: 'Happy', rating: 4 },
    { emoji: '🤩', label: 'Amazing', rating: 5 },
];

const RatingModal: React.FC<RatingModalProps> = ({ onClose, onSubmit, itemName, itemType, itemId, provider, t }) => {
    const [selectedRating, setSelectedRating] = useState<number | null>(null);
    const [countryCode, setCountryCode] = useState('+62');
    const [whatsapp, setWhatsapp] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [recentReviews, setRecentReviews] = useState<Review[]>([]);
    
    // Load recent reviews on mount
    useEffect(() => {
        if (itemId) {
            const reviews = reviewService.getReviews(itemId, itemType);
            setRecentReviews(reviews.slice(0, 3)); // Get last 3 reviews
        }
    }, [itemId, itemType]);
    
    // Calculate average rating and total reviews
    const averageRating = provider?.rating || 0;
    const totalReviews = provider?.reviewCount || 0;

    const handleSubmit = async () => {
        if (selectedRating === null) {
            setError(t.selectRatingError);
            return;
        }
        if (!whatsapp.trim()) {
            setError(t.whatsappRequiredError);
            return;
        }

        setIsLoading(true);
        setError('');
        
        const fullWhatsappNumber = `${countryCode}${whatsapp.replace(/^0+/, '')}`;

        // Mock implementation - replace with your actual data storage logic
        console.log('Rating submitted:', {
            providerId: itemId,
            providerType: itemType,
            providerName: itemName,
            rating: selectedRating,
            whatsapp: fullWhatsappNumber,
            status: 'pending' as ReviewStatus,
        });

        setIsLoading(false);
        alert(t.confirmationV2);
        onSubmit();
    };
    
    // Get profile image
    const profileImage = provider?.profilePicture || provider?.mainImage || '/default-avatar.png';
    const isLicensed = (provider as any)?.isLicensed || false;
    const isVerified = provider?.isVerified || false;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                {/* Header with close button */}
                <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Leave a Review</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Top Container: Star Rating Display */}
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 mb-6 text-center border border-orange-200">
                    {/* 5 Stars with fill based on rating */}
                    <div className="flex justify-center gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map(star => (
                            <Star 
                                key={star} 
                                className="w-8 h-8"
                                fill={star <= Math.floor(averageRating) ? '#FFA500' : star - 0.5 <= averageRating ? '#FFA500' : 'none'}
                                stroke={star <= averageRating ? '#FFA500' : '#D1D5DB'}
                                opacity={star <= averageRating ? 1 : 0.3}
                            />
                        ))}
                    </div>
                    
                    {/* Rating Score */}
                    <div className="text-3xl font-bold text-gray-800 mb-1">
                        {averageRating.toFixed(1)} <span className="text-lg text-gray-600">of 5.0</span>
                    </div>
                    
                    {/* Total Reviews */}
                    <div className="text-gray-600 font-medium">
                        {totalReviews}+ Reviews
                    </div>
                </div>

                {/* Main Content: Profile on left, Reviews on right */}
                <div className="grid md:grid-cols-[200px_1fr] gap-6 mb-6">
                    {/* Left Side: Profile Image and Info */}
                    <div className="flex flex-col items-center text-center">
                        <div className="w-32 h-32 rounded-full overflow-hidden mb-3 border-4 border-orange-200 shadow-lg">
                            <img 
                                src={profileImage} 
                                alt={itemName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/default-avatar.png';
                                }}
                            />
                        </div>
                        <h3 className="font-bold text-lg text-gray-800 mb-1">{itemName}</h3>
                        {(isLicensed || isVerified) && (
                            <div className="text-sm text-green-600 font-medium flex items-center gap-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                {itemType === 'therapist' 
                                    ? (isLicensed ? 'Licensed Massage Therapist' : 'Verified Provider')
                                    : (isLicensed ? 'Verified Shop Seller' : 'Verified Place')}
                            </div>
                        )}
                    </div>

                    {/* Right Side: Last 3 Reviews */}
                    <div className="space-y-3">
                        {recentReviews.length > 0 ? (
                            recentReviews.map(review => (
                                <div key={review.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    {/* Stars */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Star 
                                                    key={star}
                                                    className="w-4 h-4"
                                                    fill={star <= review.rating ? '#FFA500' : 'none'}
                                                    stroke={star <= review.rating ? '#FFA500' : '#D1D5DB'}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-sm font-semibold text-gray-700">{review.userName}</span>
                                    </div>
                                    {/* Review text - max 2 lines */}
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                        {review.comment || 'No comment provided.'}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 text-center">
                                <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Rating Selection */}
                <div className="mb-6">
                    <p className="text-gray-700 text-center font-medium mb-4">{t.prompt}</p>
                    <div className="flex justify-around items-center">
                        {emojis.map(({ emoji, label, rating }) => (
                            <button
                                key={rating}
                                onClick={() => setSelectedRating(rating)}
                                className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all duration-200 ${selectedRating === rating ? 'transform scale-110 bg-orange-100' : 'opacity-60 hover:opacity-100 hover:bg-gray-50'}`}
                                aria-label={label}
                            >
                                <span className="text-3xl sm:text-4xl">{emoji}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* WhatsApp Input */}
                <div className="mb-6">
                     <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">{t.whatsappLabel}</label>
                     <div className="flex items-center">
                        <select 
                            value={countryCode} 
                            onChange={e => setCountryCode(e.target.value)}
                            className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-3 text-sm font-medium text-center text-gray-900 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange"
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
                            className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-r-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-orange focus:border-brand-orange"
                            placeholder={t.whatsappPlaceholder}
                        />
                     </div>
                </div>
                
                {/* Error Message */}
                {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                
                {/* Submit Button with Verification Badge */}
                <div className="space-y-2">
                    <Button 
                        onClick={handleSubmit} 
                        disabled={isLoading}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors"
                    >
                        {isLoading ? 'Submitting...' : 'Write a Review'}
                    </Button>
                    <p className="text-center text-sm text-gray-500 flex items-center justify-center gap-1">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified By Indastreet
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RatingModal;