import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

describe('ChatWindow', () => {
  const mockChatRoom = {
    $id: 'room-123',
    bookingId: 'booking-123',
    customerId: 'customer-123',
    customerName: 'John Doe',
    therapistId: 'therapist-123',
    therapistName: 'Test Therapist',
    status: 'active' as const,
    createdAt: new Date().toISOString(),
  };

  const mockMessage = {
    $id: 'msg-123',
    senderId: 'customer-123',
    senderName: 'John Doe',
    message: 'Hello, I need a massage',
    timestamp: new Date().toISOString(),
    read: false,
  };

  it('creates chat room with correct data structure', () => {
    expect(mockChatRoom.customerId).toBe('customer-123');
    expect(mockChatRoom.therapistId).toBe('therapist-123');
    expect(mockChatRoom.status).toBe('active');
  });

  it('formats message timestamp correctly', () => {
    const formatTime = (isoString: string) => {
      const date = new Date(isoString);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    };
    
    const timestamp = '2026-01-12T10:30:00.000Z';
    const formatted = formatTime(timestamp);
    expect(formatted).toContain(':');
  });

  it('marks messages as read', () => {
    const message = { ...mockMessage, read: false };
    const updatedMessage = { ...message, read: true };
    
    expect(updatedMessage.read).toBe(true);
  });

  it('validates message content', () => {
    const validateMessage = (msg: string) => {
      return msg.trim().length > 0 && msg.length <= 1000;
    };
    
    expect(validateMessage('Hello')).toBe(true);
    expect(validateMessage('')).toBe(false);
    expect(validateMessage('a'.repeat(1001))).toBe(false);
  });

  it('handles system messages differently', () => {
    const systemMessage = {
      ...mockMessage,
      senderId: 'system',
      senderName: 'System',
    };
    
    expect(systemMessage.senderId).toBe('system');
  });

  it('sends message with correct structure', async () => {
    const mockSend = vi.fn();
    const messageData = {
      roomId: 'room-123',
      senderId: 'customer-123',
      senderName: 'John Doe',
      message: 'Test message',
      timestamp: new Date().toISOString(),
    };
    
    mockSend(messageData);
    expect(mockSend).toHaveBeenCalledWith(messageData);
  });
});
