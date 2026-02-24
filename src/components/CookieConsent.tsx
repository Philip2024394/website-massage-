import React, { useState, useEffect } from 'react';
import type { Language } from '../types/pageTypes';

interface CookieConsentProps {
  language: Language;
  hasLocation: boolean;
  onNavigateToCookiesPolicy?: () => void;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ language, hasLocation, onNavigateToCookiesPolicy }) => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    // Only show if no consent stored AND user has set location
    if (!consent && hasLocation) {
      // Show banner after 5 minutes (300,000ms)
      const timer = setTimeout(() => setShowBanner(true), 300000);
      return () => clearTimeout(timer);
    }
  }, [hasLocation]);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setShowBanner(false);
    
    // Play success sound
    const audio = new Audio('/sounds/booking-notification.mp3');
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

  const lang = language === 'gb' ? 'en' : language;
  const t = translations[lang] || translations.en;

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
          <h3 className="text-xl font-bold text-amber-700">{t.title}</h3>
        </div>
        
        <p className="text-sm text-amber-900/90 leading-relaxed mb-1">
          {t.message}
        </p>
        
        <button
          onClick={() => {
            setShowBanner(false);
            if (onNavigateToCookiesPolicy) {
              onNavigateToCookiesPolicy();
            }
          }}
          className="text-sm text-amber-600 hover:text-amber-700 underline font-semibold inline-block mb-6"
        >
          {t.learnMore}
        </button>
        
        <div className="flex gap-3">
          <button
            onClick={declineCookies}
            className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300 font-semibold text-sm"
          >
            {t.decline}
          </button>
          <button
            onClick={acceptCookies}
            className="flex-1 bg-amber-500 px-4 py-2 rounded-lg hover:bg-amber-600 text-white transition-all duration-300 font-semibold shadow-lg hover:shadow-xl text-sm"
          >
            {t.accept}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
