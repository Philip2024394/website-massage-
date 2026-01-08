// 🔒 PERSISTENT CHAT WINDOW - Minimalistic Orange Theme
// Facebook Messenger-style chat that NEVER disappears once opened

import React, { useState, useEffect, useRef } from 'react';
import { usePersistentChat, ChatMessage } from '../context/PersistentChatProvider';
import { MessageCircle, X, Send, Clock, MapPin, User, Phone, Check, Loader, ChevronRight, ArrowLeft } from 'lucide-react';

// Duration Selection Step
function DurationStep() {
  const { chatState, setSelectedDuration, setBookingStep } = usePersistentChat();
  const { therapist } = chatState;
  
  if (!therapist) return null;
  
  const durations = [
    { mins: 60, label: '1 Hour' },
    { mins: 90, label: '1.5 Hours' },
    { mins: 120, label: '2 Hours' },
  ];
  
  return (
    <div style={{ padding: '20px' }}>
      <p style={{ 
        fontSize: '13px', 
        color: '#6b7280', 
        marginBottom: '16px',
        textAlign: 'center' 
      }}>
        Choose your session duration
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {durations.map(({ mins, label }) => {
          const price = therapist.pricing[mins.toString()] || mins * 5000;
          return (
            <button
              key={mins}
              onClick={() => {
                setSelectedDuration(mins);
                setBookingStep('details');
              }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                borderRadius: '12px',
                border: '1px solid #f3f4f6',
                backgroundColor: '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#f97316';
                e.currentTarget.style.backgroundColor = '#fff7ed';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#f3f4f6';
                e.currentTarget.style.backgroundColor = '#fff';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#fff7ed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Clock size={18} color="#f97316" />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: '15px', color: '#111827' }}>{label}</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>{mins} minutes</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: '16px', color: '#f97316' }}>
                  {price.toLocaleString('id-ID')}
                </div>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>IDR</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Customer Details Step
function DetailsStep() {
  const { chatState, setCustomerDetails, setBookingStep } = usePersistentChat();
  const [name, setName] = useState(chatState.customerName);
  const [whatsApp, setWhatsApp] = useState(chatState.customerWhatsApp);
  const [location, setLocation] = useState(chatState.customerLocation);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      setIsLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
          setIsLoadingLocation(false);
        },
        () => setIsLoadingLocation(false)
      );
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !whatsApp || !location) return;
    setCustomerDetails({ name, whatsApp, location });
    setBookingStep('confirmation');
  };
  
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  };
  
  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
      <button
        type="button"
        onClick={() => setBookingStep('duration')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          color: '#6b7280',
          fontSize: '13px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          marginBottom: '16px',
          padding: 0,
        }}
      >
        <ArrowLeft size={14} /> Back
      </button>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '12px', 
            fontWeight: 500,
            color: '#374151',
            marginBottom: '6px',
          }}>
            Your Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
            style={inputStyle}
            onFocus={(e) => {
              e.target.style.borderColor = '#f97316';
              e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
        
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '12px', 
            fontWeight: 500,
            color: '#374151',
            marginBottom: '6px',
          }}>
            WhatsApp Number
          </label>
          <input
            type="tel"
            value={whatsApp}
            onChange={(e) => setWhatsApp(e.target.value)}
            placeholder="+62 812 3456 7890"
            required
            style={inputStyle}
            onFocus={(e) => {
              e.target.style.borderColor = '#f97316';
              e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
        
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '12px', 
            fontWeight: 500,
            color: '#374151',
            marginBottom: '6px',
          }}>
            Your Location
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Address or coordinates"
              required
              style={{ ...inputStyle, flex: 1 }}
              onFocus={(e) => {
                e.target.style.borderColor = '#f97316';
                e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={isLoadingLocation}
              style={{
                padding: '14px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: '#f97316',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ea580c'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f97316'}
            >
              {isLoadingLocation ? <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <MapPin size={18} />}
            </button>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={!name || !whatsApp || !location}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: (!name || !whatsApp || !location) ? '#d1d5db' : '#f97316',
            color: '#fff',
            fontWeight: 600,
            fontSize: '14px',
            cursor: (!name || !whatsApp || !location) ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
            marginTop: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          Continue <ChevronRight size={16} />
        </button>
      </div>
    </form>
  );
}

// Confirmation Step
function ConfirmationStep() {
  const { chatState, setBookingStep, addMessage } = usePersistentChat();
  const { therapist, selectedDuration, customerName, customerWhatsApp, customerLocation } = chatState;
  
  if (!therapist) return null;
  
  const price = selectedDuration ? (therapist.pricing[selectedDuration.toString()] || selectedDuration * 5000) : 0;
  
  const handleConfirm = () => {
    addMessage({
      senderId: 'system',
      senderName: 'System',
      message: `✅ Booking confirmed!\n\nTherapist: ${therapist.name}\nDuration: ${selectedDuration} mins\nPrice: IDR ${price.toLocaleString('id-ID')}\n\nWe'll contact you on WhatsApp shortly.`,
      type: 'booking',
    });
    setBookingStep('chat');
  };
  
  const Row = ({ label, value }: { label: string; value: string }) => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between',
      padding: '10px 0',
      borderBottom: '1px solid #f3f4f6',
    }}>
      <span style={{ color: '#6b7280', fontSize: '13px' }}>{label}</span>
      <span style={{ fontWeight: 500, fontSize: '13px', color: '#111827', textAlign: 'right', maxWidth: '60%' }}>{value}</span>
    </div>
  );
  
  return (
    <div style={{ padding: '20px' }}>
      <button
        type="button"
        onClick={() => setBookingStep('details')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          color: '#6b7280',
          fontSize: '13px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          marginBottom: '16px',
          padding: 0,
        }}
      >
        <ArrowLeft size={14} /> Back
      </button>
      
      <div style={{
        backgroundColor: '#fafafa',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px',
      }}>
        <Row label="Therapist" value={therapist.name} />
        <Row label="Duration" value={`${selectedDuration} minutes`} />
        <Row label="Name" value={customerName} />
        <Row label="WhatsApp" value={customerWhatsApp} />
        <Row label="Location" value={customerLocation} />
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          paddingTop: '12px',
          marginTop: '4px',
        }}>
          <span style={{ fontWeight: 600, color: '#111827' }}>Total</span>
          <span style={{ fontWeight: 700, fontSize: '18px', color: '#f97316' }}>
            IDR {price.toLocaleString('id-ID')}
          </span>
        </div>
      </div>
      
      <button
        onClick={handleConfirm}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '10px',
          border: 'none',
          backgroundColor: '#f97316',
          color: '#fff',
          fontWeight: 600,
          fontSize: '14px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ea580c'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f97316'}
      >
        <Check size={18} /> Confirm Booking
      </button>
    </div>
  );
}

// Chat Step
function ChatStep() {
  const { chatState, addMessage } = usePersistentChat();
  const { therapist, messages } = chatState;
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    addMessage({
      senderId: 'customer',
      senderName: chatState.customerName || 'You',
      message: inputValue.trim(),
      type: 'text',
    });
    
    setInputValue('');
    
    setTimeout(() => {
      addMessage({
        senderId: therapist?.id || 'therapist',
        senderName: therapist?.name || 'Therapist',
        message: 'Thank you! I will respond shortly. You can also reach me on WhatsApp.',
        type: 'text',
      });
    }, 1000);
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '280px' }}>
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#9ca3af', padding: '40px 20px' }}>
            <MessageCircle size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
            <p style={{ fontSize: '13px' }}>Start chatting with {therapist?.name}</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              alignSelf: msg.senderId === 'customer' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
            }}
          >
            <div style={{
              padding: '10px 14px',
              borderRadius: msg.senderId === 'customer' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              backgroundColor: msg.senderId === 'customer' ? '#f97316' : msg.type === 'booking' ? '#ecfdf5' : '#f3f4f6',
              color: msg.senderId === 'customer' ? '#fff' : '#111827',
              fontSize: '14px',
              lineHeight: 1.4,
              whiteSpace: 'pre-wrap',
            }}>
              {msg.message}
            </div>
            <div style={{
              fontSize: '10px',
              color: '#9ca3af',
              marginTop: '4px',
              textAlign: msg.senderId === 'customer' ? 'right' : 'left',
              paddingLeft: msg.senderId === 'customer' ? 0 : '4px',
              paddingRight: msg.senderId === 'customer' ? '4px' : 0,
            }}>
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '12px 16px',
        borderTop: '1px solid #f3f4f6',
        backgroundColor: '#fff',
      }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '20px',
            border: '1px solid #e5e7eb',
            outline: 'none',
            fontSize: '14px',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!inputValue.trim()}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: inputValue.trim() ? '#f97316' : '#e5e7eb',
            color: '#fff',
            cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s',
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

// Main Component
export function PersistentChatWindow() {
  const { chatState, isLocked, minimizeChat, maximizeChat, closeChat } = usePersistentChat();
  const { isOpen, isMinimized, therapist, bookingStep } = chatState;
  
  if (!isOpen) return null;
  
  // Minimized bubble
  if (isMinimized) {
    return (
      <div
        onClick={maximizeChat}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 99999,
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#f97316',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(249,115,22,0.4)',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.08)';
          e.currentTarget.style.boxShadow = '0 6px 24px rgba(249,115,22,0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(249,115,22,0.4)';
        }}
      >
        {therapist?.image ? (
          <img
            src={therapist.image}
            alt={therapist.name}
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <MessageCircle size={24} color="#fff" />
        )}
      </div>
    );
  }
  
  // Full window
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 99999,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{
        width: '360px',
        maxWidth: 'calc(100vw - 40px)',
        maxHeight: 'calc(100vh - 100px)',
        backgroundColor: '#fff',
        borderRadius: '16px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
          color: '#fff',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {therapist?.image ? (
                <img src={therapist.image} alt={therapist.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={20} color="#fff" />
              )}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>{therapist?.name || 'Chat'}</div>
              <div style={{ fontSize: '11px', opacity: 0.85, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4ade80' }}></span>
                Online
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={minimizeChat}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                lineHeight: 1,
              }}
              title="Minimize"
            >
              −
            </button>
            {!isLocked && (
              <button
                onClick={closeChat}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Close"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
        
        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#fff' }}>
          {bookingStep === 'duration' && <DurationStep />}
          {bookingStep === 'details' && <DetailsStep />}
          {bookingStep === 'confirmation' && <ConfirmationStep />}
          {bookingStep === 'chat' && <ChatStep />}
        </div>
      </div>
      
      {/* Keyframes for spinner */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default PersistentChatWindow;
