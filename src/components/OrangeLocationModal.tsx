import React, { useState } from 'react';
import { MapPin, Navigation, Shield, CheckCircle2 } from 'lucide-react';

interface OrangeLocationModalProps {
    isVisible: boolean;
    onAllow: () => void;
    onDeny: () => void;
    language?: 'en' | 'id';
    size?: 'default' | 'compact';
}

const OrangeLocationModal: React.FC<OrangeLocationModalProps> = ({
    isVisible,
    onAllow,
    onDeny,
    language = 'id',
    size = 'default'
}) => {
    const [isLoading, setIsLoading] = useState(false);

    if (!isVisible) return null;

    const content = {
        en: {
            title: 'Enable Location Access',
            subtitle: 'Find the best massage therapists near you',
            description: 'IndaStreet needs your location to show nearby therapists and calculate accurate distances.',
            benefits: [
                'Find therapists closest to you',
                'Get real-time distance calculations',
                'Receive location-based recommendations',
                'Better service matching'
            ],
            allowButton: 'Allow Location',
            denyButton: 'Skip for Now',
            privacyNote: 'Your location is only used to improve your experience and is never shared with third parties.',
            loadingText: 'Getting your location...'
        },
        id: {
            title: 'Aktifkan Akses Lokasi',
            subtitle: 'Temukan terapis pijat terbaik di dekat Anda',
            description: 'IndaStreet memerlukan akses lokasi untuk menampilkan terapis terdekat dan menghitung jarak dengan akurat.',
            benefits: [
                'Temukan terapis terdekat dengan Anda',
                'Dapatkan perhitungan jarak real-time',
                'Terima rekomendasi berdasarkan lokasi',
                'Pencocokan layanan yang lebih baik'
            ],
            allowButton: 'Izinkan Lokasi',
            denyButton: 'Lewati Sekarang',
            privacyNote: 'Lokasi Anda hanya digunakan untuk meningkatkan pengalaman dan tidak pernah dibagikan kepada pihak ketiga.',
            loadingText: 'Mendapatkan lokasi Anda...'
        }
    };

    const t = content[language];

    const handleAllow = async () => {
        setIsLoading(true);
        // Small delay for better UX
        setTimeout(() => {
            onAllow();
            setIsLoading(false);
        }, 1000);
    };

    // Size-based classes
    const containerMaxWidth = size === 'compact' ? 'max-w-sm' : 'max-w-md';
    const headerPadding = size === 'compact' ? 'p-4' : 'p-6';
    const headerIconWrap = size === 'compact' ? 'w-12 h-12' : 'w-16 h-16';
    const headerIconSize = size === 'compact' ? 'w-6 h-6' : 'w-8 h-8';
    const titleText = size === 'compact' ? 'text-xl' : 'text-2xl';
    const bodyPadding = size === 'compact' ? 'p-4' : 'p-6';
    const allowBtnPadding = size === 'compact' ? 'py-3 px-5' : 'py-4 px-6';
    const denyBtnPadding = size === 'compact' ? 'py-2.5 px-5' : 'py-3 px-6';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4 animate-fadeIn">
            <div className={`bg-white rounded-3xl shadow-2xl ${containerMaxWidth} w-full mx-4 relative overflow-hidden animate-slideUp`}>
                {/* Orange gradient header */}
                <div className={`bg-gradient-to-r from-amber-500 to-amber-600 ${headerPadding} text-white relative`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -ml-12 -mb-12"></div>
                    
                    <div className="relative z-10 text-center">
                        <div className={`${headerIconWrap} bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm`}>
                            <MapPin className={`${headerIconSize} text-white`} />
                        </div>
                        <h2 className={`${titleText} font-bold mb-2`}>{t.title}</h2>
                        <p className="text-amber-100 text-sm">{t.subtitle}</p>
                    </div>
                </div>

                {/* Content */}
                <div className={`${bodyPadding}`}>
                    <p className="text-gray-700 text-center mb-6 leading-relaxed">
                        {t.description}
                    </p>

                    {/* Benefits list */}
                    <div className="space-y-3 mb-6">
                        {t.benefits.map((benefit, index) => (
                            <div key={index} className="flex items-center space-x-3 group">
                                <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-amber-200 transition-colors">
                                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                                </div>
                                <span className="text-gray-700 text-sm">{benefit}</span>
                            </div>
                        ))}
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-3 mb-4">
                        <button
                            onClick={handleAllow}
                            disabled={isLoading}
                            className={`w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold ${allowBtnPadding} rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:transform-none shadow-lg flex items-center justify-center space-x-2`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>{t.loadingText}</span>
                                </>
                            ) : (
                                <>
                                    <Navigation className="w-5 h-5" />
                                    <span>{t.allowButton}</span>
                                </>
                            )}
                        </button>
                        
                        <button
                            onClick={onDeny}
                            disabled={isLoading}
                            className={`w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium ${denyBtnPadding} rounded-xl transition-all duration-300 disabled:opacity-50`}
                        >
                            {t.denyButton}
                        </button>
                    </div>

                    {/* Privacy note */}
                    <div className="flex items-start space-x-2 p-3 bg-amber-50 rounded-lg">
                        <Shield className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-600 leading-relaxed">
                            {t.privacyNote}
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeInModal {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUpModal {
                    from { 
                        opacity: 0;
                        transform: translateY(20px) scale(0.95);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                .animate-fadeIn {
                    animation: fadeInModal 0.3s ease-out;
                }
                .animate-slideUp {
                    animation: slideUpModal 0.4s ease-out;
                }
            `}</style>
        </div>
    );
};

export default OrangeLocationModal;