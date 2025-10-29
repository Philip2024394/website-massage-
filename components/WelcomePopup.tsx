import React, { useState, useEffect } from 'react';

interface WelcomePopupProps {
  language: 'en' | 'id';
  isAdmin?: boolean; // Allow admins to always see the popup for design purposes
}

const WelcomePopup: React.FC<WelcomePopupProps> = ({ language, isAdmin = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  const translations = {
    en: {
      title: 'Welcome to IndaStreet Massage!',
      description: 'The Number 1 platform for massage services in Indonesia. Find professional therapists, best spas, and traditional Balinese massage near you in minutes!',
      features: {
        therapists: '100+ professional certified therapists',
        booking: 'Real-time location tracking',
        price: 'Affordable prices from Rp 250K'
      },
      buttons: {
        start: '🎯 Start Booking Now',
        browse: 'Browse Services'
      }
    },
    id: {
      title: 'Selamat Datang di IndaStreet Massage!',
      description: 'Platform Nomor 1 untuk layanan pijat di Indonesia. Temukan terapis profesional, spa terbaik, dan pijat tradisional Bali dekat Anda dalam hitungan menit!',
      features: {
        therapists: '100+ terapis profesional tersertifikasi',
        booking: 'Pelacakan lokasi real-time',
        price: 'Harga terjangkau mulai Rp 250K'
      },
      buttons: {
        start: '🎯 Mulai Booking Sekarang',
        browse: 'Lihat Layanan'
      }
    }
  };

  const t = translations[language];

  useEffect(() => {
    const hasVisited = localStorage.getItem('has-visited');
    
    // Always show for admins (for design purposes)
    if (isAdmin) {
      setTimeout(() => setIsOpen(true), 1000); // Show after 1 second
      return;
    }
    
    // Show popup immediately when arriving at home page for first-time visitors
    if (!hasVisited) {
      setTimeout(() => setIsOpen(true), 1000); // Show after 1 second
    }
  }, [isAdmin]);

  const handleClose = (action: string) => {
    // Don't save to localStorage if admin is just previewing
    if (!isAdmin) {
      localStorage.setItem('has-visited', 'true');
      localStorage.setItem('welcome-dismissed-date', new Date().toISOString());
      localStorage.setItem('welcome-action', action);
    }
    setIsOpen(false);
    
    // Play sound
    const audio = new Audio('/sounds/success-notification.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[10000] p-4 backdrop-blur-sm">
      {/* Falling Coins Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute text-4xl animate-fall"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 20}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
              opacity: 0.7 + Math.random() * 0.3
            }}
          >
            🪙
          </div>
        ))}
      </div>

      <div 
        className="bg-gradient-to-br from-white to-orange-50 rounded-3xl max-w-md w-full p-8 relative shadow-2xl animate-popIn"
        style={{
          animation: 'popIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
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
          @keyframes fall {
            0% {
              transform: translateY(0) rotate(0deg);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(360deg);
              opacity: 0;
            }
          }
          .animate-fall {
            animation: fall linear infinite;
          }
          @keyframes wave {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-10deg); }
            75% { transform: rotate(10deg); }
          }
          .animate-wave {
            animation: wave 1s ease-in-out infinite;
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
          
          <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            {t.title}
          </h2>
          
          <p className="text-gray-700 mb-6 leading-relaxed text-base">
            {t.description}
          </p>
          
          {/* Features */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 mb-6 text-left border border-orange-200">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">✨</span>
              <span className="text-sm text-gray-800">{t.features.therapists}</span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">📍</span>
              <span className="text-sm text-gray-800">{t.features.booking}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">�</span>
              <span className="text-sm text-gray-800">{t.features.price}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                handleClose('start-booking');
                // Scroll to therapist section or navigate to home
                window.scrollTo({ top: 500, behavior: 'smooth' });
              }}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl hover:shadow-xl transition-all duration-300 font-bold text-lg shadow-lg transform hover:scale-105"
            >
              {t.buttons.start}
            </button>
            <button
              onClick={() => handleClose('browse')}
              className="w-full border-2 border-orange-300 text-orange-600 py-3 rounded-xl hover:bg-orange-50 transition-all duration-300 font-semibold"
            >
              {t.buttons.browse}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePopup;
