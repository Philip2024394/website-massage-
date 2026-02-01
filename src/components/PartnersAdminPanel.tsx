// 🎯 AUTO-FIXED: Mobile scroll architecture violations (2 fixes)
/**
 * ============================================================================
 * 🏨 PARTNERS ADMIN PANEL - APPWRITE CONNECTION MANAGER
 * ============================================================================
 * 
 * Admin component for managing partners data and Appwrite connections
 * Provides migration, testing, and management tools
 */

import React, { useState, useEffect } from 'react';
import { indastreetPartnersService, PartnerData } from '../services/indastreetPartnersService';
import { migratePartnersData, verifyMigration } from '../scripts/migratePartnersData';
import { Upload, Download, Database, CheckCircle, AlertCircle, RefreshCw, Settings } from 'lucide-react';

interface PartnersAdminPanelProps {
    onClose?: () => void;
}

const PartnersAdminPanel: React.FC<PartnersAdminPanelProps> = ({ onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
    const [partnersCount, setPartnersCount] = useState(0);
    const [migrationStatus, setMigrationStatus] = useState<string>('');
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (message: string) => {
        setLogs(prev => [...prev.slice(-19), `[${new Date().toLocaleTimeString()}] ${message}`]);
    };

    // Check Appwrite connection on mount
    useEffect(() => {
        checkConnection();
    }, []);

    const checkConnection = async () => {
        setConnectionStatus('checking');
        addLog('🔍 Checking Appwrite connection...');
        
        try {
            const initialized = await indastreetPartnersService.initializePartnersSystem();
            
            if (initialized) {
                setConnectionStatus('connected');
                addLog('✅ Successfully connected to Appwrite Partners collection');
                
                // Get current partners count
                const partners = await indastreetPartnersService.getPartners();
                setPartnersCount(partners.length);
                addLog(`📊 Found ${partners.length} partners in database`);
            } else {
                setConnectionStatus('error');
                addLog('❌ Failed to connect to Partners collection');
            }
        } catch (error: any) {
            setConnectionStatus('error');
            addLog(`❌ Connection error: ${error.message}`);
        }
    };

    const runMigration = async () => {
        setIsLoading(true);
        setMigrationStatus('Running migration...');
        addLog('🚀 Starting data migration...');
        
        try {
            // Override console.log to capture migration logs
            const originalLog = console.log;
            console.log = (message: string) => {
                addLog(message);
                originalLog(message);
            };
            
            await migratePartnersData();
            
            // Restore console.log
            console.log = originalLog;
            
            setMigrationStatus('Migration completed successfully!');
            addLog('✅ Migration completed successfully!');
            
            // Refresh partners count
            await checkConnection();
            
        } catch (error: any) {
            setMigrationStatus(`Migration failed: ${error.message}`);
            addLog(`❌ Migration failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const runVerification = async () => {
        setIsLoading(true);
        addLog('🔍 Running verification...');
        
        try {
            // Override console.log to capture verification logs
            const originalLog = console.log;
            console.log = (message: string) => {
                addLog(message);
                originalLog(message);
            };
            
            await verifyMigration();
            
            // Restore console.log
            console.log = originalLog;
            
            addLog('✅ Verification completed successfully!');
            
        } catch (error: any) {
            addLog(`❌ Verification failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const testPartnerCreation = async () => {
        setIsLoading(true);
        addLog('🧪 Testing partner creation...');
        
        try {
            const testPartner: PartnerData = {
                name: 'Test Partner',
                category: 'hotel',
                location: 'Test Location',
                description: 'Test partner for validation',
                verified: false,
                phone: '+1234567890',
                specialties: ['Test', 'Validation'],
                priceRange: 'mid-range'
            };
            
            const partnerId = await indastreetPartnersService.createPartner(testPartner);
            
            if (partnerId) {
                addLog(`✅ Test partner created successfully: ${partnerId}`);
                
                // Clean up test partner
                await indastreetPartnersService.deletePartner(partnerId);
                addLog('🧹 Test partner cleaned up');
                
            } else {
                addLog('❌ Failed to create test partner');
            }
            
        } catch (error: any) {
            addLog(`❌ Test failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const exportPartners = async () => {
        setIsLoading(true);
        addLog('📤 Exporting partners data...');
        
        try {
            const partners = await indastreetPartnersService.getPartners();
            const dataStr = JSON.stringify(partners, null, 2);
            
            // Create download link
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `partners-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            addLog(`✅ Exported ${partners.length} partners to JSON file`);
            
        } catch (error: any) {
            addLog(`❌ Export failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">Partners Admin Panel</h2>
                            <p className="text-orange-100">Appwrite Connection Manager</p>
                        </div>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <span className="sr-only">Close</span>
                                ×
                            </button>
                        )}
                    </div>
                </div>

                <div className="p-6 space-y-6  max-h-[calc(90vh-120px)]">
                    {/* Connection Status */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <Database className="w-5 h-5" />
                            <h3 className="font-semibold">Appwrite Connection Status</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            {connectionStatus === 'checking' && (
                                <div className="flex items-center gap-2 text-yellow-600">
                                    <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                                    <span>Checking connection...</span>
                                </div>
                            )}
                            {connectionStatus === 'connected' && (
                                <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircle className="w-5 h-5" />
                                    <span>Connected ({partnersCount} partners in database)</span>
                                </div>
                            )}
                            {connectionStatus === 'error' && (
                                <div className="flex items-center gap-2 text-red-600">
                                    <AlertCircle className="w-5 h-5" />
                                    <span>Connection failed</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={checkConnection}
                            disabled={isLoading}
                            className="flex items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className="w-5 h-5 text-blue-600" />
                            <span className="font-medium text-blue-700">Test Connection</span>
                        </button>

                        <button
                            onClick={runMigration}
                            disabled={isLoading || connectionStatus !== 'connected'}
                            className="flex items-center gap-2 p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <Upload className="w-5 h-5 text-green-600" />
                            <span className="font-medium text-green-700">Migrate Data</span>
                        </button>

                        <button
                            onClick={runVerification}
                            disabled={isLoading || connectionStatus !== 'connected'}
                            className="flex items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <CheckCircle className="w-5 h-5 text-purple-600" />
                            <span className="font-medium text-purple-700">Verify Migration</span>
                        </button>

                        <button
                            onClick={testPartnerCreation}
                            disabled={isLoading || connectionStatus !== 'connected'}
                            className="flex items-center gap-2 p-4 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <Settings className="w-5 h-5 text-yellow-600" />
                            <span className="font-medium text-yellow-700">Test Creation</span>
                        </button>

                        <button
                            onClick={exportPartners}
                            disabled={isLoading || connectionStatus !== 'connected'}
                            className="flex items-center gap-2 p-4 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <Download className="w-5 h-5 text-indigo-600" />
                            <span className="font-medium text-indigo-700">Export Partners</span>
                        </button>
                    </div>

                    {/* Migration Status */}
                    {migrationStatus && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-blue-700 font-medium">{migrationStatus}</p>
                        </div>
                    )}

                    {/* Activity Logs */}
                    <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <span>Activity Logs</span>
                            {isLoading && (
                                <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                            )}
                        </h3>
                        <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm max-h-64 ">
                            {logs.length === 0 ? (
                                <p className="text-gray-500">No activity yet...</p>
                            ) : (
                                logs.map((log, index) => (
                                    <div key={index} className="mb-1">
                                        {log}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartnersAdminPanel;