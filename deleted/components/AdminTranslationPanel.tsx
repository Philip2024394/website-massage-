import React, { useState } from 'react';
import { adminTranslationService } from '../lib/translationService';

interface AdminTranslationPanelProps {
    onClose: () => void;
}

const AdminTranslationPanel: React.FC<AdminTranslationPanelProps> = ({ onClose }) => {
    const [isTranslating, setIsTranslating] = useState(false);
    const [translationResults, setTranslationResults] = useState<any>(null);
    const [bulkResults, setBulkResults] = useState<any>(null);
    const [testData, setTestData] = useState({
        therapistId: '',
        description: '',
        location: '',
        massageTypes: '["Swedish Massage", "Deep Tissue"]',
        sourceLanguage: 'en' as 'en' | 'id'
    });

    const handleSingleTranslation = async () => {
        if (!testData.therapistId || !testData.description) {
            alert('Please provide Therapist ID and Description');
            return;
        }

        setIsTranslating(true);
        try {
            const result = await adminTranslationService.translateAndSaveTherapistData(
                testData.therapistId,
                {
                    description: testData.description,
                    location: testData.location || undefined,
                    massageTypes: testData.massageTypes || undefined
                },
                testData.sourceLanguage
            );
            setTranslationResults(result);
        } catch (error) {
            setTranslationResults({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        }
        setIsTranslating(false);
    };

    const handleBulkTranslation = async () => {
        if (!confirm('This will translate ALL existing therapists. This may take several minutes. Continue?')) {
            return;
        }

        setIsTranslating(true);
        try {
            const result = await adminTranslationService.translateAllExistingTherapists();
            setBulkResults(result);
        } catch (error) {
            setBulkResults({ success: false, processed: 0, errors: [error instanceof Error ? error.message : 'Unknown error'] });
        }
        setIsTranslating(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Translation Management</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* Single Therapist Translation */}
                <div className="mb-8 p-4 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Test Single Therapist Translation</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Therapist ID
                            </label>
                            <input
                                type="text"
                                value={testData.therapistId}
                                onChange={(e) => setTestData({...testData, therapistId: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                placeholder="Enter therapist ID"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Source Language
                            </label>
                            <select
                                value={testData.sourceLanguage}
                                onChange={(e) => setTestData({...testData, sourceLanguage: e.target.value as 'en' | 'id'})}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            >
                                <option value="en">English</option>
                                <option value="id">Indonesian</option>
                            </select>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            value={testData.description}
                            onChange={(e) => setTestData({...testData, description: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded-md h-24"
                            placeholder="Enter therapist description"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Location
                            </label>
                            <input
                                type="text"
                                value={testData.location}
                                onChange={(e) => setTestData({...testData, location: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                placeholder="e.g., Denpasar, Bali"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Massage Types (JSON)
                            </label>
                            <input
                                type="text"
                                value={testData.massageTypes}
                                onChange={(e) => setTestData({...testData, massageTypes: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                placeholder='["Swedish Massage", "Deep Tissue"]'
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSingleTranslation}
                        disabled={isTranslating}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
                    >
                        {isTranslating ? 'Translating...' : 'Translate & Save'}
                    </button>

                    {translationResults && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-md">
                            <h4 className="font-medium mb-2">Translation Results:</h4>
                            <pre className="text-sm overflow-x-auto">
                                {JSON.stringify(translationResults, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>

                {/* Bulk Translation */}
                <div className="mb-8 p-4 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Bulk Translate All Therapists</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        This will automatically translate all existing therapists who don't have translations yet.
                        It uses the MyMemory API (5000 chars/day free) with fallbacks for common massage terms.
                    </p>
                    
                    <button
                        onClick={handleBulkTranslation}
                        disabled={isTranslating}
                        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50"
                    >
                        {isTranslating ? 'Processing...' : 'Translate All Therapists'}
                    </button>

                    {bulkResults && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-md">
                            <h4 className="font-medium mb-2">Bulk Translation Results:</h4>
                            <div className="text-sm">
                                <p className="text-green-600">✅ Successfully processed: {bulkResults.processed}</p>
                                {bulkResults.errors && bulkResults.errors.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-red-600">❌ Errors:</p>
                                        <ul className="list-disc list-inside text-red-600">
                                            {bulkResults.errors.map((error: string, index: number) => (
                                                <li key={index}>{error}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Instructions */}
                <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">How Auto-Translation Works</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                        <li>• When therapists add/edit their profiles, the system will auto-translate to both English and Indonesian</li>
                        <li>• Uses MyMemory API (free, 5000 chars/day) with fallbacks for common massage terms</li>
                        <li>• Saves both language versions in the database (description_en, description_id, etc.)</li>
                        <li>• The app automatically displays the correct language based on user's language setting</li>
                        <li>• For production, consider upgrading to Google Translate API for better quality</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminTranslationPanel;