import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { Place, Pricing } from '../types';

interface PlaceDiscountSystemPageProps {
    place?: Place;
    onBack: () => void;
    onSave: (placeData: Partial<Place>) => void;
}

const PlaceDiscountSystemPage: React.FC<PlaceDiscountSystemPageProps> = ({
    place,
    onBack,
    onSave
}) => {
    const [discountPercentage, setDiscountPercentage] = useState<number>(0);
    const [discountDuration, setDiscountDuration] = useState<number>(6);
    const [discountEndTime, setDiscountEndTime] = useState<string>('');
    const [isDiscountActive, setIsDiscountActive] = useState(false);
    const [pricing, setPricing] = useState<Pricing>({ 60: 0, 90: 0, 120: 0 });

    // Load existing discount data when component mounts
    useEffect(() => {
        if (place) {
            setDiscountPercentage(place.discountPercentage || 0);
            setDiscountDuration(place.discountDuration || 6);
            setDiscountEndTime(place.discountEndTime || '');
            setIsDiscountActive(place.isDiscountActive || false);
            setPricing(place.pricing || { 60: 0, 90: 0, 120: 0 });
        }
    }, [place]);

    const handleActivateDiscount = () => {
        if (!isDiscountActive && discountPercentage > 0) {
            const endTime = new Date();
            endTime.setHours(endTime.getHours() + discountDuration);
            const endTimeString = endTime.toISOString();
            setDiscountEndTime(endTimeString);
            setIsDiscountActive(true);
            
            // Save to database
            onSave({
                discountPercentage,
                discountDuration,
                discountEndTime: endTimeString,
                isDiscountActive: true
            });
        } else {
            setIsDiscountActive(false);
            setDiscountEndTime('');
            
            // Save to database
            onSave({
                discountPercentage: 0,
                discountDuration: 0,
                discountEndTime: '',
                isDiscountActive: false
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-orange-100">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 rounded-full bg-orange-100 hover:bg-orange-200 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-orange-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">💥 Discount Activation System</h1>
                            <p className="text-sm text-gray-600">Manage special discount offers for your massage place</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    {/* Current Status */}
                    <div className="mb-8 p-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Current Status</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className={`text-2xl font-bold ${isDiscountActive ? 'text-green-600' : 'text-gray-400'}`}>
                                    {isDiscountActive ? '🟢 ACTIVE' : '⚪ INACTIVE'}
                                </div>
                                <p className="text-sm text-gray-600">Discount Status</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-orange-600">
                                    {discountPercentage}%
                                </div>
                                <p className="text-sm text-gray-600">Current Discount</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                    {discountDuration}h
                                </div>
                                <p className="text-sm text-gray-600">Duration</p>
                            </div>
                        </div>
                        {isDiscountActive && discountEndTime && (
                            <div className="mt-4 p-3 bg-green-100 rounded-lg text-center">
                                <p className="text-sm text-green-700 font-medium">
                                    🕒 Active until: {new Date(discountEndTime).toLocaleString()}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Discount Configuration */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">⚙️ Configure Discount</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Discount Percentage */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-4">
                                    💰 Discount Percentage
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[5, 10, 15, 20, 25, 30].map(percent => (
                                        <button
                                            key={percent}
                                            type="button"
                                            onClick={() => setDiscountPercentage(percent)}
                                            className={`px-4 py-3 rounded-lg text-sm font-bold transition-all transform hover:scale-105 ${
                                                discountPercentage === percent
                                                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg scale-105'
                                                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                                            }`}
                                        >
                                            {percent}%
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Duration */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-4">
                                    ⏰ Duration (Hours)
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[6, 12, 24, 48, 72].map(hours => (
                                        <button
                                            key={hours}
                                            type="button"
                                            onClick={() => setDiscountDuration(hours)}
                                            className={`px-4 py-3 rounded-lg text-sm font-bold transition-all transform hover:scale-105 ${
                                                discountDuration === hours
                                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105'
                                                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                            }`}
                                        >
                                            {hours}h
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preview Section */}
                    {discountPercentage > 0 && (
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">👀 Price Preview</h2>
                            <div className="p-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border-2 border-dashed border-orange-300">
                                <p className="text-sm text-orange-700 font-medium mb-4">
                                    💡 How your prices will look with {discountPercentage}% discount:
                                </p>
                                <div className="grid grid-cols-3 gap-4">
                                    {Object.entries(pricing).map(([duration, price]) => (
                                        <div key={duration} className="bg-white p-4 rounded-lg border border-orange-200 text-center">
                                            <p className="text-sm font-medium text-gray-600 mb-2">{duration} minutes</p>
                                            <p className="text-lg text-gray-500 line-through">
                                                Rp {Number(price).toLocaleString('id-ID')}
                                            </p>
                                            <p className="text-xl font-bold text-orange-600">
                                                Rp {Math.round(Number(price) * (1 - discountPercentage / 100)).toLocaleString('id-ID')}
                                            </p>
                                            <div className="mt-2 px-2 py-1 bg-orange-100 rounded-full">
                                                <p className="text-xs font-bold text-orange-700">
                                                    Save Rp {(Number(price) - Math.round(Number(price) * (1 - discountPercentage / 100))).toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Button */}
                    <div className="text-center">
                        <button
                            type="button"
                            onClick={handleActivateDiscount}
                            className={`px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 ${
                                !isDiscountActive && discountPercentage > 0
                                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-xl hover:from-green-600 hover:to-green-700'
                                    : isDiscountActive
                                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-xl hover:from-red-600 hover:to-red-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                            disabled={!isDiscountActive && discountPercentage === 0}
                        >
                            {!isDiscountActive && discountPercentage > 0 ? '🚀 Activate Discount Now!' :
                             isDiscountActive ? '🛑 Deactivate Discount' : 
                             '⚠️ Please Select Discount Percentage'}
                        </button>
                        
                        {!isDiscountActive && discountPercentage > 0 && (
                            <p className="mt-3 text-sm text-gray-600">
                                This will activate a {discountPercentage}% discount for {discountDuration} hours
                            </p>
                        )}
                    </div>

                    {/* Benefits Section */}
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                            <div className="text-3xl mb-3">📈</div>
                            <h3 className="font-bold text-gray-900 mb-2">Increase Bookings</h3>
                            <p className="text-sm text-gray-600">Attract more customers with special discount offers</p>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                            <div className="text-3xl mb-3">💰</div>
                            <h3 className="font-bold text-gray-900 mb-2">Boost Revenue</h3>
                            <p className="text-sm text-gray-600">Higher booking volume can lead to increased overall income</p>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                            <div className="text-3xl mb-3">⭐</div>
                            <h3 className="font-bold text-gray-900 mb-2">Build Loyalty</h3>
                            <p className="text-sm text-gray-600">Special offers help create repeat customers</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaceDiscountSystemPage;