import React, { useState } from 'react';
import { CheckCircle2, XCircle, RefreshCw, ClipboardList, AlertTriangle } from 'lucide-react';
import { quickTest, FullTestResult } from '../../lib/coinServiceTests';

interface TestItemResult {
  name: string;
  passed: boolean;
  details?: string;
}

const CoinSystemTestPage: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestItemResult[]>([]);
  const [summary, setSummary] = useState<FullTestResult | null>(null);

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    setSummary(null);
    try {
      const res = await quickTest();
      const items: TestItemResult[] = [
        { name: 'Service bootstraps', passed: res.serviceReady },
        { name: 'Create user', passed: res.createdUser },
        { name: 'Award coins', passed: res.awarded },
        { name: 'Balance reflects award', passed: res.balanceUpdated },
        { name: 'Spend coins', passed: res.spent },
        { name: 'History populated', passed: res.historyOk },
      ];
      setResults(items);
      setSummary(res);
    } catch (e: any) {
      setResults([{ name: 'Test runner crashed', passed: false, details: String(e) }]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-orange-600" /> Coin System Quick Test
          </h1>
          <button
            onClick={runTests}
            disabled={isRunning}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white ${isRunning ? 'bg-gray-400' : 'bg-orange-600 hover:bg-orange-700'} transition`}
          >
            <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Running…' : 'Run Tests'}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {results.length === 0 && (
          <div className="bg-white rounded-xl border p-6 text-gray-600">
            <p>Click "Run Tests" to execute the quick smoke checks for the coin system.</p>
            <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              This page is for internal verification only.
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border p-4">
              <h2 className="font-semibold mb-3">Results</h2>
              <ul className="space-y-2">
                {results.map((r, i) => (
                  <li key={i} className="flex items-start gap-3">
                    {r.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    )}
                    <div>
                      <div className="font-medium">{r.name}</div>
                      {r.details && <div className="text-sm text-gray-500">{r.details}</div>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {summary && (
              <div className="bg-white rounded-xl border p-4">
                <h2 className="font-semibold mb-3">Summary</h2>
                <pre className="text-sm bg-gray-50 p-3 rounded-lg overflow-auto">{JSON.stringify(summary, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default CoinSystemTestPage;
