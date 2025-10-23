import React, { useState } from 'react';
import { HotelVillaMenu } from '../types';

interface QRCodeMenuBuilderProps {
    menu: HotelVillaMenu | null;
    ownerType: 'hotel' | 'villa';
    onSaveMenu: (menuData: Omit<HotelVillaMenu, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const QRCodeMenuBuilder: React.FC<QRCodeMenuBuilderProps> = ({
    menu,
    ownerType,
    onSaveMenu
}) => {
    const [isEditing, setIsEditing] = useState(!menu);
    const [formData, setFormData] = useState({
        brandName: menu?.brandName || `My ${ownerType.charAt(0).toUpperCase() + ownerType.slice(1)}`,
        brandLogo: menu?.brandLogo || '',
        customMessage: menu?.customMessage || `Welcome to our ${ownerType}! Enjoy exclusive massage services with special guest pricing.`,
        isActive: menu?.isActive ?? true
    });

    const generateQRCode = (menuId: string) => {
        // In a real app, this would generate an actual QR code
        // For now, we'll create a placeholder
        const baseUrl = window.location.origin;
        const menuUrl = `${baseUrl}/guest-menu/${menuId}`;
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(menuUrl)}`;
    };

    const handleSave = () => {
        const menuData = {
            ownerId: 1, // This would be the actual hotel/villa ID
            ownerType,
            brandName: formData.brandName,
            brandLogo: formData.brandLogo,
            customMessage: formData.customMessage,
            qrCode: generateQRCode(`${ownerType}-${Date.now()}`),
            isActive: formData.isActive
        };
        
        onSaveMenu(menuData);
        setIsEditing(false);
    };

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">QR Code Menu</h2>
                        <p className="text-gray-600">
                            Create a custom branded menu for your guests to access massage services
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className={`text-sm font-medium ${formData.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                            {formData.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button
                            onClick={() => handleInputChange('isActive', !formData.isActive)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                formData.isActive ? 'bg-green-500' : 'bg-gray-200'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    formData.isActive ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>
                </div>

                {isEditing && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Brand Name
                            </label>
                            <input
                                type="text"
                                value={formData.brandName}
                                onChange={(e) => handleInputChange('brandName', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Enter your brand name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Brand Logo URL (Optional)
                            </label>
                            <input
                                type="url"
                                value={formData.brandLogo}
                                onChange={(e) => handleInputChange('brandLogo', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="https://example.com/logo.png"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Welcome Message
                            </label>
                            <textarea
                                value={formData.customMessage}
                                onChange={(e) => handleInputChange('customMessage', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Enter a welcome message for your guests"
                            />
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 font-medium"
                            >
                                Save Menu
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {!isEditing && menu && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                        Edit Menu
                    </button>
                )}
            </div>

            {/* Menu Preview */}
            {formData.isActive && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* QR Code */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">QR Code</h3>
                        <div className="text-center">
                            <div className="inline-block p-4 bg-gray-50 rounded-lg">
                                <img
                                    src={generateQRCode('demo-menu')}
                                    alt="QR Code"
                                    className="w-48 h-48 mx-auto"
                                />
                            </div>
                            <p className="text-sm text-gray-600 mt-4">
                                Print this QR code and place it in guest rooms, reception, or common areas
                            </p>
                            <div className="mt-4 space-x-3">
                                <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm">
                                    Download High-Res
                                </button>
                                <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm">
                                    Print Ready PDF
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Menu Preview */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Guest Menu Preview</h3>
                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            {/* Header */}
                            <div className="text-center mb-6">
                                {formData.brandLogo && (
                                    <img
                                        src={formData.brandLogo}
                                        alt="Logo"
                                        className="w-16 h-16 mx-auto mb-3 rounded-lg object-cover"
                                    />
                                )}
                                <h2 className="text-xl font-bold text-gray-800">{formData.brandName}</h2>
                                <div className="text-sm text-orange-600 font-medium">
                                    Powered by <span className="text-white">Indo</span><span className="text-orange-500">street</span>
                                </div>
                            </div>

                            {/* Welcome Message */}
                            <div className="bg-orange-50 p-4 rounded-lg mb-4">
                                <p className="text-sm text-gray-700">{formData.customMessage}</p>
                            </div>

                            {/* Sample Service Preview */}
                            <div className="space-y-3">
                                <h4 className="font-medium text-gray-800">Available Services:</h4>
                                <div className="bg-white p-3 rounded border">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h5 className="font-medium text-gray-800">Maya Wellness</h5>
                                            <p className="text-xs text-blue-600">Personal Therapist • 25% OFF</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center text-yellow-500">
                                                <span className="text-sm">4.8</span>
                                                <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                        <div className="text-center p-2 bg-gray-50 rounded">
                                            <div className="text-gray-600">60 min</div>
                                            <div className="line-through text-gray-400">Rp 150,000</div>
                                            <div className="font-bold text-orange-600">Rp 112,500</div>
                                            <div className="text-gray-500">ID: 101</div>
                                        </div>
                                        <div className="text-center p-2 bg-gray-50 rounded">
                                            <div className="text-gray-600">90 min</div>
                                            <div className="line-through text-gray-400">Rp 200,000</div>
                                            <div className="font-bold text-orange-600">Rp 150,000</div>
                                            <div className="text-gray-500">ID: 102</div>
                                        </div>
                                        <div className="text-center p-2 bg-gray-50 rounded">
                                            <div className="text-gray-600">120 min</div>
                                            <div className="line-through text-gray-400">Rp 250,000</div>
                                            <div className="font-bold text-orange-600">Rp 187,500</div>
                                            <div className="text-gray-500">ID: 103</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <button className="px-4 py-2 bg-orange-500 text-white rounded text-sm">
                                        View All Services
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">How it works:</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-start space-x-3">
                        <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</div>
                        <div>
                            <h4 className="font-medium text-blue-800">Download & Print</h4>
                            <p className="text-blue-700">Download the QR code and place it in guest rooms or common areas</p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</div>
                        <div>
                            <h4 className="font-medium text-blue-800">Guests Scan</h4>
                            <p className="text-blue-700">Guests scan the code to see available massage services with special pricing</p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</div>
                        <div>
                            <h4 className="font-medium text-blue-800">Direct Booking</h4>
                            <p className="text-blue-700">Guests can contact therapists directly using the provided ID numbers</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QRCodeMenuBuilder;