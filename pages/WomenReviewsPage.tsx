import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import UniversalHeader from '../components/shared/UniversalHeader';
import { AppDrawer } from '../components/AppDrawerClean';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import FloatingPageFooter from '../components/FloatingPageFooter';

interface WomenReviewsPageProps {
    t: any;
    language?: 'en' | 'id';
    onNavigate?: (page: string) => void;
}

const WomenReviewsPage: React.FC<WomenReviewsPageProps> = ({ t, language, onNavigate }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState<'en' | 'id'>(language || 'en');

    const handleLanguageChange = (newLang: string) => {
        setCurrentLanguage(newLang as 'en' | 'id');
        console.log('Language changed to:', newLang);
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Universal Header */}
            <UniversalHeader 
                language={currentLanguage}
                onLanguageChange={handleLanguageChange}
                onMenuClick={() => setIsMenuOpen(true)}
            />

            <div className="max-w-4xl mx-auto px-4 py-8 pt-20">
                {/* Back Arrow */}
                <button
                    onClick={() => onNavigate?.('home')}
                    className="mb-6 ml-2 w-12 h-12 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 will-change-transform"
                    title="Back to Home"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                
                <div className="text-center mb-8 -mt-10">
                    <img 
                        src="https://ik.imagekit.io/7grri5v7d/indastreet%20massage%20logo.png?updatedAt=1764533351258" 
                        alt="IndaStreet Massage Logo" 
                        className="w-60 h-60 object-contain mx-auto mb-4"
                    />
                    <h2 className="text-2xl font-bold text-gray-900">
                        {currentLanguage === 'id' ? 'Ulasan Terbaru' : 'Latest Reviews'}
                    </h2>
                    <p className="text-sm text-gray-600 mt-2">
                        {currentLanguage === 'id' ? 'Pelanggan Kami Bicara Terbaik' : 'Our Customers Say It Best'}
                    </p>
                </div>

                    {/* Testimonials Grid */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Sarah - Therapist */}
                        <div className="bg-white rounded-xl p-5 border border-gray-200">
                            <div className="flex items-start gap-3 mb-3">
                                <img 
                                    src="https://ik.imagekit.io/7grri5v7d/avatar%2016.png?updatedAt=1764959984734"
                                    alt="Sarah Avatar"
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div>
                                    <h4 className="font-semibold text-gray-900">Sarah, Therapist</h4>
                                    <p className="text-sm text-gray-600">Ubud, Bali</p>
                                </div>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">
                                {currentLanguage === 'id' 
                                    ? '"Sebagai ibu tunggal, platform ini mengubah hidup saya. Saya bisa mengatur jam kerja sendiri dan mendapat penghasilan yang stabil. Klien wanita saya merasa aman karena ada verifikasi dan GPS tracking."'
                                    : '"As a single mother, this platform changed my life. I can set my own hours and earn a stable income. My female clients feel safe because of verification and GPS tracking."'
                                }
                            </p>
                            <div className="mt-3 flex items-center gap-2">
                                <span className="text-yellow-500 text-sm">⭐⭐⭐⭐⭐</span>
                                <span className="text-xs text-gray-500">
                                    {currentLanguage === 'id' ? '500+ booking berhasil' : '500+ successful bookings'}
                                </span>
                            </div>
                        </div>

                        {/* Winda - Client */}
                        <div className="bg-white rounded-xl p-5 border border-gray-200">
                            <div className="flex items-start gap-3 mb-3">
                                <img 
                                    src="https://ik.imagekit.io/7grri5v7d/avatar%2014.png?updatedAt=1764959919170"
                                    alt="Winda Avatar"
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div>
                                    <h4 className="font-semibold text-gray-900">Winda, Client</h4>
                                    <p className="text-sm text-gray-600">Seminyak, Bali</p>
                                </div>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">
                                {currentLanguage === 'id'
                                    ? '"Saya sangat suka bisa memilih terapis wanita! Aplikasinya sangat mudah digunakan dan saya merasa lebih nyaman dengan pilihan ini. Pelayanannya profesional dan harga transparan."'
                                    : '"I love being able to choose a female therapist! The app is so easy to use and I feel much more comfortable with this option. The service is professional and prices are transparent."'
                                }
                            </p>
                            <div className="mt-3 flex items-center gap-2">
                                <span className="text-yellow-500 text-sm">⭐⭐⭐⭐⭐</span>
                                <span className="text-xs text-gray-500">
                                    {currentLanguage === 'id' ? 'Pelanggan reguler' : 'Regular customer'}
                                </span>
                            </div>
                        </div>

                        {/* Ela - Therapist */}
                        <div className="bg-white rounded-xl p-5 border border-gray-200">
                            <div className="flex items-start gap-3 mb-3">
                                <img 
                                    src="https://ik.imagekit.io/7grri5v7d/avatar%2012.png?updatedAt=1764959860098"
                                    alt="Ela Avatar"
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div>
                                    <h4 className="font-semibold text-gray-900">Ela, Therapist</h4>
                                    <p className="text-sm text-gray-600">Canggu, Bali</p>
                                </div>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">
                                {currentLanguage === 'id'
                                    ? '"Fitur keamanannya luar biasa! GPS tracking membuat keluarga saya tenang, dan sistem verifikasi memastikan klien saya juga orang yang terpercaya. Saya merasa aman bekerja di mana saja."'
                                    : '"The safety features are amazing! GPS tracking gives my family peace of mind, and the verification system ensures my clients are trustworthy too. I feel safe working anywhere."'
                                }
                            </p>
                            <div className="mt-3 flex items-center gap-2">
                                <span className="text-yellow-500 text-sm">⭐⭐⭐⭐⭐</span>
                                <span className="text-xs text-gray-500">
                                    {currentLanguage === 'id' ? '800+ booking berhasil' : '800+ successful bookings'}
                                </span>
                            </div>
                        </div>

                        {/* Jessica - Client */}
                        <div className="bg-white rounded-xl p-5 border border-gray-200">
                            <div className="flex items-start gap-3 mb-3">
                                <img 
                                    src="https://ik.imagekit.io/7grri5v7d/avatar%202.png?updatedAt=1764959549336"
                                    alt="Jessica Avatar"
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div>
                                    <h4 className="font-semibold text-gray-900">Jessica, Client</h4>
                                    <p className="text-sm text-gray-600">
                                        {currentLanguage === 'id' ? 'Australia, Sedang hamil' : 'Australia, Pregnant'}
                                    </p>
                                </div>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">
                                {currentLanguage === 'id'
                                    ? '"Sebagai wisatawan hamil, saya khawatir untuk booking pijat. Tapi sistem review dan verifikasi di sini membuat saya percaya diri. Terapis wanita yang saya pilih sangat berpengalaman dengan prenatal massage!"'
                                    : '"As a pregnant traveler, I was worried about booking a massage. But the review and verification system here gave me confidence. The female therapist I chose was so experienced with prenatal massage!"'
                                }
                            </p>
                            <div className="mt-3 flex items-center gap-2">
                                <span className="text-yellow-500 text-sm">⭐⭐⭐⭐⭐</span>
                                <span className="text-xs text-gray-500">
                                    {currentLanguage === 'id' ? 'Pengalaman luar biasa' : 'Amazing experience'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                            {currentLanguage === 'id' ? 'Mengapa Wanita Memilih Kami' : 'Why Women Choose Us'}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 flex items-center justify-center mb-3">
                                    <img 
                                        src="https://ik.imagekit.io/7grri5v7d/verified-removebg-preview.png?updatedAt=1768015154565"
                                        alt="Verified"
                                        className="w-16 h-16 object-contain"
                                    />
                                </div>
                                <p className="text-sm font-medium text-gray-900 text-center">
                                    {currentLanguage === 'id' ? 'Terapis Terverifikasi' : 'Verified Therapists'}
                                </p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-32 h-16 flex items-center justify-center mb-3">
                                    <img 
                                        src="https://ik.imagekit.io/7grri5v7d/satalite-removebg-preview.png"
                                        alt="GPS Tracking"
                                        className="w-32 h-32 object-contain"
                                    />
                                </div>
                                <p className="text-sm font-medium text-gray-900 text-center">
                                    {currentLanguage === 'id' ? 'GPS Tracking' : 'GPS Tracking'}
                                </p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 flex items-center justify-center mb-3">
                                    <img 
                                        src="https://ik.imagekit.io/7grri5v7d/reviews%20icon.png"
                                        alt="Real Reviews"
                                        className="w-16 h-16 object-contain"
                                    />
                                </div>
                                <p className="text-sm font-medium text-gray-900 text-center">
                                    {currentLanguage === 'id' ? 'Review Asli' : 'Real Reviews'}
                                </p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 flex items-center justify-center mb-3">
                                    <img 
                                        src="https://ik.imagekit.io/7grri5v7d/reviews%20icons.png"
                                        alt="Female Therapist"
                                        className="w-16 h-16 object-contain"
                                    />
                                </div>
                                <p className="text-sm font-medium text-gray-900 text-center">
                                    {currentLanguage === 'id' ? 'Pilihan Terapis Wanita' : 'Female Therapist Options'}
                                </p>
                            </div>
                        </div>
                    </div>
            </div>

            {/* Footer */}
            <div className="mt-16">
                <FloatingPageFooter 
                    currentLanguage={currentLanguage}
                    onNavigate={onNavigate}
                />
            </div>

            {/* App Drawer */}
            <AppDrawer
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onNavigate={onNavigate || (() => {})}
                currentLanguage={currentLanguage}
            />
        </div>
    );
};

export default WomenReviewsPage;
