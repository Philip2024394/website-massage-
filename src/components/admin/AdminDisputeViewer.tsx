/**
 * Admin Booking Dispute Viewer
 * 
 * PURPOSE: Answer "Was the therapist fairly notified?"
 * 
 * DISPLAYS:
 * - Complete notification timeline
 * - Device acknowledgment logs
 * - System evidence (timestamps, logs)
 * - Availability score impact
 * 
 * ACTIONS:
 * - Mark dispute as invalid (system worked)
 * - Grant one-time grace (exception)
 * - Flag abuse (pattern detected)
 */

import React, { useState, useEffect } from 'react';
import './AdminDisputeViewer.css';

interface NotificationLog {
  timestamp: string;
  event: string;
  details: string;
  deviceInfo?: string;
}

interface DisputeData {
  bookingId: string;
  therapistId: string;
  therapistName: string;
  customerName: string;
  serviceName: string;
  bookingDate: string;
  availabilityStatusAtTime: 'available' | 'busy' | 'offline';
  notificationTimeline: NotificationLog[];
  therapistAction: 'accepted' | 'declined' | 'missed';
  declineReason?: string;
  responseTime?: number; // milliseconds
  scoreBefore: number;
  scoreAfter: number;
  scoreDelta: number;
  disputeReason?: string;
  disputeSubmittedAt?: string;
}

export const AdminDisputeViewer: React.FC<{ disputeId: string }> = ({ disputeId }) => {
  const [dispute, setDispute] = useState<DisputeData | null>(null);
  const [resolution, setResolution] = useState<'invalid' | 'grace' | 'abuse' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDisputeData();
  }, [disputeId]);

  const loadDisputeData = async () => {
    try {
      // TODO: Fetch from Appwrite
      // For now, mock data
      const mockData: DisputeData = {
        bookingId: 'BK-12345',
        therapistId: 'TH-67890',
        therapistName: 'Wayan Sutrisna',
        customerName: 'J.S.',
        serviceName: 'Traditional Thai Massage',
        bookingDate: '2026-01-01T14:00:00Z',
        availabilityStatusAtTime: 'available',
        notificationTimeline: [
          {
            timestamp: '2026-01-01T13:45:00.123Z',
            event: 'Push Notification Sent',
            details: 'Initial notification dispatched to device',
            deviceInfo: 'Chrome 120, Windows 11'
          },
          {
            timestamp: '2026-01-01T13:45:00.456Z',
            event: 'Push Delivered',
            details: 'Browser confirmed delivery',
            deviceInfo: 'Service Worker active'
          },
          {
            timestamp: '2026-01-01T13:45:01.234Z',
            event: 'Notification Displayed',
            details: 'System notification shown to user',
            deviceInfo: 'Display confirmed'
          },
          {
            timestamp: '2026-01-01T13:47:00.123Z',
            event: 'First Escalation (2 min)',
            details: 'Second notification sent - "FINAL WARNING (1/2)"',
            deviceInfo: 'Chrome active, tab open'
          },
          {
            timestamp: '2026-01-01T13:49:00.123Z',
            event: 'Second Escalation (4 min)',
            details: 'Third notification sent - "FINAL WARNING (2/2)"',
            deviceInfo: 'Chrome active, tab open'
          },
          {
            timestamp: '2026-01-01T13:50:00.123Z',
            event: 'Booking Expired (5 min)',
            details: 'No response received within deadline',
            deviceInfo: 'Auto-expired by system'
          }
        ],
        therapistAction: 'missed',
        responseTime: undefined,
        scoreBefore: 85,
        scoreAfter: 75,
        scoreDelta: -10,
        disputeReason: 'Therapist claims notifications not received',
        disputeSubmittedAt: '2026-01-01T14:30:00Z'
      };

      setDispute(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load dispute:', error);
      setLoading(false);
    }
  };

  const handleResolveDispute = async (resolutionType: 'invalid' | 'grace' | 'abuse') => {
    try {
      // TODO: Update Appwrite with resolution
      console.log('Resolving dispute:', resolutionType, adminNotes);
      
      // Update dispute record
      // await databases.updateDocument(...)
      
      alert(`Dispute marked as: ${resolutionType.toUpperCase()}`);
      setResolution(resolutionType);
    } catch (error) {
      console.error('Failed to resolve dispute:', error);
      alert('Failed to resolve dispute');
    }
  };

  if (loading) {
    return <div className="loading">Loading dispute data...</div>;
  }

  if (!dispute) {
    return <div className="error">Dispute not found</div>;
  }

  return (
    <div className="admin-dispute-viewer">
      <div className="dispute-header">
        <h1>🔍 Booking Dispute Investigation</h1>
        <div className="dispute-id">Dispute ID: {disputeId}</div>
        <div className="booking-id">Booking ID: {dispute.bookingId}</div>
      </div>

      <div className="dispute-summary">
        <div className="summary-card">
          <h3>Therapist</h3>
          <p><strong>{dispute.therapistName}</strong></p>
          <p>ID: {dispute.therapistId}</p>
          <p>Status at time: <span className={`status-${dispute.availabilityStatusAtTime}`}>
            {dispute.availabilityStatusAtTime.toUpperCase()}
          </span></p>
        </div>

        <div className="summary-card">
          <h3>Booking Details</h3>
          <p>Customer: {dispute.customerName}</p>
          <p>Service: {dispute.serviceName}</p>
          <p>Date: {new Date(dispute.bookingDate).toLocaleString()}</p>
        </div>

        <div className="summary-card">
          <h3>Outcome</h3>
          <p>Action: <span className={`action-${dispute.therapistAction}`}>
            {dispute.therapistAction.toUpperCase()}
          </span></p>
          {dispute.responseTime && (
            <p>Response time: {(dispute.responseTime / 1000).toFixed(1)}s</p>
          )}
          {dispute.declineReason && (
            <p>Reason: {dispute.declineReason}</p>
          )}
        </div>

        <div className="summary-card score-impact">
          <h3>Score Impact</h3>
          <p>Before: <span className="score">{dispute.scoreBefore}</span></p>
          <p>After: <span className="score">{dispute.scoreAfter}</span></p>
          <p>Change: <span className={`delta ${dispute.scoreDelta < 0 ? 'negative' : 'positive'}`}>
            {dispute.scoreDelta > 0 ? '+' : ''}{dispute.scoreDelta}
          </span></p>
        </div>
      </div>

      <div className="dispute-reason">
        <h3>Therapist's Dispute Claim</h3>
        <div className="dispute-claim">
          <p>"{dispute.disputeReason}"</p>
          <p className="submitted-at">Submitted: {new Date(dispute.disputeSubmittedAt!).toLocaleString()}</p>
        </div>
      </div>

      <div className="notification-timeline">
        <h2>📱 Notification Timeline (System Evidence)</h2>
        <p className="timeline-intro">
          <strong>Critical Question:</strong> Was the therapist fairly notified?
        </p>

        <div className="timeline">
          {dispute.notificationTimeline.map((log, index) => (
            <div key={index} className="timeline-event">
              <div className="event-marker">{index + 1}</div>
              <div className="event-content">
                <div className="event-header">
                  <span className="event-name">{log.event}</span>
                  <span className="event-time">{new Date(log.timestamp).toLocaleTimeString()}.{new Date(log.timestamp).getMilliseconds()}</span>
                </div>
                <div className="event-details">{log.details}</div>
                {log.deviceInfo && (
                  <div className="event-device">Device: {log.deviceInfo}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="system-evidence">
        <h2>🔬 System Evidence Analysis</h2>
        
        <div className="evidence-grid">
          <div className="evidence-item">
            <div className="evidence-label">Push Sent</div>
            <div className="evidence-value success">✅ Confirmed</div>
            <div className="evidence-proof">Timestamp: 13:45:00.123</div>
          </div>

          <div className="evidence-item">
            <div className="evidence-label">Push Delivered</div>
            <div className="evidence-value success">✅ Confirmed</div>
            <div className="evidence-proof">Browser ACK received</div>
          </div>

          <div className="evidence-item">
            <div className="evidence-label">Device Status</div>
            <div className="evidence-value success">✅ Active</div>
            <div className="evidence-proof">Chrome open, tab active</div>
          </div>

          <div className="evidence-item">
            <div className="evidence-label">Escalations</div>
            <div className="evidence-value success">✅ Sent (3 total)</div>
            <div className="evidence-proof">2min, 4min intervals</div>
          </div>

          <div className="evidence-item">
            <div className="evidence-label">Service Worker</div>
            <div className="evidence-value success">✅ Active</div>
            <div className="evidence-proof">v5 registered</div>
          </div>

          <div className="evidence-item">
            <div className="evidence-label">Therapist Response</div>
            <div className="evidence-value failed">❌ None</div>
            <div className="evidence-proof">Expired after 5:00</div>
          </div>
        </div>
      </div>

      <div className="verdict-section">
        <h2>⚖️ Admin Verdict</h2>
        
        <div className="verdict-options">
          <button
            className={`verdict-btn invalid ${resolution === 'invalid' ? 'selected' : ''}`}
            onClick={() => setResolution('invalid')}
          >
            <span className="verdict-icon">❌</span>
            <span className="verdict-title">Dispute Invalid</span>
            <span className="verdict-desc">System worked correctly. Therapist was fairly notified.</span>
          </button>

          <button
            className={`verdict-btn grace ${resolution === 'grace' ? 'selected' : ''}`}
            onClick={() => setResolution('grace')}
          >
            <span className="verdict-icon">⚠️</span>
            <span className="verdict-title">One-Time Grace</span>
            <span className="verdict-desc">Restore score as exception. Flag for monitoring.</span>
          </button>

          <button
            className={`verdict-btn abuse ${resolution === 'abuse' ? 'selected' : ''}`}
            onClick={() => setResolution('abuse')}
          >
            <span className="verdict-icon">🚫</span>
            <span className="verdict-title">Abuse Detected</span>
            <span className="verdict-desc">Pattern of frivolous disputes. Apply additional penalty.</span>
          </button>
        </div>

        {resolution && (
          <div className="verdict-details">
            <h3>Admin Notes (Internal Only)</h3>
            <textarea
              className="admin-notes"
              placeholder="Add internal notes about this decision..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={4}
            />

            <div className="verdict-actions">
              <button
                className="btn-cancel"
                onClick={() => setResolution(null)}
              >
                Cancel
              </button>
              <button
                className="btn-confirm"
                onClick={() => handleResolveDispute(resolution)}
              >
                Confirm Resolution: {resolution.toUpperCase()}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="terms-reference">
        <h3>📜 Terms & Conditions Reference</h3>
        <p>
          <strong>Section 2.3 - Platform Non-Liability:</strong> "The Platform is NOT responsible 
          for missed bookings resulting from device on silent, network issues, browser restrictions, 
          or app not being open."
        </p>
        <p>
          <strong>Section 6.2 - Evidentiary Standard:</strong> "Decisions based on system logs, 
          timestamps, and notification delivery records shall be considered final and conclusive."
        </p>
        <a 
          href="/?page=therapist-terms-and-conditions" 
          target="_blank"
          className="terms-link"
        >
          View Full Terms & Conditions →
        </a>
      </div>
    </div>
  );
};

export default AdminDisputeViewer;
