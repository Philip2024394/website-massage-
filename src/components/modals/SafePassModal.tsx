/**
 * SafePassModal Component
 * 
 * Displays information about therapist's hotel/villa/home service verification
 * and Indastreet SafePass card credentials
 */

import React from 'react';
import { X, Shield, Check, Home, Building, Hotel, Dumbbell } from 'lucide-react';

interface SafePassModalProps {
    isOpen: boolean;
    onClose: () => void;
    therapistName: string;
    therapistImage?: string;
    safePassIssueDate?: string;
    chatLang?: string;
}

const SafePassModal: React.FC<SafePassModalProps> = ({
    isOpen,
    onClose,
    therapistName,
    therapistImage,
    safePassIssueDate = '2025-01-15', // Default issue date
    chatLang = 'id'
}) => {
    if (!isOpen) return null;

    const content = {
        id: {
            issued: 'Diterbitkan:',
            verified: 'Terverifikasi untuk melayani di:',
            hotels: 'Hotel & Resort',
            villas: 'Villa & Apartemen',
            gyms: 'Gym & Fitness',
            homes: 'Rumah Pribadi',
            cardTitle: 'Kartu SafePass Indastreet',
            cardDesc: 'Terapis ini membawa kartu identifikasi SafePass Indastreet yang dikeluarkan secara resmi untuk akses ke properti publik dan penginapan.',
            trustTitle: 'Kepercayaan & Profesionalisme',
            trustPoints: [
                'Verifikasi latar belakang lengkap',
                'Pelatihan layanan profesional',
                'Protokol keamanan yang ketat',
                'Bertanggung jawab terhadap waktu',
                'Ulasan pelanggan terverifikasi'
            ],
            serviceExcellence: 'Komitmen Layanan Sempurna',
            serviceExcellenceDesc: 'Terapis SafePass memahami sepenuhnya bahwa layanan yang lancar dari pemesanan hingga akhir pijat adalah suatu keharusan saat menawarkan layanan pijat di tempat publik mana pun, memastikan ulasan puncak untuk hotel, villa, gym, atau rumah. Itulah mengapa Indastreet dipercaya oleh ribuan tempat publik.',
            safetyTitle: 'Komitmen Keamanan',
            safetyDesc: 'Semua terapis SafePass mematuhi protokol keamanan tertinggi, menjaga privasi klien, dan memberikan layanan berkualitas dengan integritas profesional.',
            closeBtn: 'Tutup'
        },
        en: {
            issued: 'Issued:',
            verified: 'Verified to serve in:',
            hotels: 'Hotels & Resorts',
            villas: 'Villas & Apartments',
            gyms: 'Gyms & Fitness Centers',
            homes: 'Private Homes',
            cardTitle: 'Indastreet SafePass Card',
            cardDesc: 'This therapist carries an officially issued Indastreet SafePass identification card for access to public establishments and accommodations.',
            trustTitle: 'Trust & Professionalism',
            trustPoints: [
                'Complete background verification',
                'Professional service training',
                'Strict safety protocols',
                'Time frame responsible',
                'Verified customer reviews'
            ],
            serviceExcellence: 'Service Excellence Commitment',
            serviceExcellenceDesc: 'SafePass therapists understand completely that smooth service from booking to end of massage is a must when offering massage service in any public establishment, ensuring peak reviews for the hotel, villa, gym, or home. That\'s why Indastreet is trusted by 1000s of public places.',
            safetyTitle: 'Safety Commitment',
            safetyDesc: 'All SafePass therapists comply with the highest safety protocols, maintain client privacy, and deliver quality services with professional integrity.',
            closeBtn: 'Close'
        }
    };

    const t = content[chatLang as keyof typeof content] || content.id;
    
    // Format date
    const formattedDate = new Date(safePassIssueDate).toLocaleDateString(chatLang === 'id' ? 'id-ID' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div
            className="fixed inset-0 z-[10001] bg-black bg-opacity-60 flex items-center justify-center p-4 animate-fadeIn"
            onClick={onClose}
        >
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                .animate-slideUp {
                    animation: slideUp 0.3s ease-out;
                }
            `}</style>
            
            <div
                className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header - Orange theme like booking/chat window */}
                <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-t-2xl">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                    
                    <div className="flex items-center gap-3">
                        {/* Therapist Profile Image - Enlarged */}
                        <img
                            src={therapistImage || 'https://via.placeholder.com/80'}
                            alt={therapistName}
                            className="w-16 h-16 rounded-full border-3 border-white object-cover shadow-lg"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80';
                            }}
                        />
                        
                        <div className="flex-1">
                            <h2 className="text-xl font-bold">{therapistName}</h2>
                            <p className="text-orange-100 text-sm flex items-center gap-1">
                                <Shield size={16} />
                                {t.issued} {formattedDate}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content - White background, orange accents */}
                <div className="p-6 space-y-6 bg-white">
                    {/* SafePass Card Image */}
                    <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-200">
                        <img
                            src="https://ik.imagekit.io/7grri5v7d/hotel%205.png"
                            alt="SafePass Card"
                            className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                            loading="lazy"
                        />
                    </div>

                    {/* Verified Services - Custom Images */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Check className="text-gray-700" size={24} />
                            {t.verified}
                        </h3>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg border-2 border-gray-200">
                                <img 
                                    src="https://ik.imagekit.io/7grri5v7d/hotel%201.png" 
                                    alt="Hotel"
                                    className="w-12 h-12 object-contain"
                                />
                                <span className="font-semibold text-gray-900 text-center text-sm">{t.hotels}</span>
                            </div>
                            
                            <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg border-2 border-gray-200">
                                <img 
                                    src="https://ik.imagekit.io/7grri5v7d/hotel%202.png" 
                                    alt="Villa"
                                    className="w-12 h-12 object-contain"
                                />
                                <span className="font-semibold text-gray-900 text-center text-sm">{t.villas}</span>
                            </div>
                            
                            <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg border-2 border-gray-200">
                                <img 
                                    src="https://ik.imagekit.io/7grri5v7d/hotel%203.png" 
                                    alt="Gym"
                                    className="w-12 h-12 object-contain"
                                />
                                <span className="font-semibold text-gray-900 text-center text-sm">{t.gyms}</span>
                            </div>
                            
                            <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg border-2 border-gray-200">
                                <img 
                                    src="https://ik.imagekit.io/7grri5v7d/hotel%204.png" 
                                    alt="Home"
                                    className="w-12 h-12 object-contain"
                                />
                                <span className="font-semibold text-gray-900 text-center text-sm">{t.homes}</span>
                            </div>
                        </div>
                    </div>

                    {/* SafePass Card Info - Orange accent */}
                    <div className="bg-orange-50 rounded-xl p-5 border border-orange-200">
                        <h3 className="text-lg font-bold text-orange-900 mb-3">{t.cardTitle}</h3>
                        <p className="text-gray-700 leading-relaxed">
                            {t.cardDesc}
                        </p>
                    </div>

                    {/* Trust & Professionalism */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">{t.trustTitle}</h3>
                        <ul className="space-y-3">
                            {t.trustPoints.map((point, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <Check className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
                                    <span className="text-gray-700">{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Service Excellence Commitment */}
                    <div className="bg-orange-50 rounded-xl p-5 border border-orange-200">
                        <h3 className="text-lg font-bold text-orange-900 mb-3">{t.serviceExcellence}</h3>
                        <p className="text-gray-700 leading-relaxed">
                            {t.serviceExcellenceDesc}
                        </p>
                    </div>

                    {/* Safety Commitment */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <img 
                                src="https://ik.imagekit.io/7grri5v7d/verified-removebg-preview.png?updatedAt=1768015154565" 
                                alt="Verified"
                                className="w-6 h-6 object-contain"
                            />
                            {t.safetyTitle}
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                            {t.safetyDesc}
                        </p>
                    </div>

                    {/* Close Button - Orange theme */}
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
                    >
                        {t.closeBtn}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SafePassModal;
