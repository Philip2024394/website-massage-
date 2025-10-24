import React, { useState, useEffect } from 'react';
import { customLinksService, authService } from '../lib/appwriteService';
import ImageUpload from '../components/ImageUpload';

interface CustomLink {
    $id: string;
    title: string;
    url: string;
    icon: string;
}

const DrawerButtonsPage: React.FC = () => {
    const [links, setLinks] = useState<CustomLink[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        url: '',
        icon: ''
    });

    useEffect(() => {
        initializeAndFetch();
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
            alert('Please fill in all required fields (Name and URL)');
            return;
        }

        if (!formData.icon) {
            alert('Please upload an icon image for your button');
            return;
        }

        try {
            await customLinksService.create(formData);
            setFormData({ name: '', url: '', icon: '' });
            setShowAddForm(false);
            await fetchLinks();
            alert('✅ Custom button added successfully!');
        } catch (error: any) {
            console.error('Error adding link:', error);
            alert('Error adding button: ' + (error.message || 'Unknown error'));
        }
    };

    const handleDeleteLink = async (id: string) => {
        if (!confirm('Are you sure you want to delete this link?')) {
            return;
        }

        try {
            await customLinksService.delete(id);
            await fetchLinks();
            alert('Link deleted successfully!');
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
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Manage Drawer Buttons</h2>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    {showAddForm ? 'Cancel' : '+ Add New Button'}
                </button>
            </div>

            {showAddForm && (
                <form onSubmit={handleAddLink} className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Add New Drawer Button</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Button Name *
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
                                URL *
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
                                Button Icon
                            </label>
                            <ImageUpload
                                id="drawer-button-icon"
                                currentImage={formData.icon}
                                onImageChange={(url) => setFormData({ ...formData, icon: url })}
                                label="Upload Icon Image"
                                heightClass="h-32"
                            />
                            <p className="text-xs text-gray-500 mt-1">Upload an icon image for your button (recommended: square image, 128x128px)</p>
                        </div>

                        {formData.icon && formData.name && formData.url && (
                            <div className="border-t pt-4 mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Preview
                                </label>
                                <div className="bg-white rounded-lg p-4 border border-gray-300">
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
                            Save Button
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-3">
                {links.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-lg">No custom drawer buttons yet</p>
                        <p className="text-gray-400 text-sm mt-2">Click "Add New Button" to create your first one</p>
                    </div>
                ) : (
                    <>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Your Drawer Buttons</h3>
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
                                <button
                                    onClick={() => handleDeleteLink(link.$id)}
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium ml-4 flex-shrink-0"
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        ))}
                    </>
                )}
            </div>

            {links.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">💡 How it works</h4>
                    <p className="text-sm text-blue-800">
                        These custom buttons will appear in the side drawer menu of your app. Users can click them to navigate to the specified URLs.
                    </p>
                </div>
            )}
        </div>
    );
};

export default DrawerButtonsPage;
