import React, { useState, useEffect } from 'react';

const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show banner after 1 second delay
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

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

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-2xl z-[9999] animate-slideUp"
      style={{
        animation: 'slideUp 0.4s ease-out'
      }}
    >
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
      
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🍪</span>
              <h3 className="text-lg font-bold">Kebijakan Cookie</h3>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              Kami menggunakan cookie untuk meningkatkan pengalaman Anda, menganalisis lalu lintas situs, 
              dan menyediakan fitur media sosial. Dengan melanjutkan, Anda menyetujui penggunaan cookie kami.
              {' '}
              <a 
                href="/privacy-policy" 
                className="underline hover:text-orange-400 transition"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.hash = '#/privacy-policy';
                }}
              >
                Pelajari lebih lanjut
              </a>
            </p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={declineCookies}
              className="flex-1 md:flex-none px-6 py-2.5 rounded-lg border-2 border-white text-white hover:bg-white hover:text-gray-900 transition-all duration-300 font-semibold"
            >
              Tolak
            </button>
            <button
              onClick={acceptCookies}
              className="flex-1 md:flex-none bg-orange-500 px-6 py-2.5 rounded-lg hover:bg-orange-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
            >
              Terima Semua
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
