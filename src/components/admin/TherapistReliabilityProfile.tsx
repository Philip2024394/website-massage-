/**
 * Therapist Reliability Profile (Admin View)
 * 
 * PURPOSE: See patterns, not excuses
 * 
 * DISPLAYS:
 * - Complete booking performance metrics
 * - Response time analytics
 * - Availability score trends (30-day graph)
 * - Behavioral flags (high miss rate, decline abuse, etc.)
 * - Penalty history
 */

import React, { useState, useEffect } from 'react';
import './TherapistReliabilityProfile.css';

interface PerformanceMetrics {
  totalBookingsReceived: number;
  totalAccepted: number;
  totalDeclined: number;
  totalMissed: number;
  acceptanceRate: number; // percentage
  missedLast7Days: number;
  missedLast30Days: number;
  missedLifetime: number;
  avgResponseTime: number; // seconds
  currentScore: number;
  scoreHistory: { date: string; score: number }[];
  penaltiesApplied: {
    date: string;
    type: string;
    reason: string;
    scoreDelta: number;
  }[];
  flags: {
    type: 'high-miss-rate' | 'decline-abuse' | 'non-responsive' | 'pattern-detected';
    severity: 'low' | 'medium' | 'high';
    description: string;
  }[];
}

interface TherapistInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  joinedDate: string;
  status: 'active' | 'suspended' | 'warned';
  lastActive: string;
}

export const TherapistReliabilityProfile: React.FC<{ therapistId: string }> = ({ therapistId }) => {
  const [therapist, setTherapist] = useState<TherapistInfo | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'lifetime'>('30d');

  useEffect(() => {
    loadTherapistData();
  }, [therapistId]);

  const loadTherapistData = async () => {
    try {
      // TODO: Fetch from Appwrite
      // Mock data for demonstration
      const mockTherapist: TherapistInfo = {
        id: 'TH-67890',
        name: 'Wayan Sutrisna',
        email: 'wayan@example.com',
        phone: '+62 812-3456-7890',
        city: 'Ubud',
        joinedDate: '2025-06-15',
        status: 'active',
        lastActive: '2026-01-01T13:45:00Z'
      };

      const mockMetrics: PerformanceMetrics = {
        totalBookingsReceived: 147,
        totalAccepted: 125,
        totalDeclined: 10,
        totalMissed: 12,
        acceptanceRate: 85.0,
        missedLast7Days: 2,
        missedLast30Days: 5,
        missedLifetime: 12,
        avgResponseTime: 134, // seconds
        currentScore: 75,
        scoreHistory: generateMockScoreHistory(),
        penaltiesApplied: [
          {
            date: '2026-01-01',
            type: 'Missed Booking',
            reason: 'No response within 5 minutes',
            scoreDelta: -10
          },
          {
            date: '2025-12-28',
            type: 'Missed Booking',
            reason: 'No response within 5 minutes',
            scoreDelta: -10
          },
          {
            date: '2025-12-20',
            type: 'Consecutive Misses (3x)',
            reason: 'Pattern of non-responsiveness',
            scoreDelta: -20
          }
        ],
        flags: [
          {
            type: 'high-miss-rate',
            severity: 'medium',
            description: '3.4% miss rate in last 30 days (threshold: 5%)'
          },
          {
            type: 'non-responsive',
            severity: 'high',
            description: 'Average response time >2 minutes (target: <1 minute)'
          }
        ]
      };

      setTherapist(mockTherapist);
      setMetrics(mockMetrics);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load therapist data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading therapist profile...</div>;
  }

  if (!therapist || !metrics) {
    return <div className="error">Therapist not found</div>;
  }

  return (
    <div className="therapist-reliability-profile">
      <div className="profile-header">
        <div className="therapist-info">
          <h1>{therapist.name}</h1>
          <div className="info-row">
            <span className="info-label">ID:</span>
            <span>{therapist.id}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Email:</span>
            <span>{therapist.email}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Phone:</span>
            <span>{therapist.phone}</span>
          </div>
          <div className="info-row">
            <span className="info-label">City:</span>
            <span>{therapist.city}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Joined:</span>
            <span>{new Date(therapist.joinedDate).toLocaleDateString()}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Status:</span>
            <span className={`status-badge ${therapist.status}`}>
              {therapist.status.toUpperCase()}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Last Active:</span>
            <span>{new Date(therapist.lastActive).toLocaleString()}</span>
          </div>
        </div>

        <div className="current-score-card">
          <div className="score-label">Current Availability Score</div>
          <div className={`score-value ${getScoreClass(metrics.currentScore)}`}>
            {metrics.currentScore}
          </div>
          <div className="score-badge">{getScoreBadge(metrics.currentScore)}</div>
        </div>
      </div>

      {/* Behavioral Flags */}
      {metrics.flags.length > 0 && (
        <div className="flags-section">
          <h2>🚩 Behavioral Flags</h2>
          <div className="flags-grid">
            {metrics.flags.map((flag, index) => (
              <div key={index} className={`flag-card severity-${flag.severity}`}>
                <div className="flag-icon">
                  {flag.severity === 'high' ? '🔴' : flag.severity === 'medium' ? '🟠' : '🟡'}
                </div>
                <div className="flag-content">
                  <div className="flag-type">{formatFlagType(flag.type)}</div>
                  <div className="flag-desc">{flag.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="metrics-section">
        <h2>📊 Performance Metrics</h2>
        
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">Total Bookings</div>
            <div className="metric-value">{metrics.totalBookingsReceived}</div>
            <div className="metric-subtext">Received</div>
          </div>

          <div className="metric-card highlight-green">
            <div className="metric-label">Acceptance Rate</div>
            <div className="metric-value">{metrics.acceptanceRate.toFixed(1)}%</div>
            <div className="metric-subtext">{metrics.totalAccepted} accepted</div>
          </div>

          <div className="metric-card highlight-red">
            <div className="metric-label">Missed Bookings</div>
            <div className="metric-value">{metrics.totalMissed}</div>
            <div className="metric-subtext">Lifetime total</div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Avg Response Time</div>
            <div className={`metric-value ${getResponseTimeClass(metrics.avgResponseTime)}`}>
              {formatTime(metrics.avgResponseTime)}
            </div>
            <div className="metric-subtext">Target: &lt;60s</div>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="time-range-selector">
          <button
            className={timeRange === '7d' ? 'active' : ''}
            onClick={() => setTimeRange('7d')}
          >
            Last 7 Days
          </button>
          <button
            className={timeRange === '30d' ? 'active' : ''}
            onClick={() => setTimeRange('30d')}
          >
            Last 30 Days
          </button>
          <button
            className={timeRange === 'lifetime' ? 'active' : ''}
            onClick={() => setTimeRange('lifetime')}
          >
            Lifetime
          </button>
        </div>

        <div className="detailed-metrics">
          <div className="metric-row">
            <span className="metric-row-label">Missed (7 days)</span>
            <span className={`metric-row-value ${metrics.missedLast7Days > 2 ? 'warning' : ''}`}>
              {metrics.missedLast7Days}
            </span>
          </div>
          <div className="metric-row">
            <span className="metric-row-label">Missed (30 days)</span>
            <span className={`metric-row-value ${metrics.missedLast30Days > 5 ? 'danger' : ''}`}>
              {metrics.missedLast30Days}
            </span>
          </div>
          <div className="metric-row">
            <span className="metric-row-label">Missed (Lifetime)</span>
            <span className="metric-row-value">{metrics.missedLifetime}</span>
          </div>
          <div className="metric-row">
            <span className="metric-row-label">Declined</span>
            <span className="metric-row-value">{metrics.totalDeclined}</span>
          </div>
        </div>
      </div>

      {/* Score Trend Graph */}
      <div className="score-trend-section">
        <h2>📈 Availability Score Trend (30 Days)</h2>
        <div className="score-graph">
          <ScoreTrendGraph data={metrics.scoreHistory} />
        </div>
      </div>

      {/* Penalty History */}
      <div className="penalty-section">
        <h2>⚠️ Penalty History</h2>
        {metrics.penaltiesApplied.length > 0 ? (
          <table className="penalty-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Reason</th>
                <th>Score Impact</th>
              </tr>
            </thead>
            <tbody>
              {metrics.penaltiesApplied.map((penalty, index) => (
                <tr key={index}>
                  <td>{new Date(penalty.date).toLocaleDateString()}</td>
                  <td>{penalty.type}</td>
                  <td>{penalty.reason}</td>
                  <td className="score-delta negative">{penalty.scoreDelta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-penalties">No penalties applied</p>
        )}
      </div>

      {/* Admin Actions */}
      <div className="admin-actions">
        <h2>🛠️ Admin Actions</h2>
        <div className="action-buttons">
          <button className="action-btn view-logs">
            📋 View Full Logs
          </button>
          <button className="action-btn send-warning">
            ⚠️ Send Warning
          </button>
          <button className="action-btn temp-suspend">
            ⏸️ Temporary Suspend
          </button>
          <button className="action-btn manual-score">
            ✏️ Manual Score Adjust
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper Functions
function getScoreClass(score: number): string {
  if (score >= 90) return 'elite';
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  return 'poor';
}

function getScoreBadge(score: number): string {
  if (score >= 90) return '⭐ Elite';
  if (score >= 80) return '🥇 Excellent';
  if (score >= 60) return '✅ Good';
  if (score >= 40) return '⚠️ Fair';
  return '❌ Poor';
}

function formatFlagType(type: string): string {
  return type.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

function getResponseTimeClass(seconds: number): string {
  if (seconds <= 60) return 'excellent';
  if (seconds <= 180) return 'good';
  return 'poor';
}

function generateMockScoreHistory(): { date: string; score: number }[] {
  const history = [];
  let currentScore = 85;
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    currentScore += Math.floor(Math.random() * 10) - 5; // Random fluctuation
    currentScore = Math.max(0, Math.min(100, currentScore));
    history.push({
      date: date.toISOString().split('T')[0],
      score: currentScore
    });
  }
  return history;
}

// Simple Score Trend Graph Component
const ScoreTrendGraph: React.FC<{ data: { date: string; score: number }[] }> = ({ data }) => {
  const maxScore = 100;
  const height = 200;
  const width = 800;
  
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - (item.score / maxScore) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="score-graph-svg">
      {/* Grid lines */}
      <line x1="0" y1={height * 0.1} x2={width} y2={height * 0.1} stroke="#e5e7eb" strokeWidth="1" />
      <line x1="0" y1={height * 0.2} x2={width} y2={height * 0.2} stroke="#e5e7eb" strokeWidth="1" />
      <line x1="0" y1={height * 0.5} x2={width} y2={height * 0.5} stroke="#e5e7eb" strokeWidth="1" />
      <line x1="0" y1={height * 0.8} x2={width} y2={height * 0.8} stroke="#e5e7eb" strokeWidth="1" />
      
      {/* Score line */}
      <polyline
        points={points}
        fill="none"
        stroke="#3b82f6"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Score points */}
      {data.map((item, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - (item.score / maxScore) * height;
        return (
          <circle
            key={index}
            cx={x}
            cy={y}
            r="4"
            fill="#3b82f6"
          />
        );
      })}
      
      {/* Labels */}
      <text x="0" y="15" fontSize="12" fill="#6b7280">100</text>
      <text x="0" y={height - 5} fontSize="12" fill="#6b7280">0</text>
    </svg>
  );
};

export default TherapistReliabilityProfile;
