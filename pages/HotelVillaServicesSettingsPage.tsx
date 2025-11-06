import React, { useState, useEffect } from 'react';
import { Building, Percent, MapPin, Save, Info } from 'lucide-react';

interface HotelVillaServicesSettingsPageProps {
    hotelVillaId?: string;
    type?: 'hotel' | 'villa'; // Added type prop
    onBack?: () => void;
    onSave?: (settings: HotelVillaServiceSettings) => Promise<void>;
}

interface HotelVillaServiceSettings {
    commissionPercentage: number; // Base 20%, paid membership can go up to 25%
    serviceRadiusKm: number;
    isActive: boolean;
    isPaidMembership: boolean; // New field to track membership status
}

const HotelVillaServicesSettingsPage: React.FC<HotelVillaServicesSettingsPageProps> = ({
    hotelVillaId = '1',
    type = 'hotel', // Default to hotel
    onBack,
    onSave
}) => {
    const [commissionPercentage, setCommissionPercentage] = useState(20); // Default 20% (locked for free accounts)
    const [serviceRadiusKm, setServiceRadiusKm] = useState(5); // Default 5km
    const [isActive, setIsActive] = useState(true);
    const [isPaidMembership, setIsPaidMembership] = useState(false); // Track membership status
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
                    setIsPaidMembership(settings.isPaidMembership || false); // Default to false if not set
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
                isActive,
                isPaidMembership
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
                            <h1 className="text-2xl md:text-3xl font-bold">
                                {type === 'hotel' ? 'Hotel' : 'Villa'} Services Settings
                            </h1>
                            <p className="text-orange-100 mt-1">Configure commission rates and service area</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Success Message */}
                {success && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 pb-20 mb-6 rounded-lg animate-fade-in">
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
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 pb-20 mb-6 rounded-lg animate-fade-in">
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
                            <h3 className="text-blue-800 font-bold mb-2">How {type === 'hotel' ? 'Hotel' : 'Villa'} Services Work</h3>
                            <ul className="text-blue-700 text-sm space-y-1">
                                <li>• Set your commission percentage for massage services at your {type}</li>
                                <li>• Define service radius to control how far therapists can travel from your location</li>
                                <li>• Guests can book massages through your QR code menu</li>
                                <li>• Therapists pay commission after completing services at your {type}</li>
                                <li>• Commission system ensures therapists stay active and available</li>
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
                        {/* Commission Percentage Settings */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                    <Percent className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">Commission Percentage</h3>
                                    <p className="text-gray-600 text-sm">Fee charged to therapists for using your {type}</p>
                                </div>
                            </div>

                            {/* Free Account - Locked at 20% */}
                            {!isPaidMembership ? (
                                <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm font-medium text-gray-700">Commission Rate (Free Account)</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-3xl font-bold text-gray-600">20</span>
                                            <span className="text-lg font-semibold text-gray-600">%</span>
                                            <div className="bg-gray-400 text-white text-xs font-bold px-2 py-1 rounded-full ml-2">
                                                LOCKED
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-200 p-3 rounded-lg mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
                                            <div className="flex-1 h-3 bg-gray-300 rounded-full relative">
                                                <div className="h-full w-3/5 bg-gray-600 rounded-full"></div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                                            <span>0%</span>
                                            <span className="font-bold text-gray-700">20% (Current)</span>
                                            <span>25%</span>
                                        </div>
                                    </div>

                                    <div className="p-4 pb-20 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                                        <div className="flex items-start gap-3">
                                            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <div className="text-sm text-blue-800">
                                                <p className="font-semibold mb-2">Free Account Limitations:</p>
                                                <ul className="list-disc list-inside space-y-1">
                                                    <li>Commission rate locked at 20%</li>
                                                    <li>Standard pricing for guests</li>
                                                    <li>Therapist pays you 20% of service cost</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 pb-20 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                            </svg>
                                            <div className="text-sm text-green-800">
                                                <p className="font-semibold mb-2">Upgrade to Paid Membership:</p>
                                                <ul className="list-disc list-inside space-y-1">
                                                    <li>Adjust commission rate from 20% to 25%</li>
                                                    <li>Higher earnings per booking</li>
                                                    <li>Menu prices increase automatically</li>
                                                    <li>Therapist profit stays the same</li>
                                                </ul>
                                                <button
                                                    onClick={() => setIsPaidMembership(true)}
                                                    className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
                                                >
                                                    Simulate Paid Membership
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Paid Account - Adjustable 20-25% */
                                <div className="bg-gray-50 p-6 rounded-xl border-2 border-green-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm font-medium text-gray-700">Commission Rate (Paid Membership)</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-3xl font-bold text-green-600">{commissionPercentage}</span>
                                            <span className="text-lg font-semibold text-green-600">%</span>
                                            <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full ml-2">
                                                PREMIUM
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative mb-4">
                                        <input
                                            type="range"
                                            min="20"
                                            max="25"
                                            step="1"
                                            value={commissionPercentage}
                                            onChange={(e) => setCommissionPercentage(Number(e.target.value))}
                                            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                            style={{
                                                background: `linear-gradient(to right, #10b981 0%, #10b981 ${((commissionPercentage - 20) / 5) * 100}%, #e5e7eb ${((commissionPercentage - 20) / 5) * 100}%, #e5e7eb 100%)`
                                            }}
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                                            <span>20%</span>
                                            <span>22.5%</span>
                                            <span>25%</span>
                                        </div>
                                    </div>

                                    <div className="p-4 pb-20 bg-green-50 border border-green-200 rounded-lg mb-4">
                                        <p className="text-sm text-green-700">
                                            <strong>Premium Rate:</strong> Therapists will pay {commissionPercentage}% commission. Menu prices adjust automatically to maintain therapist profit.
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setIsPaidMembership(false);
                                            setCommissionPercentage(20);
                                        }}
                                        className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-600 transition-colors"
                                    >
                                        Simulate Free Account
                                    </button>
                                </div>
                            )}

                            {/* Pricing Impact Explanation */}
                            <div className="mt-6 p-4 pb-20 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    <div className="text-sm text-yellow-800">
                                        <p className="font-semibold mb-2">💡 How Commission Changes Affect Pricing:</p>
                                        <div className="space-y-2">
                                            <div className="bg-white p-3 rounded border">
                                                <p><strong>Example:</strong> Therapist service base cost = Rp 300,000</p>
                                                <p>• At 20% commission: Guest pays <strong>Rp 360,000</strong> | You earn <strong>Rp 60,000</strong></p>
                                                <p>• At 25% commission: Guest pays <strong>Rp 375,000</strong> | You earn <strong>Rp 75,000</strong></p>
                                                <p>• Therapist always receives <strong>Rp 300,000</strong> (unchanged)</p>
                                            </div>
                                        </div>
                                    </div>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
                                <div className="bg-white p-4 pb-20 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Percent className="w-5 h-5 text-orange-600" />
                                        <span className="font-semibold text-gray-800">Commission</span>
                                    </div>
                                    <p className="text-2xl font-bold text-orange-600">{commissionPercentage}%</p>
                                    <p className="text-sm text-gray-600">Per service fee</p>
                                </div>
                                <div className="bg-white p-4 pb-20 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MapPin className="w-5 h-5 text-blue-600" />
                                        <span className="font-semibold text-gray-800">Service Area</span>
                                    </div>
                                    <p className="text-2xl font-bold text-blue-600">{serviceRadiusKm} km</p>
                                    <p className="text-sm text-gray-600">Maximum radius</p>
                                </div>
                            </div>
                        </div>

                        {/* Therapist Notification System */}
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                            <div className="flex items-start gap-3">
                                <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <div className="flex-1">
                                    <h4 className="text-lg font-bold text-red-800 mb-3">⚠️ Important: Therapist Commission & Status System</h4>
                                    <div className="space-y-3 text-sm text-red-700">
                                        <div className="bg-white p-4 pb-20 rounded-lg border border-red-200">
                                            <h5 className="font-semibold mb-2">📱 How Therapists Get Notified:</h5>
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>When commission rates change, therapists receive instant notifications</li>
                                                <li>They are informed of new pricing structure for {type} guests</li>
                                                <li>Therapists must confirm commission payment to stay active</li>
                                                <li>Unpaid commissions result in "BUSY" status until payment</li>
                                            </ul>
                                        </div>
                                        
                                        <div className="bg-white p-4 pb-20 rounded-lg border border-red-200">
                                            <h5 className="font-semibold mb-2">💰 Commission Payment & Status System:</h5>
                                            <ul className="list-disc list-inside space-y-1">
                                                <li><strong>Guest pays:</strong> Service cost + {commissionPercentage}% markup</li>
                                                <li><strong>Therapist receives:</strong> Base service cost (unchanged)</li>
                                                <li><strong>{type} earns:</strong> {commissionPercentage}% commission fee</li>
                                                <li><strong>Payment required:</strong> Therapist must pay commission to return to "Available" status</li>
                                            </ul>
                                        </div>

                                        <div className="bg-yellow-50 border border-yellow-300 p-4 pb-20 rounded-lg">
                                            <h5 className="font-semibold text-yellow-800 mb-2">🔄 Example Commission Flow:</h5>
                                            <div className="text-yellow-700">
                                                <p>1. Guest books 90-minute massage (Base: Rp 300,000)</p>
                                                <p>2. Guest pays: Rp {Math.round(300000 * (1 + commissionPercentage/100)).toLocaleString()} (includes {commissionPercentage}% commission)</p>
                                                <p>3. Therapist receives: Rp 300,000</p>
                                                <p>4. Therapist owes {type}: Rp {Math.round(300000 * (commissionPercentage/100)).toLocaleString()}</p>
                                                <p>5. After payment confirmed → Therapist returns to "Available" status</p>
                                            </div>
                                        </div>
                                    </div>
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

