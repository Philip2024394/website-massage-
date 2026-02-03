/**
 * Progressive Warning System Component  
 * Shows escalating red warnings based on violation percentages
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Ban, Shield, Percent, X, TrendingUp, Clock, Eye, EyeOff } from 'lucide-react';
import { violationPercentageService, UserViolationProfile } from '../services/violationPercentageService';
import { professionalChatService } from '../services/professionalChatNotificationService';

interface ProgressiveWarningSystemProps {
  userId: string;
  chatId: string;
  onChatDeactivated?: () => void;
  onViolationRecorded?: (violationId: string) => void;
  className?: string;
}

interface WarningState {
  show: boolean;
  message: string;
  severity: 'info' | 'warning' | 'danger' | 'critical';
  percentage: number;
  showPercentage: boolean;
  canDismiss: boolean;
  autoHide: boolean;
}

export const ProgressiveWarningSystem: React.FC<ProgressiveWarningSystemProps> = ({
  userId,
  chatId,
  onChatDeactivated,
  onViolationRecorded,
  className = ''
}) => {
  const [warningState, setWarningState] = useState<WarningState>({
    show: false,
    message: '',
    severity: 'info',
    percentage: 0,
    showPercentage: false,
    canDismiss: false,
    autoHide: false
  });
  
  const [userProfile, setUserProfile] = useState<UserViolationProfile | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());

  useEffect(() => {
    loadUserProfile();
    
    // Set up periodic checking for violation updates
    const interval = setInterval(loadUserProfile, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    if (userProfile) {
      updateWarningDisplay();
    }
  }, [userProfile]);

  const loadUserProfile = async () => {
    try {
      const profile = await violationPercentageService.getUserViolationProfile(userId);
      setUserProfile(profile);
      setLastUpdateTime(new Date());
      
      // Check if chat should be deactivated
      if (profile.chatDeactivated && !warningState.show) {
        onChatDeactivated?.();
      }
    } catch (error) {
      console.error('Failed to load user violation profile:', error);
    }
  };

  const updateWarningDisplay = async () => {
    if (!userProfile) return;

    const warningConfig = await violationPercentageService.getWarningMessage(userId);
    
    // Determine if warning should be shown
    const shouldShow = userProfile.riskLevel !== 'safe' || userProfile.violationPercentage > 0;
    
    if (shouldShow) {
      setWarningState({
        show: true,
        message: warningConfig.message,
        severity: warningConfig.severity,
        percentage: warningConfig.percentage,
        showPercentage: warningConfig.showPercentage,
        canDismiss: warningConfig.severity !== 'critical',
        autoHide: warningConfig.severity === 'info'
      });

      // Play appropriate sound
      await playWarningSound(warningConfig.severity);
      
      // Auto-hide info messages after 10 seconds
      if (warningConfig.severity === 'info') {
        setTimeout(() => {
          setWarningState(prev => ({ ...prev, show: false }));
        }, 10000);
      }
    } else {
      setWarningState(prev => ({ ...prev, show: false }));
    }
  };

  const playWarningSound = async (severity: string) => {
    try {
      switch (severity) {
        case 'critical':
          await professionalChatService.playChatEffect('booking_urgent');
          break;
        case 'danger':
          await professionalChatService.playChatEffect('payment_notification');
          break;
        case 'warning':
          await professionalChatService.playChatEffect('user_away');
          break;
        default:
          await professionalChatService.playChatEffect('message_sent');
      }
    } catch (error) {
      console.error('Failed to play warning sound:', error);
    }
  };

  const handleDismissWarning = () => {
    if (warningState.canDismiss) {
      setWarningState(prev => ({ ...prev, show: false }));
    }
  };

  const recordViolation = async (violationType: string, details: string) => {
    try {
      const violationId = await violationPercentageService.recordViolation({
        userId,
        chatId,
        violationType: violationType as any,
        severity: 'medium',
        details
      });
      
      onViolationRecorded?.(violationId);
      
      // Reload profile to get updated percentages
      await loadUserProfile();
      
    } catch (error) {
      console.error('Failed to record violation:', error);
    }
  };

  const getWarningStyle = () => {
    const baseStyle = "border-l-4 p-4 rounded-r-lg";
    
    switch (warningState.severity) {
      case 'critical':
        return `${baseStyle} bg-red-100 border-red-600 text-red-800`;
      case 'danger':
        return `${baseStyle} bg-red-50 border-red-500 text-red-700`;
      case 'warning':
        return `${baseStyle} bg-orange-50 border-orange-500 text-orange-700`;
      default:
        return `${baseStyle} bg-blue-50 border-blue-500 text-blue-700`;
    }
  };

  const getWarningIcon = () => {
    switch (warningState.severity) {
      case 'critical':
        return <Ban className="w-6 h-6 text-red-600" />;
      case 'danger':
        return <AlertTriangle className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-orange-500" />;
      default:
        return <Shield className="w-6 h-6 text-blue-500" />;
    }
  };

  const getPercentageColor = () => {
    if (!userProfile) return 'bg-gray-500';
    
    if (userProfile.violationPercentage >= 90) return 'bg-red-600';
    if (userProfile.violationPercentage >= 60) return 'bg-red-500';
    if (userProfile.violationPercentage >= 40) return 'bg-orange-500';
    return 'bg-green-500';
  };

  if (!warningState.show || !userProfile) {
    return null;
  }

  return (
    <div className={`${getWarningStyle()} ${className}`}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getWarningIcon()}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Main Warning Message */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h4 className="font-bold text-lg mb-1">
                {warningState.message}
              </h4>
              
              {/* Percentage Display */}
              {warningState.showPercentage && (
                <div className="flex items-center gap-3 mb-2">
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-white text-sm font-bold ${getPercentageColor()}`}>
                    <Percent className="w-4 h-4" />
                    <span>{userProfile.violationPercentage}%</span>
                    <span className="text-xs">Violations</span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-medium">Total Violations:</span> {userProfile.totalViolations}
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-medium">Recent (24h):</span> {
                      userProfile.violationHistory.filter(v => 
                        new Date(v.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
                      ).length
                    }
                  </div>
                </div>
              )}

              {/* Detailed Warning Text */}
              <div className="space-y-2 text-sm">
                {warningState.severity === 'critical' && (
                  <div className="bg-red-200 bg-opacity-50 p-3 rounded-lg">
                    <p className="font-bold">⛔ CHAT PERMANENTLY DEACTIVATED</p>
                    <p>This conversation has been terminated due to serious policy violations.</p>
                    <p className="text-xs mt-1">Contact customer support for appeal within 48 hours.</p>
                  </div>
                )}
                
                {warningState.severity === 'danger' && userProfile.violationPercentage >= 75 && (
                  <div className="bg-red-100 bg-opacity-70 p-3 rounded-lg">
                    <p className="font-bold">🚨 FINAL WARNING</p>
                    <p>One more policy violation will permanently deactivate your chat access.</p>
                    <p className="text-xs mt-1">Next violation = immediate termination.</p>
                  </div>
                )}
                
                {warningState.severity === 'danger' && userProfile.violationPercentage >= 60 && userProfile.violationPercentage < 75 && (
                  <div className="bg-red-100 bg-opacity-70 p-3 rounded-lg">
                    <p className="font-bold">⛔ STRICTLY FORBIDDEN</p>
                    <p>Sharing personal contact information violates our platform policies.</p>
                    <p className="text-xs mt-1">Use our secure booking system for all communication.</p>
                  </div>
                )}
                
                {warningState.severity === 'warning' && (
                  <div className="bg-orange-100 bg-opacity-70 p-3 rounded-lg">
                    <p className="font-bold">⚠️ POLICY REMINDER</p>
                    <p>Multiple violations detected. Please follow platform guidelines.</p>
                    <p className="text-xs mt-1">Keep all communication professional and platform-based.</p>
                  </div>
                )}
              </div>

              {/* Show Details Toggle */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-1 mt-3 text-sm font-medium hover:underline"
              >
                {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showDetails ? 'Hide' : 'Show'} Violation Details
              </button>

              {/* Detailed Information */}
              {showDetails && (
                <div className="mt-3 p-3 bg-white bg-opacity-50 rounded-lg border space-y-3">
                  {/* Violation Breakdown */}
                  <div>
                    <h5 className="font-semibold text-sm mb-2">📊 Violation Breakdown</h5>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="font-medium">Total Messages:</span> {userProfile.totalMessages}
                      </div>
                      <div>
                        <span className="font-medium">Total Violations:</span> {userProfile.totalViolations}
                      </div>
                      <div>
                        <span className="font-medium">Violation Rate:</span> {userProfile.violationPercentage}%
                      </div>
                      <div>
                        <span className="font-medium">Risk Level:</span> 
                        <span className={`ml-1 px-1 rounded text-xs font-bold ${
                          userProfile.riskLevel === 'critical' ? 'bg-red-600 text-white' :
                          userProfile.riskLevel === 'danger' ? 'bg-red-500 text-white' :
                          userProfile.riskLevel === 'warning' ? 'bg-orange-500 text-white' :
                          'bg-green-500 text-white'
                        }`}>
                          {userProfile.riskLevel.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Violations */}
                  {userProfile.violationHistory.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-sm mb-2">🔍 Recent Violations</h5>
                      <div className="space-y-1 max-h-20 overflow-y-auto">
                        {userProfile.violationHistory.slice(-3).map((violation, index) => (
                          <div key={violation.id} className="text-xs p-2 bg-white bg-opacity-70 rounded border-l-2 border-red-300">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{violation.violationType.replace('_', ' ')}</span>
                              <span className="text-gray-500">{new Date(violation.timestamp).toLocaleDateString()}</span>
                            </div>
                            <p className="text-gray-600 mt-1">{violation.details}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Account Restrictions */}
                  <div>
                    <h5 className="font-semibold text-sm mb-2">🔒 Current Restrictions</h5>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span>Chat Access:</span>
                        <span className={userProfile.restrictions.chatDisabled ? 'text-red-600 font-bold' : 'text-green-600'}>
                          {userProfile.restrictions.chatDisabled ? 'DISABLED' : 'Active'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Booking Access:</span>
                        <span className={userProfile.restrictions.bookingRestricted ? 'text-orange-600 font-bold' : 'text-green-600'}>
                          {userProfile.restrictions.bookingRestricted ? 'RESTRICTED' : 'Active'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Account Status:</span>
                        <span className={userProfile.restrictions.accountFlagged ? 'text-red-600 font-bold' : 'text-green-600'}>
                          {userProfile.restrictions.accountFlagged ? 'FLAGGED' : 'Good Standing'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Last Update */}
                  <div className="pt-2 border-t text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Last updated: {lastUpdateTime.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Dismiss Button */}
            {warningState.canDismiss && (
              <button
                onClick={handleDismissWarning}
                className="flex-shrink-0 p-1 hover:bg-white hover:bg-opacity-30 rounded transition-colors"
                title="Dismiss warning"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {warningState.showPercentage && (
        <div className="mt-3 pl-9">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Violation Progress</span>
          </div>
          <div className="w-full bg-white bg-opacity-50 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                userProfile.violationPercentage >= 90 ? 'bg-red-600' :
                userProfile.violationPercentage >= 60 ? 'bg-red-500' :
                userProfile.violationPercentage >= 40 ? 'bg-orange-500' :
                'bg-yellow-500'
              }`}
              style={{ width: `${Math.min(userProfile.violationPercentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span>0%</span>
            <span className="font-bold">40% Warning</span>
            <span className="font-bold">60% Danger</span>
            <span className="font-bold">90% Critical</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressiveWarningSystem;