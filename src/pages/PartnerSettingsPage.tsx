// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
import React, { useState, useEffect } from 'react';
import { 
    Building, 
    MapPin, 
    Phone, 
    Globe, 
    FileText, 
    Image as ImageIcon, 
    Star, 
    Save,
    ArrowLeft,
    Upload,
    X,
    CheckCircle
} from 'lucide-react';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import { AppDrawer } from '../components/AppDrawerClean';
import UniversalHeader from '../components/shared/UniversalHeader';
import { databases, storage, DATABASE_ID, COLLECTIONS, STORAGE_BUCKETS, ID } from '../lib/appwrite';
import { Query } from 'appwrite';

interface PartnerSettingsPageProps {
    partnerId?: string;
    partnerType: 'hotel' | 'villa';
    onNavigate?: (page: any) => void;
    onBack?: () => void;
    onMassageJobsClick?: () => void;
    onHotelPortalClick?: () => void;
    onVillaPortalClick?: () => void;
    onTherapistPortalClick?: () => void;
    onMassagePlacePortalClick?: () => void;
    onAgentPortalClick?: () => void;
    onCustomerPortalClick?: () => void;
    onAdminPortalClick?: () => void;
    onTermsClick?: () => void;
    onPrivacyClick?: () => void;
    therapists?: any[];
    places?: any[];
    t: any;
}

const PartnerSettingsPage: React.FC<PartnerSettingsPageProps> = ({
    partnerId = '1',
    partnerType,
    onNavigate,
    onBack,
    onMassageJobsClick,
    onHotelPortalClick,
    onVillaPortalClick,
    onTherapistPortalClick,
    onMassagePlacePortalClick,
    onAgentPortalClick,
    onCustomerPortalClick,
    onAdminPortalClick,
    onTermsClick,
    onPrivacyClick,
    therapists = [],
    places = [],
    t
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [websiteTitle, setWebsiteTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [phone, setPhone] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [websitePreview, setWebsitePreview] = useState('');
    const [password, setPassword] = useState('');
    const [amenities, setAmenities] = useState<string[]>([]);
    const [newAmenity, setNewAmenity] = useState('');

    // Suggested amenities based on type
    const suggestedAmenities = partnerType === 'hotel' 
        ? ['Room Service', 'Spa', 'Pool', 'Gym', 'Restaurant', 'Laundry', 'Airport Transfer', 'WiFi', 'Parking', '24/7 Reception']
        : ['Private Pool', 'Chef Service', 'Spa', 'Garden', 'Concierge', 'Housekeeping', 'BBQ Area', 'WiFi', 'Parking', 'Security'];

    // Load existing data from Appwrite
    useEffect(() => {
        const loadPartnerData = async () => {
            if (!partnerId) return;

            try {
                const partner = await databases.getDocument(
                    DATABASE_ID,
                    COLLECTIONS.PARTNERS,
                    partnerId
                );

                setName(partner.name || '');
                setEmail(partner.email || '');
                setWebsiteUrl(partner.websiteUrl || '');
                setWebsiteTitle(partner.websiteTitle || '');
                setDescription(partner.description || '');
                setLocation(partner.location || '');
                setPhone(partner.phone || '');
                setImageUrl(partner.imageUrl || '');
                setWebsitePreview(partner.websitePreview || '');
                setPassword(partner.password || '');
                setAmenities(partner.amenities ? partner.amenities.split(',') : []);
            } catch (error) {
                console.error('Error loading partner data:', error);
                // If document doesn't exist yet, keep empty form for new partner
            }
        };

        loadPartnerData();
    }, [partnerId, partnerType]);

    const handleAddAmenity = (amenity: string) => {
        if (amenity && !amenities.includes(amenity) && amenities.length < 10) {
            setAmenities([...amenities, amenity]);
            setNewAmenity('');
        }
    };

    const handleRemoveAmenity = (amenity: string) => {
        setAmenities(amenities.filter(a => a !== amenity));
    };

    const handleImageUpload = async (file: File) => {
        try {
            const uploadedFile = await storage.createFile(
                STORAGE_BUCKETS.PARTNER_IMAGES,
                ID.unique(),
                file
            );

            const imageUrl = `https://syd.cloud.appwrite.io/v1/storage/buckets/${STORAGE_BUCKETS.PARTNER_IMAGES}/files/${uploadedFile.$id}/view?project=68f23b11000d25eb3664`;
            setImageUrl(imageUrl);
            return imageUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveSuccess(false);

        try {
            const partnerData = {
                name,
                websiteUrl: websiteUrl || '',
                websiteTitle: websiteTitle || '',
                description: description || '',
                location,
                phone,
                email: email || '',
                whatsapp: phone || '',
                imageUrl: imageUrl || '',
                amenities: amenities.join(','), // Convert array to comma-separated string
                category: partnerType,
                verfied: false, // Admin approval required (note: typo in collection)
                websitePreview: websitePreview || '',
                password: password || 'changeme123',
                addeddate: new Date().toISOString(),
                updateat: new Date().toISOString()
            };

            console.log('Saving partner data:', partnerData);

            if (partnerId) {
                // Update existing partner
                await databases.updateDocument(
                    DATABASE_ID,
                    COLLECTIONS.PARTNERS,
                    partnerId,
                    partnerData
                );
            } else {
                // Create new partner
                await databases.createDocument(
                    DATABASE_ID,
                    COLLECTIONS.PARTNERS,
                    ID.unique(),
                    partnerData
                );
            }

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error('Error saving partner settings:', error);
            alert('Failed to save settings. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gradient-to-br from-orange-50 via-white to-amber-50">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Back Button */}
                        <button
                            onClick={onBack || (() => onNavigate?.('website-management'))}
                            className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-medium">Back</span>
                        </button>

                        {/* Title */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg">
                                <Building className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">
                                    {partnerType === 'hotel' ? 'Hotel' : 'Villa'} Settings
                                </h1>
                                <p className="text-xs text-gray-500">Manage your partner profile</p>
                            </div>
                        </div>

                        {/* Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <BurgerMenuIcon />
                        </button>
                    </div>
                </div>
            </div>

            {/* App Drawer */}
            <AppDrawer
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onMassageJobsClick={onMassageJobsClick}
                onHotelPortalClick={onHotelPortalClick}
                onVillaPortalClick={onVillaPortalClick}
                onTherapistPortalClick={onTherapistPortalClick}
                onMassagePlacePortalClick={onMassagePlacePortalClick}
                onAgentPortalClick={onAgentPortalClick}
                onCustomerPortalClick={onCustomerPortalClick}
                onAdminPortalClick={onAdminPortalClick}
                onNavigate={onNavigate}
                onTermsClick={onTermsClick}
                onPrivacyClick={onPrivacyClick}
                therapists={therapists}
                places={places}
                t={t}
            />

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
                {/* Success Banner */}
                {saveSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-green-900">Settings Saved Successfully!</p>
                            <p className="text-sm text-green-700">Your changes are now live on the Partners page.</p>
                        </div>
                    </div>
                )}

                {/* Basic Information Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Building className="w-5 h-5" />
                            Basic Information
                        </h2>
                        <p className="text-sm text-orange-50 mt-1">Details shown on your partner card</p>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Name */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <Building className="w-4 h-4 text-orange-500" />
                                {partnerType === 'hotel' ? 'Hotel' : 'Villa'} Name *
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your property name"
                                maxLength={50}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                            />
                            <p className="text-xs text-gray-500 mt-1">{name.length}/50 characters (displayed on card)</p>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <MapPin className="w-4 h-4 text-red-500" />
                                Location *
                            </label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="e.g., Seminyak, Bali"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                            />
                            <p className="text-xs text-gray-500 mt-1">This will be displayed under your property name</p>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <Phone className="w-4 h-4 text-green-500" />
                                WhatsApp Number *
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+62 812 3456 7890"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                            />
                            <p className="text-xs text-gray-500 mt-1">Used for "Book Reservation" button (WhatsApp direct message)</p>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <FileText className="w-4 h-4 text-blue-500" />
                                Description *
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe your property and massage services..."
                                maxLength={500}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">{description.length}/500 characters</p>
                        </div>
                    </div>
                </div>

                {/* Website Information Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Globe className="w-5 h-5" />
                            Website Information
                        </h2>
                        <p className="text-sm text-purple-50 mt-1">Optional website details</p>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Website URL */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <Globe className="w-4 h-4 text-purple-500" />
                                Website URL
                            </label>
                            <input
                                type="url"
                                value={websiteUrl}
                                onChange={(e) => setWebsiteUrl(e.target.value)}
                                placeholder="https://yourhotel.com"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            />
                            <p className="text-xs text-gray-500 mt-1">Optional - Link to your website</p>
                        </div>

                        {/* Website Title */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <FileText className="w-4 h-4 text-purple-500" />
                                Website Title
                            </label>
                            <input
                                type="text"
                                value={websiteTitle}
                                onChange={(e) => setWebsiteTitle(e.target.value)}
                                placeholder="Luxury Resort & Spa"
                                maxLength={100}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            />
                            <p className="text-xs text-gray-500 mt-1">Optional tagline for your website</p>
                        </div>
                    </div>
                </div>

                {/* Images Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <ImageIcon className="w-5 h-5" />
                            Property Images
                        </h2>
                        <p className="text-sm text-blue-50 mt-1">Profile picture displayed on your card</p>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Current Image Preview */}
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-3 block">Current Profile Picture</label>
                            <div className="flex items-start gap-4">
                                <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200 shadow-md flex-shrink-0">
                                    {imageUrl ? (
                                        <img src={imageUrl} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                            <ImageIcon className="w-12 h-12 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-3">
                                    {/* File Upload */}
                                    <div>
                                        <label className="flex items-center gap-2 px-4 py-3 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                                            <Upload className="w-5 h-5 text-blue-600" />
                                            <span className="text-sm font-medium text-blue-700">Upload New Image</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        try {
                                                            const uploadedUrl = await handleImageUpload(file);
                                                            console.log('Image uploaded:', uploadedUrl);
                                                        } catch (error) {
                                                            alert('Failed to upload image. Please try again.');
                                                        }
                                                    }
                                                }}
                                                className="hidden"
                                            />
                                        </label>
                                        <p className="text-xs text-gray-500 mt-1">
                                            JPG, PNG, or WebP (max 5MB)
                                        </p>
                                    </div>

                                    {/* Or URL Input */}
                                    <div>
                                        <label className="text-xs font-medium text-gray-600 mb-1 block">Or paste image URL</label>
                                        <input
                                            type="url"
                                            value={imageUrl}
                                            onChange={(e) => setImageUrl(e.target.value)}
                                            placeholder="https://yourhotel.com/image.jpg"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Amenities Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Star className="w-5 h-5" />
                            Amenities & Services
                        </h2>
                        <p className="text-sm text-emerald-50 mt-1">Show up to 5 amenities on your card</p>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Current Amenities */}
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-3 block">
                                Selected Amenities ({amenities.length}/10)
                            </label>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {amenities.map((amenity) => (
                                    <div
                                        key={amenity}
                                        className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg border border-emerald-200"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        <span className="text-sm font-medium">{amenity}</span>
                                        <button
                                            onClick={() => handleRemoveAmenity(amenity)}
                                            className="ml-1 hover:text-emerald-900 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {amenities.length === 0 && (
                                    <p className="text-gray-500 text-sm italic">No amenities added yet</p>
                                )}
                            </div>
                        </div>

                        {/* Add Custom Amenity */}
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Add Custom Amenity</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newAmenity}
                                    onChange={(e) => setNewAmenity(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddAmenity(newAmenity)}
                                    placeholder="Enter amenity name"
                                    maxLength={30}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                    disabled={amenities.length >= 10}
                                />
                                <button
                                    onClick={() => handleAddAmenity(newAmenity)}
                                    disabled={!newAmenity || amenities.length >= 10}
                                    className="px-6 py-3 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        {/* Suggested Amenities */}
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-3 block">Quick Add (Suggested)</label>
                            <div className="flex flex-wrap gap-2">
                                {suggestedAmenities
                                    .filter(amenity => !amenities.includes(amenity))
                                    .map((amenity) => (
                                        <button
                                            key={amenity}
                                            onClick={() => handleAddAmenity(amenity)}
                                            disabled={amenities.length >= 10}
                                            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg border border-gray-300 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                                        >
                                            + {amenity}
                                        </button>
                                    ))}
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <p className="text-sm text-amber-800">
                                <strong>Note:</strong> Only the first 5 amenities will be displayed on your partner card. Choose your most important services.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg rounded-t-2xl p-6">
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !name || !location || !phone || !description}
                        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-4 px-6 rounded-xl hover:from-orange-600 hover:to-amber-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {isSaving ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Saving Changes...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                <span>Save Partner Settings</span>
                            </>
                        )}
                    </button>
                    <p className="text-center text-xs text-gray-500 mt-3">
                        * Required fields must be filled before saving
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PartnerSettingsPage;
