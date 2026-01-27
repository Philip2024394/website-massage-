/**
 * Therapist Booking Actions Component
 * Extracted from TherapistCard.tsx - preserving exact UI design
 */

import React from 'react';
import { MessageCircle, Calendar } from 'lucide-react';
import type { Therapist } from '../../types';

interface BookingActionsProps {
  therapist: Therapist;
  bookNowText: string;
  scheduleText: string;
  onBookNowClick: (therapist: Therapist) => void;
  onScheduleClick: (therapist: Therapist) => void;
  onIncrementAnalytics: (type: string) => void;
  setBookingsCount: (count: (prev: number) => number) => void;
  onNavigate?: (page: string) => void;
}

export const TherapistBookingActions: React.FC<BookingActionsProps> = ({
  therapist,
  bookNowText,
  scheduleText,
  onBookNowClick,
  onScheduleClick,
  onIncrementAnalytics,
  setBookingsCount,
  onNavigate
}) => {
  const handleBookNowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent multiple rapid clicks
    if ((e.target as HTMLElement).hasAttribute('data-clicking')) {
      return;
    }
    (e.target as HTMLElement).setAttribute('data-clicking', 'true');
    requestAnimationFrame(() => {
      (e.target as HTMLElement).removeAttribute('data-clicking');
    });
    
    console.log('🟢 Book Now button clicked - opening PERSISTENT CHAT');
    
    // 🔒 OPEN PERSISTENT CHAT - Facebook Messenger style
    // This chat window will NEVER disappear once opened
    onBookNowClick(therapist);
    
    onIncrementAnalytics('bookings');
    setBookingsCount(prev => prev + 1);
  };

  const handleScheduleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent multiple rapid clicks
    if ((e.target as HTMLElement).hasAttribute('data-clicking')) {
      return;
    }
    (e.target as HTMLElement).setAttribute('data-clicking', 'true');
    requestAnimationFrame(() => {
      (e.target as HTMLElement).removeAttribute('data-clicking');
    });
    
    console.log('📅 Schedule button clicked - opening PERSISTENT CHAT');
    
    // 🔒 OPEN PERSISTENT CHAT - Facebook Messenger style
    // This chat window will NEVER disappear once opened
    onScheduleClick(therapist);
    
    onIncrementAnalytics('bookings');
    // Increment bookings count for UI display
    setBookingsCount(prev => prev + 1);
  };

  const handleTermsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isSharedProfile = window.location.pathname.includes('/share/');
    const baseUrl = window.location.origin;
    if (isSharedProfile) {
      const currentUrl = window.location.href;
      window.open(`${baseUrl}/mobile-terms-and-conditions?returnTo=${encodeURIComponent(currentUrl)}`, '_blank');
    } else {
      window.open(`${baseUrl}/mobile-terms-and-conditions`, '_blank');
    }
  };

  return (
    <>
      {/* Main booking buttons */}
      <div className="grid grid-cols-2 gap-2 px-4 pb-2 mt-2">
        <button 
          onClick={handleBookNowClick}
          className="w-1/2 flex items-center justify-center gap-1.5 font-bold py-4 px-3 rounded-lg transition-all duration-100 transform touch-manipulation min-h-[48px] bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 active:scale-95"
        >
          <MessageCircle className="w-4 h-4"/>
          <span className="text-sm">{bookNowText}</span>
        </button>
        
        <button 
          onClick={handleScheduleClick}
          className="w-1/2 flex items-center justify-center gap-1.5 font-bold py-4 px-3 rounded-lg transition-all duration-100 transform touch-manipulation min-h-[48px] bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 active:scale-95"
        >
          <Calendar className="w-4 h-4"/>
          <span className="text-sm">{scheduleText}</span>
        </button>
      </div>

      {/* Terms and Conditions Link - Below booking buttons */}
      <div className="text-center mt-3 px-4">
        <button 
          type="button"
          onClick={handleTermsClick}
          className="text-xs text-gray-500 hover:text-gray-700 underline font-medium cursor-pointer bg-transparent border-none p-0"
        >
          Terms And Conditions
        </button>
      </div>

      {/* Hotel/Villa Partner Link - Mobile optimized */}
      {(therapist as any).partneredHotelVilla && onNavigate && (
        <div className="mt-3 mb-2 px-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate('indastreet-partners');
            }}
            className="w-full bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 rounded-lg p-2.5 hover:from-amber-100 hover:to-orange-100 transition-all"
          >
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
                </svg>
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-xs font-bold text-orange-900 truncate">
                  Partnered with {(therapist as any).partneredHotelVilla}
                </p>
                <p className="text-[10px] text-orange-700">
                  View partner hotels & villas →
                </p>
              </div>
            </div>
          </button>
        </div>
      )}
    </>
  );
};