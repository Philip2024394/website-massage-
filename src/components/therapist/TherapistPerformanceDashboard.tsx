/**
 * Therapist Performance Dashboard
 * 
 * PURPOSE: Psychology + Transparency
 * 
 * DISPLAYS (User-Facing):
 * 1. Availability Score Card (current score, status, impact)
 * 2. Response Performance (metrics with color coding)
 * 3. Missed Booking History (table with dates and impacts)
 * 4. How to Improve (actionable tips)
 * 5. Earnings Correlation (powerful motivator)
 * 
 * This dashboard is for THERAPISTS to see their own performance
 */

import React, { useState, useEffect } from 'react';
import './TherapistPerformanceDashboard.css';

interface PerformanceData {
  currentScore: number;
  badge: string;
  badgeEmoji: string;
  visibilityImpact: string;
  avgResponseTime: number; // seconds
  acceptedOnTime: number; // percentage
  missedLast30Days: number;
  totalBookings: number;
  acceptanceRate: number;
  recentHistory: {
    date: string;
    service: string;
    response: 'accepted' | 'declined' | 'missed';
    responseTime?: number;
    impact: string;
  }[];
  improvementTips: string[];
  earningsComparison: {
    yourEarnings: number;
    averageEarnings: number;
    topEarnings: number;
    potentialIncrease: number;
  };
}

export const TherapistPerformanceDashboard: React.FC<{ therapistId: string }> = ({ therapistId }) => {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPerformanceData();
  }, [therapistId]);

  const loadPerformanceData = async () => {
    try {
      // TODO: Fetch from Appwrite
      // Mock data for demonstration
      const mockData: PerformanceData = {
        currentScore: 82,
        badge: 'Excellent',
        badgeEmoji: '🥇',
        visibilityImpact: '+20%',
        avgResponseTime: 134, // 2m 14s
        acceptedOnTime: 87,
        missedLast30Days: 2,
        totalBookings: 45,
        acceptanceRate: 93,
        recentHistory: [
          {
            date: '2026-01-01',
            service: 'Traditional Thai Massage',
            response: 'missed',
            impact: '-10 score'
          },
          {
            date: '2025-12-30',
            service: 'Deep Tissue Massage',
            response: 'accepted',
            responseTime: 45,
            impact: '+7 score'
          },
          {
            date: '2025-12-28',
            service: 'Foot Reflexology',
            response: 'accepted',
            responseTime: 180,
            impact: '+5 score'
          },
          {
            date: '2025-12-25',
            service: 'Aromatherapy Massage',
            response: 'declined',
            impact: '0 score'
          },
          {
            date: '2025-12-23',
            service: 'Swedish Massage',
            response: 'accepted',
            responseTime: 35,
            impact: '+7 score'
          }
        ],
        improvementTips: [
          'Keep the app open when marked available',
          'Disable silent mode during work hours',
          'Set yourself unavailable when busy',
          'Fast responses increase visibility & income',
          'Accept bookings within 1 minute for +7 points'
        ],
        earningsComparison: {
          yourEarnings: 12500000, // IDR per month
          averageEarnings: 9800000,
          topEarnings: 16500000,
          potentialIncrease: 32
        }
      };

      setData(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load performance data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading your performance data...</div>;
  }

  if (!data) {
    return <div className="error">Unable to load performance data</div>;
  }

  return (
    <div className="therapist-performance-dashboard">
      <div className="dashboard-header">
        <h1>📊 Your Performance Dashboard</h1>
        <p className="header-subtitle">Track your responsiveness and earnings potential</p>
      </div>

      {/* Section 1: Availability Score Card */}
      <div className="score-card-section">
        <div className="score-card">
          <div className="score-main">
            <div className="score-label">Availability Score</div>
            <div className={`score-display ${getScoreColorClass(data.currentScore)}`}>
              {data.currentScore} <span className="score-max">/ 100</span>
            </div>
            <div className="score-badge">{data.badgeEmoji} {data.badge}</div>
          </div>
          
          <div className="score-details">
            <div className="detail-item">
              <span className="detail-label">Status:</span>
              <span className={`detail-value ${getStatusClass(data.currentScore)}`}>
                {getStatusText(data.currentScore)}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Booking Visibility:</span>
              <span className={`detail-value ${data.visibilityImpact.startsWith('+') ? 'positive' : 'negative'}`}>
                {data.visibilityImpact} visibility
              </span>
            </div>
          </div>

          <div className="score-tooltip">
            <strong>💡 What this means:</strong> Your score reflects how quickly you respond to bookings. 
            Higher scores = more bookings = more income!
          </div>
        </div>

        {/* Score Range Guide */}
        <div className="score-range-guide">
          <h3>Score Ranges</h3>
          <div className="range-item elite">
            <span className="range-emoji">⭐</span>
            <span className="range-label">Elite (90-100)</span>
            <span className="range-effect">+50% visibility</span>
          </div>
          <div className="range-item excellent">
            <span className="range-emoji">🥇</span>
            <span className="range-label">Excellent (80-89)</span>
            <span className="range-effect">+20% visibility</span>
          </div>
          <div className="range-item good">
            <span className="range-emoji">✅</span>
            <span className="range-label">Good (60-79)</span>
            <span className="range-effect">Normal visibility</span>
          </div>
          <div className="range-item fair">
            <span className="range-emoji">⚠️</span>
            <span className="range-label">Fair (40-59)</span>
            <span className="range-effect">-40% visibility</span>
          </div>
          <div className="range-item poor">
            <span className="range-emoji">❌</span>
            <span className="range-label">Poor (0-39)</span>
            <span className="range-effect">-70% visibility</span>
          </div>
        </div>
      </div>

      {/* Section 2: Response Performance */}
      <div className="performance-metrics-section">
        <h2>📈 Response Performance</h2>
        
        <div className="metrics-grid">
          <div className={`metric-card ${getMetricClass('responseTime', data.avgResponseTime)}`}>
            <div className="metric-icon">⏱️</div>
            <div className="metric-value">{formatResponseTime(data.avgResponseTime)}</div>
            <div className="metric-label">Avg Response Time</div>
            <div className="metric-target">Target: &lt;1 minute</div>
          </div>

          <div className={`metric-card ${getMetricClass('onTime', data.acceptedOnTime)}`}>
            <div className="metric-icon">✅</div>
            <div className="metric-value">{data.acceptedOnTime}%</div>
            <div className="metric-label">Accepted On Time</div>
            <div className="metric-target">Target: &gt;90%</div>
          </div>

          <div className={`metric-card ${getMetricClass('missed', data.missedLast30Days)}`}>
            <div className="metric-icon">⏰</div>
            <div className="metric-value">{data.missedLast30Days}</div>
            <div className="metric-label">Missed (30 days)</div>
            <div className="metric-target">Target: 0</div>
          </div>

          <div className="metric-card positive">
            <div className="metric-icon">📊</div>
            <div className="metric-value">{data.acceptanceRate}%</div>
            <div className="metric-label">Acceptance Rate</div>
            <div className="metric-target">Excellent!</div>
          </div>
        </div>
      </div>

      {/* Section 3: Missed Booking History */}
      <div className="history-section">
        <h2>📅 Recent Booking History</h2>
        
        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Service</th>
                <th>Response</th>
                <th>Time</th>
                <th>Impact</th>
              </tr>
            </thead>
            <tbody>
              {data.recentHistory.map((item, index) => (
                <tr key={index} className={`response-${item.response}`}>
                  <td>{new Date(item.date).toLocaleDateString()}</td>
                  <td>{item.service}</td>
                  <td>
                    <span className={`response-badge ${item.response}`}>
                      {item.response === 'accepted' && '✅'}
                      {item.response === 'declined' && '⚠️'}
                      {item.response === 'missed' && '❌'}
                      {' '}
                      {item.response.charAt(0).toUpperCase() + item.response.slice(1)}
                    </span>
                  </td>
                  <td>
                    {item.responseTime ? formatResponseTime(item.responseTime) : '-'}
                  </td>
                  <td className={getImpactClass(item.impact)}>
                    {item.impact}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 4: How to Improve */}
      <div className="improvement-section">
        <h2>🎯 How to Improve Your Score</h2>
        
        <div className="tips-grid">
          {data.improvementTips.map((tip, index) => (
            <div key={index} className="tip-card">
              <span className="tip-number">{index + 1}</span>
              <span className="tip-text">{tip}</span>
            </div>
          ))}
        </div>

        <div className="scoring-guide">
          <h3>Point System</h3>
          <div className="scoring-table">
            <div className="scoring-row positive">
              <span className="scoring-action">Accept &lt;1 minute</span>
              <span className="scoring-points">+7 points</span>
            </div>
            <div className="scoring-row positive">
              <span className="scoring-action">Accept 1-5 minutes</span>
              <span className="scoring-points">+5 points</span>
            </div>
            <div className="scoring-row positive">
              <span className="scoring-action">Accept &gt;5 minutes</span>
              <span className="scoring-points">+2 points</span>
            </div>
            <div className="scoring-row neutral">
              <span className="scoring-action">Decline with reason</span>
              <span className="scoring-points">0 points</span>
            </div>
            <div className="scoring-row negative">
              <span className="scoring-action">Miss booking (&gt;5 min)</span>
              <span className="scoring-points">-10 points</span>
            </div>
            <div className="scoring-row negative-severe">
              <span className="scoring-action">Miss 3+ consecutive</span>
              <span className="scoring-points">-20 points</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: Earnings Correlation (POWERFUL) */}
      <div className="earnings-section">
        <h2>💰 Earnings Potential</h2>
        
        <div className="earnings-comparison">
          <div className="earnings-card your-earnings">
            <div className="earnings-label">Your Monthly Earnings</div>
            <div className="earnings-value">
              Rp {data.earningsComparison.yourEarnings.toLocaleString('id-ID')}
            </div>
          </div>

          <div className="earnings-card average-earnings">
            <div className="earnings-label">Platform Average</div>
            <div className="earnings-value">
              Rp {data.earningsComparison.averageEarnings.toLocaleString('id-ID')}
            </div>
          </div>

          <div className="earnings-card top-earnings">
            <div className="earnings-label">Top Performers</div>
            <div className="earnings-value">
              Rp {data.earningsComparison.topEarnings.toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        <div className="earnings-insight">
          <div className="insight-icon">🚀</div>
          <div className="insight-content">
            <h3>Therapists with score 90+ earn {data.earningsComparison.potentialIncrease}% more bookings!</h3>
            <p>
              By improving your score from {data.currentScore} to 90+, you could potentially earn 
              <strong> Rp {((data.earningsComparison.yourEarnings * (1 + data.earningsComparison.potentialIncrease / 100)) - data.earningsComparison.yourEarnings).toLocaleString('id-ID')} more per month</strong>!
            </p>
          </div>
        </div>
      </div>

      {/* Terms Reference */}
      <div className="dashboard-footer">
        <p>
          📜 Learn more about our <a href="/?page=therapist-terms-and-conditions" target="_blank">Therapist Terms & Conditions</a>
        </p>
      </div>
    </div>
  );
};

// Helper Functions
function getScoreColorClass(score: number): string {
  if (score >= 90) return 'elite';
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  return 'poor';
}

function getStatusClass(score: number): string {
  if (score >= 80) return 'positive';
  if (score >= 60) return 'neutral';
  return 'negative';
}

function getStatusText(score: number): string {
  if (score >= 90) return '✅ Highly Responsive';
  if (score >= 80) return '✅ Responsive';
  if (score >= 60) return '⚠️ Needs Improvement';
  if (score >= 40) return '⚠️ At Risk';
  return '❌ Critical';
}

function formatResponseTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

function getMetricClass(type: string, value: number): string {
  if (type === 'responseTime') {
    if (value <= 60) return 'positive';
    if (value <= 180) return 'neutral';
    return 'negative';
  }
  if (type === 'onTime') {
    if (value >= 90) return 'positive';
    if (value >= 70) return 'neutral';
    return 'negative';
  }
  if (type === 'missed') {
    if (value === 0) return 'positive';
    if (value <= 2) return 'neutral';
    return 'negative';
  }
  return 'neutral';
}

function getImpactClass(impact: string): string {
  if (impact.includes('+')) return 'impact-positive';
  if (impact.includes('-')) return 'impact-negative';
  return 'impact-neutral';
}

export default TherapistPerformanceDashboard;
