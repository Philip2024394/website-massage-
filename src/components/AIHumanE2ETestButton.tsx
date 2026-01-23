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

export default function AIHumanE2ETestButton() {
  const [status, setStatus] = useState<'IDLE' | 'RUNNING' | 'GO' | 'NO-GO' | 'WARNING'>('IDLE');
  const [report, setReport] = useState<OrchestratorResult | null>(null);

  const runTest = async () => {
    setStatus('RUNNING');
    setReport(null);

    try {
      const response = await fetch('/api/run-full-e2e', { method: 'POST' });
      const data = await response.json();
      setStatus(data.status);
      setReport(data);
    } catch (err: any) {
      setStatus('NO-GO');
      setReport({
        status: 'NO-GO',
        orchestrationComplete: false,
        message: err.message,
        totalScenarios: 0,
        passedScenarios: 0,
        failedScenarios: 0,
        scenarios: {
          bookNow: { status: 'UNKNOWN', duration: 0 },
          scheduled: { status: 'UNKNOWN', duration: 0 },
          slider: { status: 'UNKNOWN', duration: 0 },
          chat: { status: 'UNKNOWN', duration: 0 },
          notifications: { status: 'UNKNOWN', duration: 0 },
          commissions: { status: 'UNKNOWN', duration: 0 },
          countdown: { status: 'UNKNOWN', duration: 0 },
          dashboards: { status: 'UNKNOWN', duration: 0 }
        },
        revenueProtected: false,
        sev1Failures: 0,
        sev2Failures: 0,
        autoRetryAttempts: 0,
        fixedMinorFailures: 0,
        executiveSummary: '',
        timestamp: new Date().toISOString(),
        totalDuration: 0
      } as any);
    }
  };

  return (
    <div className="p-4 border rounded shadow-md bg-gray-50">
      <h2 className="text-xl font-bold mb-2">🤖 AI Human Ultimate E2E</h2>
      <button
        onClick={runTest}
        disabled={status === 'RUNNING'}
        className={`px-4 py-2 font-semibold rounded ${
          status === 'GO' ? 'bg-green-500 text-white' :
          status === 'NO-GO' ? 'bg-red-500 text-white' :
          status === 'WARNING' ? 'bg-yellow-500 text-white' :
          'bg-blue-500 text-white'
        }`}
      >
        {status === 'IDLE' ? 'Run Full E2E Test' : status === 'RUNNING' ? 'Running...' : status}
      </button>

      {report && (
        <div className="mt-4 p-2 border rounded bg-white max-h-96 overflow-auto">
          <h3 className="font-semibold mb-1">Test Report:</h3>
          <pre className="text-sm">{JSON.stringify(report, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
