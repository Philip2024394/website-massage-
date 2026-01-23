import { useState } from 'react';

interface E2ETestResult {
  status: 'GO' | 'NO-GO' | 'WARNING';
  totalTests: number;
  passed: number;
  failed: number;
  sev1Failures: number;
  sev2Failures: number;
  deploymentBlocked: boolean;
  executiveSummary: string;
  timestamp: string;
  duration: number;
}

export default function E2ETestDashboard() {
  const [status, setStatus] = useState<'IDLE' | 'RUNNING' | 'GO' | 'NO-GO' | 'WARNING'>('IDLE');
  const [result, setResult] = useState<E2ETestResult | null>(null);
  const [showExecutiveReport, setShowExecutiveReport] = useState(false);
  const [showDeveloperReport, setShowDeveloperReport] = useState(false);
  const [executiveReport, setExecutiveReport] = useState('');
  const [developerReport, setDeveloperReport] = useState('');

  const runFullTest = async () => {
    setStatus('RUNNING');
    setResult(null);
    setShowExecutiveReport(false);
    setShowDeveloperReport(false);

    try {
      const response = await fetch('/api/run-e2e-test', { method: 'POST' });
      const data = await response.json();

      setStatus(data.status);
      setResult(data);
    } catch (err: any) {
      setStatus('NO-GO');
      alert(`Test execution failed: ${err.message}`);
    }
  };

  const runRevenueGuard = async () => {
    setStatus('RUNNING');
    setResult(null);

    try {
      const response = await fetch('/api/run-revenue-guard', { method: 'POST' });
      const data = await response.json();

      setStatus(data.status);
      // Map revenue guard response to E2ETestResult format
      setResult({
        status: data.status,
        totalTests: 1,
        passed: data.status === 'GO' ? 1 : 0,
        failed: data.status === 'NO-GO' ? 1 : 0,
        sev1Failures: data.status === 'NO-GO' ? 1 : 0,
        sev2Failures: 0,
        deploymentBlocked: data.status === 'NO-GO',
        executiveSummary: data.message,
        timestamp: new Date().toISOString(),
        duration: data.duration
      });
    } catch (err: any) {
      setStatus('NO-GO');
      alert(`Revenue Guard failed: ${err.message}`);
    }
  };

  const loadExecutiveReport = async () => {
    try {
      const response = await fetch('/api/e2e-reports/executive');
      const text = await response.text();
      setExecutiveReport(text);
      setShowExecutiveReport(true);
      setShowDeveloperReport(false);
    } catch (err: any) {
      alert(`Failed to load executive report: ${err.message}`);
    }
  };

  const loadDeveloperReport = async () => {
    try {
      const response = await fetch('/api/e2e-reports/developer');
      const text = await response.text();
      setDeveloperReport(text);
      setShowDeveloperReport(true);
      setShowExecutiveReport(false);
    } catch (err: any) {
      alert(`Failed to load developer report: ${err.message}`);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'GO': return '✅';
      case 'NO-GO': return '🚨';
      case 'WARNING': return '⚠️';
      case 'RUNNING': return '⏳';
      default: return '🤖';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'GO': return 'bg-green-100 border-green-500';
      case 'NO-GO': return 'bg-red-100 border-red-500';
      case 'WARNING': return 'bg-yellow-100 border-yellow-500';
      case 'RUNNING': return 'bg-blue-100 border-blue-500';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🤖 AI Human E2E Test Dashboard</h1>
        <p className="text-gray-600">Production-grade, revenue-protecting E2E testing system</p>
      </div>

      {/* Control Panel */}
      <div className={`p-6 border-2 rounded-lg ${getStatusColor()} mb-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{getStatusIcon()}</span>
            <div>
              <h2 className="text-2xl font-bold">
                Status: {status}
              </h2>
              {result && (
                <p className="text-sm text-gray-600">
                  Last run: {new Date(result.timestamp).toLocaleString()} ({(result.duration / 1000).toFixed(2)}s)
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={runFullTest}
            disabled={status === 'RUNNING'}
            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {status === 'RUNNING' ? '⏳ Running...' : '🧪 Run Full E2E Tests'}
          </button>

          <button
            onClick={runRevenueGuard}
            disabled={status === 'RUNNING'}
            className="px-6 py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            💰 Revenue Guard Only
          </button>

          {result && (
            <>
              <button
                onClick={loadExecutiveReport}
                className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600"
              >
                📊 Executive Report
              </button>

              <button
                onClick={loadDeveloperReport}
                className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600"
              >
                🔧 Developer Report
              </button>
            </>
          )}
        </div>
      </div>

      {/* Results Summary */}
      {result && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border-2 border-gray-200 shadow">
            <div className="text-3xl font-bold text-blue-600">{result.totalTests}</div>
            <div className="text-sm text-gray-600">Total Tests</div>
          </div>

          <div className="bg-white p-4 rounded-lg border-2 border-green-200 shadow">
            <div className="text-3xl font-bold text-green-600">{result.passed}</div>
            <div className="text-sm text-gray-600">Passed</div>
          </div>

          <div className="bg-white p-4 rounded-lg border-2 border-red-200 shadow">
            <div className="text-3xl font-bold text-red-600">{result.failed}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>

          <div className={`p-4 rounded-lg border-2 shadow ${
            result.deploymentBlocked ? 'bg-red-100 border-red-500' : 'bg-green-100 border-green-500'
          }`}>
            <div className="text-3xl font-bold">
              {result.deploymentBlocked ? '🚨' : '✅'}
            </div>
            <div className="text-sm font-semibold">
              {result.deploymentBlocked ? 'BLOCKED' : 'APPROVED'}
            </div>
          </div>
        </div>
      )}

      {/* Critical Failures */}
      {result && (result.sev1Failures > 0 || result.sev2Failures > 0) && (
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-3">🚨 Critical Issues</h3>
          
          {result.sev1Failures > 0 && (
            <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🚨</span>
                <h4 className="text-lg font-bold text-red-700">
                  SEV-1: Revenue Critical ({result.sev1Failures} failures)
                </h4>
              </div>
              <p className="text-red-600 font-semibold">
                ⚠️ DEPLOYMENT BLOCKED - These failures directly impact revenue
              </p>
            </div>
          )}

          {result.sev2Failures > 0 && (
            <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">⚠️</span>
                <h4 className="text-lg font-bold text-yellow-700">
                  SEV-2: User Experience ({result.sev2Failures} failures)
                </h4>
              </div>
              <p className="text-yellow-600">
                These failures impact user experience and should be addressed
              </p>
            </div>
          )}
        </div>
      )}

      {/* Executive Report */}
      {showExecutiveReport && executiveReport && (
        <div className="bg-white border-2 border-gray-300 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">📊 Executive Summary</h3>
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-gray-700">
              {executiveReport}
            </pre>
          </div>
        </div>
      )}

      {/* Developer Report */}
      {showDeveloperReport && developerReport && (
        <div className="bg-white border-2 border-gray-300 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">🔧 Developer Report</h3>
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-gray-700">
              {developerReport}
            </pre>
          </div>
        </div>
      )}

      {/* Executive Summary */}
      {result && result.executiveSummary && !showExecutiveReport && !showDeveloperReport && (
        <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">📝 Summary</h3>
          <pre className="whitespace-pre-wrap text-sm text-gray-700">
            {result.executiveSummary}
          </pre>
        </div>
      )}
    </div>
  );
}
