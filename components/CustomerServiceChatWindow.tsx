import React, { useState } from 'react';
import { X, MapPin, Send, CheckCircle } from 'lucide-react';

interface CustomerServiceChatWindowProps {
    isOpen: boolean;
    onClose: () => void;
}

const CustomerServiceChatWindow: React.FC<CustomerServiceChatWindowProps> = ({ isOpen, onClose }) => {
    const [customerName, setCustomerName] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [location, setLocation] = useState('');
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [gettingLocation, setGettingLocation] = useState(false);

    const handleGetLocation = async () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setGettingLocation(true);
        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0
                });
            });

            const { latitude, longitude } = position.coords;
            
            // Try to get Google Geocoding address
            try {
                const { GOOGLE_MAPS_API_KEY } = await import('../lib/appwrite.config');
                
                if (!GOOGLE_MAPS_API_KEY) {
                    // Fallback to GPS coordinates
                    setLocation(`GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
                    setGettingLocation(false);
                    return;
                }

                // Call Google Geocoding API
                const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}&language=en`;
                const response = await fetch(geocodeUrl);
                const data = await response.json();
                
                if (data.status === 'OK' && data.results && data.results.length > 0) {
                    const addressComponents = data.results[0].address_components;
                    let cityName = '';
                    let areaName = '';
                    
                    // Find locality and sublocality
                    for (const component of addressComponents) {
                        if (component.types.includes('locality') || component.types.includes('administrative_area_level_2')) {
                            cityName = component.long_name;
                        }
                        if (component.types.includes('sublocality') || component.types.includes('sublocality_level_1')) {
                            areaName = component.long_name;
                        }
                    }
                    
                    const locationString = areaName && cityName 
                        ? `${areaName}, ${cityName}` 
                        : cityName || data.results[0].formatted_address;
                    
                    setLocation(locationString);
                } else {
                    // Fallback to GPS
                    setLocation(`GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
                }
            } catch (geocodeError) {
                console.error('Geocoding error:', geocodeError);
                // Fallback to GPS coordinates
                setLocation(`GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
            }
        } catch (error) {
            console.error('Error getting location:', error);
            alert('Could not get your location. Please enter manually.');
        } finally {
            setGettingLocation(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!customerName.trim() || !whatsappNumber.trim() || !location.trim() || !message.trim()) {
            alert('Please fill in all fields');
            return;
        }

        // TODO: Send message to customer service system (e.g., Appwrite, email service, etc.)
        console.log('📧 Customer Service Message:', {
            name: customerName,
            whatsapp: whatsappNumber,
            location,
            message,
            timestamp: new Date().toISOString()
        });

        // Show confirmation
        setSubmitted(true);

        // Auto-close after 2 minutes (120 seconds)
        setTimeout(() => {
            console.log('⏰ Auto-closing customer service chat after 2 minutes');
            onClose();
            // Reset form after closing
            setSubmitted(false);
            setCustomerName('');
            setWhatsappNumber('');
            setLocation('');
            setMessage('');
        }, 120000); // 2 minutes = 120,000 milliseconds
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-24 right-6 z-[9998]">
            <div className="bg-white rounded-lg shadow-2xl border-2 border-orange-200 w-80 sm:w-96 max-h-[600px] flex flex-col animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 rounded-t-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                            <span className="text-2xl">💬</span>
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-base">Customer Service</h2>
                            <p className="text-orange-100 text-xs">We're here to help</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 rounded-full p-1.5 transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="overflow-y-auto flex-1 p-4">
                    {/* Logo/Image */}
                    <div className="flex justify-center mb-4">
                        <img
                            src="https://ik.imagekit.io/7grri5v7d/indastreet%20massage%20logo.png?updatedAt=1764533351258"
                            alt="IndaStreet Customer Service"
                            className="w-40 h-40 object-contain"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = '/logo.png';
                            }}
                        />
                    </div>

                    {!submitted ? (
                        <>
                            {/* Instruction Text */}
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                                <p className="text-xs text-gray-700 text-center leading-relaxed">
                                    To chat with customer service, please provide your <strong>name</strong>, <strong>WhatsApp number</strong>, and <strong>set your location</strong>.
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-3">
                                {/* Name Field */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Your Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        placeholder="Enter your name"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                        required
                                    />
                                </div>

                                {/* WhatsApp Number Field */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        WhatsApp Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={whatsappNumber}
                                        onChange={(e) => setWhatsappNumber(e.target.value)}
                                        placeholder="+62 812 3456 7890"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                        required
                                    />
                                </div>

                                {/* Location Field */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Your Location <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            placeholder="City or coordinates"
                                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={handleGetLocation}
                                            disabled={gettingLocation}
                                            className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                            title="Get current location"
                                        >
                                            <MapPin className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Message Field */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Your Message <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="How can we help you today?"
                                        rows={3}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
                                        required
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    <span>Send Message</span>
                                </button>
                            </form>
                        </>
                    ) : (
                        /* Confirmation Message */
                        <div className="py-6 text-center animate-in fade-in zoom-in duration-300">
                            <div className="flex justify-center mb-3">
                                <CheckCircle className="w-16 h-16 text-green-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Message Sent!</h3>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                                <p className="text-xs text-gray-700 leading-relaxed">
                                    <strong>IndaStreet Team</strong> will reply to your WhatsApp number soon.
                                    Please be patient due to high traffic requests.
                                </p>
                            </div>
                            <p className="text-xs text-gray-500">
                                You can close this window now
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerServiceChatWindow;
