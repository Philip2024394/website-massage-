import React from 'react';

interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingDetails?: {
    therapistName?: string;
    placeName?: string;
    massageType?: string;
    duration?: number;
    date?: string;
    time?: string;
    price?: number;
  };
}

const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({ 
  isOpen, 
  onClose,
  bookingDetails = {}
}) => {
  if (!isOpen) return null;

  const handleShare = () => {
    const text = `Saya baru booking treatment di IndaStreet! ${bookingDetails.therapistName || bookingDetails.placeName} - ${bookingDetails.massageType || 'Professional Treatment'}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Booking IndaStreet',
        text: text,
        url: window.location.href
      }).catch(() => {});
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(text);
      alert('Link disalin ke clipboard!');
    }
  };

  const handleAddToCalendar = () => {
    const { date, time, duration, therapistName, placeName } = bookingDetails;
    
    // Create ICS format calendar event
    const startDate = date && time ? new Date(`${date}T${time}`) : new Date();
    const endDate = new Date(startDate.getTime() + (duration || 60) * 60000);
    
    const event = {
      title: `Massage Booking - ${therapistName || placeName || 'IndaStreet'}`,
      start: startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      end: endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      description: `Booking massage di IndaStreet`
    };

    // Create Google Calendar link
    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.start}/${event.end}&details=${encodeURIComponent(event.description)}`;
    window.open(googleCalUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[10001] p-4 backdrop-blur-sm">
      <div 
        className="bg-white rounded-3xl max-w-md w-full p-8 relative shadow-2xl animate-bounceIn"
        style={{
          animation: 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        }}
      >
        <style>{`
          @keyframes bounceIn {
            0% {
              transform: scale(0) rotate(-180deg);
              opacity: 0;
            }
            50% {
              transform: scale(1.1) rotate(10deg);
            }
            100% {
              transform: scale(1) rotate(0);
              opacity: 1;
            }
          }
          @keyframes checkmark {
            0% { stroke-dashoffset: 100; }
            100% { stroke-dashoffset: 0; }
          }
        `}</style>
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
        >
          ✕
        </button>
        
        <div className="text-center">
          {/* Animated Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-16 h-16" viewBox="0 0 52 52">
                  <circle 
                    cx="26" 
                    cy="26" 
                    r="25" 
                    fill="none" 
                    stroke="#22c55e" 
                    strokeWidth="2"
                  />
                  <path 
                    fill="none" 
                    stroke="#22c55e" 
                    strokeWidth="4" 
                    strokeLinecap="round"
                    strokeDasharray="100"
                    strokeDashoffset="0"
                    d="M14 27l7 7 16-16"
                    style={{
                      animation: 'checkmark 0.5s ease-in-out 0.3s forwards'
                    }}
                  />
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 text-3xl animate-bounce">
                🎉
              </div>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold mb-2 text-gray-900">
            Booking Berhasil!
          </h2>
          
          <p className="text-gray-600 mb-6">
            Terima kasih telah booking melalui IndaStreet
          </p>
          
          {/* Booking Details */}
          {bookingDetails && (
            <div className="bg-gray-50 rounded-xl p-5 mb-6 text-left space-y-3">
              {(bookingDetails.therapistName || bookingDetails.placeName) && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Provider:</span>
                  <span className="font-semibold text-gray-900">
                    {bookingDetails.therapistName || bookingDetails.placeName}
                  </span>
                </div>
              )}
              {bookingDetails.massageType && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Jenis Massage:</span>
                  <span className="font-semibold text-gray-900">{bookingDetails.massageType}</span>
                </div>
              )}
              {bookingDetails.duration && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Durasi:</span>
                  <span className="font-semibold text-gray-900">{bookingDetails.duration} menit</span>
                </div>
              )}
              {bookingDetails.price && (
                <div className="flex justify-between border-t pt-3">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-bold text-orange-500 text-lg">
                    Rp {bookingDetails.price.toLocaleString('id-ID')}
                  </span>
                </div>
              )}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleAddToCalendar}
              className="w-full bg-orange-500 text-white py-3.5 rounded-xl hover:bg-orange-600 transition-all duration-300 font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <span>📅</span>
              Tambah ke Kalender
            </button>
            
            <button
              onClick={handleShare}
              className="w-full border-2 border-orange-500 text-orange-500 py-3.5 rounded-xl hover:bg-orange-50 transition-all duration-300 font-bold flex items-center justify-center gap-2"
            >
              <span>📤</span>
              Bagikan
            </button>
            
            <button
              onClick={onClose}
              className="w-full border-2 border-gray-300 py-3 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold text-gray-700"
            >
              Tutup
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            💬 Terapis akan menghubungi Anda segera
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationModal;
