import React, { useState, useEffect } from 'react';
import { Building, Percent, MapPin, Save, Info } from 'lucide-react';

interface HotelVillaServicesSettingsPageProps {
    hotelVillaId?: string;
    onBack: () => void;
    onSave?: (settings: HotelVillaServiceSettings) => Promise<void>;
}

interface HotelVillaServiceSettings {
    commissionPercentage: number;
    serviceRadiusKm: number;
    isActive: boolean;
}

const HotelVillaServicesSettingsPage: React.FC<HotelVillaServicesSettingsPageProps> = ({
    hotelVillaId = '1',
    onBack,
    onSave
}) => {
    const [commissionPercentage, setCommissionPercentage] = useState(15); // Default 15%
    const [serviceRadiusKm, setServiceRadiusKm] = useState(5); // Default 5km
    const [isActive, setIsActive] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Load existing settings
    useEffect(() => {
        const loadSettings = async () => {
            try {
                // TODO: Load from Appwrite or your database
                // For now, using localStorage to persist settings
                const savedSettings = localStorage.getItem(`hotel-villa-settings-${hotelVillaId}`);
                if (savedSettings) {
                    const settings: HotelVillaServiceSettings = JSON.parse(savedSettings);
                    setCommissionPercentage(settings.commissionPercentage);
                    setServiceRadiusKm(settings.serviceRadiusKm);
                    setIsActive(settings.isActive);
                }
            } catch (error) {
                console.error('Error loading settings:', error);
            }
        };

        loadSettings();
    }, [hotelVillaId]);

    const handleSaveSettings = async () => {
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const settings: HotelVillaServiceSettings = {
                commissionPercentage,
                serviceRadiusKm,
                isActive
            };

            // Save to localStorage for now
            localStorage.setItem(`hotel-villa-settings-${hotelVillaId}`, JSON.stringify(settings));

            // Call external save handler if provided
            if (onSave) {
                await onSave(settings);
            }

            setSuccess('Settings saved successfully!');
        } catch (err) {
            console.error('Error saving settings:', err);
            setError('Failed to save settings. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
            {/* Header */}
            <header className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-white py-6 px-4 shadow-xl">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Back to Dashboard</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <Building className="w-8 h-8" />
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold">Hotel & Villa Services Settings</h1>
                            <p className="text-orange-100 mt-1">Configure commission rates and service area</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Success Message */}
                {success && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-lg animate-fade-in">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <p className="text-green-700 font-medium">{success}</p>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg animate-fade-in">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-700 font-medium">{error}</p>
                        </div>
                    </div>
                )}

                {/* Info Banner */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded-lg">
                    <div className="flex items-start gap-3">
                        <Info className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-blue-800 font-bold mb-2">How Hotel & Villa Services Work</h3>
                            <ul className="text-blue-700 text-sm space-y-1">
                                <li>• Set your commission percentage for massage services at your property</li>
                                <li>• Define service radius to control how far therapists can travel from your location</li>
                                <li>• Guests can book massages through your QR code menu</li>
                                <li>• Therapists pay commission after completing services</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Settings Form */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Service Status Toggle */}
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold">Service Status</h2>
                                <p className="text-orange-100 text-sm mt-1">Enable or disable massage services</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-sm font-medium ${isActive ? 'text-orange-100' : 'text-orange-200'}`}>
                                    {isActive ? 'Active' : 'Inactive'}
                                </span>
                                <button
                                    onClick={() => setIsActive(!isActive)}
                                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 ${
                                        isActive ? 'bg-white' : 'bg-white/30'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-6 w-6 transform rounded-full bg-orange-500 transition-transform ${
                                            isActive ? 'translate-x-7' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Commission Percentage Slider */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                    <Percent className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">Commission Percentage</h3>
                                    <p className="text-gray-600 text-sm">Fee charged to therapists for using your venue</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-medium text-gray-700">Commission Rate</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-3xl font-bold text-orange-600">{commissionPercentage}</span>
                                        <span className="text-lg font-semibold text-orange-600">%</span>
                                    </div>
                                </div>

                                <div className="relative">
                                    <input
                                        type="range"
                                        min="5"
                                        max="30"
                                        step="1"
                                        value={commissionPercentage}
                                        onChange={(e) => setCommissionPercentage(Number(e.target.value))}
                                        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                        style={{
                                            background: `linear-gradient(to right, #f97316 0%, #f97316 ${((commissionPercentage - 5) / 25) * 100}%, #e5e7eb ${((commissionPercentage - 5) / 25) * 100}%, #e5e7eb 100%)`
                                        }}
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                                        <span>5%</span>
                                        <span>15%</span>
                                        <span>30%</span>
                                    </div>
                                </div>

                                <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                                    <p className="text-sm text-orange-700">
                                        <strong>Current Rate:</strong> Therapists will pay {commissionPercentage}% commission on each service completed at your venue.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Service Radius Slider */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <MapPin className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">Service Radius</h3>
                                    <p className="text-gray-600 text-sm">Maximum distance therapists can travel from your location</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-medium text-gray-700">Coverage Area</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-3xl font-bold text-blue-600">{serviceRadiusKm}</span>
                                        <span className="text-lg font-semibold text-blue-600">km</span>
                                    </div>
                                </div>

                                <div className="relative">
                                    <input
                                        type="range"
                                        min="1"
                                        max="15"
                                        step="0.5"
                                        value={serviceRadiusKm}
                                        onChange={(e) => setServiceRadiusKm(Number(e.target.value))}
                                        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                        style={{
                                            background: `linear-gradient(to right, #2563eb 0%, #2563eb ${((serviceRadiusKm - 1) / 14) * 100}%, #e5e7eb ${((serviceRadiusKm - 1) / 14) * 100}%, #e5e7eb 100%)`
                                        }}
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                                        <span>1km</span>
                                        <span>7.5km</span>
                                        <span>15km</span>
                                    </div>
                                </div>

                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-700">
                                        <strong>Coverage Area:</strong> Therapists can provide services within {serviceRadiusKm}km radius from your hotel/villa.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Preview Section */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
                            <h4 className="text-lg font-bold text-green-800 mb-3">Settings Preview</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Percent className="w-5 h-5 text-orange-600" />
                                        <span className="font-semibold text-gray-800">Commission</span>
                                    </div>
                                    <p className="text-2xl font-bold text-orange-600">{commissionPercentage}%</p>
                                    <p className="text-sm text-gray-600">Per service fee</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MapPin className="w-5 h-5 text-blue-600" />
                                        <span className="font-semibold text-gray-800">Service Area</span>
                                    </div>
                                    <p className="text-2xl font-bold text-blue-600">{serviceRadiusKm} km</p>
                                    <p className="text-sm text-gray-600">Maximum radius</p>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end pt-4">
                            <button
                                onClick={handleSaveSettings}
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="w-5 h-5" />
                                {isSubmitting ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <style>{`
                .slider::-webkit-slider-thumb {
                    appearance: none;
                    height: 24px;
                    width: 24px;
                    border-radius: 50%;
                    background: #ffffff;
                    border: 3px solid #f97316;
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
                    transition: all 0.2s ease;
                }
                
                .slider::-webkit-slider-thumb:hover {
                    transform: scale(1.1);
                    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
                }
                
                .slider::-moz-range-thumb {
                    height: 24px;
                    width: 24px;
                    border-radius: 50%;
                    background: #ffffff;
                    border: 3px solid #f97316;
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
                }
                
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default HotelVillaServicesSettingsPage;