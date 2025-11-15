import React, { useState } from 'react';
import { Globe, Star, ArrowLeft, Save, Eye, Home, Activity, Users, MapPin, TrendingUp } from 'lucide-react';

interface WebsiteManagementPageProps {
    onBack: () => void;
    currentUser?: {
        id: string;
        name: string;
        type: 'customer' | 'therapist' | 'place' | 'hotel' | 'villa' | 'agent';
    };
    onSave?: (websiteData: {
        websiteUrl: string;
        websiteTitle: string;
        websiteDescription: string;
    }) => void;
    initialData?: {
        websiteUrl?: string;
        websiteTitle?: string;
        websiteDescription?: string;
    };
    t?: any;
}

const WebsiteManagementPage: React.FC<WebsiteManagementPageProps> = ({
    onBack,
    currentUser,
    onSave,
    initialData
}) => {
    const [websiteUrl, setWebsiteUrl] = useState(initialData?.websiteUrl || '');
    const [websiteTitle, setWebsiteTitle] = useState(initialData?.websiteTitle || '');
    const [websiteDescription, setWebsiteDescription] = useState(initialData?.websiteDescription || '');
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!onSave) return;
        
        setIsSaving(true);
        try {
            await onSave({
                websiteUrl,
                websiteTitle,
                websiteDescription
            });
            
            // Show success feedback
            const successMessage = document.createElement('div');
            successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
            successMessage.textContent = 'Website information saved successfully!';
            document.body.appendChild(successMessage);
            
            setTimeout(() => {
                try {
                    if (successMessage && successMessage.parentNode && document.body.contains(successMessage)) {
                        document.body.removeChild(successMessage);
                    }
                } catch (error) {
                    console.warn('Failed to remove success message element:', error);
                }
            }, 3000);
        } catch (error) {
            console.error('Error saving website data:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const isValidUrl = (url: string) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const getUserTypeLabel = () => {
        switch (currentUser?.type) {
            case 'therapist': return 'Therapist';
            case 'place': return 'Massage Place';
            case 'hotel': return 'Hotel';
            case 'villa': return 'Villa';
            default: return 'Business';
        }
    };

    return (
        <div className="min-h-screen bg-orange-50">
            {/* Top Home Header */}
            <div className="sticky top-0 z-30 bg-gradient-to-r from-orange-500 to-orange-600 shadow">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onBack}
                            aria-label="Back"
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-white" />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                                <Home className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-white leading-tight">Website Management</h1>
                                <p className="text-[11px] text-orange-100">Indastreet Partner Directory Setup</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsPreviewMode(!isPreviewMode)}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-orange-700 bg-white rounded-md shadow-sm hover:bg-orange-50 transition-colors"
                        >
                            <Eye className="w-4 h-4" />
                            {isPreviewMode ? 'Edit' : 'Preview'}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-orange-700 rounded-md shadow-sm hover:bg-orange-800 transition-colors disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {isSaving ? 'Saving' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                {isPreviewMode ? (
                    /* Preview Mode */
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border p-5">
                            <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2"><Globe className="w-4 h-4 text-orange-500" /> Preview Listing</h2>
                            
                            {websiteUrl && websiteTitle ? (
                                <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-5">
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Globe className="w-7 h-7 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-base font-semibold text-gray-900 mb-1">
                                                {websiteTitle || 'Your Website Title'}
                                            </h3>
                                            <p className="text-xs text-gray-600 mb-2">
                                                {getUserTypeLabel()} • Indastreet Partner
                                            </p>
                                            {websiteDescription && (
                                                <p className="text-xs text-gray-700 mb-3 line-clamp-4">
                                                    {websiteDescription}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-3">
                                                <a
                                                    href={websiteUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-xs font-medium"
                                                >
                                                    <Globe className="w-4 h-4" />
                                                    Visit Website
                                                </a>
                                                <div className="flex items-center gap-1 text-[10px] text-orange-600">
                                                    <Star className="w-3 h-3 fill-current" />
                                                    <span>SEO Ready</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <Globe className="w-14 h-14 mx-auto mb-3 text-gray-300" />
                                    <p className="text-sm">Enter details to preview your listing</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Edit Mode */
                    <div className="space-y-6">
                        {/* Information Section */}
                        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-5 rounded-xl border border-orange-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <Globe className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-gray-900 flex items-center gap-1">
                                        <span>🤝 Indastreet Partners Directory</span>
                                    </h2>
                                    <p className="text-[11px] text-orange-600">Optional but Recommended</p>
                                </div>
                            </div>
                            
                            <div className="bg-white/60 rounded-lg p-4 space-y-3">
                                <p className="text-xs text-gray-700 leading-relaxed">
                                    Add your website to be featured in our <strong>Indastreet Partners</strong> directory for better SEO ranking and exposure.
                                    This boosts visibility and drives more relevant visitors to your business.
                                </p>
                                
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                                    <div className="flex items-center gap-2 text-[11px] text-orange-700">
                                        <TrendingUp className="w-3.5 h-3.5" />
                                        <span>Traffic</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-orange-700">
                                        <Activity className="w-3.5 h-3.5" />
                                        <span>SEO Boost</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-orange-700">
                                        <Users className="w-3.5 h-3.5" />
                                        <span>Exposure</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-orange-700">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span>Local Reach</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Website Information Form */}
                        <div className="bg-white rounded-xl shadow-sm border p-5">
                            <h3 className="text-sm font-semibold text-gray-800 mb-5 flex items-center gap-2"><Globe className="w-4 h-4 text-orange-500" /> Website Information</h3>
                            
                            <div className="space-y-6">
                                {/* Website URL */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                        Website URL *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Globe className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input 
                                            type="url" 
                                            value={websiteUrl} 
                                            onChange={e => setWebsiteUrl(e.target.value)} 
                                            placeholder="https://yourwebsite.com" 
                                            className={`block w-full pl-10 pr-3 py-2.5 bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 text-gray-900 text-sm ${
                                                websiteUrl && !isValidUrl(websiteUrl)
                                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
                                            }`}
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-500 mt-1">
                                        Your professional website or business URL
                                    </p>
                                    {websiteUrl && !isValidUrl(websiteUrl) && (
                                        <p className="text-[11px] text-red-600 mt-1">
                                            Please enter a valid URL (e.g., https://example.com)
                                        </p>
                                    )}
                                </div>

                                {/* Website Title */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                        Website Title *
                                    </label>
                                    <input 
                                        type="text" 
                                        value={websiteTitle} 
                                        onChange={e => setWebsiteTitle(e.target.value)} 
                                        placeholder="Professional Massage & Wellness Services" 
                                        className="block w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 text-sm"
                                        maxLength={100}
                                    />
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-[11px] text-gray-500">
                                            Display name for your website link
                                        </p>
                                        <p className="text-[11px] text-gray-400">
                                            {websiteTitle.length}/100 characters
                                        </p>
                                    </div>
                                </div>

                                {/* Website Description */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                        Website Description
                                    </label>
                                    <textarea 
                                        value={websiteDescription} 
                                        onChange={e => setWebsiteDescription(e.target.value)} 
                                        placeholder="Brief description of your website and services for the partners directory. Describe what makes your business unique and what visitors can expect..." 
                                        rows={4}
                                        className="block w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 text-sm"
                                        maxLength={300}
                                    />
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-[11px] text-gray-500">
                                            Short description for the partners directory (optional)
                                        </p>
                                        <p className="text-[11px] text-gray-400">
                                            {websiteDescription.length}/300 characters
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SEO Benefits Card */}
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Star className="w-5 h-5 text-orange-600" />
                                <h3 className="text-sm font-semibold text-orange-900">SEO Benefits</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="flex flex-col gap-1 bg-white rounded-lg p-3 border border-orange-100">
                                    <TrendingUp className="w-4 h-4 text-orange-600" />
                                    <h4 className="text-xs font-medium text-gray-800">Higher Ranking</h4>
                                    <p className="text-[10px] text-gray-600">Quality backlink improves visibility</p>
                                </div>
                                <div className="flex flex-col gap-1 bg-white rounded-lg p-3 border border-orange-100">
                                    <Activity className="w-4 h-4 text-orange-600" />
                                    <h4 className="text-xs font-medium text-gray-800">More Traffic</h4>
                                    <p className="text-[10px] text-gray-600">Directory sends relevant visitors</p>
                                </div>
                                <div className="flex flex-col gap-1 bg-white rounded-lg p-3 border border-orange-100">
                                    <Users className="w-4 h-4 text-orange-600" />
                                    <h4 className="text-xs font-medium text-gray-800">Authority</h4>
                                    <p className="text-[10px] text-gray-600">Brand trust & credibility</p>
                                </div>
                                <div className="flex flex-col gap-1 bg-white rounded-lg p-3 border border-orange-100">
                                    <MapPin className="w-4 h-4 text-orange-600" />
                                    <h4 className="text-xs font-medium text-gray-800">Local SEO</h4>
                                    <p className="text-[10px] text-gray-600">Better location searches</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WebsiteManagementPage;

