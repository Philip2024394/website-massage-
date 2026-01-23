/**
 * EnhancedTimerComponent
 * Advanced timer with visual urgency indicators and multiple timer types
 */

import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, Pause, Play, RotateCcw } from 'lucide-react';

type TimerType = 'response' | 'service' | 'break' | 'overtime';

interface EnhancedTimerComponentProps {
  type: TimerType;
  initialSeconds: number;
  title: string;
  description?: string;
  onExpire?: () => void;
  onWarning?: (secondsLeft: number) => void;
  isActive?: boolean;
  canPause?: boolean;
  warningThreshold?: number; // seconds before expire to show warning
  urgentThreshold?: number; // seconds before expire to show urgent state
}

export const EnhancedTimerComponent: React.FC<EnhancedTimerComponentProps> = ({
  type,
  initialSeconds,
  title,
  description,
  onExpire,
  onWarning,
  isActive = true,
  canPause = false,
  warningThreshold = 60, // 1 minute
  urgentThreshold = 30 // 30 seconds
}) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isPaused, setIsPaused] = useState(!isActive);
  const [hasExpired, setHasExpired] = useState(false);

  useEffect(() => {
    if (isPaused || hasExpired) return;

    const interval = setInterval(() => {
      setSeconds(prevSeconds => {
        const newSeconds = prevSeconds - 1;
        
        // Check for warning threshold
        if (newSeconds === warningThreshold && onWarning) {
          onWarning(newSeconds);
        }
        
        // Check for expiration
        if (newSeconds <= 0) {
          setHasExpired(true);
          if (onExpire) {
            onExpire();
          }
          return 0;
        }
        
        return newSeconds;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, hasExpired, onExpire, onWarning, warningThreshold]);

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerState = () => {
    if (hasExpired) return 'expired';
    if (seconds <= urgentThreshold) return 'urgent';
    if (seconds <= warningThreshold) return 'warning';
    return 'normal';
  };

  const getTimerColors = () => {
    const state = getTimerState();
    switch (state) {
      case 'expired':
        return {
          bg: 'bg-red-100',
          border: 'border-red-300',
          text: 'text-red-800',
          accent: 'text-red-600',
          progress: 'bg-red-500'
        };
      case 'urgent':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          accent: 'text-red-500',
          progress: 'bg-red-400'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          accent: 'text-yellow-600',
          progress: 'bg-yellow-500'
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          accent: 'text-blue-600',
          progress: 'bg-blue-500'
        };
    }
  };

  const colors = getTimerColors();
  const state = getTimerState();
  const progressPercentage = ((initialSeconds - seconds) / initialSeconds) * 100;

  const getIcon = () => {
    if (hasExpired) return <AlertTriangle className="w-6 h-6" />;
    if (isPaused) return <Pause className="w-6 h-6" />;
    return <Clock className={`w-6 h-6 ${state === 'urgent' ? 'animate-pulse' : ''}`} />;
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'response': return '📱 Response Timer';
      case 'service': return '✨ Service Timer';
      case 'break': return '☕ Break Timer';
      case 'overtime': return '⏰ Overtime';
      default: return '🕰️ Timer';
    }
  };

  return (
    <div className={`mx-4 mb-3 p-4 rounded-xl border-2 ${colors.bg} ${colors.border} ${state === 'urgent' ? 'animate-pulse' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={colors.accent}>
            {getIcon()}
          </div>
          <div>
            <h4 className={`font-bold ${colors.text}`}>{title}</h4>
            <p className="text-xs text-gray-600">{getTypeLabel()}</p>
          </div>
        </div>
        
        {/* Control Buttons */}
        {canPause && !hasExpired && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                setSeconds(initialSeconds);
                setHasExpired(false);
                setIsPaused(false);
              }}
              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Timer Display */}
      <div className="text-center mb-4">
        <div className={`text-4xl font-mono font-bold ${colors.accent} ${state === 'urgent' ? 'animate-bounce' : ''}`}>
          {formatTime(seconds)}
        </div>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-1000 ${colors.progress}`}
            style={{ width: `${Math.min(100, progressPercentage)}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Started</span>
          <span>{hasExpired ? 'Expired' : isPaused ? 'Paused' : 'Active'}</span>
          <span>Ends</span>
        </div>
      </div>

      {/* Status Messages */}
      <div className="text-center">
        {hasExpired && (
          <div className="flex items-center justify-center gap-2 text-red-700 font-semibold">
            <AlertTriangle className="w-5 h-5" />
            <span>Timer Expired!</span>
          </div>
        )}
        
        {state === 'urgent' && !hasExpired && (
          <div className="flex items-center justify-center gap-2 text-red-600 font-semibold">
            <AlertTriangle className="w-4 h-4" />
            <span>Urgent: {seconds} seconds remaining</span>
          </div>
        )}
        
        {state === 'warning' && (
          <div className="flex items-center justify-center gap-2 text-yellow-600 font-medium">
            <Clock className="w-4 h-4" />
            <span>Ending soon: {formatTime(seconds)} left</span>
          </div>
        )}
        
        {isPaused && (
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Pause className="w-4 h-4" />
            <span>Timer paused</span>
          </div>
        )}
      </div>

      {/* Type-specific messages */}
      {type === 'response' && state === 'warning' && (
        <div className="mt-3 p-2 bg-yellow-100 rounded-lg">
          <p className="text-xs text-yellow-800 text-center">
            🔍 Searching for alternative therapists if no response...
          </p>
        </div>
      )}

      {type === 'service' && state === 'normal' && (
        <div className="mt-3 p-2 bg-blue-100 rounded-lg">
          <p className="text-xs text-blue-800 text-center">
            ✨ Enjoy your relaxing massage session
          </p>
        </div>
      )}

      {type === 'overtime' && (
        <div className="mt-3 p-2 bg-orange-100 rounded-lg">
          <p className="text-xs text-orange-800 text-center">
            💰 Additional charges may apply for extended service
          </p>
        </div>
      )}
    </div>
  );
};