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
  details: any[];
  timestamp: string;
  duration: number;
}

export default function RunE2ETestButton() {
  const [status, setStatus] = useState<'IDLE' | 'RUNNING' | 'GO' | 'NO-GO' | 'WARNING'>('IDLE');
  const [report, setReport] = useState<E2ETestResult | null>(null);

  const handleRunTest = async () => {
    setStatus('RUNNING');
    setReport(null);
    try {
      const response = await fetch('/api/run-e2e-test', { method: 'POST' });
      const data = await response.json();

      setStatus(data.status);
      setReport(data);
    } catch (err: any) {
      setStatus('NO-GO');
      setReport({
        status: 'NO-GO',
        message: err.message,
        totalTests: 0,
        passed: 0,
        failed: 0,
        sev1Failures: 0,
        sev2Failures: 0,
        deploymentBlocked: true,
        executiveSummary: '',
        details: [],
        timestamp: new Date().toISOString(),
        duration: 0
      } as any);
    }
  };

  return (
    <div className="p-4 border rounded shadow-md bg-gray-50">
      <h2 className="text-xl font-bold mb-2">🤖 AI Human E2E Test</h2>
      <button
        onClick={handleRunTest}
        disabled={status === 'RUNNING'}
        className={`px-4 py-2 font-semibold rounded ${
          status === 'GO' ? 'bg-green-500 text-white' :
          status === 'NO-GO' ? 'bg-red-500 text-white' :
          status === 'WARNING' ? 'bg-yellow-500 text-white' :
          'bg-blue-500 text-white'
        }`}
      >
        {status === 'IDLE' ? 'Run Test' : status === 'RUNNING' ? 'Running...' : status}
      </button>

      {report && (
        <div className="mt-4 p-2 border rounded bg-white max-h-80 overflow-auto">
          <pre className="text-sm">{JSON.stringify(report, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
