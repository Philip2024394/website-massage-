// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState, useEffect } from 'react';
import {
    Mail, Send, Calendar, Users,
    Plus, Upload, X, Check, Globe
} from 'lucide-react';

interface Contact {
    $id: string;
    email: string;
    name: string;
    country: string;
    userType: 'therapist' | 'place' | 'guest';
    subscribed: boolean;
    selected?: boolean;
}

interface EmailCampaign {
    $id: string;
    name: string;
    subject: string;
    headerText: string;
    bodyText: string;
    imageUrl?: string;
    targetCountries: string[];
    scheduledDate?: Date;
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
    sentCount: number;
    totalRecipients: number;
    createdAt: Date;
}

const EmailMarketing: React.FC = () => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
    const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
    const [showComposer, setShowComposer] = useState(false);
    const [showRecipientSelector, setShowRecipientSelector] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectionMode, setSelectionMode] = useState<'country' | 'individual' | 'batch'>('country');
    const [batchSize, setBatchSize] = useState(50); // Max emails per batch send
    const [sendDelay, setSendDelay] = useState(2); // Seconds between batches

    // Campaign form state
    const [campaignName, setCampaignName] = useState('');
    const [subject, setSubject] = useState('');
    const [headerText, setHeaderText] = useState('');
    const [bodyText, setBodyText] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [sendNow, setSendNow] = useState(true);

    const availableCountries = [
        'Indonesia', 'Singapore', 'Malaysia', 'Thailand', 
        'Philippines', 'Vietnam', 'Australia', 'Japan'
    ];

    useEffect(() => {
        loadContacts();
        loadCampaigns();
    }, []);

    const loadContacts = async () => {
        try {
            // TODO: Load contacts from Appwrite
            // Filter by subscribed = true
            const mockContacts: Contact[] = [
                {
                    $id: '1',
                    email: 'user@example.com',
                    name: 'John Doe',
                    country: 'Indonesia',
                    userType: 'therapist',
                    subscribed: true
                }
            ];
            setContacts(mockContacts);
        } catch (error) {
            console.error('Error loading contacts:', error);
        }
    };

    const loadCampaigns = async () => {
        try {
            // TODO: Load campaigns from Appwrite
            setCampaigns([]);
        } catch (error) {
            console.error('Error loading campaigns:', error);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const getFilteredContacts = () => {
        switch (selectionMode) {
            case 'country':
                if (selectedCountries.length === 0) return [];
                return contacts.filter(c => selectedCountries.includes(c.country));
            case 'individual':
                return contacts.filter(c => c.selected);
            case 'batch':
                // In batch mode, use country filter as base, but respect batch size limits
                if (selectedCountries.length === 0) return [];
                return contacts.filter(c => selectedCountries.includes(c.country));
            default:
                return [];
        }
    };

    const toggleContactSelection = (contactId: string) => {
        setContacts(contacts.map(c => 
            c.$id === contactId ? { ...c, selected: !c.selected } : c
        ));
    };

    const selectAllInCountry = (country: string) => {
        setContacts(contacts.map(c => 
            c.country === country ? { ...c, selected: true } : c
        ));
    };

    const deselectAllInCountry = (country: string) => {
        setContacts(contacts.map(c => 
            c.country === country ? { ...c, selected: false } : c
        ));
    };

    const selectAll = () => {
        setContacts(contacts.map(c => ({ ...c, selected: true })));
    };

    const deselectAll = () => {
        setContacts(contacts.map(c => ({ ...c, selected: false })));
    };

    const handleSendCampaign = async () => {
        if (!subject.trim() || !bodyText.trim()) {
            alert('Please fill in subject and body text');
            return;
        }

        const filteredContacts = getFilteredContacts();
        if (filteredContacts.length === 0) {
            alert('No recipients selected');
            return;
        }

        setLoading(true);
        try {
            // Create campaign
            const campaign: EmailCampaign = {
                $id: Date.now().toString(),
                name: campaignName || `Campaign ${new Date().toLocaleDateString()}`,
                subject,
                headerText,
                bodyText,
                imageUrl: imagePreview,
                targetCountries: selectedCountries,
                scheduledDate: sendNow ? undefined : new Date(`${scheduledDate}T${scheduledTime}`),
                status: sendNow ? 'sending' : 'scheduled',
                sentCount: 0,
                totalRecipients: filteredContacts.length,
                createdAt: new Date()
            };

            // TODO: Save campaign to Appwrite
            // TODO: If sendNow, start sending immediately
            // TODO: If scheduled, save for cron job to pick up

            if (sendNow) {
                await sendEmails(campaign, filteredContacts);
            }

            setCampaigns([...campaigns, campaign]);
            resetForm();
            setShowComposer(false);
            alert(`Campaign ${sendNow ? 'sent' : 'scheduled'} successfully!`);
        } catch (error) {
            console.error('Error sending campaign:', error);
            alert('Failed to send campaign');
        } finally {
            setLoading(false);
        }
    };

    const sendEmails = async (campaign: EmailCampaign, recipients: Contact[]) => {
        // Send in batches to comply with email regulations and avoid rate limits
        // Use configured batch size and delay from state
        const effectiveBatchSize = batchSize || 50;
        const delayMs = (sendDelay || 2) * 1000; // Convert seconds to milliseconds

        for (let i = 0; i < recipients.length; i += effectiveBatchSize) {
            const batch = recipients.slice(i, i + effectiveBatchSize);
            
            for (const contact of batch) {
                try {
                    // TODO: Use Appwrite Functions or Messaging API
                    // Create HTML email with image and styling
                    const emailHTML = `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>
                                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { background: linear-gradient(to right, #f97316, #fb923c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                                .header h1 { margin: 0; font-size: 28px; }
                                .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
                                .image { max-width: 100%; height: auto; margin: 20px 0; border-radius: 8px; }
                                .footer { background: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #6b7280; }
                                .unsubscribe { color: #9ca3af; text-decoration: none; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>${campaign.headerText || 'IndaStreet'}</h1>
                                </div>
                                <div class="content">
                                    <h2>${campaign.subject}</h2>
                                    ${campaign.imageUrl ? `<img src="${campaign.imageUrl}" alt="Campaign Image" class="image" />` : ''}
                                    <p>${campaign.bodyText.replace(/\n/g, '<br>')}</p>
                                </div>
                                <div class="footer">
                                    <p>© ${new Date().getFullYear()} IndaStreet. All rights reserved.</p>
                                    <p><a href="#" class="unsubscribe">Unsubscribe</a></p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `;

                    console.log(`Sending to ${contact.email}:`, emailHTML);
                    
                    // TODO: Send via Appwrite
                    // await appwrite.functions.createExecution('email-sender', JSON.stringify({
                    //     to: contact.email,
                    //     subject: campaign.subject,
                    //     html: emailHTML
                    // }));
                    
                } catch (error) {
                    console.error(`Failed to send to ${contact.email}:`, error);
                }
            }

            // Wait between batches
            if (i + effectiveBatchSize < recipients.length) {
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }
    };

    const resetForm = () => {
        setCampaignName('');
        setSubject('');
        setHeaderText('');
        setBodyText('');
        setImageFile(null);
        setImagePreview('');
        setScheduledDate('');
        setScheduledTime('');
        setSendNow(true);
        setSelectedCountries([]);
    };

    const toggleCountry = (country: string) => {
        if (selectedCountries.includes(country)) {
            setSelectedCountries(selectedCountries.filter(c => c !== country));
        } else {
            setSelectedCountries([...selectedCountries, country]);
        }
    };

    const recipientCount = getFilteredContacts().length;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Mail className="w-8 h-8 text-orange-500" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Email Marketing</h1>
                            <p className="text-gray-500">Send targeted campaigns to your members</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowComposer(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-semibold transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        New Campaign
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <Users className="w-8 h-8 text-blue-500" />
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Total Contacts</p>
                    <p className="text-3xl font-bold text-gray-800">{contacts.length}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <Send className="w-8 h-8 text-green-500" />
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Campaigns Sent</p>
                    <p className="text-3xl font-bold text-gray-800">
                        {campaigns.filter(c => c.status === 'sent').length}
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <Calendar className="w-8 h-8 text-purple-500" />
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Scheduled</p>
                    <p className="text-3xl font-bold text-gray-800">
                        {campaigns.filter(c => c.status === 'scheduled').length}
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <Globe className="w-8 h-8 text-orange-500" />
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Countries</p>
                    <p className="text-3xl font-bold text-gray-800">{availableCountries.length}</p>
                </div>
            </div>

            {/* Campaigns List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Campaigns</h2>
                {campaigns.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p>No campaigns yet. Create your first campaign!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {campaigns.map((campaign) => (
                            <div key={campaign.$id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-800">{campaign.name}</h3>
                                    <p className="text-sm text-gray-500">{campaign.subject}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {campaign.sentCount} / {campaign.totalRecipients} sent
                                        {campaign.scheduledDate && ` • Scheduled: ${campaign.scheduledDate.toLocaleString()}`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        campaign.status === 'sent' ? 'bg-green-100 text-green-700' :
                                        campaign.status === 'sending' ? 'bg-blue-100 text-blue-700' :
                                        campaign.status === 'scheduled' ? 'bg-purple-100 text-purple-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        {campaign.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Email Composer Modal */}
            {showComposer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-white">Create Email Campaign</h2>
                            <button
                                onClick={() => setShowComposer(false)}
                                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Campaign Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Campaign Name (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={campaignName}
                                    onChange={(e) => setCampaignName(e.target.value)}
                                    placeholder="e.g., Monthly Newsletter - January"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>

                            {/* Selection Mode */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Recipient Selection Mode
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setSelectionMode('country')}
                                        className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                                            selectionMode === 'country'
                                                ? 'border-orange-500 bg-orange-50 text-orange-700 font-semibold'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        By Country
                                    </button>
                                    <button
                                        onClick={() => setSelectionMode('individual')}
                                        className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                                            selectionMode === 'individual'
                                                ? 'border-orange-500 bg-orange-50 text-orange-700 font-semibold'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        Individual Emails
                                    </button>
                                    <button
                                        onClick={() => setSelectionMode('batch')}
                                        className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                                            selectionMode === 'batch'
                                                ? 'border-orange-500 bg-orange-50 text-orange-700 font-semibold'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        Batch Groups
                                    </button>
                                </div>
                            </div>

                            {/* Country Selection (for country and batch modes) */}
                            {(selectionMode === 'country' || selectionMode === 'batch') && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Target Countries
                                        <span className="ml-2 text-xs font-normal text-gray-500">
                                            ({recipientCount} recipients)
                                        </span>
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setSelectedCountries(availableCountries)}
                                            className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm hover:bg-orange-200 transition-colors"
                                        >
                                            Select All Countries
                                        </button>
                                        <button
                                            onClick={() => setSelectedCountries([])}
                                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {availableCountries.map((country) => {
                                            const countryCount = contacts.filter(c => c.country === country).length;
                                            return (
                                                <button
                                                    key={country}
                                                    onClick={() => toggleCountry(country)}
                                                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                                                        selectedCountries.includes(country)
                                                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                >
                                                    {selectedCountries.includes(country) && (
                                                        <Check className="w-4 h-4 inline mr-1" />
                                                    )}
                                                    <span className="font-medium">{country}</span>
                                                    <span className="ml-1 text-xs text-gray-500">({countryCount})</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Individual Email Selection */}
                            {selectionMode === 'individual' && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Select Individual Recipients
                                        <span className="ml-2 text-xs font-normal text-gray-500">
                                            ({contacts.filter(c => c.selected).length} selected)
                                        </span>
                                    </label>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <button
                                            onClick={selectAll}
                                            className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm hover:bg-orange-200 transition-colors"
                                        >
                                            Select All
                                        </button>
                                        <button
                                            onClick={deselectAll}
                                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                                        >
                                            Deselect All
                                        </button>
                                        <button
                                            onClick={() => setShowRecipientSelector(true)}
                                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                                        >
                                            Browse by Country
                                        </button>
                                    </div>
                                    <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                                        {availableCountries.map(country => {
                                            const countryContacts = contacts.filter(c => c.country === country);
                                            if (countryContacts.length === 0) return null;
                                            return (
                                                <div key={country} className="border-b border-gray-100 last:border-0">
                                                    <div className="bg-gray-50 px-4 py-2 flex items-center justify-between">
                                                        <span className="font-semibold text-gray-700">{country} ({countryContacts.length})</span>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => selectAllInCountry(country)}
                                                                className="text-xs text-orange-600 hover:text-orange-700"
                                                            >
                                                                Select All
                                                            </button>
                                                            <button
                                                                onClick={() => deselectAllInCountry(country)}
                                                                className="text-xs text-gray-600 hover:text-gray-700"
                                                            >
                                                                Clear
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="px-4 py-2 space-y-1">
                                                        {countryContacts.map(contact => (
                                                            <label key={contact.$id} className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={contact.selected || false}
                                                                    onChange={() => toggleContactSelection(contact.$id)}
                                                                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                                                                />
                                                                <span className="text-sm text-gray-700">{contact.email}</span>
                                                                <span className="text-xs text-gray-500">({contact.name})</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Batch Settings */}
                            {selectionMode === 'batch' && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-blue-900 mb-3">Batch Send Settings (Regulation Compliance)</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-blue-900 mb-2">
                                                Emails Per Batch
                                            </label>
                                            <input
                                                type="number"
                                                value={batchSize}
                                                onChange={(e) => setBatchSize(parseInt(e.target.value) || 50)}
                                                min="1"
                                                max="1000"
                                                className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            <p className="text-xs text-blue-700 mt-1">
                                                Maximum emails to send at once (recommended: 50-100)
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-blue-900 mb-2">
                                                Delay Between Batches (seconds)
                                            </label>
                                            <input
                                                type="number"
                                                value={sendDelay}
                                                onChange={(e) => setSendDelay(parseInt(e.target.value) || 2)}
                                                min="1"
                                                max="60"
                                                className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            <p className="text-xs text-blue-700 mt-1">
                                                Wait time between batches (recommended: 2-5 seconds)
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-3 p-3 bg-blue-100 rounded border border-blue-300">
                                        <p className="text-sm text-blue-900">
                                            <strong>Estimated Send Time:</strong> {Math.ceil(recipientCount / batchSize)} batches × {sendDelay}s = 
                                            <span className="font-semibold ml-1">
                                                ~{Math.ceil((recipientCount / batchSize) * sendDelay / 60)} minutes
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Country Selection (continued for country mode only) - removed duplicate */}

                            {/* Header Text */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email Header Text
                                </label>
                                <input
                                    type="text"
                                    value={headerText}
                                    onChange={(e) => setHeaderText(e.target.value)}
                                    placeholder="e.g., IndaStreet Monthly Update"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>

                            {/* Subject */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email Subject *
                                </label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="e.g., New Features & Special Offers"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Attach Image
                                </label>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition-colors">
                                        <Upload className="w-4 h-4" />
                                        Choose Image
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </label>
                                    {imagePreview && (
                                        <div className="relative">
                                            <img src={imagePreview} alt="Preview" className="h-20 w-32 object-cover rounded-lg" />
                                            <button
                                                onClick={() => {
                                                    setImageFile(null);
                                                    setImagePreview('');
                                                }}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Body Text */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email Body *
                                </label>
                                <textarea
                                    value={bodyText}
                                    onChange={(e) => setBodyText(e.target.value)}
                                    rows={8}
                                    placeholder="Write your email message here..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            {/* Scheduling */}
                            <div className="border-t pt-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <button
                                        onClick={() => setSendNow(true)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                            sendNow
                                                ? 'bg-orange-500 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Send Now
                                    </button>
                                    <button
                                        onClick={() => setSendNow(false)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                            !sendNow
                                                ? 'bg-orange-500 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Schedule for Later
                                    </button>
                                </div>

                                {!sendNow && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Date
                                            </label>
                                            <input
                                                type="date"
                                                value={scheduledDate}
                                                onChange={(e) => setScheduledDate(e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Time
                                            </label>
                                            <input
                                                type="time"
                                                value={scheduledTime}
                                                onChange={(e) => setScheduledTime(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4 border-t">
                                <button
                                    onClick={handleSendCampaign}
                                    disabled={loading || !subject.trim() || !bodyText.trim() || recipientCount === 0}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:bg-gray-300 text-white rounded-lg font-semibold transition-colors"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            {sendNow ? 'Sending...' : 'Scheduling...'}
                                        </>
                                    ) : (
                                        <>
                                            {sendNow ? <Send className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                                            {sendNow ? 'Send Campaign' : 'Schedule Campaign'}
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowComposer(false)}
                                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmailMarketing;
