// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
import React from 'react';
import type { Language } from '../types/pageTypes';
import { logger } from '../utils/logger';

interface SimpleTestPageProps {
    language: Language;
    translations: any;
}

const SimpleTestPage: React.FC<SimpleTestPageProps> = ({ language, translations }) => {
    logger.debug('🧪 SimpleTestPage: Current language:', language);
    logger.debug('🧪 SimpleTestPage: Translations:', translations);

    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">
                        Language Test Page
                    </h1>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-blue-50 p-6 rounded-lg">
                            <h2 className="text-xl font-semibold text-blue-800 mb-3">
                                Current Language
                            </h2>
                            <p className="text-2xl font-bold text-blue-600">
                                {language === 'id' ? '🇮🇩 Bahasa Indonesia' : '🇺🇸 English'}
                            </p>
                        </div>

                        <div className="bg-green-50 p-6 rounded-lg">
                            <h2 className="text-xl font-semibold text-green-800 mb-3">
                                Translation Status
                            </h2>
                            <p className="text-lg text-green-600">
                                {translations ? `✅ Loaded (${Object.keys(translations).length} keys)` : '❌ Not loaded'}
                            </p>
                        </div>
                    </div>

                    {/* Test Translations */}
                    <div className="mt-8 bg-gray-50 p-6 rounded-lg">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Translation Test
                        </h2>
                        
                        <div className="space-y-4">
                            <div className="p-4 bg-white rounded border">
                                <h3 className="font-semibold text-gray-700 mb-2">Home Service Tab:</h3>
                                <p className="text-lg">
                                    {translations?.home?.homeServiceTab || 'Translation not found'}
                                </p>
                            </div>

                            <div className="p-4 bg-white rounded border">
                                <h3 className="font-semibold text-gray-700 mb-2">Massage Places Tab:</h3>
                                <p className="text-lg">
                                    {translations?.home?.massagePlacesTab || 'Translation not found'}
                                </p>
                            </div>

                            <div className="p-4 bg-white rounded border">
                                <h3 className="font-semibold text-gray-700 mb-2">Search Placeholder:</h3>
                                <p className="text-lg">
                                    {translations?.home?.searchPlaceholder || 'Translation not found'}
                                </p>
                            </div>

                            <div className="p-4 bg-white rounded border">
                                <h3 className="font-semibold text-gray-700 mb-2">Location Modal Title:</h3>
                                <p className="text-lg">
                                    {translations?.home?.locationModal?.title || 'Translation not found'}
                                </p>
                            </div>

                            <div className="p-4 bg-white rounded border">
                                <h3 className="font-semibold text-gray-700 mb-2">Set Location Button:</h3>
                                <p className="text-lg">
                                    {translations?.home?.setLocation || 'Translation not found'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Debug Info */}
                    <div className="mt-8 bg-yellow-50 p-6 rounded-lg">
                        <h2 className="text-xl font-semibold text-yellow-800 mb-4">
                            Debug Information
                        </h2>
                        <pre className="text-sm text-yellow-700 bg-yellow-100 p-4 rounded overflow-auto">
                            {JSON.stringify({ 
                                language, 
                                translationsKeys: translations ? Object.keys(translations) : null,
                                homeKeys: translations?.home ? Object.keys(translations.home) : null
                            }, null, 2)}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimpleTestPage;