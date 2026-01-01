/**
 * Admin Enforcement Console
 * 
 * PURPOSE: Apply consequences cleanly
 * 
 * ACTIONS:
 * - Temporary availability lock (24h / 72h / 7d)
 * - Manual score adjustment (admin-only)
 * - Remove badges
 * - Suspend account
 * - Add internal notes (not visible to therapist)
 */

import React, { useState } from 'react';
import './AdminEnforcementConsole.css';

interface EnforcementAction {
  type: 'lock' | 'score-adjust' | 'badge-remove' | 'suspend' | 'note';
  severity: 'low' | 'medium' | 'high' | 'critical';
  duration?: string;
  value?: number;
  reason: string;
  adminNotes: string;
}

export const AdminEnforcementConsole: React.FC<{ therapistId: string; therapistName: string }> = ({ 
  therapistId, 
  therapistName 
}) => {
  const [actionType, setActionType] = useState<EnforcementAction['type'] | null>(null);
  const [lockDuration, setLockDuration] = useState<'24h' | '72h' | '7d' | '30d'>('24h');
  const [scoreAdjustment, setScoreAdjustment] = useState<number>(0);
  const [reason, setReason] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [confirmAction, setConfirmAction] = useState<boolean>(false);

  const handleApplyEnforcement = async () => {
    if (!actionType || !reason) {
      alert('Please select an action type and provide a reason');
      return;
    }

    if (!confirmAction) {
      alert('Please confirm the action before proceeding');
      return;
    }

    const enforcement: EnforcementAction = {
      type: actionType,
      severity: getSeverity(actionType, lockDuration, scoreAdjustment),
      duration: actionType === 'lock' || actionType === 'suspend' ? lockDuration : undefined,
      value: actionType === 'score-adjust' ? scoreAdjustment : undefined,
      reason,
      adminNotes
    };

    try {
      // TODO: Send to Appwrite
      console.log('Applying enforcement:', enforcement);
      
      // Update therapist record
      // await databases.updateDocument(...)
      
      // Create enforcement log
      // await databases.createDocument('enforcement_logs', ...)
      
      alert(`Enforcement action applied successfully: ${actionType.toUpperCase()}`);
      
      // Reset form
      setActionType(null);
      setReason('');
      setAdminNotes('');
      setConfirmAction(false);
    } catch (error) {
      console.error('Failed to apply enforcement:', error);
      alert('Failed to apply enforcement action');
    }
  };

  return (
    <div className="admin-enforcement-console">
      <div className="console-header">
        <h1>🛠️ Enforcement Console</h1>
        <div className="therapist-context">
          <span className="context-label">Therapist:</span>
          <span className="context-value">{therapistName}</span>
          <span className="context-label">ID:</span>
          <span className="context-value">{therapistId}</span>
        </div>
      </div>

      <div className="warning-banner">
        <span className="warning-icon">⚠️</span>
        <div className="warning-content">
          <strong>Admin Actions are Permanent</strong>
          <p>All enforcement actions are logged and irreversible. Ensure you have reviewed all evidence before proceeding.</p>
        </div>
      </div>

      <div className="action-selector">
        <h2>Select Enforcement Action</h2>
        
        <div className="action-cards">
          {/* Temporary Lock */}
          <div 
            className={`action-card ${actionType === 'lock' ? 'selected' : ''}`}
            onClick={() => setActionType('lock')}
          >
            <div className="action-icon">🔒</div>
            <div className="action-title">Temporary Availability Lock</div>
            <div className="action-description">
              Prevent therapist from marking themselves available for a set period
            </div>
            <div className="action-severity severity-medium">Medium Impact</div>
          </div>

          {/* Manual Score Adjustment */}
          <div 
            className={`action-card ${actionType === 'score-adjust' ? 'selected' : ''}`}
            onClick={() => setActionType('score-adjust')}
          >
            <div className="action-icon">✏️</div>
            <div className="action-title">Manual Score Adjustment</div>
            <div className="action-description">
              Add or subtract points from availability score (admin override)
            </div>
            <div className="action-severity severity-low">Low Impact</div>
          </div>

          {/* Remove Badges */}
          <div 
            className={`action-card ${actionType === 'badge-remove' ? 'selected' : ''}`}
            onClick={() => setActionType('badge-remove')}
          >
            <div className="action-icon">🚫</div>
            <div className="action-title">Remove Performance Badges</div>
            <div className="action-description">
              Strip Elite/Excellent badges as disciplinary action
            </div>
            <div className="action-severity severity-medium">Medium Impact</div>
          </div>

          {/* Account Suspension */}
          <div 
            className={`action-card ${actionType === 'suspend' ? 'selected' : ''}`}
            onClick={() => setActionType('suspend')}
          >
            <div className="action-icon">⏸️</div>
            <div className="action-title">Account Suspension</div>
            <div className="action-description">
              Temporarily disable account access and all bookings
            </div>
            <div className="action-severity severity-high">High Impact</div>
          </div>

          {/* Internal Note */}
          <div 
            className={`action-card ${actionType === 'note' ? 'selected' : ''}`}
            onClick={() => setActionType('note')}
          >
            <div className="action-icon">📝</div>
            <div className="action-title">Add Internal Note</div>
            <div className="action-description">
              Add admin note to therapist record (not visible to therapist)
            </div>
            <div className="action-severity severity-low">No Impact</div>
          </div>
        </div>
      </div>

      {/* Action-Specific Options */}
      {actionType && (
        <div className="action-options">
          <h2>Configure Action</h2>

          {/* Temporary Lock Options */}
          {actionType === 'lock' && (
            <div className="option-group">
              <label className="option-label">Lock Duration</label>
              <div className="duration-selector">
                <button 
                  className={lockDuration === '24h' ? 'active' : ''}
                  onClick={() => setLockDuration('24h')}
                >
                  24 Hours
                </button>
                <button 
                  className={lockDuration === '72h' ? 'active' : ''}
                  onClick={() => setLockDuration('72h')}
                >
                  72 Hours (3 Days)
                </button>
                <button 
                  className={lockDuration === '7d' ? 'active' : ''}
                  onClick={() => setLockDuration('7d')}
                >
                  7 Days
                </button>
                <button 
                  className={lockDuration === '30d' ? 'active' : ''}
                  onClick={() => setLockDuration('30d')}
                >
                  30 Days
                </button>
              </div>
            </div>
          )}

          {/* Score Adjustment Options */}
          {actionType === 'score-adjust' && (
            <div className="option-group">
              <label className="option-label">Score Adjustment</label>
              <div className="score-adjuster">
                <button onClick={() => setScoreAdjustment(Math.max(-50, scoreAdjustment - 5))}>-5</button>
                <button onClick={() => setScoreAdjustment(Math.max(-50, scoreAdjustment - 1))}>-1</button>
                <input 
                  type="number" 
                  value={scoreAdjustment} 
                  onChange={(e) => setScoreAdjustment(Math.max(-50, Math.min(50, parseInt(e.target.value) || 0)))}
                  min="-50"
                  max="50"
                />
                <button onClick={() => setScoreAdjustment(Math.min(50, scoreAdjustment + 1))}>+1</button>
                <button onClick={() => setScoreAdjustment(Math.min(50, scoreAdjustment + 5))}>+5</button>
              </div>
              <div className="score-preview">
                {scoreAdjustment > 0 ? `+${scoreAdjustment}` : scoreAdjustment} points
                {scoreAdjustment > 0 && <span className="preview-note"> (Grace/Correction)</span>}
                {scoreAdjustment < 0 && <span className="preview-note"> (Penalty)</span>}
              </div>
            </div>
          )}

          {/* Suspension Options */}
          {actionType === 'suspend' && (
            <div className="option-group">
              <label className="option-label">Suspension Duration</label>
              <div className="duration-selector">
                <button 
                  className={lockDuration === '24h' ? 'active' : ''}
                  onClick={() => setLockDuration('24h')}
                >
                  24 Hours
                </button>
                <button 
                  className={lockDuration === '72h' ? 'active' : ''}
                  onClick={() => setLockDuration('72h')}
                >
                  3 Days
                </button>
                <button 
                  className={lockDuration === '7d' ? 'active' : ''}
                  onClick={() => setLockDuration('7d')}
                >
                  7 Days
                </button>
                <button 
                  className={lockDuration === '30d' ? 'active' : ''}
                  onClick={() => setLockDuration('30d')}
                >
                  30 Days
                </button>
              </div>
              <div className="suspension-warning">
                ⚠️ Therapist will be unable to log in during suspension period
              </div>
            </div>
          )}

          {/* Reason (Required for all actions) */}
          <div className="option-group">
            <label className="option-label">Reason (Required) *</label>
            <select 
              className="reason-selector"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="">-- Select Reason --</option>
              <option value="repeated-missed-bookings">Repeated Missed Bookings</option>
              <option value="pattern-of-non-responsiveness">Pattern of Non-Responsiveness</option>
              <option value="dispute-abuse">Frivolous Dispute Claims</option>
              <option value="whatsapp-bypass">Platform Bypass (WhatsApp)</option>
              <option value="customer-complaint">Customer Complaint</option>
              <option value="terms-violation">Terms & Conditions Violation</option>
              <option value="admin-discretion">Admin Discretion</option>
              <option value="grace-exception">Grace Exception (Restore Score)</option>
              <option value="other">Other (Specify in Notes)</option>
            </select>
          </div>

          {/* Admin Notes (Internal Only) */}
          <div className="option-group">
            <label className="option-label">Admin Notes (Internal Only)</label>
            <textarea
              className="admin-notes-textarea"
              placeholder="Add internal notes about this enforcement action. These notes are NOT visible to the therapist."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={4}
            />
          </div>

          {/* Confirmation */}
          <div className="confirmation-section">
            <label className="confirmation-checkbox">
              <input 
                type="checkbox"
                checked={confirmAction}
                onChange={(e) => setConfirmAction(e.target.checked)}
              />
              <span>
                I confirm that I have reviewed all evidence and understand that this action is permanent and logged.
              </span>
            </label>
          </div>

          {/* Summary Preview */}
          <div className="action-summary">
            <h3>Action Summary</h3>
            <div className="summary-row">
              <span className="summary-label">Action Type:</span>
              <span className="summary-value">{formatActionType(actionType)}</span>
            </div>
            {(actionType === 'lock' || actionType === 'suspend') && (
              <div className="summary-row">
                <span className="summary-label">Duration:</span>
                <span className="summary-value">{lockDuration}</span>
              </div>
            )}
            {actionType === 'score-adjust' && (
              <div className="summary-row">
                <span className="summary-label">Score Change:</span>
                <span className={`summary-value ${scoreAdjustment < 0 ? 'negative' : 'positive'}`}>
                  {scoreAdjustment > 0 ? '+' : ''}{scoreAdjustment} points
                </span>
              </div>
            )}
            <div className="summary-row">
              <span className="summary-label">Reason:</span>
              <span className="summary-value">{reason || 'Not specified'}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Therapist:</span>
              <span className="summary-value">{therapistName} ({therapistId})</span>
            </div>
          </div>

          {/* Apply Button */}
          <div className="apply-actions">
            <button 
              className="btn-cancel"
              onClick={() => {
                setActionType(null);
                setReason('');
                setAdminNotes('');
                setConfirmAction(false);
              }}
            >
              Cancel
            </button>
            <button 
              className="btn-apply"
              onClick={handleApplyEnforcement}
              disabled={!reason || !confirmAction}
            >
              Apply Enforcement Action
            </button>
          </div>
        </div>
      )}

      {/* Terms Reference */}
      <div className="terms-reference">
        <h3>📜 Legal Framework Reference</h3>
        <p>
          <strong>Section 4 - Penalties:</strong> "Platform reserves the right to apply progressive 
          penalties including temporary locks, score reductions, and account suspensions."
        </p>
        <p>
          <strong>Section 6 - Platform Authority:</strong> "All enforcement decisions are final 
          and based on system logs and admin review."
        </p>
        <a href="/?page=therapist-terms-and-conditions" target="_blank" className="terms-link">
          View Full Terms & Conditions →
        </a>
      </div>
    </div>
  );
};

// Helper Functions
function getSeverity(
  type: EnforcementAction['type'], 
  duration: string, 
  scoreAdjustment: number
): EnforcementAction['severity'] {
  if (type === 'suspend') return 'critical';
  if (type === 'lock' && duration === '30d') return 'high';
  if (type === 'lock') return 'medium';
  if (type === 'score-adjust' && Math.abs(scoreAdjustment) > 20) return 'high';
  if (type === 'badge-remove') return 'medium';
  return 'low';
}

function formatActionType(type: EnforcementAction['type']): string {
  const types: Record<string, string> = {
    'lock': 'Temporary Availability Lock',
    'score-adjust': 'Manual Score Adjustment',
    'badge-remove': 'Remove Performance Badges',
    'suspend': 'Account Suspension',
    'note': 'Internal Admin Note'
  };
  return types[type] || type;
}

export default AdminEnforcementConsole;
