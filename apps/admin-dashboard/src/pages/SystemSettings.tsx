// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState, useEffect } from 'react';
import {
    Settings, Save, RefreshCw, Key, Database, Download, Upload,
    AlertCircle, CheckCircle, Shield, DollarSign, Percent, Clock,
    Globe, Mail, Bell, Lock, Eye, EyeOff, Copy, Check, Trash2
} from 'lucide-react';
import { auditLoggingService, type AuditLogEntry } from '../lib/appwrite';

interface SystemConfig {
    // Commission & Fees
    commissionRate: number; // percentage
    serviceFee: number; // percentage
    minimumBookingAmount: number;
    cancellationFee: number;
    
    // Time Settings
    bookingResponseTimeout: number; // minutes
    autoReassignAfter: number; // minutes
    sessionTimeout: number; // minutes
    
    // Feature Toggles
    enableBookings: boolean;
    enableReviews: boolean;
    enableChat: boolean;
    enablePayments: boolean;
    enableNotifications: boolean;
    enableEmailMarketing: boolean;
    maintenanceMode: boolean;
    
    // API Keys
    appwriteEndpoint: string;
    appwriteProjectId: string;
    appwriteApiKey: string;
    googleMapsApiKey: string;
    googleTranslateApiKey: string;
    stripeApiKey: string;
    twilioAccountSid: string;
    twilioAuthToken: string;
    
    // Email Settings
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    
    // Notification Settings
    adminEmails: string[];
    notificationEmail: boolean;
    notificationSMS: boolean;
    notificationPush: boolean;
    
    // Other
    appVersion: string;
    lastBackup?: string;
}

interface SystemSettingsProps {
    onBack?: () => void;
}

const SystemSettings: React.FC<SystemSettingsProps> = ({ onBack }) => {
    const [config, setConfig] = useState<SystemConfig>({
        commissionRate: 30, // 30% standard commission for all bookings
        serviceFee: 5,
        minimumBookingAmount: 50000,
        cancellationFee: 25,
        bookingResponseTimeout: 15,
        autoReassignAfter: 30,
        sessionTimeout: 60,
        enableBookings: true,
        enableReviews: true,
        enableChat: true,
        enablePayments: true,
        enableNotifications: true,
        enableEmailMarketing: true,
        maintenanceMode: false,
        appwriteEndpoint: 'https://cloud.appwrite.io/v1',
        appwriteProjectId: '',
        appwriteApiKey: '',
        googleMapsApiKey: '',
        googleTranslateApiKey: '',
        stripeApiKey: '',
        twilioAccountSid: '',
        twilioAuthToken: '',
        smtpHost: '',
        smtpPort: 587,
        smtpUser: '',
        smtpPassword: '',
        fromEmail: 'noreply@indastreet.com',
        adminEmails: [],
        notificationEmail: true,
        notificationSMS: false,
        notificationPush: true,
        appVersion: '1.0.0'
    });

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'api' | 'features' | 'backup' | 'compliance'>('general');
    const [showApiKeys, setShowApiKeys] = useState<{[key: string]: boolean}>({});
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [backupInProgress, setBackupInProgress] = useState(false);
    const [restoreInProgress, setRestoreInProgress] = useState(false);
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    useEffect(() => {
        if (activeTab === 'compliance') {
            fetchAuditLogs();
        }
    }, [activeTab]);

    const loadSettings = async () => {
        try {
            setLoading(true);
            // TODO: Load from Appwrite system_config collection
            // const settings = await settingsService.get();
            // setConfig(settings);
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAuditLogs = async () => {
        try {
            setLogsLoading(true);
            const logs = await auditLoggingService.getRecentLogs(40);
            setAuditLogs(logs);
        } catch (error) {
            console.error('Error loading compliance logs:', error);
        } finally {
            setLogsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            // TODO: Save to Appwrite system_config collection
            // await settingsService.update(config);
            
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleBackup = async () => {
        try {
            setBackupInProgress(true);
            
            // TODO: Implement full database backup
            // 1. Export all collections to JSON
            // 2. Include storage files metadata
            // 3. Create timestamped backup file
            
            const backupData = {
                timestamp: new Date().toISOString(),
                config,
                version: config.appVersion,
                // Add other collections data
            };
            
            // Download as JSON file
            const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `indastreet-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            // Update last backup time
            setConfig(prev => ({ ...prev, lastBackup: new Date().toISOString() }));
            
            alert('Backup created successfully!');
        } catch (error) {
            console.error('Error creating backup:', error);
            alert('Failed to create backup');
        } finally {
            setBackupInProgress(false);
        }
    };

    const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        
        if (!confirm('Warning: Restoring will overwrite current settings. Continue?')) {
            return;
        }
        
        try {
            setRestoreInProgress(true);
            
            const text = await file.text();
            const backupData = JSON.parse(text);
            
            // TODO: Validate backup data structure
            // TODO: Restore to Appwrite collections
            
            setConfig(backupData.config);
            
            alert('Settings restored successfully! Please review and save.');
        } catch (error) {
            console.error('Error restoring backup:', error);
            alert('Failed to restore backup. Please check the file format.');
        } finally {
            setRestoreInProgress(false);
            event.target.value = '';
        }
    };

    const toggleApiKeyVisibility = (key: string) => {
        setShowApiKeys(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    const addAdminEmail = () => {
        if (newAdminEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newAdminEmail)) {
            setConfig(prev => ({
                ...prev,
                adminEmails: [...prev.adminEmails, newAdminEmail]
            }));
            setNewAdminEmail('');
        } else {
            alert('Please enter a valid email address');
        }
    };

    const removeAdminEmail = (email: string) => {
        setConfig(prev => ({
            ...prev,
            adminEmails: prev.adminEmails.filter(e => e !== email)
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                ←
                            </button>
                        )}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
                            <p className="text-gray-600">Configure app settings, API keys, and features</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={loadSettings}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Reload
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                        >
                            {saveSuccess ? (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    Saved!
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm mb-6">
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`flex-1 px-6 py-4 font-medium transition-colors ${
                            activeTab === 'general'
                                ? 'text-orange-600 border-b-2 border-orange-600'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <Settings className="w-5 h-5 inline mr-2" />
                        General Settings
                    </button>
                    <button
                        onClick={() => setActiveTab('api')}
                        className={`flex-1 px-6 py-4 font-medium transition-colors ${
                            activeTab === 'api'
                                ? 'text-orange-600 border-b-2 border-orange-600'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <Key className="w-5 h-5 inline mr-2" />
                        API Management
                    </button>
                    <button
                        onClick={() => setActiveTab('features')}
                        className={`flex-1 px-6 py-4 font-medium transition-colors ${
                            activeTab === 'features'
                                ? 'text-orange-600 border-b-2 border-orange-600'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <Shield className="w-5 h-5 inline mr-2" />
                        Feature Toggles
                    </button>
                    <button
                        onClick={() => setActiveTab('compliance')}
                        className={`flex-1 px-6 py-4 font-medium transition-colors ${
                            activeTab === 'compliance'
                                ? 'text-orange-600 border-b-2 border-orange-600'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <AlertCircle className="w-5 h-5 inline mr-2" />
                        Compliance Logs
                    </button>
                    <button
                        onClick={() => setActiveTab('backup')}
                        className={`flex-1 px-6 py-4 font-medium transition-colors ${
                            activeTab === 'backup'
                                ? 'text-orange-600 border-b-2 border-orange-600'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <Database className="w-5 h-5 inline mr-2" />
                        Backup & Restore
                    </button>
                </div>
            </div>

            {/* General Settings Tab */}
            {activeTab === 'general' && (
                <div className="space-y-6">
                    {/* Commission & Fees */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            Commission & Fees
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Commission Rate (%)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={config.commissionRate}
                                        onChange={(e) => setConfig(prev => ({ ...prev, commissionRate: parseFloat(e.target.value) }))}
                                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Service Fee (%)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={config.serviceFee}
                                        onChange={(e) => setConfig(prev => ({ ...prev, serviceFee: parseFloat(e.target.value) }))}
                                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Minimum Booking Amount (Rp)
                                </label>
                                <input
                                    type="number"
                                    value={config.minimumBookingAmount}
                                    onChange={(e) => setConfig(prev => ({ ...prev, minimumBookingAmount: parseInt(e.target.value) }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    min="0"
                                    step="1000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cancellation Fee (%)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={config.cancellationFee}
                                        onChange={(e) => setConfig(prev => ({ ...prev, cancellationFee: parseFloat(e.target.value) }))}
                                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        min="0"
                                        max="100"
                                        step="1"
                                    />
                                    <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Time Settings */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                            Time Settings
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Booking Response Timeout (minutes)
                                </label>
                                <input
                                    type="number"
                                    value={config.bookingResponseTimeout}
                                    onChange={(e) => setConfig(prev => ({ ...prev, bookingResponseTimeout: parseInt(e.target.value) }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    min="1"
                                />
                                <p className="text-xs text-gray-500 mt-1">How long members have to respond to bookings</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Auto-Reassign After (minutes)
                                </label>
                                <input
                                    type="number"
                                    value={config.autoReassignAfter}
                                    onChange={(e) => setConfig(prev => ({ ...prev, autoReassignAfter: parseInt(e.target.value) }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    min="1"
                                />
                                <p className="text-xs text-gray-500 mt-1">Automatically reassign unresponded bookings</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Session Timeout (minutes)
                                </label>
                                <input
                                    type="number"
                                    value={config.sessionTimeout}
                                    onChange={(e) => setConfig(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    min="5"
                                />
                                <p className="text-xs text-gray-500 mt-1">Idle time before auto-logout</p>
                            </div>
                        </div>
                    </div>

                    {/* Notification Settings */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Bell className="w-5 h-5 text-purple-600" />
                            Admin Notifications
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Admin Email Addresses
                                </label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="email"
                                        value={newAdminEmail}
                                        onChange={(e) => setNewAdminEmail(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addAdminEmail()}
                                        placeholder="admin@example.com"
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                    <button
                                        onClick={addAdminEmail}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {config.adminEmails.map((email, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                            <span className="text-sm">{email}</span>
                                            <button
                                                onClick={() => removeAdminEmail(email)}
                                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.notificationEmail}
                                        onChange={(e) => setConfig(prev => ({ ...prev, notificationEmail: e.target.checked }))}
                                        className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Email Notifications</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.notificationSMS}
                                        onChange={(e) => setConfig(prev => ({ ...prev, notificationSMS: e.target.checked }))}
                                        className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">SMS Notifications</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.notificationPush}
                                        onChange={(e) => setConfig(prev => ({ ...prev, notificationPush: e.target.checked }))}
                                        className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Push Notifications</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* API Management Tab */}
            {activeTab === 'api' && (
                <div className="space-y-6">
                    {/* Appwrite */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Database className="w-5 h-5 text-red-600" />
                            Appwrite Configuration
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Endpoint</label>
                                <input
                                    type="text"
                                    value={config.appwriteEndpoint}
                                    onChange={(e) => setConfig(prev => ({ ...prev, appwriteEndpoint: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Project ID</label>
                                <input
                                    type="text"
                                    value={config.appwriteProjectId}
                                    onChange={(e) => setConfig(prev => ({ ...prev, appwriteProjectId: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type={showApiKeys['appwrite'] ? 'text' : 'password'}
                                            value={config.appwriteApiKey}
                                            onChange={(e) => setConfig(prev => ({ ...prev, appwriteApiKey: e.target.value }))}
                                            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                        <button
                                            onClick={() => toggleApiKeyVisibility('appwrite')}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                        >
                                            {showApiKeys['appwrite'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(config.appwriteApiKey)}
                                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Google Maps */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Globe className="w-5 h-5 text-blue-600" />
                            Google Maps API
                        </h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type={showApiKeys['googleMaps'] ? 'text' : 'password'}
                                        value={config.googleMapsApiKey}
                                        onChange={(e) => setConfig(prev => ({ ...prev, googleMapsApiKey: e.target.value }))}
                                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                    <button
                                        onClick={() => toggleApiKeyVisibility('googleMaps')}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                    >
                                        {showApiKeys['googleMaps'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <button
                                    onClick={() => copyToClipboard(config.googleMapsApiKey)}
                                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Google Translate */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Globe className="w-5 h-5 text-green-600" />
                            Google Translate API
                        </h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type={showApiKeys['googleTranslate'] ? 'text' : 'password'}
                                        value={config.googleTranslateApiKey}
                                        onChange={(e) => setConfig(prev => ({ ...prev, googleTranslateApiKey: e.target.value }))}
                                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="Enter Google Translate API key for chat translation"
                                    />
                                    <button
                                        onClick={() => toggleApiKeyVisibility('googleTranslate')}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                    >
                                        {showApiKeys['googleTranslate'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <button
                                    onClick={() => copyToClipboard(config.googleTranslateApiKey)}
                                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                Used for real-time chat translation between customers and service providers
                            </p>
                        </div>
                    </div>

                    {/* Stripe */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-purple-600" />
                            Stripe Payment
                        </h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Secret Key</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type={showApiKeys['stripe'] ? 'text' : 'password'}
                                        value={config.stripeApiKey}
                                        onChange={(e) => setConfig(prev => ({ ...prev, stripeApiKey: e.target.value }))}
                                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                    <button
                                        onClick={() => toggleApiKeyVisibility('stripe')}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                    >
                                        {showApiKeys['stripe'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <button
                                    onClick={() => copyToClipboard(config.stripeApiKey)}
                                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* SMTP Email */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Mail className="w-5 h-5 text-green-600" />
                            SMTP Email Configuration
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
                                <input
                                    type="text"
                                    value={config.smtpHost}
                                    onChange={(e) => setConfig(prev => ({ ...prev, smtpHost: e.target.value }))}
                                    placeholder="smtp.gmail.com"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                                <input
                                    type="number"
                                    value={config.smtpPort}
                                    onChange={(e) => setConfig(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Username</label>
                                <input
                                    type="text"
                                    value={config.smtpUser}
                                    onChange={(e) => setConfig(prev => ({ ...prev, smtpUser: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Password</label>
                                <div className="relative">
                                    <input
                                        type={showApiKeys['smtp'] ? 'text' : 'password'}
                                        value={config.smtpPassword}
                                        onChange={(e) => setConfig(prev => ({ ...prev, smtpPassword: e.target.value }))}
                                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                    <button
                                        onClick={() => toggleApiKeyVisibility('smtp')}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                    >
                                        {showApiKeys['smtp'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
                                <input
                                    type="email"
                                    value={config.fromEmail}
                                    onChange={(e) => setConfig(prev => ({ ...prev, fromEmail: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Feature Toggles Tab */}
            {activeTab === 'features' && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Feature Toggles</h2>
                    <div className="space-y-4">
                        {/* Maintenance Mode */}
                        <div className="p-4 border-2 border-red-200 rounded-lg bg-red-50">
                            <label className="flex items-center justify-between cursor-pointer">
                                <div>
                                    <div className="font-semibold text-red-900">Maintenance Mode</div>
                                    <div className="text-sm text-red-700">Disable all user access to the app</div>
                                </div>
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={config.maintenanceMode}
                                        onChange={(e) => setConfig(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                                        className="sr-only peer"
                                    />
                                    <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
                                </div>
                            </label>
                        </div>

                        {/* Other Features */}
                        {[
                            { key: 'enableBookings', label: 'Booking System', desc: 'Allow customers to create bookings' },
                            { key: 'enableReviews', label: 'Reviews & Ratings', desc: 'Allow customers to leave reviews' },
                            { key: 'enableChat', label: 'Chat System', desc: 'Enable real-time messaging' },
                            { key: 'enablePayments', label: 'Payment Processing', desc: 'Enable online payments' },
                            { key: 'enableNotifications', label: 'Push Notifications', desc: 'Send push notifications to users' },
                            { key: 'enableEmailMarketing', label: 'Email Marketing', desc: 'Send marketing emails to users' }
                        ].map((feature) => (
                            <div key={feature.key} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <div>
                                        <div className="font-medium text-gray-900">{feature.label}</div>
                                        <div className="text-sm text-gray-600">{feature.desc}</div>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={config[feature.key as keyof SystemConfig] as boolean}
                                            onChange={(e) => setConfig(prev => ({ ...prev, [feature.key]: e.target.checked }))}
                                            className="sr-only peer"
                                        />
                                        <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                                    </div>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Backup & Restore Tab */}
            {activeTab === 'backup' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Database Backup</h2>
                        <p className="text-gray-600 mb-4">
                            Create a complete backup of all system data including settings, users, bookings, and reviews.
                        </p>
                        {config.lastBackup && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm text-green-800">
                                    Last backup: {new Date(config.lastBackup).toLocaleString()}
                                </p>
                            </div>
                        )}
                        <button
                            onClick={handleBackup}
                            disabled={backupInProgress}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium"
                        >
                            <Download className={`w-5 h-5 ${backupInProgress ? 'animate-bounce' : ''}`} />
                            {backupInProgress ? 'Creating Backup...' : 'Create Backup'}
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Restore from Backup</h2>
                        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-yellow-800">
                                    <strong>Warning:</strong> Restoring from a backup will overwrite all current settings.
                                    This action cannot be undone. Make sure to create a current backup first.
                                </div>
                            </div>
                        </div>
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleRestore}
                            disabled={restoreInProgress}
                            className="hidden"
                            id="restore-input"
                        />
                        <label
                            htmlFor="restore-input"
                            className={`inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 cursor-pointer font-medium ${
                                restoreInProgress ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            <Upload className={`w-5 h-5 ${restoreInProgress ? 'animate-bounce' : ''}`} />
                            {restoreInProgress ? 'Restoring...' : 'Restore from File'}
                        </label>
                    </div>
                </div>
            )}

            {activeTab === 'compliance' && (
                <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Compliance Logs</h2>
                            <p className="text-sm text-gray-600">
                                Review every blocked attempt to share contact data from customer or therapist chats.
                            </p>
                        </div>
                        <button
                            onClick={fetchAuditLogs}
                            disabled={logsLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg text-xs font-semibold hover:bg-orange-200 disabled:opacity-60"
                        >
                            <RefreshCw className="w-4 h-4" />
                            {logsLoading ? 'Refreshing…' : 'Refresh logs'}
                        </button>
                    </div>

                    {logsLoading ? (
                        <p className="text-sm text-gray-500">Loading compliance logs…</p>
                    ) : auditLogs.length === 0 ? (
                        <p className="text-sm text-gray-500">No blocked attempts recorded yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {auditLogs.map((log) => (
                                <div
                                    key={log.$id ?? `${log.context}-${log.createdAt}-${log.userId}`}
                                    className="border border-gray-200 rounded-xl p-4 shadow-sm space-y-1"
                                >
                                    <div className="flex justify-between items-center text-[11px] uppercase text-gray-500">
                                        <span className="font-semibold text-gray-700">
                                            {log.detectedType?.toUpperCase() ?? 'PII'} blocked
                                        </span>
                                        <span>{new Date(log.createdAt).toLocaleString('en-US')}</span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-gray-900">
                                        <span>{log.role}</span>
                                        <span className="text-xs text-gray-500">Booking: {log.bookingId || 'N/A'}</span>
                                    </div>
                                    <div className="text-xs text-gray-500">Context: {log.context}</div>
                                    {log.reason && <div className="text-sm text-gray-700">{log.reason}</div>}
                                    {log.excerpt && (
                                        <div className="text-xs text-gray-500">Excerpt: {log.excerpt}</div>
                                    )}
                                    <details className="text-xs text-gray-600">
                                        <summary className="font-semibold text-orange-600 cursor-pointer">
                                            View original content
                                        </summary>
                                        <p className="mt-1 whitespace-pre-wrap break-words">{log.fullContent}</p>
                                    </details>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SystemSettings;
