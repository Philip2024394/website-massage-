import React, { useEffect, useState } from 'react';

/**
 * Debug component to track activeChat state changes
 * Add this to App.tsx temporarily to debug chat window issues
 */
const ActiveChatDebugger = ({ activeChat }) => {
  const [history, setHistory] = useState([]);
  
  useEffect(() => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
      timestamp,
      activeChat: activeChat ? {
        chatRoomId: activeChat.chatRoomId,
        bookingId: activeChat.bookingId,
        providerId: activeChat.providerId,
        providerName: activeChat.providerName,
        customerName: activeChat.customerName
      } : null
    };
    
    setHistory(prev => [logEntry, ...prev].slice(0, 5)); // Keep last 5 entries
    
    console.log('🔥 ACTIVE CHAT STATE CHANGE:', logEntry);
  }, [activeChat]);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
        🐛 ActiveChat Debug
      </div>
      
      <div style={{ marginBottom: '5px' }}>
        Current: {activeChat ? (
          <span style={{ color: '#4ade80' }}>
            Room: {activeChat.chatRoomId?.substring(0, 8)}...
          </span>
        ) : (
          <span style={{ color: '#f87171' }}>NULL</span>
        )}
      </div>
      
      <div style={{ fontSize: '10px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>History:</div>
        {history.map((entry, i) => (
          <div key={i} style={{ marginBottom: '2px' }}>
            {entry.timestamp}: {entry.activeChat ? '✅' : '❌'}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveChatDebugger;