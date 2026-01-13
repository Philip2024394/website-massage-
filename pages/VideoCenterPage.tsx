import React, { useState } from 'react';
import { ArrowLeft, Play, X } from 'lucide-react';
import UniversalHeader from '../components/shared/UniversalHeader';
import { AppDrawer } from '../components/AppDrawerClean';
import FloatingPageFooter from '../components/FloatingPageFooter';

interface Video {
    id: string;
    title: string;
    youtubeId: string;
    description?: string;
    info?: string;
    hashtags?: string;
}

interface VideoCenterPageProps {
    t: any;
    language?: 'en' | 'id';
    onNavigate?: (page: string) => void;
}

const VideoCenterPage: React.FC<VideoCenterPageProps> = ({ t, language = 'en', onNavigate }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState<'en' | 'id'>(language);
    const [enlargedVideo, setEnlargedVideo] = useState<Video | null>(null);

    const handleLanguageChange = (newLang: string) => {
        setCurrentLanguage(newLang as 'en' | 'id');
        console.log('Language changed to:', newLang);
    };

    // Translation object
    const translations = {
        en: {
            title: 'Video Center',
            subtitle: 'Watch & Learn About Our Services',
            heroTitle: 'Massage Tutorial & Information Videos',
            heroSubtitle: 'Learn massage techniques and discover our services',
            close: 'Close',
        },
        id: {
            title: 'Pusat Video',
            subtitle: 'Tonton & Pelajari Layanan Kami',
            heroTitle: 'Video Tutorial & Informasi Pijat',
            heroSubtitle: 'Pelajari teknik pijat dan temukan layanan kami',
            close: 'Tutup',
        }
    };

    const currentTrans = translations[currentLanguage];

    // Video data - You can add YouTube video IDs here
    const videos: Video[] = [
        {
            id: '1',
            title: currentLanguage === 'en' ? 'Indastreet Intro Massage' : 'Pengenalan Pijat Indastreet',
            youtubeId: 'iEmxdXdgrD8',
            description: currentLanguage === 'en' ? 'Welcome to Indastreet - Your trusted massage platform' : 'Selamat datang di Indastreet - Platform pijat terpercaya Anda',
            info: currentLanguage === 'en' ? 'Discover Indonesia\'s premier massage booking platform connecting professional therapists with clients across the archipelago.' : 'Temukan platform pemesanan pijat terkemuka Indonesia yang menghubungkan terapis profesional dengan klien di seluruh nusantara.',
            hashtags: '#IndastreetMassage #IndonesiaMassage #MassageTherapy #WellnessIndonesia #MassagePlatform'
        },
        {
            id: '2',
            title: currentLanguage === 'en' ? 'Hot Stone Massage' : 'Pijat Batu Panas',
            youtubeId: 'ivSIP_1D_Yg',
            description: currentLanguage === 'en' ? 'Experience the relaxing hot stone massage therapy' : 'Rasakan terapi pijat batu panas yang menenangkan',
            info: currentLanguage === 'en' ? 'Hot stone massage combines heated volcanic stones with therapeutic massage techniques to release muscle tension and promote deep relaxation.' : 'Pijat batu panas menggabungkan batu vulkanik yang dipanaskan dengan teknik pijat terapeutik untuk melepaskan ketegangan otot dan meningkatkan relaksasi mendalam.',
            hashtags: '#HotStoneMassage #PijatBatuPanas #BaliMassage #SpaTreatment #RelaxationTherapy #IndonesiaSpa'
        },
        {
            id: '3',
            title: currentLanguage === 'en' ? 'Shirodhara Traditional Ayurvedic Therapeutic Massage' : 'Pijat Terapeutik Ayurveda Tradisional Shirodhara',
            youtubeId: 'k7GCjPY1CbU',
            description: currentLanguage === 'en' ? 'Ancient Ayurvedic therapy for deep relaxation' : 'Terapi Ayurveda kuno untuk relaksasi mendalam',
            info: currentLanguage === 'en' ? 'Shirodhara is an ancient Ayurvedic healing practice where warm oil is poured in a continuous stream over the forehead, calming the mind and nervous system.' : 'Shirodhara adalah praktik penyembuhan Ayurveda kuno di mana minyak hangat dituangkan secara terus menerus di atas dahi, menenangkan pikiran dan sistem saraf.',
            hashtags: '#Shirodhara #AyurvedicMassage #HolisticHealing #AyurvedaIndonesia #WellnessTherapy #MindBodyBalance'
        },
        {
            id: '4',
            title: currentLanguage === 'en' ? 'Traditional Coin Rub Indonesia' : 'Kerokan Tradisional Indonesia',
            youtubeId: 'YME2QSl7h5M',
            description: currentLanguage === 'en' ? 'Traditional Indonesian coin rubbing therapy technique' : 'Teknik terapi kerokan tradisional Indonesia',
            info: currentLanguage === 'en' ? 'Kerokan is a traditional Indonesian healing technique using a coin to rub the skin, promoting blood circulation and releasing toxins from the body.' : 'Kerokan adalah teknik penyembuhan tradisional Indonesia menggunakan koin untuk menggosok kulit, meningkatkan sirkulasi darah dan melepaskan racun dari tubuh.',
            hashtags: '#Kerokan #IndonesianMassage #TraditionalHealing #CoinRubbing #IndonesianTherapy #HerbalMedicine'
        },
        {
            id: '5',
            title: currentLanguage === 'en' ? 'Indonesia Facial Massage' : 'Pijat Wajah Indonesia',
            youtubeId: 'NBlOGh0UCuc',
            description: currentLanguage === 'en' ? 'Traditional Indonesian facial massage techniques for natural beauty' : 'Teknik pijat wajah tradisional Indonesia untuk kecantikan alami',
            info: currentLanguage === 'en' ? 'Indonesian facial massage uses gentle pressure points and natural techniques to improve skin tone, reduce wrinkles, and promote a youthful, glowing complexion.' : 'Pijat wajah Indonesia menggunakan titik tekanan lembut dan teknik alami untuk meningkatkan warna kulit, mengurangi kerutan, dan meningkatkan kulit yang awet muda dan bercahaya.',
            hashtags: '#FacialMassage #PijatWajah #IndonesianBeauty #NaturalSkincare #FacialTherapy #AntiAging'
        }
    ];

    const handleVideoClick = (video: Video) => {
        setEnlargedVideo(video);
    };

    const closeEnlargedVideo = () => {
        setEnlargedVideo(null);
    };

    return (
        <div className="min-h-screen bg-white w-full max-w-[100vw] overflow-x-hidden">
            {/* Universal Header */}
            <UniversalHeader 
                language={currentLanguage}
                onLanguageChange={handleLanguageChange}
                onMenuClick={() => setIsMenuOpen(true)}
            />

            {/* Main Content */}
            <div className="pt-[60px] px-3 sm:px-4 pb-8">
                <div className="max-w-6xl mx-auto">
                    {/* Back Arrow Button */}
                    <button
                        onClick={() => onNavigate?.('home')}
                        className="mt-5 mb-4 ml-2 w-12 h-12 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 will-change-transform"
                        title="Back to Home"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>

                    {/* Hero Section */}
                    <div className="relative bg-gradient-to-br from-orange-50 via-white to-purple-50 py-12 rounded-2xl mb-8">
                        <div className="flex flex-col justify-center items-center px-4 text-center">
                    <img 
                        src="https://ik.imagekit.io/7grri5v7d/indastreet%20massage%20logo.png?updatedAt=1764533351258"
                        alt="Indastreet Massage"
                        className="w-48 h-48 object-contain mb-6"
                    />
                    <h1 className="text-4xl font-bold mb-2 text-gray-900">{currentTrans.heroTitle}</h1>
                    <p className="text-lg text-gray-600 mb-4">{currentTrans.heroSubtitle}</p>
                            <Play className="mt-2 w-16 h-16 text-orange-500" />
                        </div>
                    </div>

                    {/* Video Section Title */}
                    <div className="mb-6 text-center">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">{currentTrans.subtitle}</h2>
                    </div>

                    {/* Video Grid - 2 per row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-24">
                    {videos.map((video) => (
                        <div 
                            key={video.id}
                            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
                            onClick={() => handleVideoClick(video)}
                        >
                            {/* Video Thumbnail */}
                            <div className="relative aspect-video bg-gray-900">
                                <iframe
                                    className="w-full h-full"
                                    src={`https://www.youtube.com/embed/${video.youtubeId}`}
                                    title={video.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    loading="lazy"
                                ></iframe>
                                <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                                    <div className="bg-red-600 rounded-full p-4 opacity-90">
                                        <Play className="w-8 h-8 text-white" fill="white" />
                                    </div>
                                </div>
                            </div>

                            {/* Video Info */}
                            <div className="p-4">
                                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                                    {video.title}
                                </h3>
                                {video.description && (
                                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                        {video.description}
                                    </p>
                                )}
                                {video.info && (
                                    <p className="text-xs text-gray-500 mb-3 line-clamp-3 leading-relaxed">
                                        {video.info}
                                    </p>
                                )}
                                {video.hashtags && (
                                    <p className="text-xs text-red-600 font-medium mt-2">
                                        {video.hashtags}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                    </div>
                </div>
            </div>

            {/* Enlarged Video Modal */}
            {enlargedVideo && (
                <div 
                    className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
                    onClick={closeEnlargedVideo}
                >
                    <div 
                        className="relative w-full max-w-6xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={closeEnlargedVideo}
                            className="absolute -top-12 right-0 text-white hover:text-red-500 transition-colors flex items-center gap-2 bg-black/50 px-4 py-2 rounded-lg"
                        >
                            <X className="w-6 h-6" />
                            <span>{currentTrans.close}</span>
                        </button>

                        {/* Video Title */}
                        <div className="mb-4 text-white">
                            <h2 className="text-2xl font-bold">{enlargedVideo.title}</h2>
                            {enlargedVideo.description && (
                                <p className="text-gray-300 mt-2">{enlargedVideo.description}</p>
                            )}
                        </div>

                        {/* Enlarged Video */}
                        <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
                            <iframe
                                className="w-full h-full"
                                src={`https://www.youtube.com/embed/${enlargedVideo.youtubeId}?autoplay=1`}
                                title={enlargedVideo.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Footer */}
            <div>
                <FloatingPageFooter 
                    onNavigate={onNavigate}
                />
            </div>

            {/* App Drawer */}
            <AppDrawer
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onNavigate={(page) => {
                    setIsMenuOpen(false);
                    onNavigate?.(page);
                }}
                language={currentLanguage}
            />
        </div>
    );
};

export default VideoCenterPage;
