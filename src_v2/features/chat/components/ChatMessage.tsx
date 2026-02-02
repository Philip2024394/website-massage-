import React from 'react';
import type { ChatMessage } from '../../../core/chat';

export interface ChatMessageProps {
  message: ChatMessage;
  isCurrentUser: boolean;
}

export function ChatMessageComponent({ message, isCurrentUser }: ChatMessageProps) {
  const messageStyle = {
    maxWidth: '320px',
    padding: '8px 12px',
    borderRadius: '12px',
    marginBottom: '12px',
    ...(isCurrentUser ? {
      backgroundColor: '#3b82f6',
      color: '#ffffff',
      marginLeft: '16px',
      borderBottomRightRadius: '0'
    } : {
      backgroundColor: '#e5e7eb',
      color: '#1f2937',
      marginRight: '16px',
      borderBottomLeftRadius: '0'
    })
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: isCurrentUser ? 'flex-end' : 'flex-start'
    }}>
      <div style={messageStyle}>
        <p style={{ fontSize: '14px', margin: 0 }}>{message.content}</p>
        <p style={{ 
          fontSize: '11px', 
          opacity: 0.7, 
          marginTop: '4px',
          marginBottom: 0
        }}>
          {new Date(message.$createdAt).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}