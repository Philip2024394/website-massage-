import React, { useState, useEffect } from 'react';

interface WelcomePopupProps {
  language: 'en' | 'id';
  isAdmin?: boolean; // Allow admins to always see the popup for design purposes
  isAnyUserLoggedIn?: boolean; // Hide popup if any user/member is logged in
}

const WelcomePopup: React.FC<WelcomePopupProps> = ({ language, isAdmin = false, isAnyUserLoggedIn = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  const translations = {
    en: {
      title: 'Welcome to Inda',
      titleHighlight: 'Street',
      titleEnd: ' Massage!',
      subtitle: "Indonesia's Premium Choice",
      coinReward: '🎁 Get 100 Free Coins on Sign Up!',
      coinExplainer: 'Use coins to unlock exclusive deals and rewards',
      description: 'The Number 1 platform for massage services in Indonesia. Find professional therapists, best spas, and traditional Balinese massage near you in minutes!',
      buttons: {
        browse: "Let's Go!"
      }
    },
    id: {
      title: 'Selamat Datang di Inda',
      titleHighlight: 'Street',
      titleEnd: ' Massage!',
      subtitle: "Pilihan Premium Indonesia",
      coinReward: '🎁 Dapatkan 100 Koin Gratis saat Daftar!',
      coinExplainer: 'Gunakan koin untuk membuka penawaran dan hadiah eksklusif',
      description: 'Platform Nomor 1 untuk layanan pijat di Indonesia. Temukan terapis profesional, spa terbaik, dan pijat tradisional Bali dekat Anda dalam hitungan menit!',
      buttons: {
        browse: "Ayo!"
      }
    }
  };

  const t = translations[language];

  useEffect(() => {
    const hasVisited = localStorage.getItem('has-visited');
    
    // Don't show popup if any user/member is logged in (except admins for preview)
    if (isAnyUserLoggedIn && !isAdmin) {
      return;
    }
    
    // Always show for admins (for design purposes)
    if (isAdmin) {
      setTimeout(() => setIsOpen(true), 1000); // Show after 1 second
      return;
    }
    
    // Show popup immediately when arriving at home page for first-time visitors
    if (!hasVisited) {
      setTimeout(() => setIsOpen(true), 1000); // Show after 1 second
    }
  }, [isAdmin, isAnyUserLoggedIn]);

  const handleClose = (action: string) => {
    // Don't save to localStorage if admin is just previewing
    if (!isAdmin) {
      localStorage.setItem('has-visited', 'true');
      localStorage.setItem('welcome-dismissed-date', new Date().toISOString());
      localStorage.setItem('welcome-action', action);
    }
    setIsOpen(false);
    
    // Play sound
    const audio = new Audio('/sounds/booking-notification.mp3');
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
        className="bg-gradient-to-br from-white to-orange-50 rounded-3xl max-w-md w-full p-8 relative shadow-2xl animate-popIn max-h-[90vh] overflow-y-auto"
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
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
        `}</style>
        
        <button
          onClick={() => handleClose('close')}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
        >
          ✕
        </button>
        
        <div className="text-center">
          {/* Welcome Image */}
          <div className="mb-4 flex justify-center">
            <img 
              src="https://ik.imagekit.io/7grri5v7d/indastreet_guy_34-removebg-preview.png?updatedAt=1761705645668"
              alt="IndaStreet Welcome"
              className="w-64 h-64 object-contain"
            />
          </div>
          
          <h2 className="text-3xl font-bold mb-2">
            <span className="text-black">{t.title}</span>
            <span className="text-orange-500">{t.titleHighlight}</span>
            <span className="text-black">{t.titleEnd}</span>
          </h2>
          
          <p className="text-orange-600 font-semibold text-lg mb-3">
            {t.subtitle}
          </p>
          
          {/* Coin Reward Banner */}
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl p-4 mb-4 shadow-lg border-2 border-yellow-300">
            <p className="text-white font-bold text-xl mb-1">
              {t.coinReward}
            </p>
            <p className="text-yellow-50 text-sm">
              {t.coinExplainer}
            </p>
          </div>
          
          <p className="text-gray-700 mb-6 leading-relaxed text-base">
            {t.description}
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => handleClose('browse')}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl hover:shadow-xl transition-all duration-300 font-bold text-lg shadow-lg transform hover:scale-105"
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
