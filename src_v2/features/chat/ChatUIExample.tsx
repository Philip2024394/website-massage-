import React from 'react';
import { ChatContainer } from './ChatContainer';

/**
 * STEP 16 — CHAT UI MIGRATION (FINAL CORE SYSTEM) 
 * 
 * This example shows how to integrate the new chat UI with the Step 15 chat core.
 * 
 * KEY FEATURES:
 * ✅ UI calls sendMessage from Step 15 core (no direct Appwrite access)
 * ✅ UI owns scroll inside its container only
 * ✅ Shell scroll untouched
 * ✅ Complete isolation from booking system
 * ✅ Fixes "chat + booking both failed" permanently
 */

export interface ChatUIExampleProps {
  bookingId: string;
  currentUserId: string;
}

export function ChatUIExample({ bookingId, currentUserId }: ChatUIExampleProps) {
  return (
    <div className="h-screen bg-gray-100 p-4">
      {/* SHELL CONTAINER - This scroll is untouched by chat */}
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg h-full flex flex-col">
        
        {/* HEADER - Fixed, doesn't scroll */}
        <div className="bg-blue-500 text-white p-4 rounded-t-lg">
          <h1 className="text-lg font-semibold">Massage Chat</h1>
          <p className="text-sm opacity-90">Booking ID: {bookingId}</p>
        </div>

        {/* CHAT CONTAINER WITH ISOLATED SCROLL */}
        <div className="flex-1 min-h-0">
          <ChatContainer 
            bookingId={bookingId}
            currentUserId={currentUserId}
            className="h-full"
          />
        </div>

        {/* FOOTER - Fixed, doesn't scroll */}
        <div className="bg-gray-50 p-2 rounded-b-lg text-center text-xs text-gray-500">
          Step 16 Complete: UI uses sendMessage core, isolated scroll
        </div>
      </div>
    </div>
  );
}

// Example usage in existing application:
/*
import { ChatUIExample } from 'path/to/ChatUIExample';

// In your app component:
<ChatUIExample 
  bookingId="booking-123"
  currentUserId="user-456"
/>
*/