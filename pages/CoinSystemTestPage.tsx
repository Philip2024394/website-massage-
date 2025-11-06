import React, { useState } from 'react';
import { Play, CheckCircle, XCircle, Loader } from 'lucide-react';
import { quickTest, runAllCoinTests } from '../lib/coinServiceTests';

interface CoinSystemTestPageProps {
    onBack?: () => void;
    t?: any;
}

const CoinSystemTestPage: React.FC<CoinSystemTestPageProps> = ({ onBack: _onBack, t: _t }) => {
    const [testResults, setTestResults] = useState<any>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [quickTestResult, setQuickTestResult] = useState<boolean | null>(null);

    const handleQuickTest = async () => {
        setIsRunning(true);
        setQuickTestResult(null);
        try {
            const result = await quickTest('testUser_' + Date.now());
            setQuickTestResult(result);
        } catch (error) {
            console.error('Test error:', error);
            setQuickTestResult(false);
        } finally {
            setIsRunning(false);
        }
    };

    const handleRunAllTests = async () => {
        setIsRunning(true);
        setTestResults(null);
        try {
            const results = await runAllCoinTests();
            setTestResults(results);
        } catch (error) {
            console.error('Test error:', error);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        🧪 Coin System Tests
                    </h1>
                    <p className="text-gray-600">
                        Verify your Appwrite integration is working correctly
                    </p>
                </div>

                {/* Collection Info */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-6">
                    <h2 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        ✅ Collection Created: coins
                    </h2>
                    <div className="grid grid-cols-2 gap-3 text-sm text-blue-800">
                        <div>✅ userId (string, 255)</div>
                        <div>✅ amount (integer)</div>
                        <div>✅ type (string, 50)</div>
                        <div>✅ reason (string, 500)</div>
                        <div>✅ earnedAt (datetime)</div>
                        <div>✅ expiryAt (datetime, nullable)</div>
                        <div>✅ status (string, 51, nullable)</div>
                        <div>✅ metadata (string, 5000, nullable)</div>
                    </div>
                </div>

                {/* Quick Test Button */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                        ⚡ Quick Test
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Run a fast test to verify basic functionality (award coins, check balance, get referral code)
                    </p>
                    <button
                        onClick={handleQuickTest}
                        disabled={isRunning}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                    >
                        {isRunning ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                Running...
                            </>
                        ) : (
                            <>
                                <Play className="w-5 h-5" />
                                Run Quick Test
                            </>
                        )}
                    </button>

                    {quickTestResult !== null && (
                        <div className={`mt-4 p-4 rounded-xl ${
                            quickTestResult 
                                ? 'bg-green-50 border-2 border-green-200' 
                                : 'bg-red-50 border-2 border-red-200'
                        }`}>
                            {quickTestResult ? (
                                <div className="flex items-center gap-2 text-green-900">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="font-semibold">✅ Quick test passed! System is working.</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-red-900">
                                    <XCircle className="w-5 h-5" />
                                    <span className="font-semibold">❌ Quick test failed. Check console for errors.</span>
                                </div>
                            )}
                            <p className="text-sm mt-2 text-gray-700">
                                Check browser console (F12) for detailed output
                            </p>
                        </div>
                    )}
                </div>

                {/* Full Test Suite Button */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                        🧪 Full Test Suite
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Run all 9 comprehensive tests (award coins, referrals, spending, FIFO, etc.)
                    </p>
                    <button
                        onClick={handleRunAllTests}
                        disabled={isRunning}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                    >
                        {isRunning ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                Running Tests...
                            </>
                        ) : (
                            <>
                                <Play className="w-5 h-5" />
                                Run All Tests
                            </>
                        )}
                    </button>

                    {testResults && (
                        <div className="mt-6">
                            <div className={`p-4 rounded-xl mb-4 ${
                                testResults.failed === 0 
                                    ? 'bg-green-50 border-2 border-green-200' 
                                    : 'bg-orange-50 border-2 border-orange-200'
                            }`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-lg text-gray-900">
                                            {testResults.passed} / {testResults.passed + testResults.failed} Tests Passed
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {testResults.failed === 0 
                                                ? '🎉 All tests passed! Your system is fully functional.' 
                                                : `${testResults.failed} test(s) failed. Check console for details.`
                                            }
                                        </p>
                                    </div>
                                    <div className="text-4xl">
                                        {testResults.failed === 0 ? '✅' : '⚠️'}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {Object.entries(testResults.results).map(([test, passed]: [string, any]) => (
                                    <div key={test} className={`p-3 rounded-lg flex items-center gap-3 ${
                                        passed ? 'bg-green-50' : 'bg-red-50'
                                    }`}>
                                        {passed ? (
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-600" />
                                        )}
                                        <span className={`font-medium ${
                                            passed ? 'text-green-900' : 'text-red-900'
                                        }`}>
                                            {test}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 bg-gray-50 rounded-lg p-4 pb-20">
                                <p className="text-sm text-gray-700">
                                    💡 <strong>Tip:</strong> Open browser console (F12) to see detailed test output and any error messages.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Next Steps */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-purple-900 mb-3">
                        🚀 Next Steps
                    </h3>
                    <ol className="space-y-2 text-purple-800">
                        <li className="flex gap-2">
                            <span className="font-bold">1.</span>
                            <span>Create <code className="bg-purple-100 px-2 py-1 rounded">referrals</code> collection in Appwrite</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold">2.</span>
                            <span>Run Quick Test to verify coins collection works</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold">3.</span>
                            <span>Run Full Test Suite to verify all features</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold">4.</span>
                            <span>Integrate coin hooks into your app (see QUICK_START.md)</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold">5.</span>
                            <span>Deploy and launch! 🎉</span>
                        </li>
                    </ol>
                </div>

                {/* Console Tip */}
                <div className="mt-6 bg-gray-100 rounded-xl p-4 pb-20">
                    <p className="text-sm text-gray-700">
                        <strong>💻 Developer Tip:</strong> You can also run tests from browser console:
                    </p>
                    <code className="block mt-2 bg-gray-800 text-green-400 p-3 rounded font-mono text-sm">
                        coinTests.quick() // Quick test<br />
                        coinTests.runAll() // All tests<br />
                        coinTests.test1() // Individual test
                    </code>
                </div>
            </div>
        </div>
    );
};

export default CoinSystemTestPage;

