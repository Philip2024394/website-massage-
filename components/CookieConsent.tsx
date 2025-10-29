import React, { useState, useEffect } from 'react';

interface CookieConsentProps {
  language: 'en' | 'id';
  hasLocation: boolean;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ language, hasLocation }) => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    // Only show if no consent stored AND user has set location
    if (!consent && hasLocation) {
      // Show banner after 1 second delay
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, [hasLocation]);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setShowBanner(false);
    
    // Play success sound
    const audio = new Audio('/sounds/success-notification.mp3');
    audio.volume = 0.2;
    audio.play().catch(() => {});
  };

  const declineCookies = () => {
    localStorage.setItem('cookie-consent', 'declined');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setShowBanner(false);
  };

  if (!showBanner) return null;

  const translations = {
    en: {
      title: 'Cookie Policy',
      message: 'We use cookies to enhance your experience, analyze site traffic, and provide social media features. By continuing, you consent to our use of cookies.',
      learnMore: 'Learn more',
      accept: 'Accept All',
      decline: 'Decline'
    },
    id: {
      title: 'Kebijakan Cookie',
      message: 'Kami menggunakan cookie untuk meningkatkan pengalaman Anda, menganalisis lalu lintas situs, dan menyediakan fitur media sosial. Dengan melanjutkan, Anda menyetujui penggunaan cookie kami.',
      learnMore: 'Pelajari lebih lanjut',
      accept: 'Terima Semua',
      decline: 'Tolak'
    }
  };

  const t = translations[language];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn"
      style={{
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
      
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-slideUp"
        style={{
          animation: 'slideUp 0.4s ease-out'
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">🍪</span>
          <h3 className="text-xl font-bold text-gray-900">{t.title}</h3>
        </div>
        
        <p className="text-sm text-gray-700 leading-relaxed mb-1">
          {t.message}
        </p>
        
        <a 
          href="/privacy-policy" 
          className="text-sm text-orange-500 hover:text-orange-600 underline font-semibold inline-block mb-6"
          onClick={(e) => {
            e.preventDefault();
            window.location.hash = '#/privacy-policy';
          }}
        >
          {t.learnMore}
        </a>
        
        <div className="flex gap-3">
          <button
            onClick={declineCookies}
            className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300 font-semibold"
          >
            {t.decline}
          </button>
          <button
            onClick={acceptCookies}
            className="flex-1 bg-orange-500 px-6 py-3 rounded-lg hover:bg-orange-600 text-white transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
          >
            {t.accept}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
