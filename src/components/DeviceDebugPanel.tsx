import React, { useState, useEffect } from 'react';
import { useMobileDetection } from '../hooks/useMobileDetection';
import { getDeviceDebugInfo, startViewportMonitoring, createDebugOverlay } from '../utils/deviceDebug';
import type { DeviceDebugInfo } from '../utils/deviceDebug';

/**
 * Interactive Device Debug Panel Component
 * Shows live device information with debugging tools
 */
export default function DeviceDebugPanel() {
  const mobile = useMobileDetection();
  const [debugInfo, setDebugInfo] = useState<DeviceDebugInfo | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [hasOverlay, setHasOverlay] = useState(false);
  const [monitoringCleanup, setMonitoringCleanup] = useState<(() => void) | null>(null);
  const [overlayCleanup, setOverlayCleanup] = useState<(() => void) | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Update debug info
  const updateDebugInfo = () => {
    setDebugInfo(getDeviceDebugInfo());
  };

  // Initialize debug info
  useEffect(() => {
    updateDebugInfo();
  }, []);

  // Auto-refresh debug info
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(updateDebugInfo, 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  if (!debugInfo) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg">
        <div className="animate-pulse">Loading debug info...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            🔍 Device Debug Panel
          </h1>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-bold mb-4 text-lg">Debug Information</h3>
          <div className="space-y-2 text-sm">
            <div>Window: {debugInfo.windowWidth}×{debugInfo.windowHeight}</div>
            <div>Screen: {debugInfo.screenWidth}×{debugInfo.screenHeight}</div>
            <div>Touch Support: {debugInfo.touchSupport ? 'Yes' : 'No'}</div>
            <div>Platform: {debugInfo.platform}</div>
          </div>
        </div>
      </div>
    </div>
  );
}