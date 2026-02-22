// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
import React from 'react';
import { useMobileDetection } from '../hooks/useMobileDetection';

/**
 * Enhanced Mobile Detection Demo Component
 * Shows all the features of the react-device-detect + react-responsive integration
 */
export default function MobileDetectionDemo() {
  const mobile = useMobileDetection();

  return (
    <div className="p-6 bg-gray-50 min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))]">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Enhanced Mobile Detection Demo</h1>
        
        {/* Device Detection Summary */}
        <div className={`p-4 rounded-lg mb-6 ${
          mobile.isMobileDevice 
            ? 'bg-blue-100 border-blue-300' 
            : mobile.isTabletDevice 
            ? 'bg-green-100 border-green-300'
            : 'bg-gray-100 border-gray-300'
        } border-2`}>
          <h2 className="text-xl font-semibold mb-2">
            {mobile.isMobileDevice ? '📱 Mobile Device' : 
             mobile.isTabletDevice ? '📱 Tablet Device' : 
             '🖥️ Desktop Device'}
          </h2>
          <p className="text-sm text-gray-600">
            Browser: {mobile.deviceInfo.browser} • 
            OS: {mobile.deviceInfo.os} • 
            Screen: {mobile.deviceInfo.screenWidth}×{mobile.deviceInfo.screenHeight} • 
            Viewport: {mobile.deviceInfo.viewportWidth}×{mobile.deviceInfo.viewportHeight}
          </p>
        </div>

        {/* Detection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          
          {/* Device Type */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-3 text-gray-700">Device Type</h3>
            <div className="space-y-2 text-sm">
              <div className={`flex justify-between ${mobile.isMobileDevice ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                <span>Mobile Device:</span>
                <span>{mobile.isMobileDevice ? '✅' : '❌'}</span>
              </div>
              <div className={`flex justify-between ${mobile.isTabletDevice ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                <span>Tablet Device:</span>
                <span>{mobile.isTabletDevice ? '✅' : '❌'}</span>
              </div>
              <div className={`flex justify-between ${mobile.isDesktopDevice ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                <span>Desktop Device:</span>
                <span>{mobile.isDesktopDevice ? '✅' : '❌'}</span>
              </div>
              <div className={`flex justify-between ${mobile.isTouchDevice ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                <span>Touch Device:</span>
                <span>{mobile.isTouchDevice ? '✅' : '❌'}</span>
              </div>
            </div>
          </div>

          {/* Screen Size */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-3 text-gray-700">Screen Size</h3>
            <div className="space-y-2 text-sm">
              <div className={`flex justify-between ${mobile.isMobileScreen ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                <span>Mobile Screen (≤768px):</span>
                <span>{mobile.isMobileScreen ? '✅' : '❌'}</span>
              </div>
              <div className={`flex justify-between ${mobile.isSmallScreen ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                <span>Small Screen (≤640px):</span>
                <span>{mobile.isSmallScreen ? '✅' : '❌'}</span>
              </div>
              <div className={`flex justify-between ${mobile.isMediumScreen ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                <span>Medium Screen (769-1024px):</span>
                <span>{mobile.isMediumScreen ? '✅' : '❌'}</span>
              </div>
              <div className={`flex justify-between ${mobile.isLargeScreen ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                <span>Large Screen (≥1025px):</span>
                <span>{mobile.isLargeScreen ? '✅' : '❌'}</span>
              </div>
            </div>
          </div>

          {/* Orientation & Capabilities */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-3 text-gray-700">Orientation & Capabilities</h3>
            <div className="space-y-2 text-sm">
              <div className={`flex justify-between ${mobile.isPortrait ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                <span>Portrait:</span>
                <span>{mobile.isPortrait ? '✅' : '❌'}</span>
              </div>
              <div className={`flex justify-between ${mobile.isLandscape ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                <span>Landscape:</span>
                <span>{mobile.isLandscape ? '✅' : '❌'}</span>
              </div>
              <div className={`flex justify-between ${mobile.hasTouch ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                <span>Touch Support:</span>
                <span>{mobile.hasTouch ? '✅' : '❌'}</span>
              </div>
              <div className={`flex justify-between ${mobile.hasHover ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                <span>Hover Support:</span>
                <span>{mobile.hasHover ? '✅' : '❌'}</span>
              </div>
              <div className={`flex justify-between ${mobile.supportsViewportUnits ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                <span>Viewport Units:</span>
                <span>{mobile.supportsViewportUnits ? '✅' : '❌'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Applied CSS Classes */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="font-semibold mb-4 text-gray-700">Applied CSS Classes</h3>
          <div className="bg-gray-50 p-4 rounded text-sm font-mono">
            <div className="text-blue-600">body classes:</div>
            <div className="ml-4 text-gray-700">
              {mobile.isMobileDevice && <div>• mobile-device</div>}
              {mobile.isTabletDevice && <div>• tablet-device</div>}
              {mobile.isDesktopDevice && <div>• desktop-device</div>}
              {mobile.isMobileScreen && <div>• mobile-screen</div>}
              {mobile.isSmallScreen && <div>• small-screen</div>}
              {mobile.isMediumScreen && <div>• medium-screen</div>}
              {mobile.isLargeScreen && <div>• large-screen</div>}
              {mobile.isPortrait && <div>• portrait</div>}
              {mobile.isLandscape && <div>• landscape</div>}
              {mobile.hasTouch && <div>• has-touch</div>}
              {mobile.hasHover && <div>• has-hover</div>}
              <div className="text-amber-600 mt-2">• mobile-lock (if mobile detected)</div>
            </div>
          </div>
        </div>

        {/* Interactive Demo */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-4 text-gray-700">Interactive Demo</h3>
          <div className="space-y-4">
            
            {/* Touch-optimized Button */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Touch-optimized button (44px minimum touch target):</p>
              <button className={`px-4 py-3 bg-blue-500 text-white rounded-lg ${
                mobile.hasTouch ? 'min-h-[44px] min-w-[44px]' : ''
              } hover:bg-blue-600 transition-colors`}>
                {mobile.hasTouch ? 'Touch Enabled' : 'Desktop Button'}
              </button>
            </div>

            {/* Hover Demo */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Hover effects (disabled on touch devices):</p>
              <div className={`p-4 bg-gray-100 rounded-lg ${
                mobile.hasHover ? 'hover:bg-gray-200' : ''
              } transition-colors`}>
                {mobile.hasHover 
                  ? 'Hover over me (desktop)' 
                  : 'No hover effects (touch device)'}
              </div>
            </div>

            {/* Scrollable Area */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Scrollable area (optimized for device type):</p>
              <div className={`h-32 overflow-y-auto border rounded-lg p-4 ${
                mobile.isMobileDevice ? 'touch-action-pan-y' : ''
              } scrollable`}>
                <div className="space-y-2">
                  {Array.from({ length: 20 }, (_, i) => (
                    <div key={i} className="py-1 text-sm">
                      Scrollable item {i + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Input Demo */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Input field (16px font-size on mobile to prevent zoom):</p>
              <input 
                type="text" 
                placeholder="Type something..."
                className={`w-full p-3 border rounded-lg ${
                  mobile.hasTouch ? 'text-base' : 'text-sm'
                }`}
              />
            </div>

          </div>
        </div>

        {/* Instructions */}
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
          <h4 className="font-semibold text-amber-800 mb-2">Testing Instructions</h4>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• Resize your browser window to see responsive breakpoints</li>
            <li>• Rotate your device to see orientation changes</li>
            <li>• Open developer tools and toggle device simulation</li>
            <li>• Check the console for mobile detection logs</li>
            <li>• Inspect the body element to see applied CSS classes</li>
          </ul>          
          {/* Debug Action Buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => mobile.debug.log('Manual Debug from Demo')}
              className="px-3 py-1 bg-amber-500 text-white rounded text-sm hover:bg-amber-600"
            >
              📝 Log Device Info
            </button>
            
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && (window as any).debugDevice) {
                  (window as any).debugDevice.quick();
                } else {
                  console.log('Debug tools not available');
                }
              }}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              ⚡ Quick Debug
            </button>
            
            <button
              onClick={() => mobile.debug.setLogOnChange(!mobile.debug.logOnChange)}
              className={`px-3 py-1 rounded text-sm ${
                mobile.debug.logOnChange 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              {mobile.debug.logOnChange ? '⏸️ Stop Auto-Log' : '▶️ Auto-Log Changes'}
            </button>
          </div>        </div>
      </div>
    </div>
  );
}