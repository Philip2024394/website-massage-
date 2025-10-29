import React, { useState, useEffect } from 'react';

interface WelcomePopupProps {
  language: 'en' | 'id';
}

const WelcomePopup: React.FC<WelcomePopupProps> = ({ language }) => {
  const [isOpen, setIsOpen] = useState(false);

  const translations = {
    en: {
      title: 'Welcome to',
      description: 'The #1 platform for call massage services in Bali. Find professional therapists, best spas, and traditional Balinese massage near you in minutes!',
      features: {
        therapists: 'professional certified therapists',
        booking: 'with real-time location',
        price: 'starting from Rp 250K'
      },
      buttons: {
        start: '🎯 Start Booking Now',
        browse: 'Browse First'
      },
      tip: '💡 Tip: Enable location to find nearest therapists'
    },
    id: {
      title: 'Selamat Datang di',
      description: 'Platform #1 untuk layanan pijat panggilan di Bali. Temukan terapis profesional, spa terbaik, dan massage traditional Balinese dekat Anda dalam hitungan menit!',
      features: {
        therapists: 'terapis profesional tersertifikasi',
        booking: 'dengan lokasi real-time',
        price: 'mulai dari Rp 250K'
      },
      buttons: {
        start: '🎯 Mulai Booking Sekarang',
        browse: 'Lihat-lihat Dulu'
      },
      tip: '💡 Tip: Aktifkan lokasi untuk menemukan terapis terdekat'
    }
  };

  const t = translations[language];

  useEffect(() => {
    const hasVisited = localStorage.getItem('has-visited');
    const cookieConsent = localStorage.getItem('cookie-consent');
    
    // Only show if user hasn't visited AND cookie consent is accepted
    if (!hasVisited && cookieConsent === 'accepted') {
      setTimeout(() => setIsOpen(true), 3000); // Show after 3 seconds
    }
  }, []);

  const handleClose = (action: string) => {
    localStorage.setItem('has-visited', 'true');
    localStorage.setItem('welcome-dismissed-date', new Date().toISOString());
    localStorage.setItem('welcome-action', action);
    setIsOpen(false);
    
    // Play sound
    const audio = new Audio('/sounds/success-notification.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[10000] p-4 backdrop-blur-sm">
      <div 
        className="bg-white rounded-3xl max-w-md w-full p-8 relative shadow-2xl animate-popIn"
        style={{
          animation: 'popIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        }}
      >
        <style>{`
          @keyframes popIn {
            from {
              transform: scale(0.5);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}</style>
        
        <button
          onClick={() => handleClose('close')}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
        >
          ✕
        </button>
        
        <div className="text-center">
          {/* Animated Welcome Icon */}
          <div className="text-7xl mb-4 animate-wave">
            👋
          </div>
          <style>{`
            @keyframes wave {
              0%, 100% { transform: rotate(0deg); }
              25% { transform: rotate(-10deg); }
              75% { transform: rotate(10deg); }
            }
            .animate-wave {
              animation: wave 1s ease-in-out infinite;
            }
          `}</style>
          
          <h2 className="text-3xl font-bold mb-3 text-gray-900">
            {t.title} <span className="text-orange-500">IndaStreet</span>!
          </h2>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            {t.description}
          </p>
          
          {/* Features */}
          <div className="bg-orange-50 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">✨</span>
              <span className="text-sm text-gray-700"><strong>100+</strong> {t.features.therapists}</span>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📍</span>
              <span className="text-sm text-gray-700"><strong>{language === 'en' ? 'Easy booking' : 'Booking mudah'}</strong> {t.features.booking}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">💯</span>
              <span className="text-sm text-gray-700"><strong>{language === 'en' ? 'Affordable prices' : 'Harga terjangkau'}</strong> {t.features.price}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                handleClose('start-booking');
                // Scroll to therapist section or navigate to home
                window.scrollTo({ top: 500, behavior: 'smooth' });
              }}
              className="w-full bg-orange-500 text-white py-4 rounded-xl hover:bg-orange-600 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {t.buttons.start}
            </button>
            <button
              onClick={() => handleClose('browse')}
              className="w-full border-2 border-gray-300 py-3 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold text-gray-700"
            >
              {t.buttons.browse}
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            {t.tip}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomePopup;
