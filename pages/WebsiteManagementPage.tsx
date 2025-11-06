import React, { useState } from 'react';
import { Globe, Star, ArrowLeft, Save, Eye } from 'lucide-react';

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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 pb-20">
                            <button
                                onClick={onBack}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                                        <Globe className="w-6 h-6 text-white" />
                                    </div>
                                    Website Management
                                </h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    Manage your website for Indastreet Partners Directory
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsPreviewMode(!isPreviewMode)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                            >
                                <Eye className="w-4 h-4" />
                                {isPreviewMode ? 'Edit Mode' : 'Preview'}
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                {isPreviewMode ? (
                    /* Preview Mode */
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Preview: Partners Directory Listing</h2>
                            
                            {websiteUrl && websiteTitle ? (
                                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
                                    <div className="flex items-start gap-4 pb-20">
                                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Globe className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                {websiteTitle || 'Your Website Title'}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-3">
                                                {getUserTypeLabel()} • Indastreet Partner
                                            </p>
                                            {websiteDescription && (
                                                <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                                                    {websiteDescription}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-3">
                                                <a
                                                    href={websiteUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                                                >
                                                    <Globe className="w-4 h-4" />
                                                    Visit Website
                                                </a>
                                                <div className="flex items-center gap-1 text-xs text-indigo-600">
                                                    <Star className="w-3 h-3 fill-current" />
                                                    <span>SEO Optimized</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <Globe className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                    <p>Fill in your website information to see the preview</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Edit Mode */
                    <div className="space-y-6">
                        {/* Information Section */}
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                    <Globe className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        🤝 Indastreet Partners Directory
                                    </h2>
                                    <p className="text-sm text-indigo-600">Optional but Recommended</p>
                                </div>
                            </div>
                            
                            <div className="bg-white/50 rounded-lg p-4 pb-20 space-y-3">
                                <p className="text-sm text-gray-700">
                                    Add your website to be featured in our <strong>Indastreet Partners</strong> directory for better SEO ranking and exposure.
                                    Being part of the Indastreet Partnership will drive additional traffic to your website.
                                </p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-20 mt-4">
                                    <div className="flex items-center gap-2 text-sm text-green-700">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span>Increased Web Traffic</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-blue-700">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span>SEO Boost</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-purple-700">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                        <span>Brand Exposure</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Website Information Form */}
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Website Information</h3>
                            
                            <div className="space-y-6">
                                {/* Website URL */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                            className={`block w-full pl-10 pr-3 py-3 bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 text-gray-900 ${
                                                websiteUrl && !isValidUrl(websiteUrl)
                                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                                            }`}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Your professional website or business URL
                                    </p>
                                    {websiteUrl && !isValidUrl(websiteUrl) && (
                                        <p className="text-xs text-red-600 mt-1">
                                            Please enter a valid URL (e.g., https://example.com)
                                        </p>
                                    )}
                                </div>

                                {/* Website Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Website Title *
                                    </label>
                                    <input 
                                        type="text" 
                                        value={websiteTitle} 
                                        onChange={e => setWebsiteTitle(e.target.value)} 
                                        placeholder="Professional Massage & Wellness Services" 
                                        className="block w-full px-3 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                                        maxLength={100}
                                    />
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-xs text-gray-500">
                                            Display name for your website link
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {websiteTitle.length}/100 characters
                                        </p>
                                    </div>
                                </div>

                                {/* Website Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Website Description
                                    </label>
                                    <textarea 
                                        value={websiteDescription} 
                                        onChange={e => setWebsiteDescription(e.target.value)} 
                                        placeholder="Brief description of your website and services for the partners directory. Describe what makes your business unique and what visitors can expect..." 
                                        rows={4}
                                        className="block w-full px-3 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                                        maxLength={300}
                                    />
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-xs text-gray-500">
                                            Short description for the partners directory (optional)
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {websiteDescription.length}/300 characters
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SEO Benefits Card */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Star className="w-6 h-6 text-blue-600" />
                                <h3 className="text-lg font-semibold text-blue-900">SEO Benefits</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                    <div>
                                        <h4 className="font-medium text-blue-900">Higher Google Ranking</h4>
                                        <p className="text-sm text-blue-700">
                                            Backlinks from our directory improve your search engine visibility
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                    <div>
                                        <h4 className="font-medium text-blue-900">Increased Traffic</h4>
                                        <p className="text-sm text-blue-700">
                                            Drive qualified visitors to your website through our platform
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                    <div>
                                        <h4 className="font-medium text-blue-900">Brand Authority</h4>
                                        <p className="text-sm text-blue-700">
                                            Association with Indastreet enhances your business credibility
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                    <div>
                                        <h4 className="font-medium text-blue-900">Local SEO</h4>
                                        <p className="text-sm text-blue-700">
                                            Better local search rankings for location-based queries
                                        </p>
                                    </div>
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

