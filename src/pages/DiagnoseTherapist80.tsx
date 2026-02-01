// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
import React, { useState, useEffect } from 'react';
import { therapistService } from '../lib/appwriteService';
import PageContainer from '../components/layout/PageContainer';

/**
 * Diagnostic Page for Therapist ID 80
 * Troubleshoot why therapist is not showing as live
 */
const DiagnoseTherapist80: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [therapist, setTherapist] = useState<any>(null);
    const [allTherapists, setAllTherapists] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<any>(null);

    useEffect(() => {
        diagnoseTherapist();
    }, []);

    const diagnoseTherapist = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('🔍 Starting diagnosis for therapist ID 80...');

            // Fetch all therapists
            const allTherapistsData = await therapistService.getAll();
            setAllTherapists(allTherapistsData);

            console.log(`✅ Loaded ${allTherapistsData.length} total therapists from database`);

            // Find therapist 80
            const therapist80 = allTherapistsData.find((t: any) => t.$id === '80' || t.id === '80');

            if (!therapist80) {
                setError(`Therapist with ID "80" not found in database!`);
                console.log('📋 Available therapist IDs:', allTherapistsData.slice(0, 20).map((t: any) => ({
                    id: t.$id || t.id,
                    name: t.name
                })));
                setLoading(false);
                return;
            }

            setTherapist(therapist80);
            console.log('✅ Found therapist 80:', therapist80);

            // Analyze live status logic
            const normalizedLiveFlag = typeof therapist80.isLive === 'boolean' ? therapist80.isLive : null;
            const normalizedStatus = (therapist80.status || therapist80.availability || '').toString().trim().toLowerCase();
            const hasActiveStatus = normalizedStatus === 'available' || normalizedStatus === 'busy' || normalizedStatus === 'online';

            let shouldBeVisible = false;
            let reason = '';
            let priority = '';

            if (hasActiveStatus) {
                shouldBeVisible = true;
                reason = `Has active status: ${normalizedStatus}`;
                priority = 'Priority 1: Active Status';
            } else if (normalizedLiveFlag === true) {
                shouldBeVisible = true;
                reason = 'isLive flag is explicitly true';
                priority = 'Priority 2: isLive=true';
            } else if (normalizedLiveFlag === false && (normalizedStatus === 'offline' || normalizedStatus === '')) {
                shouldBeVisible = false;
                reason = `isLive=false AND status=${normalizedStatus || 'empty'}`;
                priority = 'Priority 3: Hidden';
            } else {
                shouldBeVisible = true;
                reason = 'Default behavior (permissive - shows therapist)';
                priority = 'Priority 4: Default';
            }

            setAnalysis({
                normalizedLiveFlag,
                normalizedStatus,
                hasActiveStatus,
                shouldBeVisible,
                reason,
                priority
            });

            setLoading(false);

        } catch (err: any) {
            console.error('❌ Error diagnosing therapist:', err);
            setError(err.message || 'Unknown error occurred');
            setLoading(false);
        }
    };

    const fixTherapist = async (method: 'setLive' | 'setAvailable') => {
        if (!therapist) return;

        try {
            console.log(`🔧 Applying fix: ${method}`);

            const updateData: any = {};

            if (method === 'setLive') {
                updateData.isLive = true;
                console.log('Setting isLive = true');
            } else if (method === 'setAvailable') {
                updateData.status = 'available';
                updateData.availability = 'Available';
                console.log('Setting status = available');
            }

            await therapistService.update(therapist.$id, updateData);

            alert(`✅ Fix applied successfully! Reloading diagnosis...`);
            diagnoseTherapist();

        } catch (err: any) {
            console.error('❌ Error applying fix:', err);
            alert(`❌ Failed to apply fix: ${err.message}`);
        }
    };

    if (loading) {
        return (
            <PageContainer>
                <div className="max-w-4xl mx-auto py-8">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading diagnostic data...</p>
                    </div>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <div className="max-w-4xl mx-auto py-8 px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                    🔍 Therapist ID 80 Diagnostic Report
                </h1>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <h2 className="text-lg font-semibold text-red-800 mb-2">❌ Error</h2>
                        <p className="text-red-700">{error}</p>
                        
                        {allTherapists.length > 0 && (
                            <div className="mt-4">
                                <p className="font-medium text-red-800 mb-2">First 20 available therapist IDs:</p>
                                <div className="bg-white rounded p-3 max-h-60 ">
                                    {allTherapists.slice(0, 20).map((t: any, i: number) => (
                                        <div key={i} className="text-sm py-1">
                                            {i + 1}. ID: <span className="font-mono font-bold">{t.$id || t.id}</span> - {t.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {therapist && analysis && (
                    <>
                        {/* Therapist Basic Info */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Basic Information</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-gray-600">ID:</span>
                                    <span className="ml-2 font-mono font-bold">{therapist.$id}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Name:</span>
                                    <span className="ml-2 font-semibold">{therapist.name}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Email:</span>
                                    <span className="ml-2">{therapist.email || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">City:</span>
                                    <span className="ml-2">{therapist.city || therapist.location || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Live Status Fields */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">🔑 Key Status Fields</h2>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <span className="text-gray-600">isLive:</span>
                                    <span className={`font-mono font-bold ${therapist.isLive === true ? 'text-green-600' : therapist.isLive === false ? 'text-red-600' : 'text-gray-400'}`}>
                                        {String(therapist.isLive)} ({typeof therapist.isLive})
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-b pb-2">
                                    <span className="text-gray-600">status:</span>
                                    <span className="font-semibold">{therapist.status || '(empty)'}</span>
                                </div>
                                <div className="flex items-center justify-between border-b pb-2">
                                    <span className="text-gray-600">availability:</span>
                                    <span className="font-semibold">{therapist.availability || '(empty)'}</span>
                                </div>
                                <div className="flex items-center justify-between border-b pb-2">
                                    <span className="text-gray-600">published:</span>
                                    <span className="font-mono">{String(therapist.published)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">visibility:</span>
                                    <span className="font-mono">{String(therapist.visibility || 'N/A')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Analysis */}
                        <div className={`rounded-lg shadow-sm border p-6 mb-6 ${analysis.shouldBeVisible ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <h2 className="text-xl font-semibold mb-4">
                                {analysis.shouldBeVisible ? '✅ Visibility Analysis' : '🚫 Visibility Analysis'}
                            </h2>
                            
                            <div className="space-y-3">
                                <div>
                                    <span className="font-semibold">Verdict: </span>
                                    <span className={`text-lg font-bold ${analysis.shouldBeVisible ? 'text-green-700' : 'text-red-700'}`}>
                                        {analysis.shouldBeVisible ? 'SHOULD BE VISIBLE' : 'HIDDEN FROM APP'}
                                    </span>
                                </div>
                                
                                <div>
                                    <span className="font-semibold">Logic Applied: </span>
                                    <span className="text-gray-700">{analysis.priority}</span>
                                </div>
                                
                                <div>
                                    <span className="font-semibold">Reason: </span>
                                    <span className="text-gray-700">{analysis.reason}</span>
                                </div>

                                <div className="mt-4 pt-4 border-t">
                                    <div className="text-sm space-y-1">
                                        <div>normalizedLiveFlag: <span className="font-mono">{String(analysis.normalizedLiveFlag)}</span></div>
                                        <div>normalizedStatus: <span className="font-mono">"{analysis.normalizedStatus}"</span></div>
                                        <div>hasActiveStatus (available/busy/online): <span className="font-mono">{String(analysis.hasActiveStatus)}</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Fix Actions */}
                        {!analysis.shouldBeVisible && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                <h2 className="text-xl font-semibold text-blue-900 mb-4">💡 Fix Options</h2>
                                <p className="text-blue-800 mb-4">
                                    Therapist 80 is currently hidden. Choose one of these fixes:
                                </p>
                                
                                <div className="space-y-3">
                                    <button
                                        onClick={() => fixTherapist('setLive')}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                                    >
                                        Fix #1: Set isLive = true
                                    </button>
                                    
                                    <button
                                        onClick={() => fixTherapist('setAvailable')}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                                    >
                                        Fix #2: Set status = "available"
                                    </button>
                                </div>
                            </div>
                        )}

                        {analysis.shouldBeVisible && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                <h2 className="text-xl font-semibold text-green-900 mb-2">✅ Therapist Configuration Looks Good!</h2>
                                <p className="text-green-800">
                                    Therapist 80 should be visible on the app according to the filtering logic.
                                    If they're not showing up, check:
                                </p>
                                <ul className="list-disc list-inside mt-3 space-y-1 text-green-800">
                                    <li>City/location filtering (currently: {therapist.city || therapist.location || 'N/A'})</li>
                                    <li>Service area coverage</li>
                                    <li>Browser cache (try hard refresh: Ctrl+Shift+R)</li>
                                    <li>Check HomePage console logs for filtering details</li>
                                </ul>
                            </div>
                        )}

                        {/* Raw Data */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">📄 Raw Therapist Data</h2>
                            <pre className="bg-white p-4 rounded border border-gray-200 overflow-x-auto text-xs">
                                {JSON.stringify(therapist, null, 2)}
                            </pre>
                        </div>
                    </>
                )}

                <div className="mt-6 text-center">
                    <button
                        onClick={diagnoseTherapist}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                    >
                        🔄 Refresh Diagnosis
                    </button>
                </div>
            </div>
        </PageContainer>
    );
};

export default DiagnoseTherapist80;
