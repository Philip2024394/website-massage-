// Latest Reviews – shows therapist / massage place / skin care clinic per review, View profile button, and moderation disclaimer
import React, { useState, useEffect, useMemo } from 'react';
import { Star, ExternalLink } from 'lucide-react';
import UniversalHeader from '../components/shared/UniversalHeader';
import { AppDrawer } from '../components/AppDrawerClean';
import FloatingPageFooter from '../components/FloatingPageFooter';
import { reviewService } from '../lib/appwriteService';
import { therapistService, placesService } from '../lib/appwriteService';

interface WomenReviewsPageProps {
  t: any;
  language?: 'en' | 'id';
  onNavigate?: (page: string) => void;
  onSelectTherapist?: (therapist: any) => void;
  onSelectPlace?: (place: any) => void;
  therapists?: any[];
  places?: any[];
  facialPlaces?: any[];
}

const REVIEW_AVATARS = [
  'https://ik.imagekit.io/7grri5v7d/avatar%201.png',
  'https://ik.imagekit.io/7grri5v7d/avatar%202.png',
  'https://ik.imagekit.io/7grri5v7d/avatar%203.png',
  'https://ik.imagekit.io/7grri5v7d/avatar%204.png',
  'https://ik.imagekit.io/7grri5v7d/avatar%206.png',
  'https://ik.imagekit.io/7grri5v7d/avatar%207.png',
  'https://ik.imagekit.io/7grri5v7d/avatar%208.png',
  'https://ik.imagekit.io/7grri5v7d/avatar%209.png',
  'https://ik.imagekit.io/7grri5v7d/avatar%2010.png',
  'https://ik.imagekit.io/7grri5v7d/avatar%2011.png',
  'https://ik.imagekit.io/7grri5v7d/avatar%2012.png',
  'https://ik.imagekit.io/7grri5v7d/avatar%2013.png',
  'https://ik.imagekit.io/7grri5v7d/avatar%2014.png',
  'https://ik.imagekit.io/7grri5v7d/avatar%2015.png',
  'https://ik.imagekit.io/7grri5v7d/avatar%2016.png',
  'https://ik.imagekit.io/7grri5v7d/avatar%2017.png',
  'https://ik.imagekit.io/7grri5v7d/avatar%2018.png',
];

/** Realistic mock reviews shown until real reviews exist. Bilingual content. */
const MOCK_REVIEWS: Array<{
  id: string;
  userName: string;
  rating: number;
  textEn: string;
  textId: string;
  providerName: string;
  providerType: 'therapist' | 'place' | 'facial-place';
  reviewDate: string;
  avatarIndex: number;
}> = [
  {
    id: 'mock-1',
    userName: 'Dewi S.',
    rating: 5,
    textEn: 'Booked a 90-minute massage at my villa in Seminyak. The therapist was on time, professional and the pressure was perfect. Will definitely use IndaStreet again.',
    textId: 'Pesan pijat 90 menit di villa saya di Seminyak. Terapis tepat waktu, profesional dan tekanannya pas. Pasti akan pakai IndaStreet lagi.',
    providerName: 'Putu Wijaya',
    providerType: 'therapist',
    reviewDate: '2025-01-08',
    avatarIndex: 13,
  },
  {
    id: 'mock-2',
    userName: 'James T.',
    rating: 5,
    textEn: 'First time trying a massage place from the app. Clean room, friendly staff and the traditional massage was exactly what I needed after a long flight.',
    textId: 'Pertama kali coba tempat pijat dari aplikasi. Ruangan bersih, staf ramah dan pijat tradisionalnya persis yang saya butuhkan setelah penerbangan panjang.',
    providerName: 'Bali Relax Spa',
    providerType: 'place',
    reviewDate: '2025-01-07',
    avatarIndex: 2,
  },
  {
    id: 'mock-3',
    userName: 'Siti R.',
    rating: 5,
    textEn: 'I requested a female therapist and got one without any hassle. She was very skilled and made me feel comfortable. Great experience.',
    textId: 'Saya minta terapis wanita dan dapat tanpa ribet. Terapisnya sangat terampil dan membuat saya nyaman. Pengalaman yang bagus.',
    providerName: 'Ni Luh Ketut',
    providerType: 'therapist',
    reviewDate: '2025-01-06',
    avatarIndex: 15,
  },
  {
    id: 'mock-4',
    userName: 'Michelle L.',
    rating: 4,
    textEn: 'Facial treatment was relaxing and my skin felt really soft afterwards. The clinic was easy to find. Only minor wait for the appointment.',
    textId: 'Perawatan wajahnya menenangkan dan kulit saya terasa sangat halus setelahnya. Kliniknya mudah ditemukan. Hanya tunggu sedikit untuk janji.',
    providerName: 'Glow Skin Care',
    providerType: 'facial-place',
    reviewDate: '2025-01-05',
    avatarIndex: 5,
  },
  {
    id: 'mock-5',
    userName: 'Budi H.',
    rating: 5,
    textEn: 'Hotel massage in Ubud—came to my room as scheduled. Very professional, brought own equipment. Price was clear from the start. Recommended.',
    textId: 'Pijat hotel di Ubud—datang ke kamar saya sesuai jadwal. Sangat profesional, bawa peralatan sendiri. Harga jelas dari awal. Direkomendasikan.',
    providerName: 'Komang Adi',
    providerType: 'therapist',
    reviewDate: '2025-01-04',
    avatarIndex: 7,
  },
  {
    id: 'mock-6',
    userName: 'Emma W.',
    rating: 5,
    textEn: 'Our whole group booked therapists for an afternoon at the villa. Everyone was happy with their massage. Booking and payment were straightforward.',
    textId: 'Seluruh grup kami memesan terapis untuk sore di villa. Semua puas dengan pijatannya. Pemesanan dan pembayaran mudah.',
    providerName: 'Canggu Wellness Studio',
    providerType: 'place',
    reviewDate: '2025-01-03',
    avatarIndex: 10,
  },
  {
    id: 'mock-7',
    userName: 'Ahmad F.',
    rating: 5,
    textEn: 'Needed a deep tissue massage after surfing. Found a great therapist on IndaStreet, came to my guesthouse. Exactly what I needed.',
    textId: 'Butuh pijat deep tissue setelah berselancar. Nemuin terapis bagus di IndaStreet, datang ke guesthouse saya. Persis yang saya butuhkan.',
    providerName: 'Made Surya',
    providerType: 'therapist',
    reviewDate: '2025-01-02',
    avatarIndex: 1,
  },
  {
    id: 'mock-8',
    userName: 'Linda K.',
    rating: 5,
    textEn: 'I was nervous about booking a massage as a solo female traveller. The verification and option to choose a female therapist put my mind at ease. Thank you!',
    textId: 'Saya nervous pesan pijat sebagai wisatawan wanita solo. Verifikasi dan opsi pilih terapis wanita bikin saya tenang. Terima kasih!',
    providerName: 'Kadek Sri',
    providerType: 'therapist',
    reviewDate: '2024-12-30',
    avatarIndex: 14,
  },
];

const WomenReviewsPage: React.FC<WomenReviewsPageProps> = ({
  t,
  language,
  onNavigate,
  onSelectTherapist,
  onSelectPlace,
  therapists = [],
  places = [],
  facialPlaces = [],
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'id'>(language || 'en');
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [providerMap, setProviderMap] = useState<Record<string, { name: string; typeLabel: string; provider: any; page: string }>>({});

  const handleLanguageChange = (newLang: string) => {
    setCurrentLanguage(newLang as 'en' | 'id');
  };

  const translations = useMemo(() => ({
    en: {
      title: 'Latest Reviews',
      subtitle: 'Our Customers Say It Best',
      loading: 'Loading reviews...',
      noReviews: 'No reviews yet. Check back soon!',
      reviewFor: 'Review for',
      therapist: 'Therapist',
      massagePlace: 'Massage Place',
      skinCareClinic: 'Skin Care Clinic',
      viewProfile: 'View profile',
      whyChoose: 'Why Women Choose Us',
      verifiedTherapists: 'Verified Therapists',
      gpsTracking: 'GPS Tracking',
      realReviews: 'Real Reviews',
      femaleOption: 'Female Therapist Options',
      safetyMonitoringNote: 'Location monitoring helps keep both clients and therapists safe. Our providers agree to this in our terms.',
      disclaimerTitle: 'About our reviews',
      disclaimer: 'IndaStreet does not modify reviews. We may remove reviews that do not meet our standards (for example, content not suitable for all audiences or that exploits personal details).',
    },
    id: {
      title: 'Ulasan Terbaru',
      subtitle: 'Pelanggan Kami Bicara Terbaik',
      loading: 'Memuat ulasan...',
      noReviews: 'Belum ada ulasan. Silakan cek lagi nanti!',
      reviewFor: 'Ulasan untuk',
      therapist: 'Terapis',
      massagePlace: 'Tempat Pijat',
      skinCareClinic: 'Klinik Perawatan Kulit',
      viewProfile: 'Lihat profil',
      whyChoose: 'Mengapa Wanita Memilih Kami',
      verifiedTherapists: 'Terapis Terverifikasi',
      gpsTracking: 'GPS Tracking',
      realReviews: 'Review Asli',
      femaleOption: 'Pilihan Terapis Wanita',
      safetyMonitoringNote: 'Pemantauan lokasi membantu menjaga keselamatan klien dan terapis. Semua penyedia kami setuju dalam ketentuan kami.',
      disclaimerTitle: 'Tentang ulasan kami',
      disclaimer: 'IndaStreet tidak mengubah ulasan. Kami dapat menghapus ulasan yang tidak memenuhi standar kami (misalnya konten yang tidak pantas untuk semua usia atau yang mengeksploitasi detail pribadi).',
    },
  }), []);

  const T = translations[currentLanguage];

  /** Reviews to display: real from API, or realistic mock reviews when none exist. */
  const displayReviews = useMemo(() => {
    if (reviews.length > 0) return reviews;
    return MOCK_REVIEWS.map((m) => ({
      id: m.id,
      $id: m.id,
      userName: m.userName,
      rating: m.rating,
      reviewContent: currentLanguage === 'id' ? m.textId : m.textEn,
      textEn: m.textEn,
      textId: m.textId,
      reviewDate: m.reviewDate,
      providerName: m.providerName,
      providerType: m.providerType,
      avatarIndex: m.avatarIndex,
      isMock: true,
    }));
  }, [reviews, currentLanguage]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const list = (reviewService as any).getLatest
          ? await (reviewService as any).getLatest(50)
          : [];
        if (cancelled) return;
        setReviews(Array.isArray(list) ? list : []);
      } catch (e) {
        if (!cancelled) setReviews([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const typeLabels = useMemo(() => ({ therapist: T.therapist, massagePlace: T.massagePlace, skinCareClinic: T.skinCareClinic }), [T.therapist, T.massagePlace, T.skinCareClinic]);

  useEffect(() => {
    if (reviews.length === 0) return;
    const uniq = new Map<string, { providerType: string; providerId: string }>();
    reviews.forEach((r) => {
      const id = (r.providerId ?? r.provider_id ?? '').toString();
      const type = (r.providerType ?? r.provider_type ?? 'therapist').toLowerCase();
      if (id) uniq.set(`${type}_${id}`, { providerType: type, providerId: id });
    });

    const map: Record<string, { name: string; typeLabel: string; provider: any; page: string }> = {};
    const resolve = async (key: string, providerType: string, providerId: string) => {
      if (providerType === 'therapist') {
        const fromList = therapists.find((th: any) => (th.$id || th.id || '').toString() === providerId);
        if (fromList) {
          map[key] = { name: fromList.name || 'Therapist', typeLabel: typeLabels.therapist, provider: fromList, page: 'therapist-profile' };
          return;
        }
        try {
          const th = await therapistService.getById(providerId);
          if (th) map[key] = { name: th.name || 'Therapist', typeLabel: typeLabels.therapist, provider: th, page: 'therapist-profile' };
        } catch (_) {}
        return;
      }
      if (providerType === 'place' || providerType === 'massage_place') {
        const fromList = places.find((p: any) => (p.$id || p.id || p.placeId || '').toString() === providerId);
        if (fromList) {
          map[key] = { name: fromList.name || 'Massage Place', typeLabel: typeLabels.massagePlace, provider: fromList, page: 'massage-place-profile' };
          return;
        }
        try {
          const pl = await placesService.getByProviderId?.(providerId) ?? await (placesService as any).getById?.(providerId);
          if (pl) map[key] = { name: pl.name || 'Massage Place', typeLabel: typeLabels.massagePlace, provider: pl, page: 'massage-place-profile' };
        } catch (_) {}
        return;
      }
      if (providerType === 'facial-place' || providerType === 'facial_place') {
        const fromList = facialPlaces.find((p: any) => (p.$id || p.id || '').toString() === providerId);
        if (fromList) {
          map[key] = { name: fromList.name || 'Skin Care Clinic', typeLabel: typeLabels.skinCareClinic, provider: fromList, page: 'facial-place-profile' };
        }
      }
    };

    (async () => {
      await Promise.all(Array.from(uniq.entries()).map(([key, { providerType, providerId }]) => resolve(key, providerType, providerId)));
      setProviderMap((prev) => ({ ...prev, ...map }));
    })();
  }, [reviews, therapists, places, facialPlaces, typeLabels]);

  const getProviderInfo = (r: any) => {
    const id = (r.providerId ?? r.provider_id ?? '').toString();
    const type = (r.providerType ?? r.provider_type ?? 'therapist').toLowerCase();
    return providerMap[`${type}_${id}`];
  };

  const handleViewProfile = (r: any) => {
    const info = getProviderInfo(r);
    if (!info?.provider) return;
    if (info.page === 'therapist-profile' && onSelectTherapist) {
      onSelectTherapist(info.provider);
      onNavigate?.('therapist-profile');
    } else if ((info.page === 'massage-place-profile' || info.page === 'facial-place-profile') && onSelectPlace) {
      onSelectPlace(info.provider);
      onNavigate?.(info.page);
    }
  };

  const formatDate = (d: string) => {
    if (!d) return '';
    try {
      return new Date(d).toLocaleDateString(currentLanguage === 'id' ? 'id-ID' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return d;
    }
  };

  return (
    <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50">
      <UniversalHeader
        language={currentLanguage}
        onLanguageChange={handleLanguageChange}
        onMenuClick={() => setIsMenuOpen(true)}
      />

      {isMenuOpen && (
        <AppDrawer
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onNavigate={onNavigate}
          currentLanguage={currentLanguage}
        />
      )}

      <main className="max-w-4xl mx-auto px-4 py-6 pt-16 pb-20">
        <header className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            <span className="text-black">Inda</span>
            <span className="text-orange-500">street</span>
          </h1>
          <h2 className="text-xl font-semibold text-gray-800 mt-2">{T.title}</h2>
          <p className="text-sm text-gray-600 mt-1">{T.subtitle}</p>
        </header>

        {/* Moderation disclaimer */}
        <div className="mb-6 p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">{T.disclaimerTitle}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{T.disclaimer}</p>
        </div>

        {loading && (
          <p className="text-center text-gray-500 py-8">{T.loading}</p>
        )}

        {!loading && displayReviews.length > 0 && (
          <div className="space-y-4">
            {displayReviews.map((r) => {
              const id = r.$id || r.id || r.reviewId;
              const rating = Number(r.rating) || 0;
              const text = r.reviewContent || r.comment || r.reviewText || r.text || (currentLanguage === 'id' ? (r as any).textId : (r as any).textEn) || '';
              const reviewerName = r.userName || r.reviewerName || 'Anonymous';
              const info = getProviderInfo(r) ?? (r.providerName && r.providerType
                ? {
                    name: r.providerName,
                    typeLabel: r.providerType === 'facial-place' ? typeLabels.skinCareClinic : r.providerType === 'place' ? typeLabels.massagePlace : typeLabels.therapist,
                    provider: null,
                    page: '',
                  }
                : null);
              const avatarIndex = (r as any).avatarIndex ?? Math.abs((id || '').split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0)) % REVIEW_AVATARS.length;

              return (
                <article key={id || Math.random()} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={r.avatar || r.avatarUrl || REVIEW_AVATARS[avatarIndex]}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-gray-900">{reviewerName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex text-yellow-500">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star
                              key={n}
                              className={`w-4 h-4 ${n <= rating ? 'fill-current' : 'text-gray-200'}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">{formatDate(r.reviewDate || r.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  {text && <p className="text-gray-700 text-sm leading-relaxed mb-4">{text}</p>}
                  {info && (
                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-600">
                        {T.reviewFor}: <strong>{info.name}</strong> ({info.typeLabel})
                      </span>
                      {info.provider && (onSelectTherapist || onSelectPlace) && (
                        <button
                          type="button"
                          onClick={() => handleViewProfile(r)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          {T.viewProfile}
                        </button>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {!loading && displayReviews.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
            <p className="text-gray-600">{T.noReviews}</p>
          </div>
        )}

        {/* Trust badges */}
        <section className="mt-10 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">{T.whyChoose}</h3>
          <p className="text-sm text-gray-600 text-center max-w-xl mx-auto mb-6">
            {T.safetyMonitoringNote}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 flex items-center justify-center mb-3">
                <img
                  src="https://ik.imagekit.io/7grri5v7d/verified-removebg-preview.png?updatedAt=1768015154565"
                  alt="Verified"
                  className="w-16 h-16 object-contain"
                />
              </div>
              <p className="text-sm font-medium text-gray-900 text-center">{T.verifiedTherapists}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-32 h-16 flex items-center justify-center mb-3">
                <img
                  src="https://ik.imagekit.io/7grri5v7d/satalite-removebg-preview.png"
                  alt="GPS"
                  className="w-32 h-32 object-contain"
                />
              </div>
              <p className="text-sm font-medium text-gray-900 text-center">{T.gpsTracking}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 flex items-center justify-center mb-3">
                <img
                  src="https://ik.imagekit.io/7grri5v7d/reviews%20icon.png"
                  alt="Reviews"
                  className="w-16 h-16 object-contain"
                />
              </div>
              <p className="text-sm font-medium text-gray-900 text-center">{T.realReviews}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 flex items-center justify-center mb-3">
                <img
                  src="https://ik.imagekit.io/7grri5v7d/reviews%20icons.png"
                  alt="Female"
                  className="w-16 h-16 object-contain"
                />
              </div>
              <p className="text-sm font-medium text-gray-900 text-center">{T.femaleOption}</p>
            </div>
          </div>
        </section>

        <div className="mt-10">
          <FloatingPageFooter currentLanguage={currentLanguage} onNavigate={onNavigate} />
        </div>
      </main>
    </div>
  );
};

export default WomenReviewsPage;
