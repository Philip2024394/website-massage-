// Video Center – Massage Tutorial & Information Videos (jobs-posting theme)
import React, { useState } from 'react';
import { Play, X } from 'lucide-react';
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
    };

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

    const handleVideoClick = (video: Video) => setEnlargedVideo(video);
    const closeEnlargedVideo = () => setEnlargedVideo(null);

    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-white w-full max-w-full">
            <UniversalHeader
                language={currentLanguage}
                onLanguageChange={handleLanguageChange}
                onMenuClick={() => setIsMenuOpen(true)}
            />

            <div className="pt-[60px] px-3 sm:px-4 pb-8">
                <div className="max-w-6xl mx-auto">
                    {/* Hero – white, jobs theme: accent line + slate typography */}
                    <div className="relative border-b border-slate-200/80 pb-8 mb-8">
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-orange-400/60 to-transparent" aria-hidden />
                        <div className="flex flex-col items-center px-4 text-center pt-4">
                            <img
                                src="https://ik.imagekit.io/7grri5v7d/indastreet%20massage%20logo.png?updatedAt=1764533351258"
                                alt="Indastreet Massage"
                                className="w-32 h-32 sm:w-40 sm:h-40 object-contain mb-4"
                            />
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                                {currentTrans.heroTitle}
                            </h1>
                            <p className="text-base sm:text-lg text-slate-600 max-w-xl">
                                {currentTrans.heroSubtitle}
                            </p>
                        </div>
                    </div>

                    {/* Section label – jobs style */}
                    <div className="mb-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                            {currentTrans.subtitle}
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            {videos.length} {currentLanguage === 'en' ? 'videos' : 'video'}
                        </p>
                    </div>

                    {/* Video grid – job-card style: white cards, rounded-[20px], border-slate-200 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
                        {videos.map((video) => (
                            <button
                                key={video.id}
                                type="button"
                                className="group w-full text-left bg-white rounded-[20px] border border-slate-200/80 shadow-sm overflow-hidden hover:shadow-lg hover:border-slate-300/80 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
                                onClick={() => handleVideoClick(video)}
                            >
                                <div className="relative aspect-video rounded-t-[20px] overflow-hidden bg-slate-100">
                                    <iframe
                                        className="w-full h-full pointer-events-none"
                                        src={`https://www.youtube.com/embed/${video.youtubeId}`}
                                        title={video.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none">
                                        <span className="w-14 h-14 rounded-full bg-white/95 shadow-lg flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                            <Play className="w-7 h-7 ml-0.5" fill="currentColor" />
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
                                        {video.title}
                                    </h3>
                                    {video.description && (
                                        <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                                            {video.description}
                                        </p>
                                    )}
                                    {video.info && (
                                        <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                                            {video.info}
                                        </p>
                                    )}
                                    {video.hashtags && (
                                        <p className="text-xs text-orange-600 font-medium mt-3 truncate">
                                            {video.hashtags}
                                        </p>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal – dark overlay, inner content white/slate for consistency */}
            {enlargedVideo && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={closeEnlargedVideo}
                >
                    <div
                        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 sm:p-6 border-b border-slate-200/80 flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                                    {enlargedVideo.title}
                                </h2>
                                {enlargedVideo.description && (
                                    <p className="text-sm text-slate-600 mt-1">
                                        {enlargedVideo.description}
                                    </p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={closeEnlargedVideo}
                                className="flex-shrink-0 p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                aria-label={currentTrans.close}
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="relative aspect-video bg-black">
                            <iframe
                                className="w-full h-full"
                                src={`https://www.youtube.com/embed/${enlargedVideo.youtubeId}?autoplay=1`}
                                title={enlargedVideo.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    </div>
                </div>
            )}

            <FloatingPageFooter onNavigate={onNavigate} />

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
