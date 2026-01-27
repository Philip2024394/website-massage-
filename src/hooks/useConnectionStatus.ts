/**
 * 🔌 CONNECTION STATUS REACT HOOK
 * 
 * Purpose: React hook for using connection stability service
 */

import { useState, useEffect } from 'react';
import { 
  connectionStabilityService, 
  ConnectionStatus 
} from '../lib/services/connectionStabilityService';

// React hook for using connection status
export function useConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>(
    connectionStabilityService.getStatus()
  );

  useEffect(() => {
    connectionStabilityService.addConnectionListener(setStatus);
    
    return () => {
      connectionStabilityService.removeConnectionListener(setStatus);
    };
  }, []);

  return {
    status,
    forceReconnect: () => connectionStabilityService.forceReconnect()
  };
}