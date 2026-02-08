/**
 * Enhanced Chat Window with Advanced Split Phone Detection
 * Integrates sophisticated circumvention detection and prevention
 */

import React, { useState, useEffect, useRef } from 'react';
import { Send, Shield, AlertTriangle, X, Eye, EyeOff, Ban } from 'lucide-react';
import { chatModerationService } from '../services/chatModerationService';
import { splitPhoneDetectionService, SplitPhoneDetection, CircumventionAlert } from '../services/splitPhoneDetectionService';
import { professionalChatService } from '../services/professionalChatNotificationService';
import { logger } from '../utils/logger';

interface AdvancedChatWindowProps {
  chatId: string;
  currentUserId: string;
  recipientId: string;
  recipientName: string;
  userRole: 'customer' | 'therapist' | 'admin';
  onSendMessage?: (message: string) => void;
  messages?: any[];
}

interface SplitDetectionAlert {
  detection: SplitPhoneDetection;
  riskLevel: CircumventionAlert;
  showDetails: boolean;
}

export const AdvancedChatWindow: React.FC<AdvancedChatWindowProps> = ({
  chatId,
  currentUserId,
  recipientId,
  recipientName,
  userRole,
  onSendMessage,
  messages = []
}) => {
  const [messageText, setMessageText] = useState('');
  const [splitDetectionAlert, setSplitDetectionAlert] = useState<SplitDetectionAlert | null>(null);
  const [circumventionWarning, setCircumventionWarning] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [userRiskLevel, setUserRiskLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('low');
  const inputRef = useRef<HTMLInputElement>(null);

  // Chat moderation is automatically initialized on first use

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessageText(value);
    
    // Clear alerts when user starts typing
    if (splitDetectionAlert) {
      setSplitDetectionAlert(null);
    }
    if (circumventionWarning) {
      setCircumventionWarning(null);
    }
  };

  const analyzeSplitAttempt = async (text: string) => {
    // Get recent messages for analysis (last 6 messages in past 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentMessages = messages
      .filter(msg => msg.senderId === currentUserId && new Date(msg.timestamp) > tenMinutesAgo)
      .slice(-6)
      .map(msg => ({
        text: msg.content,
        timestamp: new Date(msg.timestamp),
        chatId
      }));

    // Add current message to analysis
    recentMessages.push({
      text,
      timestamp: new Date(),
      chatId
    });

    // Analyze for split phone attempts
    const detection = splitPhoneDetectionService.analyzeSplitAttempt(currentUserId, recentMessages);
    
    if (detection) {
      const riskAssessment = splitPhoneDetectionService.assessCircumventionRisk(currentUserId, detection);
      
      setUserRiskLevel(riskAssessment.riskLevel);
      
      // Show detailed alert for split attempts
      setSplitDetectionAlert({
        detection,
        riskLevel: riskAssessment,
        showDetails: false
      });

      // Block message if high risk
      if (riskAssessment.riskLevel === 'high' || riskAssessment.riskLevel === 'critical') {
        setIsBlocked(true);
        
        // Play urgent warning sound
        await professionalChatService.playChatEffect('message_received');
        
        // Show circumvention warning
        if (riskAssessment.riskLevel === 'critical') {
          setCircumventionWarning('🚨 CRITICAL: Multiple circumvention attempts detected. Account under review.');
        } else {
          setCircumventionWarning('⚠️ HIGH RISK: Repeated policy violations detected. Further attempts may result in account restrictions.');
        }

        return false; // Block the message
      }
      
      // Warn for medium risk
      if (riskAssessment.riskLevel === 'medium') {
        await professionalChatService.playChatEffect('typing_start');
        return false; // Block but allow override
      }
      
      // Just warn for low risk
      if (riskAssessment.riskLevel === 'low') {
        await professionalChatService.playChatEffect('message_sent');
        // Allow message but show warning
      }
    }

    return true;
  };

  const handleSendMessage = async (overrideDetection = false) => {
    if (!messageText.trim() || isSending) return;

    setIsSending(true);

    try {
      // Check for split phone attempts first (unless overriding)
      if (!overrideDetection) {
        const splitAllowed = await analyzeSplitAttempt(messageText);
        if (!splitAllowed) {
          setIsSending(false);
          return;
        }
      }

      // Regular moderation validation
      const validation = await chatModerationService.filterMessage(
        currentUserId,
        messageText,
        'general'
      );

      if (!validation.isAllowed && !overrideDetection) {
        // Show regular filter alert (using existing component logic)
        setIsSending(false);
        return;
      }

      // Send message
      await onSendMessage?.(messageText);
      
      // Clear input and alerts
      setMessageText('');
      setSplitDetectionAlert(null);
      setCircumventionWarning(null);
      
      // Play success sound
      await professionalChatService.playChatEffect('message_sent');
      
      inputRef.current?.focus();
      
    } catch (error) {
      logger.error('Send message error:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleOverrideDetection = () => {
    handleSendMessage(true);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'high':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'medium':
        return 'bg-orange-50 border-orange-200 text-orange-700';
      default:
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return <Ban className="w-5 h-5 text-red-600" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default:
        return <Shield className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header with Risk Indicator */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
            {recipientName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{recipientName}</h3>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-500">Online</span>
              {userRiskLevel !== 'low' && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                  userRiskLevel === 'critical' ? 'bg-red-100 text-red-700' :
                  userRiskLevel === 'high' ? 'bg-red-50 text-red-600' :
                  'bg-orange-50 text-orange-600'
                }`}>
                  {getRiskIcon(userRiskLevel)}
                  <span>{userRiskLevel.toUpperCase()} RISK</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-500" title="Protected chat" />
        </div>
      </div>

      {/* Circumvention Warning Banner */}
      {circumventionWarning && (
        <div className="bg-red-50 border-b border-red-200 p-4">
          <div className="flex items-center gap-3">
            <Ban className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-800">Account Flagged</h4>
              <p className="text-red-700 text-sm">{circumventionWarning}</p>
            </div>
            <button
              onClick={() => setCircumventionWarning(null)}
              className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Split Detection Alert */}
      {splitDetectionAlert && (
        <div className={`border-b p-4 ${getRiskColor(splitDetectionAlert.riskLevel.riskLevel)}`}>
          <div className="flex items-start gap-3">
            {getRiskIcon(splitDetectionAlert.riskLevel.riskLevel)}
            <div className="flex-1">
              <h4 className="font-semibold mb-2">
                🚨 Split Phone Number Attempt Detected
              </h4>
              
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Detection Type:</strong> {splitDetectionAlert.detection.detectionType.replace('_', ' ')}
                  <span className="ml-2 px-2 py-1 bg-white bg-opacity-50 rounded text-xs">
                    {Math.round(splitDetectionAlert.detection.confidence * 100)}% confidence
                  </span>
                </p>
                
                <p>
                  <strong>Risk Level:</strong> 
                  <span className={`ml-1 px-2 py-1 rounded text-xs font-medium ${getRiskColor(splitDetectionAlert.riskLevel.riskLevel)}`}>
                    {splitDetectionAlert.riskLevel.riskLevel.toUpperCase()}
                  </span>
                </p>

                <p><strong>Attempts Today:</strong> {splitDetectionAlert.riskLevel.attemptCount}</p>
              </div>

              {/* Detected Messages */}
              <div className="mt-3">
                <button
                  onClick={() => setSplitDetectionAlert(prev => prev ? {...prev, showDetails: !prev.showDetails} : null)}
                  className="flex items-center gap-1 text-sm font-medium hover:underline"
                >
                  {splitDetectionAlert.showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {splitDetectionAlert.showDetails ? 'Hide' : 'Show'} Detection Details
                </button>
                
                {splitDetectionAlert.showDetails && (
                  <div className="mt-2 p-3 bg-white bg-opacity-50 rounded">
                    <p className="text-xs font-medium mb-2">Analyzed Messages:</p>
                    <div className="space-y-1">
                      {splitDetectionAlert.detection.messages.map((msg, index) => (
                        <div key={index} className="text-xs p-2 bg-white bg-opacity-70 rounded border-l-2 border-gray-300">
                          "{msg}"
                        </div>
                      ))}
                    </div>
                    <p className="text-xs mt-2">
                      <strong>Reconstructed:</strong> {splitDetectionAlert.detection.reconstructedNumber}
                    </p>
                  </div>
                )}
              </div>

              {/* Suggestions */}
              <div className="mt-3 text-sm">
                <p className="font-medium mb-1">💡 Suggestions:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  {splitPhoneDetectionService.getSuggestions(splitDetectionAlert.detection).map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {splitDetectionAlert.riskLevel.riskLevel === 'low' && (
                <button
                  onClick={handleOverrideDetection}
                  className="p-1 text-orange-600 hover:bg-orange-100 rounded transition-colors text-xs"
                  title="Send anyway (not recommended)"
                >
                  Override
                </button>
              )}
              <button
                onClick={() => setSplitDetectionAlert(null)}
                className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Shield className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Advanced Protection Active 🛡️</h3>
            <div className="text-center max-w-sm text-sm space-y-1">
              <p>This chat is protected by advanced AI moderation including:</p>
              <ul className="list-disc list-inside text-xs mt-2 space-y-1">
                <li>Split phone number detection</li>
                <li>Circumvention attempt tracking</li>
                <li>Risk-based user scoring</li>
                <li>Real-time pattern analysis</li>
              </ul>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className="mb-4">
              {/* Render your existing message component */}
              <div className={`p-3 rounded-lg max-w-xs ${
                message.senderId === currentUserId 
                  ? 'bg-blue-500 text-white ml-auto' 
                  : 'bg-gray-100'
              }`}>
                {message.content}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={messageText}
              onChange={handleInputChange}
              placeholder={isBlocked ? "Messages blocked due to policy violations" : "Type your message..."}
              className={`w-full p-3 pr-12 border rounded-xl transition-colors ${
                isBlocked 
                  ? 'border-red-300 bg-red-50 text-red-700 placeholder-red-400 cursor-not-allowed'
                  : userRiskLevel === 'high'
                  ? 'border-orange-300 bg-orange-50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
                  : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              }`}
              disabled={isSending || isBlocked}
              maxLength={1000}
            />
            <div className="absolute right-3 bottom-3 text-xs text-gray-400">
              {messageText.length}/1000
            </div>
          </div>
          
          <button
            onClick={() => handleSendMessage()}
            disabled={!messageText.trim() || isSending || isBlocked}
            className={`p-3 rounded-xl transition-colors flex items-center justify-center min-w-[48px] ${
              isBlocked
                ? 'bg-red-300 text-red-500 cursor-not-allowed'
                : userRiskLevel === 'high'
                ? 'bg-orange-500 hover:bg-orange-600 text-white disabled:bg-gray-300'
                : 'bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-300'
            }`}
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isBlocked ? (
              <Ban className="w-5 h-5" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Safety Status */}
        <div className="flex items-center justify-between mt-2 text-xs">
          <div className="flex items-center gap-2 text-gray-500">
            <Shield className="w-3 h-3" />
            <span>Advanced split detection active</span>
          </div>
          <div className={`flex items-center gap-1 ${
            userRiskLevel === 'critical' ? 'text-red-600' :
            userRiskLevel === 'high' ? 'text-red-500' :  
            userRiskLevel === 'medium' ? 'text-orange-500' :
            'text-green-500'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              userRiskLevel === 'critical' ? 'bg-red-600' :
              userRiskLevel === 'high' ? 'bg-red-500' :
              userRiskLevel === 'medium' ? 'bg-orange-500' :
              'bg-green-500'
            }`}></div>
            <span>
              {userRiskLevel === 'critical' ? 'Blocked' :
               userRiskLevel === 'high' ? 'High Risk' :
               userRiskLevel === 'medium' ? 'Medium Risk' : 'Safe'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedChatWindow;