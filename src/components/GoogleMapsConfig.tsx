import React, { useState, useEffect } from 'react';
import { saveGoogleMapsApiKey, getStoredGoogleMapsApiKey } from '../utils/appConfig';

const GoogleMapsConfig: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [storedKey, setStoredKey] = useState<string | null>(null);
  const [isTestingAPI, setIsTestingAPI] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    const key = getStoredGoogleMapsApiKey();
    setStoredKey(key);
    if (key) setApiKey(key);
  }, []);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      saveGoogleMapsApiKey(apiKey.trim());
      setStoredKey(apiKey.trim());
      alert('Google Maps API Key saved successfully!');
    }
  };

  const testGoogleMapsAPI = async () => {
    if (!storedKey) {
      setTestResult('❌ No API key configured');
      return;
    }

    setIsTestingAPI(true);
    try {
      // Test the API with a simple geocoding request
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=Yogyakarta,Indonesia&key=${storedKey}`
      );
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        setTestResult(`✅ API Working! Yogyakarta coords: ${location.lat}, ${location.lng}`);
      } else {
        setTestResult(`❌ API Error: ${data.status} - ${data.error_message || 'Unknown error'}`);
      }
    } catch (error) {
      setTestResult(`❌ Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    setIsTestingAPI(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-4">🗺️ Google Maps API Configuration</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Google Maps API Key
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Google Maps API Key"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              onClick={handleSaveApiKey}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
            >
              Save
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Current Status: {storedKey ? '✅ Configured' : '❌ Not configured'}
          </span>
          <button
            onClick={testGoogleMapsAPI}
            disabled={!storedKey || isTestingAPI}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTestingAPI ? 'Testing...' : 'Test API'}
          </button>
        </div>

        {testResult && (
          <div className="p-3 rounded-md bg-gray-50 border">
            <p className="text-sm font-mono">{testResult}</p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Setup Instructions:</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Go to Google Cloud Console</li>
            <li>Enable Maps JavaScript API and Geocoding API</li>
            <li>Create an API key with appropriate restrictions</li>
            <li>Enter the API key above and test it</li>
          </ol>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <h3 className="font-semibold text-green-900 mb-2">City Location Features:</h3>
          <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
            <li>Distance-based provider matching (25km radius)</li>
            <li>City-based filtering for therapists and places</li>
            <li>Support for Indonesian cities and tourist destinations</li>
            <li>Fallback to location name matching if coordinates missing</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GoogleMapsConfig;