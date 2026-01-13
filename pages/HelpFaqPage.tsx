import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import UniversalHeader from '../components/shared/UniversalHeader';
import { AppDrawer } from '../components/AppDrawerClean';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import FloatingPageFooter from '../components/FloatingPageFooter';

interface HelpFaqPageProps {
    t: any;
    language?: 'en' | 'id';
    onNavigate?: (page: string) => void;
}

const HelpFaqPage: React.FC<HelpFaqPageProps> = ({ t, language, onNavigate }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const faqs = [
        {
            question: language === 'id' ? 'Bagaimana cara booking terapis?' : 'How do I book a therapist?',
            answer: language === 'id' 
                ? 'Pilih terapis dari daftar, klik "Book Now", pilih waktu dan lokasi, lalu konfirmasi booking Anda.' 
                : 'Select a therapist from the list, click "Book Now", choose your time and location, then confirm your booking.'
        },
        {
            question: language === 'id' ? 'Apakah semua terapis sudah diverifikasi?' : 'Are all therapists verified?',
            answer: language === 'id'
                ? 'Ya, semua terapis telah melalui proses verifikasi ketat termasuk pemeriksaan latar belakang, sertifikasi, dan pelatihan.'
                : 'Yes, all therapists have gone through a strict verification process including background checks, certifications, and training.'
        },
        {
            question: language === 'id' ? 'Bagaimana cara membayar?' : 'How do I pay?',
            answer: language === 'id'
                ? 'Kami menerima pembayaran tunai, transfer bank, dan e-wallet seperti GoPay, OVO, dan Dana.'
                : 'We accept cash, bank transfer, and e-wallets like GoPay, OVO, and Dana.'
        },
        {
            question: language === 'id' ? 'Apakah saya bisa memilih terapis wanita?' : 'Can I choose a female therapist?',
            answer: language === 'id'
                ? 'Ya, Anda bisa menggunakan filter gender untuk memilih terapis wanita. Gunakan tombol filter di sidebar atau halaman pencarian lanjutan.'
                : 'Yes, you can use the gender filter to choose a female therapist. Use the filter button in the sidebar or advanced search page.'
        },
        {
            question: language === 'id' ? 'Bagaimana jika saya perlu membatalkan booking?' : 'What if I need to cancel my booking?',
            answer: language === 'id'
                ? 'Anda dapat membatalkan booking hingga 2 jam sebelum jadwal tanpa biaya pembatalan. Untuk pembatalan kurang dari 2 jam, akan dikenakan biaya 25%.'
                : 'You can cancel your booking up to 2 hours before the scheduled time without cancellation fees. Cancellations less than 2 hours will incur a 25% fee.'
        },
        {
            question: language === 'id' ? 'Apakah ada GPS tracking untuk keamanan?' : 'Is there GPS tracking for safety?',
            answer: language === 'id'
                ? 'Ya, semua booking dilengkapi dengan GPS tracking real-time untuk keamanan Anda dan terapis.'
                : 'Yes, all bookings come with real-time GPS tracking for your safety and the therapist\'s safety.'
        },
        {
            question: language === 'id' ? 'Berapa lama durasi sesi pijat?' : 'How long is a massage session?',
            answer: language === 'id'
                ? 'Durasi standar adalah 60 menit, tapi Anda bisa memilih 90 atau 120 menit saat booking.'
                : 'The standard duration is 60 minutes, but you can choose 90 or 120 minutes when booking.'
        },
        {
            question: language === 'id' ? 'Apakah terapis bisa datang ke hotel saya?' : 'Can therapists come to my hotel?',
            answer: language === 'id'
                ? 'Ya, hampir semua terapis menyediakan layanan mobile dan bisa datang ke hotel, villa, atau rumah Anda.'
                : 'Yes, nearly all therapists provide mobile services and can come to your hotel, villa, or home.'
        },
        {
            question: language === 'id' ? 'Bagaimana cara memberikan tip?' : 'How do I give tips?',
            answer: language === 'id'
                ? 'Tip diberikan langsung kepada terapis dalam bentuk tunai. Tip tidak wajib tapi sangat dihargai.'
                : 'Tips are given directly to the therapist in cash. Tipping is not mandatory but greatly appreciated.'
        },
        {
            question: language === 'id' ? 'Apa yang terjadi jika terapis terlambat?' : 'What happens if the therapist is late?',
            answer: language === 'id'
                ? 'Jika terapis terlambat lebih dari 15 menit, Anda berhak mendapat kompensasi atau membatalkan tanpa biaya.'
                : 'If the therapist is more than 15 minutes late, you are entitled to compensation or can cancel without fees.'
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Universal Header */}
            <UniversalHeader 
                language={language || 'en'}
                onLanguageChange={() => {}}
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
                        {language === 'id' ? 'Bantuan & FAQ' : 'Help & FAQ'}
                    </h2>
                    <p className="text-sm text-gray-600 mt-2">
                        {language === 'id' ? 'Temukan jawaban untuk pertanyaan umum' : 'Find answers to frequently asked questions'}
                    </p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <div className="space-y-3">
                        {faqs.map((faq, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    className="w-full px-5 py-4 text-left flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                                >
                                    <span className="font-medium text-gray-900">{faq.question}</span>
                                    <span className={`text-gray-500 transition-transform ${openFaq === index ? 'rotate-180' : ''}`}>
                                        ▼
                                    </span>
                                </button>
                                {openFaq === index && (
                                    <div className="px-5 py-4 bg-gray-50 border-t border-gray-200">
                                        <p className="text-gray-700">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <FloatingPageFooter 
                currentLanguage={language || 'en'}
                onNavigate={onNavigate}
            />

            {/* App Drawer */}
            <AppDrawer
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onNavigate={onNavigate || (() => {})}
                currentLanguage={language || 'en'}
                onLanguageChange={() => {}}
            />
        </div>
    );
};

export default HelpFaqPage;
