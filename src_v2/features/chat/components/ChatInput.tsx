import React, { useState, useCallback } from 'react';
import { sendMessage } from '../../../core/chat';

export interface ChatInputProps {
  bookingId: string;
  onMessageSent?: () => void;
}

export function ChatInput({ bookingId, onMessageSent }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = useCallback(async () => {
    // 🔴 TEMPORARY DEBUG: Proof that send handler was triggered
    alert('🔴 STEP 1: SEND HANDLER TRIGGERED');
    
    if (!message.trim() || isSending) return;

    setIsSending(true);
    setError(null); // Clear previous errors
    
    try {
      // 🔴 TEMPORARY DEBUG: Proof that feature layer is calling core
      alert('🔴 STEP 2: FEATURE CALLING CORE sendMessage()');
      await sendMessage(bookingId, message.trim());
      setMessage('');
      setError(null); // Clear error on success
      onMessageSent?.();
    } catch (error: any) {
      // 🔴 TEMPORARY DEBUG: Proof that error was caught in feature layer
      alert('🔴 STEP 6: ERROR CAUGHT IN FEATURE LAYER: ' + (error?.message || 'Unknown error'));
      console.error('Failed to send message:', error);
      // CRITICAL: Set user-visible error - GUARANTEED feedback
      const errorMessage = error?.message || 'Failed to send message. Please check your connection and try again.';
      setError(errorMessage);
      // Keep the message text so user can retry
    } finally {
      setIsSending(false);
    }
  }, [bookingId, message, isSending, onMessageSent]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  return (
    <div style={{
      borderTop: '1px solid #e5e7eb',
      backgroundColor: '#ffffff'
    }}>
      {/* CRITICAL: User-visible error banner - IMPOSSIBLE TO MISS */}
      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          borderBottom: '2px solid #ef4444',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              color: '#991b1b',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              ⚠️ Message Not Sent
            </div>
            <div style={{
              color: '#dc2626',
              fontSize: '13px'
            }}>
              {error}
            </div>
          </div>
          <button
            onClick={() => setError(null)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#991b1b',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '4px 8px',
              fontWeight: 'bold'
            }}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px',
        height: '72px'
      }}>
        <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type your message..."
        style={{
          flex: 1,
          resize: 'none',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          padding: '8px 12px',
          fontSize: '14px',
          outline: 'none'
        }}
        rows={1}
        disabled={isSending}
      />
      <button
        onClick={handleSendMessage}
        disabled={!message.trim() || isSending}
        style={{
          backgroundColor: !message.trim() || isSending ? '#93c5fd' : '#3b82f6',
          color: '#ffffff',
          padding: '8px 16px',
          borderRadius: '6px',
          fontSize: '14px',
          border: 'none',
          cursor: !message.trim() || isSending ? 'not-allowed' : 'pointer',
          height: '40px'
        }}
      >
        {isSending ? 'Sending...' : 'Send'}
      </button>
      </div>
    </div>
  );
}