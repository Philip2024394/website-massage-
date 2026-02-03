/**
 * ============================================================================
 * 🎯 SIMPLE GPS BOOKING DEMO - WORKING EXAMPLE
 * ============================================================================
 * 
 * This demo shows your clean GPS booking flow in action:
 * 1. Landing page collects GPS (one permission popup)
 * 2. Booking automatically includes GPS if available
 * 3. Therapist gets location-aware message
 * 
 * NO COMPLEX CHAT MODIFICATIONS - CLEAN & SIMPLE!
 * 
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { customerGPSService } from '../services/customerGPSCollectionService';
import { SimpleGPSUtils } from '../services/simpleGPSBookingIntegration';

export const SimpleGPSBookingDemo: React.FC = () => {
  const [gpsStatus, setGpsStatus] = useState('checking');
  const [bookingStatus, setBookingStatus] = useState('idle');
  const [therapistMessage, setTherapistMessage] = useState('');

  // Check GPS status on load
  useEffect(() => {
    const checkGPS = () => {
      const stats = SimpleGPSUtils.getStats();
      if (stats.available) {
        setGpsStatus(`ready (${stats.city}, ±${stats.accuracy}m)`);
      } else {
        setGpsStatus('not available');
      }
    };

    checkGPS();
    
    // Check every 2 seconds for demo
    const interval = setInterval(checkGPS, 2000);
    return () => clearInterval(interval);
  }, []);

  // Simulate booking with GPS
  const handleTestBooking = async () => {
    setBookingStatus('processing');
    
    // Your typical booking data
    const normalBooking = {
      customerName: "John Smith",
      customerWhatsApp: "+6281234567890",
      therapistId: "therapist_123",
      therapistName: "Maya (Female Therapist)",
      duration: 60,
      price: 150000,
      location: "Jakarta Pusat" // What user typed
    };

    // Mock therapist with GPS
    const therapistData = {
      id: "therapist_123",
      name: "Maya",
      geopoint: { lat: -6.2088, lng: 106.8456 } // Therapist location
    };

    try {
      // 🎯 ENHANCE WITH GPS (ONE LINE):
      const gpsBooking = SimpleGPSUtils.enhanceBooking(normalBooking, therapistData);
      
      console.log('📍 Original booking:', normalBooking);
      console.log('✨ GPS-enhanced booking:', gpsBooking);
      
      // 🎯 CREATE THERAPIST MESSAGE:
      const message = SimpleGPSUtils.createMessage(gpsBooking);
      setTherapistMessage(message);
      
      setBookingStatus('completed');
      
      // In real app, you'd send to Appwrite and WhatsApp
      console.log('📱 Sending to therapist WhatsApp:', message);
      
    } catch (error) {
      setBookingStatus('error');
      console.error('Booking error:', error);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'monospace', 
      backgroundColor: '#f0f8ff',
      border: '2px solid #0066cc',
      borderRadius: '10px',
      margin: '20px'
    }}>
      
      <h2>🎯 Simple GPS Booking Demo</h2>
      <p><strong>Clean implementation - no complex chat modifications!</strong></p>
      
      {/* GPS Status */}
      <div style={{ 
        padding: '15px', 
        backgroundColor: gpsStatus.includes('ready') ? '#e8f5e8' : '#fff8e1',
        borderRadius: '8px',
        marginBottom: '15px'
      }}>
        <h3>📍 GPS Status</h3>
        <p>Status: <strong>{gpsStatus}</strong></p>
        {gpsStatus === 'not available' && (
          <p style={{ color: '#666', fontSize: '14px' }}>
            ℹ️ GPS will be collected automatically when user visits landing page
          </p>
        )}
      </div>

      {/* Test Booking */}
      <div style={{ 
        padding: '15px', 
        backgroundColor: '#fff',
        borderRadius: '8px',
        marginBottom: '15px'
      }}>
        <h3>🎯 Test Booking Flow</h3>
        <button 
          onClick={handleTestBooking}
          disabled={bookingStatus === 'processing'}
          style={{
            padding: '12px 20px',
            backgroundColor: bookingStatus === 'processing' ? '#ccc' : '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: bookingStatus === 'processing' ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {bookingStatus === 'processing' ? 'Processing...' : 'Book Therapist Maya'}
        </button>
        
        {bookingStatus === 'completed' && (
          <p style={{ color: '#059862', marginTop: '10px' }}>
            ✅ Booking enhanced with GPS and sent to therapist!
          </p>
        )}
        
        {bookingStatus === 'error' && (
          <p style={{ color: '#dc3545', marginTop: '10px' }}>
            ❌ Booking failed (check console for details)
          </p>
        )}
      </div>

      {/* Therapist Message Preview */}
      {therapistMessage && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#e8f5e8',
          borderRadius: '8px',
          marginBottom: '15px'
        }}>
          <h3>📱 Message Sent to Therapist</h3>
          <pre style={{ 
            whiteSpace: 'pre-wrap', 
            fontSize: '14px',
            backgroundColor: '#fff',
            padding: '12px',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}>
            {therapistMessage}
          </pre>
        </div>
      )}

      {/* Implementation Guide */}
      <div style={{ 
        padding: '15px', 
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <h3>⚡ How This Works</h3>
        <ol>
          <li><strong>Landing Page:</strong> GPS collected silently (one permission popup)</li>
          <li><strong>Your Booking:</strong> <code>SimpleGPSUtils.enhanceBooking(booking)</code></li>
          <li><strong>Therapist Message:</strong> <code>SimpleGPSUtils.createMessage(gpsBooking)</code></li>
          <li><strong>WhatsApp Send:</strong> Your existing chat system</li>
        </ol>
        
        <h4>🔒 Privacy & Security</h4>
        <ul>
          <li>GPS stored locally only (localStorage)</li>
          <li>Shared with therapist only during booking</li>
          <li>Automatic cleanup after 2 hours</li>
          <li>Graceful fallback if permission denied</li>
        </ul>
        
        <h4>📁 Files Created</h4>
        <ul>
          <li><code>customerGPSCollectionService.ts</code> - GPS collection</li>
          <li><code>simpleGPSBookingIntegration.ts</code> - Booking enhancement</li>
          <li><code>GPSBookingUsageExamples.tsx</code> - Usage examples</li>
          <li>MainLandingPage.tsx - Auto-collection added</li>
        </ul>
      </div>

    </div>
  );
};

export default SimpleGPSBookingDemo;