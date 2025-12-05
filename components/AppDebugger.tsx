import React, { useEffect, useState } from 'react';

const AppDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const collectDebugInfo = () => {
      const info = {
        currentURL: window.location.href,
        pathname: window.location.pathname,
        search: window.location.search,
        sessionStorage: {
          current_page: sessionStorage.getItem('current_page'),
          has_entered_app: sessionStorage.getItem('has_entered_app'),
          app_language: sessionStorage.getItem('app_language')
        },
        localStorage: {
          app_user: localStorage.getItem('app_user'),
          app_language: localStorage.getItem('app_language')
        },
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };
      
      setDebugInfo(info);
      console.log('🐛 Debug Info:', info);
    };

    collectDebugInfo();
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: 10, 
      left: 10, 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '5px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999
    }}>
      <strong>Debug Info:</strong><br/>
      Current URL: {debugInfo.currentURL}<br/>
      Session Page: {debugInfo.sessionStorage?.current_page || 'none'}<br/>
      Has Entered: {debugInfo.sessionStorage?.has_entered_app || 'false'}<br/>
      Language: {debugInfo.sessionStorage?.app_language || 'none'}<br/>
      Timestamp: {debugInfo.timestamp}
    </div>
  );
};

export default AppDebugger;