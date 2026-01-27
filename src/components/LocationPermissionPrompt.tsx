import React from 'react';

interface LocationPermissionPromptProps {
    isVisible: boolean;
    onAllow: () => void;
    onDeny: () => void;
    language: 'en' | 'id';
}

const LocationPermissionPrompt: React.FC<LocationPermissionPromptProps> = ({
    isVisible,
    onAllow,
    onDeny,
    language
}) => {
    if (!isVisible) return null;

    const content = {
        en: {
            title: 'Enable Location Access',
            description: 'IndaStreet needs access to your location to find nearby massage therapists and provide better service.',
            benefits: [
                'Find therapists near you',
                'Get accurate distance calculations',
                'Receive location-based recommendations'
            ],
            allowButton: 'Allow Location Access',
            denyButton: 'Use Default Location',
            privacyNote: 'Your location is only used to improve your experience and is not shared with third parties.'
        },
        id: {
            title: 'Aktifkan Akses Lokasi',
            description: 'IndaStreet memerlukan akses ke lokasi Anda untuk menemukan terapis pijat terdekat dan memberikan layanan yang lebih baik.',
            benefits: [
                'Temukan terapis di dekat Anda',
                'Dapatkan perhitungan jarak yang akurat',
                'Terima rekomendasi berdasarkan lokasi'
            ],
            allowButton: 'Izinkan Akses Lokasi',
            denyButton: 'Gunakan Lokasi Default',
            privacyNote: 'Lokasi Anda hanya digunakan untuk meningkatkan pengalaman dan tidak dibagikan kepada pihak ketiga.'
        }
    };

    const t = content[language];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 mx-4">
                {/* Location Icon */}
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900 text-center mb-3">
                    {t.title}
                </h2>

                {/* Description */}
                <p className="text-gray-600 text-center mb-4 text-sm">
                    {t.description}
                </p>

                {/* Benefits */}
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Benefits:</h3>
                    <ul className="space-y-1">
                        {t.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-center text-sm text-gray-600">
                                <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {benefit}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Privacy Note */}
                <p className="text-xs text-gray-500 text-center mb-6">
                    {t.privacyNote}
                </p>

                {/* Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={onAllow}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                        {t.allowButton}
                    </button>
                    <button
                        onClick={onDeny}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                        {t.denyButton}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LocationPermissionPrompt;