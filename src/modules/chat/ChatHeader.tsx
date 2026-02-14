/**
 * Chat Header Component
 * Extracted from PersistentChatWindow.tsx - preserving exact UI design
 */

import React from 'react';
import { Clock, WifiOff, CreditCard, X } from 'lucide-react';

interface ChatHeaderProps {
  therapist: {
    name: string;
    image?: string;
  };
  isConnected: boolean;
  currentBooking?: {
    status: string;
    bookingId?: string;
  };
  bookingId?: string; // Direct booking ID prop
  isLocked: boolean;
  onMinimize: () => void;
  onClose: () => void;
  onShareBankCard?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  therapist,
  isConnected,
  currentBooking,
  bookingId,
  isLocked,
  onMinimize,
  onClose,
  onShareBankCard
}) => {
  const displayBookingId = bookingId || currentBooking?.bookingId;
  
  return (
    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-4 flex items-center gap-3">
      <div className="relative flex-shrink-0">
        <img 
          src={(therapist as any).profilePicture || (therapist as any).mainImage || (therapist as any).profileImageUrl || therapist.image || (therapist as any).profileImage || '/placeholder-avatar.jpg'} 
          alt={therapist.name}
          className="w-12 h-12 rounded-full object-cover border-2 border-white/50 flex-shrink-0"
          style={{minWidth: '48px', minHeight: '48px'}}
        />
        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-orange-500"></span>
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-base truncate">{therapist.name}</h3>
        <div className="flex items-center gap-1 text-xs text-orange-100">
          {isConnected ? (
            <>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>Indastreet Live Monitoring In Process</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3" />
              <span>Connecting...</span>
            </>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        {/* Bank Card Button - for payment sharing */}
        {currentBooking && (currentBooking.status === 'completed' || currentBooking.status === 'on_the_way') && onShareBankCard && (
          <button
            onClick={onShareBankCard}
            className="p-1.5 bg-green-500 rounded-full hover:bg-green-600 transition-colors"
            title="Share Bank Card for Payment"
          >
            <CreditCard className="w-4 h-4 text-white" />
          </button>
        )}
        <button
          onClick={onMinimize}
          className="p-1.5 hover:bg-white/20 transition-colors rounded relative z-[10001]"
          title="Minimize"
        >
          <span>▼</span>
        </button>
        {!isLocked && (
          <button
            onClick={onClose}
            className="p-1.5 bg-black rounded-full hover:bg-gray-800 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        )}
      </div>
    </div>
  );
};