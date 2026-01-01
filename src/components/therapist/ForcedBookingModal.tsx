/**
 * ForcedBookingModal - PLATFORM-ONLY Booking Response System
 * 
 * PURPOSE: Maximizes booking awareness and prevents platform bypass
 * 
 * FEATURES:
 * - Full-screen modal that blocks all other interactions
 * - Live 5-minute countdown timer
 * - Availability score impact warnings
 * - Accept/Decline with platform messaging only
 * - No WhatsApp, no external contact options
 * - Auto-expiry with score penalty
 */

import React, { useState, useEffect } from 'react';
import './ForcedBookingModal.css';

interface BookingRequest {
  id: string;
  customerName: string;
  service: string;
  date: string;
  time: string;
  duration: string;
  price: string;
  receivedAt: number;
  expiresAt: number;
}

interface ForcedBookingModalProps {
  booking: BookingRequest;
  onAccept: (bookingId: string) => Promise<void>;
  onDecline: (bookingId: string, reason?: string) => Promise<void>;
  onExpire: (bookingId: string) => void;
}

export const ForcedBookingModal: React.FC<ForcedBookingModalProps> = ({
  booking,
  onAccept,
  onDecline,
  onExpire
}) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineForm, setShowDeclineForm] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const remaining = booking.expiresAt - now;
      
      if (remaining <= 0) {
        setTimeRemaining(0);
        onExpire(booking.id);
      } else {
        setTimeRemaining(remaining);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 100); // Update every 100ms for smooth countdown

    return () => clearInterval(interval);
  }, [booking.expiresAt, booking.id, onExpire]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getUrgencyClass = () => {
    const secondsLeft = timeRemaining / 1000;
    if (secondsLeft <= 60) return 'critical';
    if (secondsLeft <= 120) return 'warning';
    return 'normal';
  };

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await onAccept(booking.id);
    } catch (error) {
      console.error('Accept failed:', error);
      alert('Failed to accept booking. Please try again.');
      setIsAccepting(false);
    }
  };

  const handleDeclineClick = () => {
    setShowDeclineForm(true);
  };

  const handleDeclineSubmit = async () => {
    if (!declineReason.trim()) {
      alert('Please provide a reason for declining');
      return;
    }

    setIsDeclining(true);
    try {
      await onDecline(booking.id, declineReason);
    } catch (error) {
      console.error('Decline failed:', error);
      alert('Failed to decline booking. Please try again.');
      setIsDeclining(false);
    }
  };

  const urgencyClass = getUrgencyClass();

  return (
    <div className={`forced-booking-modal ${urgencyClass}`}>
      <div className="forced-booking-overlay" />
      
      <div className="forced-booking-content">
        <div className="booking-header">
          <div className={`countdown-timer ${urgencyClass}`}>
            <div className="timer-icon">⏰</div>
            <div className="timer-display">{formatTime(timeRemaining)}</div>
            <div className="timer-label">Time Remaining</div>
          </div>
          
          <h1 className="booking-title">🔴 URGENT: New Booking Request</h1>
          <p className="booking-warning">
            ⚠️ Your availability score depends on responding quickly
          </p>
        </div>

        {!showDeclineForm ? (
          <>
            <div className="booking-details">
              <div className="detail-row">
                <span className="detail-label">Customer:</span>
                <span className="detail-value">{booking.customerName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Service:</span>
                <span className="detail-value">{booking.service}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date:</span>
                <span className="detail-value">{booking.date}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Time:</span>
                <span className="detail-value">{booking.time}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Duration:</span>
                <span className="detail-value">{booking.duration}</span>
              </div>
              <div className="detail-row highlight">
                <span className="detail-label">Your Earnings:</span>
                <span className="detail-value price">{booking.price}</span>
              </div>
            </div>

            <div className="availability-warning">
              <div className="warning-icon">📊</div>
              <div className="warning-content">
                <strong>Availability Score Impact:</strong>
                <ul>
                  <li>✅ Accept within 5 min: <span className="positive">+5 points</span></li>
                  <li>⏱️ Miss deadline: <span className="negative">-10 points</span></li>
                  <li>❌ Decline: <span className="neutral">No penalty</span> (with valid reason)</li>
                </ul>
                <p className="score-info">
                  Higher scores = Better visibility in search results
                </p>
              </div>
            </div>

            <div className="action-buttons">
              <button
                className="btn-accept"
                onClick={handleAccept}
                disabled={isAccepting || isDeclining}
              >
                {isAccepting ? 'Accepting...' : '✅ ACCEPT BOOKING'}
              </button>
              
              <button
                className="btn-decline"
                onClick={handleDeclineClick}
                disabled={isAccepting || isDeclining}
              >
                ❌ Decline (Provide Reason)
              </button>
            </div>

            <div className="platform-notice">
              <p>
                🔒 All communication through platform messaging only
              </p>
              <p>
                💰 Commission protected • No external contact sharing
              </p>
            </div>
          </>
        ) : (
          <div className="decline-form">
            <h3>Reason for Declining</h3>
            <p className="form-instruction">
              Please provide a clear reason. This helps us improve the service.
            </p>
            
            <div className="decline-options">
              <button
                className={`reason-option ${declineReason === 'Already booked at that time' ? 'selected' : ''}`}
                onClick={() => setDeclineReason('Already booked at that time')}
              >
                📅 Already Booked
              </button>
              <button
                className={`reason-option ${declineReason === 'Too far from my location' ? 'selected' : ''}`}
                onClick={() => setDeclineReason('Too far from my location')}
              >
                📍 Too Far
              </button>
              <button
                className={`reason-option ${declineReason === 'Service not available' ? 'selected' : ''}`}
                onClick={() => setDeclineReason('Service not available')}
              >
                🚫 Service Unavailable
              </button>
              <button
                className={`reason-option ${declineReason === 'Need more preparation time' ? 'selected' : ''}`}
                onClick={() => setDeclineReason('Need more preparation time')}
              >
                ⏰ Need More Time
              </button>
            </div>

            <textarea
              className="decline-textarea"
              placeholder="Or provide your own reason..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              rows={4}
            />

            <div className="form-actions">
              <button
                className="btn-cancel"
                onClick={() => {
                  setShowDeclineForm(false);
                  setDeclineReason('');
                }}
                disabled={isDeclining}
              >
                Cancel
              </button>
              <button
                className="btn-submit-decline"
                onClick={handleDeclineSubmit}
                disabled={!declineReason.trim() || isDeclining}
              >
                {isDeclining ? 'Declining...' : 'Submit & Decline'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
