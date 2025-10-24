import React, { useState } from 'react';
import { HotelVillaServiceStatus } from '../types';

interface HotelVillaOptInProps {
    currentStatus: HotelVillaServiceStatus;
    hotelDiscount: number;
    villaDiscount: number;
    onUpdate: (status: HotelVillaServiceStatus, hotelDiscount: number, villaDiscount: number) => void;
}

const HotelVillaOptIn: React.FC<HotelVillaOptInProps> = ({ 
    currentStatus, 
    hotelDiscount, 
    villaDiscount, 
    onUpdate 
}) => {
    const [isOptedIn, setIsOptedIn] = useState(currentStatus !== HotelVillaServiceStatus.NotOptedIn);
    const [localHotelDiscount, setLocalHotelDiscount] = useState(hotelDiscount || 20);
    const [localVillaDiscount, setLocalVillaDiscount] = useState(villaDiscount || 20);
    const [isEditing, setIsEditing] = useState(false);

    const handleToggleOptIn = () => {
        const newOptIn = !isOptedIn;
        setIsOptedIn(newOptIn);
        
        if (newOptIn) {
            onUpdate(HotelVillaServiceStatus.OptedIn, localHotelDiscount, localVillaDiscount);
        } else {
            onUpdate(HotelVillaServiceStatus.NotOptedIn, 0, 0);
        }
    };

    const handleUpdateDiscounts = () => {
        if (localHotelDiscount < 20 || localVillaDiscount < 20) {
            alert('Minimum discount is 20% for both hotel and villa services');
            return;
        }
        
        onUpdate(HotelVillaServiceStatus.OptedIn, localHotelDiscount, localVillaDiscount);
        setIsEditing(false);
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="mb-6">
                <div className="mb-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Hotel & Villa Services</h3>
                    <p className="text-sm text-gray-600">Offer your services to hotel and villa guests with special discounts</p>
                </div>
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                    <span className={`text-sm font-medium ${isOptedIn ? 'text-green-600' : 'text-gray-500'}`}>
                        {isOptedIn ? 'Opted In' : 'Not Opted In'}
                    </span>
                    <button
                        onClick={handleToggleOptIn}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            isOptedIn ? 'bg-orange-500' : 'bg-gray-200'
                        }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                isOptedIn ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                    </button>
                </div>
            </div>

            {isOptedIn && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-orange-50 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-gray-800">Hotel Discount</h4>
                                <span className="text-2xl font-bold text-orange-600">{localHotelDiscount}%</span>
                            </div>
                            {isEditing ? (
                                <div>
                                    <input
                                        type="range"
                                        min="20"
                                        max="60"
                                        value={localHotelDiscount}
                                        onChange={(e) => setLocalHotelDiscount(Number(e.target.value))}
                                        className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                                        <span>20%</span>
                                        <span>60%</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-600">Discount for hotel guests</p>
                            )}
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-gray-800">Villa Discount</h4>
                                <span className="text-2xl font-bold text-blue-600">{localVillaDiscount}%</span>
                            </div>
                            {isEditing ? (
                                <div>
                                    <input
                                        type="range"
                                        min="20"
                                        max="60"
                                        value={localVillaDiscount}
                                        onChange={(e) => setLocalVillaDiscount(Number(e.target.value))}
                                        className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                                        <span>20%</span>
                                        <span>60%</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-600">Discount for villa guests</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600 mb-4">
                            <p className="font-semibold mb-2">Benefits:</p>
                            <ul className="list-disc list-inside text-xs sm:text-sm space-y-1">
                                <li>Increased visibility to hotel & villa guests</li>
                                <li>Exclusive partnerships with premium properties</li>
                                <li>Higher booking volume potential</li>
                                <li>Access to QR code menu systems</li>
                            </ul>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdateDiscounts}
                                        className="flex-1 px-4 py-2 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600"
                                    >
                                        Save Changes
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="w-full px-4 py-3 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600 font-medium"
                                >
                                    Edit Discounts
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {!isOptedIn && (
                <div className="text-center py-8">
                    <div className="text-6xl mb-4">🏨</div>
                    <h4 className="text-lg font-medium text-gray-800 mb-2">Partner with Hotels & Villas</h4>
                    <p className="text-gray-600 mb-4 max-w-md mx-auto">
                        Join our exclusive network and offer your services to guests at premium hotels and villas. 
                        Set your own discount rates (minimum 20%) and reach a wider audience.
                    </p>
                    <button
                        onClick={handleToggleOptIn}
                        className="px-6 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 font-medium"
                    >
                        Opt In to Hotel & Villa Services
                    </button>
                </div>
            )}
        </div>
    );
};

export default HotelVillaOptIn;