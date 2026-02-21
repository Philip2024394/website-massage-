import React, { useState, useEffect } from 'react';
import { databases, ID, APPWRITE_CONFIG } from '../lib/appwrite';

// Icon components
const IconWrapper = ({ emoji, className }: { emoji: string; className?: string }) => (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{emoji}</span>
);

const Globe = ({ className }: { className?: string }) => <IconWrapper emoji="🌍" className={className} />;
const MapPin = ({ className }: { className?: string }) => <IconWrapper emoji="📍" className={className} />;
const Plus = ({ className }: { className?: string }) => <IconWrapper emoji="➕" className={className} />;
const Edit = ({ className }: { className?: string }) => <IconWrapper emoji="✏️" className={className} />;
const Trash2 = ({ className }: { className?: string }) => <IconWrapper emoji="🗑️" className={className} />;
const Save = ({ className }: { className?: string }) => <IconWrapper emoji="💾" className={className} />;
const X = ({ className }: { className?: string }) => <IconWrapper emoji="❌" className={className} />;
const Search = ({ className }: { className?: string }) => <IconWrapper emoji="🔍" className={className} />;
const Filter = ({ className }: { className?: string }) => <IconWrapper emoji="🔽" className={className} />;
const Eye = ({ className }: { className?: string }) => <IconWrapper emoji="👁️" className={className} />;
const EyeOff = ({ className }: { className?: string }) => <IconWrapper emoji="🚫" className={className} />;

interface Country {
    $id?: string;
    code: string;
    name: string;
    flag: string;
    description: string;
    language: string;
    languages: string[];
    active: boolean;
    dialCode: string;
    currency: string;
    timezone: string;
    cities: City[];
    totalTherapists?: number;
    totalBookings?: number;
    /** URL for this country's linked website (e.g. country landing page). Shown in side drawer. */
    linkedWebsite?: string;
    $createdAt?: string;
    $updatedAt?: string;
}

interface City {
    $id?: string;
    name: string;
    region: string;
    description: string;
    popular: boolean;
    countryCode: string;
    active: boolean;
    latitude?: number;
    longitude?: number;
    totalTherapists?: number;
    totalBookings?: number;
}

const CountryManagement = () => {
    const [countries, setCountries] = useState<Country[]>([]);
    const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showActiveOnly, setShowActiveOnly] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCityModal, setShowCityModal] = useState(false);
    const [editingCity, setEditingCity] = useState<City | null>(null);
    const [actionInProgress, setActionInProgress] = useState(false);

    // Form state for adding/editing countries
    const [countryForm, setCountryForm] = useState<Partial<Country>>({
        code: '',
        name: '',
        flag: '',
        description: '',
        language: 'en',
        languages: ['en'],
        active: true,
        dialCode: '',
        currency: '',
        timezone: '',
        cities: [],
        linkedWebsite: ''
    });

    // City form state
    const [cityForm, setCityForm] = useState<Partial<City>>({
        name: '',
        region: '',
        description: '',
        popular: false,
        active: true,
        latitude: 0,
        longitude: 0
    });

    // Default countries based on landing page
    const defaultCountries: Country[] = [
        {
            code: 'ID',
            name: 'Indonesia',
            flag: '🇮🇩',
            description: 'Southeast Asian archipelago',
            language: 'id',
            languages: ['id', 'en'],
            active: true,
            dialCode: '+62',
            currency: 'IDR',
            timezone: 'Asia/Jakarta',
            cities: []
        },
        {
            code: 'MY',
            name: 'Malaysia',
            flag: '🇲🇾',
            description: 'Truly Asia',
            language: 'en',
            languages: ['en'],
            active: true,
            dialCode: '+60',
            currency: 'MYR',
            timezone: 'Asia/Kuala_Lumpur',
            cities: []
        },
        {
            code: 'SG',
            name: 'Singapore',
            flag: '🇸🇬',
            description: 'Lion City',
            language: 'en',
            languages: ['en'],
            active: true,
            dialCode: '+65',
            currency: 'SGD',
            timezone: 'Asia/Singapore',
            cities: []
        },
        {
            code: 'TH',
            name: 'Thailand',
            flag: '🇹🇭',
            description: 'Land of Smiles',
            language: 'en',
            languages: ['en'],
            active: true,
            dialCode: '+66',
            currency: 'THB',
            timezone: 'Asia/Bangkok',
            cities: []
        },
        {
            code: 'PH',
            name: 'Philippines',
            flag: '🇵🇭',
            description: 'Pearl of the Orient Seas',
            language: 'tl',
            languages: ['tl', 'en'],
            active: true,
            dialCode: '+63',
            currency: 'PHP',
            timezone: 'Asia/Manila',
            cities: []
        },
        {
            code: 'VN',
            name: 'Vietnam',
            flag: '🇻🇳',
            description: 'Timeless Charm',
            language: 'en',
            languages: ['en'],
            active: true,
            dialCode: '+84',
            currency: 'VND',
            timezone: 'Asia/Ho_Chi_Minh',
            cities: []
        },
        {
            code: 'GB',
            name: 'United Kingdom',
            flag: '🇬🇧',
            description: 'England, Scotland, Wales',
            language: 'en',
            languages: ['en'],
            active: true,
            dialCode: '+44',
            currency: 'GBP',
            timezone: 'Europe/London',
            cities: []
        },
        {
            code: 'US',
            name: 'United States',
            flag: '🇺🇸',
            description: 'Land of opportunity',
            language: 'en',
            languages: ['en'],
            active: true,
            dialCode: '+1',
            currency: 'USD',
            timezone: 'America/New_York',
            cities: []
        },
        {
            code: 'AU',
            name: 'Australia',
            flag: '🇦🇺',
            description: 'Down under',
            language: 'en',
            languages: ['en'],
            active: true,
            dialCode: '+61',
            currency: 'AUD',
            timezone: 'Australia/Sydney',
            cities: []
        },
        {
            code: 'DE',
            name: 'Germany',
            flag: '🇩🇪',
            description: 'Heart of Europe',
            language: 'en',
            languages: ['en'],
            active: true,
            dialCode: '+49',
            currency: 'EUR',
            timezone: 'Europe/Berlin',
            cities: []
        }
    ];

    useEffect(() => {
        fetchCountries();
    }, []);

    useEffect(() => {
        filterCountries();
    }, [countries, searchQuery, showActiveOnly]);

    const fetchCountries = async () => {
        try {
            setLoading(true);
            
            // Try to fetch from database first
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.countries || 'countries'
            );
            
            if (response.documents.length === 0) {
                // Initialize with default countries if none exist
                await initializeDefaultCountries();
                return;
            }
            
            const countriesData = response.documents.map(doc => ({
                $id: doc.$id,
                code: doc.code,
                name: doc.name,
                flag: doc.flag,
                description: doc.description,
                language: doc.language,
                languages: Array.isArray(doc.languages) ? doc.languages : (typeof doc.languages === 'string' ? (() => { try { return JSON.parse(doc.languages); } catch { return ['en']; } })() : ['en']),
                active: doc.active !== false,
                dialCode: doc.dialCode || '',
                currency: doc.currency || '',
                timezone: doc.timezone || '',
                cities: Array.isArray(doc.cities) ? doc.cities : (typeof doc.cities === 'string' ? (() => { try { return JSON.parse(doc.cities); } catch { return []; } })() : []),
                totalTherapists: doc.totalTherapists || 0,
                totalBookings: doc.totalBookings || 0,
                linkedWebsite: doc.linkedWebsite || '',
                $createdAt: doc.$createdAt,
                $updatedAt: doc.$updatedAt
            }));
            
            setCountries(countriesData);
            
        } catch (error) {
            console.error('Error fetching countries:', error);
            // If collection doesn't exist, initialize with defaults
            if (error.message?.includes('Collection with the requested ID could not be found')) {
                await initializeDefaultCountries();
            }
        } finally {
            setLoading(false);
        }
    };

    const initializeDefaultCountries = async () => {
        try {
            console.log('Initializing default countries...');
            const createdCountries = [];
            
            for (const country of defaultCountries) {
                try {
                    const payload = {
                        ...country,
                        languages: JSON.stringify(country.languages || ['en']),
                        cities: JSON.stringify(country.cities || [])
                    };
                    const created = await databases.createDocument(
                        APPWRITE_CONFIG.databaseId,
                        APPWRITE_CONFIG.collections.countries || 'countries',
                        ID.unique(),
                        payload
                    );
                    createdCountries.push({
                        ...country,
                        $id: created.$id,
                        $createdAt: created.$createdAt,
                        $updatedAt: created.$updatedAt
                    });
                } catch (err) {
                    console.warn('Failed to create country:', country.code, err);
                }
            }
            
            setCountries(createdCountries);
            
        } catch (error) {
            console.error('Error initializing default countries:', error);
            // Fallback to showing default countries without saving
            setCountries(defaultCountries);
        }
    };

    const filterCountries = () => {
        let filtered = [...countries];
        
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(country =>
                country.name.toLowerCase().includes(query) ||
                country.code.toLowerCase().includes(query) ||
                country.description.toLowerCase().includes(query)
            );
        }
        
        if (showActiveOnly) {
            filtered = filtered.filter(country => country.active);
        }
        
        setFilteredCountries(filtered);
    };

    const handleAddCountry = async () => {
        if (!countryForm.code || !countryForm.name) {
            alert('Please fill in required fields (Code and Name)');
            return;
        }
        
        try {
            setActionInProgress(true);
            
            const payload: Record<string, unknown> = {
                ...countryForm,
                languages: typeof countryForm.languages === 'string' ? countryForm.languages : JSON.stringify(countryForm.languages || ['en']),
                cities: typeof countryForm.cities === 'string' ? countryForm.cities : JSON.stringify(countryForm.cities || []),
                linkedWebsite: (countryForm.linkedWebsite || '').trim() || undefined
            };
            const newCountry = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.countries || 'countries',
                ID.unique(),
                payload
            );
            
            const countryData: Country = {
                ...countryForm as Country,
                $id: newCountry.$id,
                $createdAt: newCountry.$createdAt,
                $updatedAt: newCountry.$updatedAt
            };
            
            setCountries([...countries, countryData]);
            setShowAddForm(false);
            resetCountryForm();
            
            alert('✅ Country added successfully!');
            
        } catch (error) {
            console.error('Error adding country:', error);
            alert(`Failed to add country: ${error.message}`);
        } finally {
            setActionInProgress(false);
        }
    };

    const handleEditCountry = async () => {
        if (!selectedCountry?.$id || !countryForm.code || !countryForm.name) {
            alert('Please fill in required fields');
            return;
        }
        
        try {
            setActionInProgress(true);
            
            const payload: Record<string, unknown> = {
                ...countryForm,
                languages: typeof countryForm.languages === 'string' ? countryForm.languages : JSON.stringify(countryForm.languages || ['en']),
                cities: typeof countryForm.cities === 'string' ? countryForm.cities : JSON.stringify(countryForm.cities || []),
                linkedWebsite: (countryForm.linkedWebsite || '').trim() || undefined
            };
            await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.countries || 'countries',
                selectedCountry.$id,
                payload
            );
            
            setCountries(countries.map(country =>
                country.$id === selectedCountry.$id
                    ? { ...country, ...countryForm as Country }
                    : country
            ));
            
            setShowEditModal(false);
            setSelectedCountry(null);
            resetCountryForm();
            
            alert('✅ Country updated successfully!');
            
        } catch (error) {
            console.error('Error updating country:', error);
            alert(`Failed to update country: ${error.message}`);
        } finally {
            setActionInProgress(false);
        }
    };

    const handleDeleteCountry = async (country: Country) => {
        if (!confirm(`Are you sure you want to delete ${country.name}? This action cannot be undone.`)) {
            return;
        }
        
        try {
            setActionInProgress(true);
            
            if (country.$id) {
                await databases.deleteDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.countries || 'countries',
                    country.$id
                );
            }
            
            setCountries(countries.filter(c => c.$id !== country.$id));
            
            alert('✅ Country deleted successfully!');
            
        } catch (error) {
            console.error('Error deleting country:', error);
            alert(`Failed to delete country: ${error.message}`);
        } finally {
            setActionInProgress(false);
        }
    };

    const handleToggleActive = async (country: Country) => {
        try {
            setActionInProgress(true);
            
            const updatedActive = !country.active;
            
            if (country.$id) {
                await databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.countries || 'countries',
                    country.$id,
                    { active: updatedActive }
                );
            }
            
            setCountries(countries.map(c =>
                c.$id === country.$id ? { ...c, active: updatedActive } : c
            ));
            
            alert(`✅ Country ${updatedActive ? 'activated' : 'deactivated'} successfully!`);
            
        } catch (error) {
            console.error('Error toggling country status:', error);
            alert(`Failed to update country status: ${error.message}`);
        } finally {
            setActionInProgress(false);
        }
    };

    const resetCountryForm = () => {
        setCountryForm({
            code: '',
            name: '',
            flag: '',
            description: '',
            language: 'en',
            languages: ['en'],
            active: true,
            dialCode: '',
            currency: '',
            timezone: '',
            cities: [],
            linkedWebsite: ''
        });
    };

    const openEditModal = (country: Country) => {
        setSelectedCountry(country);
        setCountryForm({
            code: country.code,
            name: country.name,
            flag: country.flag,
            description: country.description,
            language: country.language,
            languages: country.languages,
            active: country.active,
            dialCode: country.dialCode,
            currency: country.currency,
            timezone: country.timezone,
            cities: country.cities,
            linkedWebsite: country.linkedWebsite || ''
        });
        setShowEditModal(true);
    };

    const formatStats = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Globe className="w-12 h-12 text-orange-500 animate-pulse mx-auto" />
                    <p className="mt-4 text-gray-600">Loading countries...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Globe className="w-8 h-8 text-orange-500" />
                        Country Management
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Manage countries and cities where Indastreet operates
                    </p>
                </div>
                
                <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Country
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm font-medium text-gray-500">Total Countries</div>
                    <div className="text-3xl font-bold text-gray-900 mt-1">{countries.length}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm font-medium text-gray-500">Active Countries</div>
                    <div className="text-3xl font-bold text-green-600 mt-1">
                        {countries.filter(c => c.active).length}
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm font-medium text-gray-500">Total Cities</div>
                    <div className="text-3xl font-bold text-blue-600 mt-1">
                        {countries.reduce((sum, c) => sum + (c.cities?.length || 0), 0)}
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm font-medium text-gray-500">Languages</div>
                    <div className="text-3xl font-bold text-purple-600 mt-1">
                        {new Set(countries.flatMap(c => c.languages)).size}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search countries by name, code, or description..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showActiveOnly}
                                onChange={(e) => setShowActiveOnly(e.target.checked)}
                                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                            />
                            <span className="text-sm text-gray-700">Active only</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Countries List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Country
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Details
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Cities
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Stats
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredCountries.map((country) => (
                                <tr key={country.$id || country.code} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{country.flag}</span>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {country.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {country.code}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{country.description}</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {country.dialCode} • {country.currency} • {country.timezone}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Languages: {country.languages?.join(', ') || '—'}
                                        </div>
                                        {country.linkedWebsite && (
                                            <a href={country.linkedWebsite} target="_blank" rel="noopener noreferrer" className="text-xs text-orange-600 hover:underline mt-1 inline-block truncate max-w-[200px]" title={country.linkedWebsite}>
                                                🔗 {country.linkedWebsite}
                                            </a>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {country.cities?.length || 0} cities
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {country.cities?.filter(c => c.popular).length || 0} popular
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {formatStats(country.totalTherapists || 0)} therapists
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {formatStats(country.totalBookings || 0)} bookings
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleToggleActive(country)}
                                            disabled={actionInProgress}
                                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                                                country.active
                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                            }`}
                                        >
                                            {country.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                            {country.active ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openEditModal(country)}
                                                className="text-blue-600 hover:text-blue-900 transition-colors p-1"
                                                title="Edit country"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedCountry(country);
                                                    setShowCityModal(true);
                                                }}
                                                className="text-green-600 hover:text-green-900 transition-colors p-1"
                                                title="Manage cities"
                                            >
                                                <MapPin className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCountry(country)}
                                                disabled={actionInProgress}
                                                className="text-red-600 hover:text-red-900 transition-colors p-1"
                                                title="Delete country"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {filteredCountries.length === 0 && (
                    <div className="text-center py-12">
                        <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No countries found matching your criteria</p>
                    </div>
                )}
            </div>

            {/* Add Country Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">Add New Country</h2>
                                <button
                                    onClick={() => {
                                        setShowAddForm(false);
                                        resetCountryForm();
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Country Code *
                                    </label>
                                    <input
                                        type="text"
                                        value={countryForm.code}
                                        onChange={(e) => setCountryForm({ ...countryForm, code: e.target.value.toUpperCase() })}
                                        placeholder="e.g. ID, US, GB"
                                        maxLength={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Country Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={countryForm.name}
                                        onChange={(e) => setCountryForm({ ...countryForm, name: e.target.value })}
                                        placeholder="e.g. Indonesia"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Flag Emoji
                                    </label>
                                    <input
                                        type="text"
                                        value={countryForm.flag}
                                        onChange={(e) => setCountryForm({ ...countryForm, flag: e.target.value })}
                                        placeholder="🇮🇩"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Dial Code
                                    </label>
                                    <input
                                        type="text"
                                        value={countryForm.dialCode}
                                        onChange={(e) => setCountryForm({ ...countryForm, dialCode: e.target.value })}
                                        placeholder="+62"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    value={countryForm.description}
                                    onChange={(e) => setCountryForm({ ...countryForm, description: e.target.value })}
                                    placeholder="e.g. Southeast Asian archipelago"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Currency
                                    </label>
                                    <input
                                        type="text"
                                        value={countryForm.currency}
                                        onChange={(e) => setCountryForm({ ...countryForm, currency: e.target.value })}
                                        placeholder="IDR"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Primary Language
                                    </label>
                                    <select
                                        value={countryForm.language}
                                        onChange={(e) => setCountryForm({ ...countryForm, language: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    >
                                        <option value="en">English</option>
                                        <option value="id">Indonesian</option>
                                        <option value="tl">Tagalog</option>
                                        <option value="th">Thai</option>
                                        <option value="vi">Vietnamese</option>
                                        <option value="de">German</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Timezone
                                    </label>
                                    <input
                                        type="text"
                                        value={countryForm.timezone}
                                        onChange={(e) => setCountryForm({ ...countryForm, timezone: e.target.value })}
                                        placeholder="Asia/Jakarta"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Linked Website URL</label>
                                <input
                                    type="url"
                                    value={countryForm.linkedWebsite || ''}
                                    onChange={(e) => setCountryForm({ ...countryForm, linkedWebsite: e.target.value })}
                                    placeholder="https://indonesia.indastreet.id"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">Side drawer: opens when user taps this country. Empty = in-app only.</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={countryForm.active}
                                        onChange={(e) => setCountryForm({ ...countryForm, active: e.target.checked })}
                                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                    />
                                    <span className="text-sm text-gray-700">Active</span>
                                </label>
                            </div>
                        </div>
                        
                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowAddForm(false);
                                    resetCountryForm();
                                }}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddCountry}
                                disabled={actionInProgress || !countryForm.code || !countryForm.name}
                                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {actionInProgress ? 'Adding...' : 'Add Country'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Country Modal */}
            {showEditModal && selectedCountry && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">Edit {selectedCountry.name}</h2>
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedCountry(null);
                                        resetCountryForm();
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Country Code *
                                    </label>
                                    <input
                                        type="text"
                                        value={countryForm.code}
                                        onChange={(e) => setCountryForm({ ...countryForm, code: e.target.value.toUpperCase() })}
                                        placeholder="e.g. ID, US, GB"
                                        maxLength={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Country Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={countryForm.name}
                                        onChange={(e) => setCountryForm({ ...countryForm, name: e.target.value })}
                                        placeholder="e.g. Indonesia"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Flag Emoji
                                    </label>
                                    <input
                                        type="text"
                                        value={countryForm.flag}
                                        onChange={(e) => setCountryForm({ ...countryForm, flag: e.target.value })}
                                        placeholder="🇮🇩"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Dial Code
                                    </label>
                                    <input
                                        type="text"
                                        value={countryForm.dialCode}
                                        onChange={(e) => setCountryForm({ ...countryForm, dialCode: e.target.value })}
                                        placeholder="+62"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    value={countryForm.description}
                                    onChange={(e) => setCountryForm({ ...countryForm, description: e.target.value })}
                                    placeholder="e.g. Southeast Asian archipelago"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Currency
                                    </label>
                                    <input
                                        type="text"
                                        value={countryForm.currency}
                                        onChange={(e) => setCountryForm({ ...countryForm, currency: e.target.value })}
                                        placeholder="IDR"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Primary Language
                                    </label>
                                    <select
                                        value={countryForm.language}
                                        onChange={(e) => setCountryForm({ ...countryForm, language: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    >
                                        <option value="en">English</option>
                                        <option value="id">Indonesian</option>
                                        <option value="tl">Tagalog</option>
                                        <option value="th">Thai</option>
                                        <option value="vi">Vietnamese</option>
                                        <option value="de">German</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Timezone
                                    </label>
                                    <input
                                        type="text"
                                        value={countryForm.timezone}
                                        onChange={(e) => setCountryForm({ ...countryForm, timezone: e.target.value })}
                                        placeholder="Asia/Jakarta"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Linked Website URL</label>
                                <input
                                    type="url"
                                    value={countryForm.linkedWebsite || ''}
                                    onChange={(e) => setCountryForm({ ...countryForm, linkedWebsite: e.target.value })}
                                    placeholder="https://indonesia.indastreet.id"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">Side drawer: opens when user taps this country. Empty = in-app only.</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={countryForm.active}
                                        onChange={(e) => setCountryForm({ ...countryForm, active: e.target.checked })}
                                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                    />
                                    <span className="text-sm text-gray-700">Active</span>
                                </label>
                            </div>
                        </div>
                        
                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setSelectedCountry(null);
                                    resetCountryForm();
                                }}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditCountry}
                                disabled={actionInProgress || !countryForm.code || !countryForm.name}
                                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {actionInProgress ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* City Management Modal - Simplified for now */}
            {showCityModal && selectedCountry && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <MapPin className="w-6 h-6 text-orange-500" />
                                    Cities in {selectedCountry.name}
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowCityModal(false);
                                        setSelectedCountry(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            <div className="text-center py-12">
                                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg mb-2">City Management</p>
                                <p className="text-gray-400">
                                    Detailed city management will be implemented in the next phase.
                                    This will include adding, editing, and organizing cities within each country.
                                </p>
                                <div className="mt-4 text-sm text-gray-500">
                                    Current cities: {selectedCountry.cities?.length || 0}
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={() => {
                                    setShowCityModal(false);
                                    setSelectedCountry(null);
                                }}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CountryManagement;