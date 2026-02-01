// 🎯 AUTO-FIXED: Mobile scroll architecture violations (2 fixes)
import React, { useState, useEffect } from 'react';
import { autoTranslationService, ALL_LANGUAGES, BASIC_LANGUAGES, TRANSLATION_SCOPES } from '../lib/autoTranslationService';

interface TranslationManagerProps {
    onClose?: () => void;
}

const TranslationManager: React.FC<TranslationManagerProps> = ({ onClose }) => {
    const [isTranslating, setIsTranslating] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [progress, setProgress] = useState('');
    const [stats, setStats] = useState({
        totalKeys: 0,
        totalLanguages: 0,
        completedTranslations: 0,
        completionPercentage: 0
    });
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const translationStats = await autoTranslationService.getTranslationStats();
            setStats(translationStats);
        } catch (error) {
            console.error('Error loading translation stats:', error);
        }
    };

    const addLog = (message: string) => {
        setLogs(prev => [...prev.slice(-49), `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    const handleSyncLocal = async () => {
        setIsSyncing(true);
        setProgress('Syncing local translations...');
        addLog('Starting local translation sync...');
        
        try {
            await autoTranslationService.syncLocalTranslations();
            addLog('✅ Local translations synced successfully!');
            setProgress('Sync completed successfully!');
            await loadStats();
        } catch (error) {
            addLog('❌ Sync failed: ' + (error as Error).message);
            setProgress('Sync failed');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleTranslateAll = async () => {
        setIsTranslating(true);
        setProgress('Starting automatic translation...');
        addLog('🌐 Starting automatic translation to all languages...');
        
        // Note: Translation progress now logged directly to UI only
        // Console logs will appear naturally without interception
        
        try {
            await autoTranslationService.translateAllLanguages('en');
            addLog('🎉 Translation process completed successfully!');
            setProgress('All translations completed!');
            await loadStats();
        } catch (error) {
            addLog('❌ Translation failed: ' + (error as Error).message);
            setProgress('Translation failed');
        } finally {
            setIsTranslating(false);
        }
    };

    const handleClearLogs = () => {
        setLogs([]);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                🌐 Translation Manager
                            </h2>
                            <p className="text-blue-100 text-sm mt-1">
                                Scope-based translation: Tourist pages (20 languages) • Business areas (EN + ID)
                            </p>
                        </div>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="text-white hover:text-gray-200 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                <div className="p-6 space-y-6  max-h-[calc(90vh-200px)]">
                    {/* Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                            <div className="text-blue-600 text-sm font-medium">Total Keys</div>
                            <div className="text-2xl font-bold text-blue-800">{stats.totalKeys}</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                            <div className="text-green-600 text-sm font-medium">Languages</div>
                            <div className="text-2xl font-bold text-green-800">{stats.totalLanguages}</div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                            <div className="text-purple-600 text-sm font-medium">Completed</div>
                            <div className="text-2xl font-bold text-purple-800">{stats.completedTranslations}</div>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4">
                            <div className="text-orange-600 text-sm font-medium">Progress</div>
                            <div className="text-2xl font-bold text-orange-800">{stats.completionPercentage}%</div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="bg-gray-200 rounded-full h-3">
                        <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${stats.completionPercentage}%` }}
                        />
                    </div>

                    {/* Translation Scope Configuration */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-3">Translation Scope Configuration</h3>
                        
                        {/* Tourist Pages - 20 Languages */}
                        <div className="mb-4">
                            <h4 className="font-medium text-green-700 mb-2">
                                🎯 Tourist Pages (20 Languages)
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                                Landing page, hotel/villa menu, booking, search, therapist profiles
                            </p>
                            <div className="flex flex-wrap gap-1 text-xs">
                                {ALL_LANGUAGES.map(lang => (
                                    <span key={lang.code} className="px-2 py-1 bg-green-100 text-green-800 rounded">
                                        {lang.code}
                                    </span>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Key prefixes: {TRANSLATION_SCOPES.TOURIST.keyPrefixes.join(', ')}
                            </p>
                        </div>
                        
                        {/* Business Pages - 2 Languages */}
                        <div>
                            <h4 className="font-medium text-blue-700 mb-2">
                                🏢 Business Pages (2 Languages)
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                                Admin dashboard, agent features, member areas, settings
                            </p>
                            <div className="flex flex-wrap gap-1 text-xs">
                                {BASIC_LANGUAGES.map(lang => (
                                    <span key={lang.code} className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                        {lang.code}
                                    </span>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Key prefixes: {TRANSLATION_SCOPES.BUSINESS.keyPrefixes.join(', ')}
                            </p>
                        </div>
                    </div>

                    {/* Current Progress */}
                    {progress && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="text-blue-800 font-medium">Current Status:</div>
                            <div className="text-blue-600 mt-1">{progress}</div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={handleSyncLocal}
                                disabled={isSyncing || isTranslating}
                                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                            >
                                {isSyncing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Syncing...
                                    </>
                                ) : (
                                    <>
                                        📤 Sync Local Translations
                                    </>
                                )}
                            </button>

                            <button
                                onClick={handleTranslateAll}
                                disabled={isSyncing || isTranslating}
                                className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                            >
                                {isTranslating ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Translating...
                                    </>
                                ) : (
                                    <>
                                        🌐 Auto-Translate All Languages
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Warning */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-start gap-2">
                                <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <h4 className="text-yellow-800 font-semibold">⚠️ Important Notes</h4>
                                    <ul className="text-yellow-700 text-sm mt-1 space-y-1">
                                        <li>• Auto-translation uses free MyMemory API (rate limited)</li>
                                        <li>• Process may take 15-30 minutes for all languages</li>
                                        <li>• Sync local translations first before auto-translating</li>
                                        <li>• Review translated content for accuracy</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Logs */}
                    {logs.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Translation Logs</h3>
                                <button
                                    onClick={handleClearLogs}
                                    className="text-sm text-red-600 hover:text-red-800 transition-colors"
                                >
                                    Clear Logs
                                </button>
                            </div>
                            <div className="bg-gray-900 rounded-lg p-4 max-h-64 ">
                                <div className="font-mono text-sm space-y-1">
                                    {logs.map((log, index) => (
                                        <div 
                                            key={index} 
                                            className={`${
                                                log.includes('✅') ? 'text-green-400' :
                                                log.includes('❌') ? 'text-red-400' :
                                                log.includes('🔄') ? 'text-yellow-400' :
                                                'text-gray-300'
                                            }`}
                                        >
                                            {log}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TranslationManager;