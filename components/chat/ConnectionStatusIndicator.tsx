/**
 * ConnectionStatusIndicator Component
 * Displays connection status and provides manual retry options
 */

import React from 'react';
import { Wifi, WifiOff, RefreshCw, AlertTriangle, Clock } from 'lucide-react';

export interface ConnectionStatusIndicatorProps {
  isConnected: boolean;
  isReconnecting?: boolean;
  lastConnected?: Date;
  queuedMessages?: number;
  onRetry?: () => void;
  onOfflineMode?: () => void;
}

export const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({
  isConnected,
  isReconnecting = false,
  lastConnected,
  queuedMessages = 0,
  onRetry,
  onOfflineMode
}) => {
  // Don't show anything if connected and no issues
  if (isConnected && !isReconnecting && queuedMessages === 0) {
    return null;
  }

  const getStatusColor = () => {
    if (isConnected) return 'green';
    if (isReconnecting) return 'yellow';
    return 'red';
  };

  const getStatusMessage = () => {
    if (isReconnecting) return 'Reconnecting...';
    if (!isConnected) return 'Connection lost';
    if (queuedMessages > 0) return `${queuedMessages} messages pending`;
    return 'Connected';
  };

  const statusColor = getStatusColor();
  const colorClasses = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: 'text-green-500'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: 'text-yellow-500'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: 'text-red-500'
    }
  };

  const classes = colorClasses[statusColor];

  return (
    <div className={`mx-4 mb-2 p-3 rounded-xl border ${classes.bg} ${classes.border}`}>
      <div className="flex items-center gap-3">
        {/* Status Icon */}
        <div className="flex-shrink-0">
          {isReconnecting ? (
            <RefreshCw className={`w-5 h-5 ${classes.icon} animate-spin`} />
          ) : isConnected ? (
            <Wifi className={`w-5 h-5 ${classes.icon}`} />
          ) : (
            <WifiOff className={`w-5 h-5 ${classes.icon}`} />
          )}
        </div>

        {/* Status Message */}
        <div className="flex-1">
          <p className={`font-semibold text-sm ${classes.text}`}>
            {getStatusMessage()}
          </p>
          
          {/* Last Connected Time */}
          {!isConnected && lastConnected && (
            <p className="text-xs text-gray-500 mt-1">
              Last connected: {lastConnected.toLocaleTimeString()}
            </p>
          )}
          
          {/* Queued Messages Info */}
          {queuedMessages > 0 && (
            <p className="text-xs text-gray-600 mt-1">
              Messages will be sent when connection is restored
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!isConnected && !isReconnecting && onRetry && (
            <button
              onClick={onRetry}
              className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-all flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          )}
          
          {!isConnected && onOfflineMode && (
            <button
              onClick={onOfflineMode}
              className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-300 transition-all"
            >
              Offline Mode
            </button>
          )}
        </div>
      </div>

      {/* Offline Mode Notice */}
      {!isConnected && !isReconnecting && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-gray-600">
              <p className="font-semibold mb-1">Connection Issues:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Messages may not be delivered immediately</li>
                <li>Booking updates may be delayed</li>
                <li>Try refreshing if issues persist</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Reconnecting Progress */}
      {isReconnecting && (
        <div className="mt-3">
          <div className="w-full bg-yellow-200 rounded-full h-2">
            <div className="bg-yellow-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
          <p className="text-xs text-yellow-700 mt-1 text-center">Attempting to reconnect...</p>
        </div>
      )}
    </div>
  );
};