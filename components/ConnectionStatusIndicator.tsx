/**
 * 🔌 CONNECTION STATUS INDICATOR
 * 
 * Purpose: Visual indicator for chat connection stability
 * Shows connection quality and provides user feedback
 */

import React from 'react';
import { Wifi, WifiOff, AlertTriangle, RotateCw } from 'lucide-react';
import { useConnectionStatus } from '../hooks/useConnectionStatus';
import { ConnectionStatus } from '../lib/services/connectionStabilityService';

interface ConnectionStatusIndicatorProps {
  showDetails?: boolean;
  className?: string;
}

export function ConnectionStatusIndicator({ 
  showDetails = false, 
  className = '' 
}: ConnectionStatusIndicatorProps) {
  const { status, forceReconnect } = useConnectionStatus();

  const getStatusColor = (quality: ConnectionStatus['quality']) => {
    switch (quality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'poor': return 'text-yellow-500';
      case 'disconnected': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    if (!status.isConnected) {
      return <WifiOff className="w-4 h-4" />;
    }

    if (status.quality === 'poor') {
      return <AlertTriangle className="w-4 h-4" />;
    }

    return <Wifi className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (!status.isConnected) {
      return status.reconnectAttempts > 0 ? 'Reconnecting...' : 'Disconnected';
    }

    if (status.connectionType === 'polling') {
      return 'Limited connection';
    }

    return status.quality === 'excellent' ? 'Connected' : `Connected (${status.quality})`;
  };

  const getLatencyText = () => {
    if (status.latency > 0) {
      return `${status.latency}ms`;
    }
    return '';
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div 
        className={`flex items-center gap-1 ${getStatusColor(status.quality)}`}
        title={`Connection: ${getStatusText()} ${getLatencyText()}`}
      >
        {getStatusIcon()}
        {showDetails && (
          <span className="text-xs font-medium">
            {getStatusText()}
          </span>
        )}
      </div>

      {/* Reconnect button for poor/disconnected states */}
      {(status.quality === 'poor' || !status.isConnected) && (
        <button
          onClick={forceReconnect}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
          title="Force reconnect"
        >
          <RotateCcw className="w-3 h-3 text-gray-500 hover:text-orange-500" />
        </button>
      )}

      {/* Connection quality dots */}
      {status.isConnected && !showDetails && (
        <div className="flex items-center gap-0.5 ml-1">
          <div className={`w-1 h-1 rounded-full ${status.quality !== 'disconnected' ? 'bg-green-500' : 'bg-gray-300'}`} />
          <div className={`w-1 h-1 rounded-full ${['good', 'excellent'].includes(status.quality) ? 'bg-green-500' : 'bg-gray-300'}`} />
          <div className={`w-1 h-1 rounded-full ${status.quality === 'excellent' ? 'bg-green-500' : 'bg-gray-300'}`} />
        </div>
      )}
    </div>
  );
}

interface ConnectionStatusBannerProps {
  className?: string;
}

export function ConnectionStatusBanner({ className = '' }: ConnectionStatusBannerProps) {
  const { status, forceReconnect } = useConnectionStatus();

  // Only show banner for poor connection states
  if (status.isConnected && status.quality !== 'poor') {
    return null;
  }

  const getBannerStyle = () => {
    if (!status.isConnected) {
      return 'bg-red-50 border-red-200 text-red-800';
    }
    
    if (status.connectionType === 'polling') {
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }

    return 'bg-orange-50 border-orange-200 text-orange-800';
  };

  const getBannerMessage = () => {
    if (!status.isConnected) {
      if (status.reconnectAttempts > 0) {
        return `Reconnecting... (attempt ${status.reconnectAttempts})`;
      }
      return 'Connection lost. Messages may be delayed.';
    }

    if (status.connectionType === 'polling') {
      return 'Using backup connection. Real-time features limited.';
    }

    return 'Poor connection detected. Messages may be delayed.';
  };

  return (
    <div className={`p-2 border rounded-lg ${getBannerStyle()} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!status.isConnected ? (
            <WifiOff className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">
            {getBannerMessage()}
          </span>
        </div>
        
        <button
          onClick={forceReconnect}
          className="flex items-center gap-1 px-2 py-1 text-xs rounded hover:bg-white/50 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Retry
        </button>
      </div>
    </div>
  );
}