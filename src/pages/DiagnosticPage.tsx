import React, { useState, useEffect } from 'react';
import { debugService } from '../lib/services/debugService';

export const DiagnosticPage: React.FC = () => {
  const [results, setResults] = useState<any[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const runDiagnostic = async () => {
    setIsRunning(true);
    setResults([]);
    setSummary('Running diagnostic...');
    
    try {
      const diagnostic = await debugService.runFullDiagnostic();
      setResults(diagnostic.results);
      setSummary(diagnostic.summary);
    } catch (error) {
      setResults([{
        test: 'Diagnostic Error',
        success: false,
        message: (error as Error).message,
        details: error
      }]);
      setSummary('Diagnostic failed');
    }
    
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostic();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔬 Appwrite Connection Diagnostic</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={runDiagnostic} 
          disabled={isRunning}
          style={{
            padding: '10px 20px',
            backgroundColor: isRunning ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isRunning ? 'not-allowed' : 'pointer'
          }}
        >
          {isRunning ? 'Running...' : 'Run Diagnostic'}
        </button>
      </div>

      <div style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' }}>
        Summary: {summary}
      </div>

      <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
        <h3>Test Results:</h3>
        {results.map((result, index) => (
          <div 
            key={index} 
            style={{ 
              margin: '10px 0',
              padding: '10px',
              backgroundColor: result.success ? '#d4edda' : '#f8d7da',
              border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
              borderRadius: '5px'
            }}
          >
            <h4>{result.success ? '✅' : '❌'} {result.test}</h4>
            <p><strong>Message:</strong> {result.message}</p>
            {result.details && (
              <details>
                <summary>Show Details</summary>
                <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '5px' }}>
        <h4>💡 What This Tells Us:</h4>
        <ul>
          <li><strong>Database Connection:</strong> Tests if we can connect to Appwrite at all</li>
          <li><strong>Messages Collection:</strong> Tests if we can create/delete messages</li>
          <li><strong>Bookings Collection:</strong> Tests if we can create/delete bookings</li>
        </ul>
        <p>If any test fails, we'll see the exact error message and can fix the root cause.</p>
      </div>
    </div>
  );
};