import React, { useState, useEffect } from 'react';
import { customLinksService, authService } from '../lib/appwriteService';
import ImageUpload from '../components/ImageUpload';
import { useTranslations } from '../lib/useTranslations';
import { useLanguage } from '../context/LanguageContext';

interface CustomLink {
    $id: string;
    title: string;
    url: string;
    icon: string;
}

const DrawerButtonsPage: React.FC = () => {
    const { language } = useLanguage();
    const { t } = useTranslations(language);
    const [links, setLinks] = useState<CustomLink[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [authError, setAuthError] = useState<string | null>(null);
    // Use environment variable or localStorage fallback
    const [googleMapsApiKey, setGoogleMapsApiKey] = useState(import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '');
    const [isEditingApiKey, setIsEditingApiKey] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        url: '',
        icon: ''
    });

    useEffect(() => {
        initializeAndFetch();
        // Load Google Maps API key from localStorage or environment variable
        const savedApiKey = localStorage.getItem('googleMapsApiKey');
        if (savedApiKey) {
            setGoogleMapsApiKey(savedApiKey);
        } else if (import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
            setGoogleMapsApiKey(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
        }
    }, []);

    const initializeAndFetch = async () => {
        try {
            setAuthError(null);
            setIsLoading(true);
            
            // Ensure we have a session before fetching data
            const user = await authService.createAnonymousSession();
            console.log('Session created:', user);
            
            // Small delay to ensure session is fully established
            await new Promise(resolve => setTimeout(resolve, 500));
            
            await fetchLinks();
        } catch (error: any) {
            console.error('Error initializing session:', error);
            const errorMsg = error.message || error.toString();
            
            if (errorMsg.includes('not authorized') || errorMsg.includes('401')) {
                setAuthError('⚠️ Database permissions not configured. Please set up collection permissions in Appwrite Console:\n\n1. Go to your Appwrite Console\n2. Navigate to Databases → custom_links_collection_id\n3. Settings → Permissions\n4. Add "Any" role with Read, Create, Update, Delete permissions');
            } else {
                setAuthError('Unable to connect to the database. Please check your Appwrite configuration.');
            }
            setIsLoading(false);
        }
    };

    const fetchLinks = async () => {
        try {
            setIsLoading(true);
            const data = await customLinksService.getAll();
            setLinks(data);
        } catch (error) {
            console.error('Error fetching custom links:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddLink = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name || !formData.url) {
            alert(t('drawerAdmin.errorRequired') || 'Please fill in all required fields (Name and URL)');
            return;
        }

        if (!formData.icon) {
            alert(t('drawerAdmin.errorIcon') || 'Please upload an icon image for your button');
            return;
        }

        try {
            if (editingId) {
                // Update existing link
                await customLinksService.update(editingId, formData);
                setEditingId(null);
                alert(t('drawerAdmin.successUpdate') || '✅ Button updated successfully!');
            } else {
                // Create new link
                await customLinksService.create(formData);
                alert(t('drawerAdmin.successAdd') || '✅ Custom button added successfully!');
            }
            
            setFormData({ name: '', url: '', icon: '' });
            setShowAddForm(false);
            await fetchLinks();
        } catch (error: any) {
            console.error('Error saving link:', error);
            alert('Error saving button: ' + (error.message || 'Unknown error'));
        }
    };

    const handleEditLink = (link: CustomLink) => {
        setFormData({
            name: link.title,
            url: link.url,
            icon: link.icon
        });
        setEditingId(link.$id);
        setShowAddForm(true);
        // Scroll to top to show the form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setFormData({ name: '', url: '', icon: '' });
        setEditingId(null);
        setShowAddForm(false);
    };

    const handleDeleteLink = async (id: string) => {
        if (!confirm(t('common.confirm') + '?')) {
            return;
        }

        try {
            await customLinksService.delete(id);
            await fetchLinks();
            alert(t('drawerAdmin.successDelete') || 'Link deleted successfully!');
        } catch (error: any) {
            console.error('Error deleting link:', error);
            alert('Error deleting link: ' + (error.message || 'Unknown error'));
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (authError) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-red-800 font-semibold mb-2 text-lg">⚠️ Configuration Required</h3>
                <div className="text-red-700 whitespace-pre-line mb-4">{authError}</div>
                <div className="space-y-2">
                    <button
                        onClick={() => {
                            setAuthError(null);
                            setIsLoading(true);
                            initializeAndFetch();
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors mr-2"
                    >
                        Retry Connection
                    </button>
                    <a
                        href="https://cloud.appwrite.io/console"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Open Appwrite Console
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Google Maps API Settings Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{t('drawerAdmin.googleMapsSettings') || 'Google Maps API Settings'}</h2>
                        <p className="text-sm text-gray-600 mt-1">{t('drawerAdmin.googleMapsDescription') || 'Configure Google Maps API for distance calculations'}</p>
                    </div>
                    <button
                        onClick={() => setIsEditingApiKey(!isEditingApiKey)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        {isEditingApiKey ? t('common.cancel') : t('drawerAdmin.editApiKey')}
                    </button>
                </div>

                {isEditingApiKey ? (
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('drawerAdmin.apiKey') || 'API Key'} *
                                </label>
                                <input
                                    type="text"
                                    value={googleMapsApiKey}
                                    onChange={(e) => setGoogleMapsApiKey(e.target.value)}
                                    placeholder={t('drawerAdmin.apiKeyPlaceholder') || 'Enter your Google Maps API Key'}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    This key is used to calculate distances between user location and massage places.
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        if (googleMapsApiKey) {
                                            localStorage.setItem('googleMapsApiKey', googleMapsApiKey);
                                            setIsEditingApiKey(false);
                                            alert(t('drawerAdmin.successApiKey') || '✅ Google Maps API Key saved successfully!');
                                        } else {
                                            alert(t('drawerAdmin.errorApiKey') || 'Please enter a valid API key');
                                        }
                                    }}
                                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    {t('drawerAdmin.saveApiKey') || 'Save API Key'}
                                </button>
                                <a
                                    href="https://console.cloud.google.com/google/maps-apis"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    Get API Key
                                </a>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 pb-20">
                        <p className="text-sm text-blue-800">
                            <strong>Current API Key:</strong> {googleMapsApiKey || 'Not configured'}
                        </p>
                        <p className="text-xs text-blue-600 mt-2">
                            💡 Click "Edit API Key" to update your Google Maps API configuration
                        </p>
                    </div>
                )}

                <div className="mt-4 p-4 pb-20 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-yellow-900 mb-2">📍 How to get Google Maps API Key</h4>
                    <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
                        <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
                        <li>Create a new project or select an existing one</li>
                        <li>Enable "Maps JavaScript API" and "Distance Matrix API"</li>
                        <li>Go to Credentials and create an API key</li>
                        <li>Copy the API key and paste it above</li>
                    </ol>
                </div>
            </div>

            {/* Drawer Buttons Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{t('drawerAdmin.pageTitle') || 'Manage Drawer Buttons'}</h2>
                <button
                    onClick={() => {
                        if (showAddForm && editingId) {
                            handleCancelEdit();
                        } else {
                            setShowAddForm(!showAddForm);
                        }
                    }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    {showAddForm ? t('drawerAdmin.cancelButton') : t('drawerAdmin.addButton')}
                </button>
            </div>

            {showAddForm && (
                <form onSubmit={handleAddLink} className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">
                        {editingId ? '✏️ Edit Drawer Button' : 'Add New Drawer Button'}
                    </h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('drawerAdmin.buttonNameRequired') || 'Button Name *'}
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="e.g., Contact Us"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('drawerAdmin.urlRequired') || 'URL *'}
                            </label>
                            <input
                                type="url"
                                value={formData.url}
                                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="https://example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('drawerAdmin.buttonIcon') || 'Button Icon'}
                            </label>
                            <ImageUpload
                                id="drawer-button-icon"
                                currentImage={formData.icon}
                                onImageChange={(url) => setFormData({ ...formData, icon: url })}
                                label={t('drawerAdmin.uploadIcon') || 'Upload Icon Image'}
                                heightClass="h-32"
                            />
                            <p className="text-xs text-gray-500 mt-1">Upload an icon image for your button (recommended: square image, 128x128px)</p>
                        </div>

                        {formData.icon && formData.name && formData.url && (
                            <div className="border-t pt-4 mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Preview
                                </label>
                                <div className="bg-white rounded-lg p-4 pb-20 border border-gray-300">
                                    <div className="flex items-center space-x-3">
                                        {formData.icon && (
                                            <img 
                                                src={formData.icon} 
                                                alt="Icon preview" 
                                                className="w-10 h-10 object-cover rounded"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-800">{formData.name}</h4>
                                            <p className="text-xs text-gray-500 truncate">{formData.url}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                        >
                            {editingId ? t('drawerAdmin.updateButton') : t('drawerAdmin.saveButton')}
                        </button>
                        
                        {editingId && (
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="w-full bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500 transition-colors font-medium"
                            >
                                {t('drawerAdmin.cancelButton') || 'Cancel'}
                            </button>
                        )}
                    </div>
                </form>
            )}

            <div className="space-y-3">
                {links.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-lg">{t('drawerAdmin.noLinks') || 'No custom drawer buttons yet'}</p>
                        <p className="text-gray-400 text-sm mt-2">{t('drawerAdmin.addButton')}</p>
                    </div>
                ) : (
                    <>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('drawerAdmin.customLinks') || 'Your Drawer Buttons'}</h3>
                        {links.map((link) => (
                            <div
                                key={link.$id}
                                className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-indigo-400 hover:shadow-lg transition-all"
                            >
                                <div className="flex items-center space-x-4 flex-1 min-w-0 overflow-hidden">
                                    {link.icon && (
                                        <div className="flex-shrink-0">
                                            <img 
                                                src={link.icon} 
                                                alt={link.title}
                                                className="w-12 h-12 object-cover rounded-lg border-2 border-gray-200"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0 overflow-hidden">
                                        <h4 className="font-semibold text-gray-800 text-lg truncate">{link.title}</h4>
                                        <p
                                            className="text-sm text-indigo-600 truncate overflow-hidden"
                                            title={link.url}
                                        >
                                            {link.url}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-4 flex-shrink-0">
                                    <button
                                        onClick={() => handleEditLink(link)}
                                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                                    >
                                        {t('common.edit') || 'Edit'}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteLink(link.$id)}
                                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                                    >
                                        {t('common.delete') || 'Delete'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>

            {links.length > 0 && (
                <div className="mt-6 p-4 pb-20 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">💡 How it works</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• These custom buttons will appear in the side drawer menu of your app</li>
                        <li>• Click <strong>"Edit"</strong> to change the button name or icon</li>
                        <li>• Upload new icons to maintain consistent design across all buttons</li>
                        <li>• Changes are immediately reflected in the app drawer</li>
                    </ul>
                </div>
            )}
            </div>
        </div>
    );
};

export default DrawerButtonsPage;

