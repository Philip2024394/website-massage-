import { useState } from 'react';

interface OrchestratorResult {
  status: 'GO' | 'NO-GO' | 'WARNING';
  orchestrationComplete: boolean;
  totalScenarios: number;
  passedScenarios: number;
  failedScenarios: number;
  scenarios: {
    bookNow: { status: string; duration: number };
    scheduled: { status: string; duration: number };
    slider: { status: string; duration: number };
    chat: { status: string; duration: number };
    notifications: { status: string; duration: number };
    commissions: { status: string; duration: number };
    countdown: { status: string; duration: number };
    dashboards: { status: string; duration: number };
  };
  revenueProtected: boolean;
  sev1Failures: number;
  sev2Failures: number;
  autoRetryAttempts: number;
  fixedMinorFailures: number;
  executiveSummary: string;
  timestamp: string;
  totalDuration: number;
}

const scenarioDetails = [
  { key: 'bookNow', name: 'Book Now', icon: '⚡', description: 'Immediate booking with chat' },
  { key: 'scheduled', name: 'Scheduled', icon: '📅', description: 'Future booking with timer' },
  { key: 'slider', name: 'Slider', icon: '💰', description: 'Price negotiation flow' },
  { key: 'chat', name: 'Chat System', icon: '💬', description: 'Messages & notifications' },
  { key: 'notifications', name: 'Notifications', icon: '🔔', description: 'Push delivery' },
  { key: 'commissions', name: 'Commissions', icon: '💸', description: 'Revenue protection' },
  { key: 'countdown', name: 'Countdown', icon: '⏰', description: 'Auto-acceptance' },
  { key: 'dashboards', name: 'Dashboards', icon: '📊', description: 'Admin & Therapist UI' }
];

export default function AIHumanOrchestrator() {
  const [status, setStatus] = useState<'IDLE' | 'RUNNING' | 'GO' | 'NO-GO' | 'WARNING'>('IDLE');
  const [result, setResult] = useState<OrchestratorResult | null>(null);
  const [runningScenario, setRunningScenario] = useState<string | null>(null);

  const runFullOrchestration = async () => {
    setStatus('RUNNING');
    setResult(null);
    setRunningScenario('Initializing...');

    try {
      const response = await fetch('/api/run-full-e2e', { method: 'POST' });
      const data = await response.json();

      setStatus(data.status);
      setResult(data);
      setRunningScenario(null);
    } catch (err: any) {
      setStatus('NO-GO');
      setRunningScenario(null);
      alert(`Orchestration failed: ${err.message}`);
    }
  };

  const runSingleScenario = async (scenario: string) => {
    setStatus('RUNNING');
    setRunningScenario(scenario);

    try {
      const response = await fetch('/api/run-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario })
      });
      const data = await response.json();

      setStatus(data.status === 'PASSED' ? 'GO' : 'NO-GO');
      setRunningScenario(null);
      
      // Update result with single scenario
      setResult({
        status: data.status === 'PASSED' ? 'GO' : 'NO-GO',
        orchestrationComplete: false,
        totalScenarios: 1,
        passedScenarios: data.status === 'PASSED' ? 1 : 0,
        failedScenarios: data.status === 'PASSED' ? 0 : 1,
        scenarios: {
          [scenario]: { status: data.status, duration: 0 }
        } as any,
        revenueProtected: scenario === 'commissions' && data.status === 'PASSED',
        sev1Failures: 0,
        sev2Failures: 0,
        autoRetryAttempts: 0,
        fixedMinorFailures: 0,
        executiveSummary: `Scenario: ${scenario} - ${data.status}`,
        timestamp: new Date().toISOString(),
        totalDuration: 0
      });
    } catch (err: any) {
      setStatus('NO-GO');
      setRunningScenario(null);
      alert(`Scenario ${scenario} failed: ${err.message}`);
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

  const getScenarioColor = (scenarioStatus: string) => {
    if (scenarioStatus === 'PASSED') return 'bg-green-100 border-green-500';
    if (scenarioStatus === 'FAILED') return 'bg-red-100 border-red-500';
    return 'bg-gray-100 border-gray-300';
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🤖 AI Human E2E Orchestrator</h1>
        <p className="text-gray-600">
          Comprehensive multi-scenario testing with revenue protection
        </p>
      </div>

      {/* Status Panel */}
      <div className={`p-6 border-2 rounded-lg ${getStatusColor()} mb-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{getStatusIcon()}</span>
            <div>
              <h2 className="text-2xl font-bold">
                Status: {status}
              </h2>
              {runningScenario && (
                <p className="text-sm text-gray-600">
                  Running: {runningScenario}
                </p>
              )}
              {result && (
                <p className="text-sm text-gray-600">
                  Last run: {new Date(result.timestamp).toLocaleString()} ({(result.totalDuration / 1000).toFixed(2)}s)
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={runFullOrchestration}
            disabled={status === 'RUNNING'}
            className="px-6 py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {status === 'RUNNING' ? '⏳ Running...' : '🚀 Run Full Orchestration'}
          </button>
        </div>
      </div>

      {/* Results Summary */}
      {result && result.orchestrationComplete && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border-2 border-gray-200 shadow">
            <div className="text-3xl font-bold text-blue-600">{result.totalScenarios}</div>
            <div className="text-sm text-gray-600">Total Scenarios</div>
          </div>

          <div className="bg-white p-4 rounded-lg border-2 border-green-200 shadow">
            <div className="text-3xl font-bold text-green-600">{result.passedScenarios}</div>
            <div className="text-sm text-gray-600">Passed</div>
          </div>

          <div className="bg-white p-4 rounded-lg border-2 border-red-200 shadow">
            <div className="text-3xl font-bold text-red-600">{result.failedScenarios}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>

          <div className={`p-4 rounded-lg border-2 shadow ${
            result.revenueProtected ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'
          }`}>
            <div className="text-3xl font-bold">
              {result.revenueProtected ? '💰' : '🚨'}
            </div>
            <div className="text-sm font-semibold">
              {result.revenueProtected ? 'Protected' : 'At Risk'}
            </div>
          </div>

          <div className={`p-4 rounded-lg border-2 shadow ${
            result.fixedMinorFailures > 0 ? 'bg-blue-100 border-blue-500' : 'bg-gray-100 border-gray-200'
          }`}>
            <div className="text-3xl font-bold text-blue-600">{result.fixedMinorFailures}</div>
            <div className="text-sm text-gray-600">Auto-Fixed</div>
          </div>
        </div>
      )}

      {/* Scenarios Grid */}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-4">📋 Test Scenarios</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {scenarioDetails.map((scenario) => {
            const scenarioResult = result?.scenarios?.[scenario.key as keyof typeof result.scenarios];
            const isRunning = runningScenario === scenario.key;
            
            return (
              <div
                key={scenario.key}
                className={`p-4 border-2 rounded-lg shadow ${
                  scenarioResult ? getScenarioColor(scenarioResult.status) : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{scenario.icon}</span>
                  {scenarioResult && (
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-white">
                      {scenarioResult.status}
                    </span>
                  )}
                </div>
                <h4 className="font-bold mb-1">{scenario.name}</h4>
                <p className="text-xs text-gray-600 mb-2">{scenario.description}</p>
                {scenarioResult && (
                  <p className="text-xs text-gray-500">
                    {(scenarioResult.duration / 1000).toFixed(2)}s
                  </p>
                )}
                <button
                  onClick={() => runSingleScenario(scenario.key)}
                  disabled={status === 'RUNNING'}
                  className="mt-2 w-full px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isRunning ? '⏳' : 'Run'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Critical Issues */}
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
                ⚠️ DEPLOYMENT BLOCKED - Revenue at risk
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
                Should be fixed before deployment
              </p>
            </div>
          )}
        </div>
      )}

      {/* Auto-Retry Info */}
      {result && result.autoRetryAttempts > 0 && (
        <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🔧</span>
            <h4 className="text-lg font-bold text-blue-700">Auto-Retry Applied</h4>
          </div>
          <p className="text-blue-600">
            {result.fixedMinorFailures} minor failure(s) automatically fixed through retry logic
          </p>
        </div>
      )}

      {/* Executive Summary */}
      {result && result.executiveSummary && (
        <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">📊 Executive Summary</h3>
          <pre className="whitespace-pre-wrap text-sm text-gray-700">
            {result.executiveSummary}
          </pre>
        </div>
      )}
    </div>
  );
}
