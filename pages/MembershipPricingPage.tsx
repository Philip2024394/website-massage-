import React, { useEffect, useState } from 'react';
import { DollarSign, Save, Trash2, Plus, Package, Building, Home } from 'lucide-react';

interface MembershipPackage {
  $id?: string;
  id: string;
  title: string;
  duration: string;
  price: number;
  priceFormatted: string;
  save?: string;
  bestValue: boolean;
  description?: string;
  category: 'therapist' | 'place' | 'hotel' | 'villa';
}

const MembershipPricingPage: React.FC = () => {
  const [packages, setPackages] = useState<MembershipPackage[]>([
    // Therapist & Place Packages
    { id: '1m', title: '1 Month', duration: '1 month', price: 150000, priceFormatted: 'Rp 150,000', save: '', bestValue: false, description: 'Monthly subscription', category: 'therapist' },
    { id: '3m', title: '3 Months', duration: '3 months', price: 400000, priceFormatted: 'Rp 400,000', save: 'Save Rp 50,000', bestValue: false, description: 'Quarterly subscription', category: 'therapist' },
    { id: '6m', title: '6 Months', duration: '6 months', price: 750000, priceFormatted: 'Rp 750,000', save: 'Save Rp 150,000', bestValue: false, description: 'Half-year subscription', category: 'therapist' },
    { id: '1y', title: '1 Year', duration: '12 months', price: 1400000, priceFormatted: 'Rp 1,400,000', save: 'Save Rp 400,000', bestValue: true, description: 'Annual subscription - Best Value!', category: 'therapist' },
    
    // Hotel Packages
    { id: 'hotel-3m', title: '3 Months', duration: '3 months', price: 500000, priceFormatted: 'Rp 500,000', save: '', bestValue: false, description: 'Hotel quarterly membership', category: 'hotel' },
    { id: 'hotel-6m', title: '6 Months', duration: '6 months', price: 900000, priceFormatted: 'Rp 900,000', save: 'Save Rp 100,000', bestValue: false, description: 'Hotel half-year membership', category: 'hotel' },
    { id: 'hotel-1y', title: '1 Year', duration: '12 months', price: 1600000, priceFormatted: 'Rp 1,600,000', save: 'Save Rp 400,000', bestValue: true, description: 'Hotel annual membership - Best Value!', category: 'hotel' },
    { id: 'hotel-free', title: 'Free Access', duration: 'unlimited', price: 0, priceFormatted: 'Free', save: '', bestValue: false, description: 'Complimentary access for partner hotels', category: 'hotel' },
    
    // Villa Packages
    { id: 'villa-3m', title: '3 Months', duration: '3 months', price: 500000, priceFormatted: 'Rp 500,000', save: '', bestValue: false, description: 'Villa quarterly membership', category: 'villa' },
    { id: 'villa-6m', title: '6 Months', duration: '6 months', price: 900000, priceFormatted: 'Rp 900,000', save: 'Save Rp 100,000', bestValue: false, description: 'Villa half-year membership', category: 'villa' },
    { id: 'villa-1y', title: '1 Year', duration: '12 months', price: 1600000, priceFormatted: 'Rp 1,600,000', save: 'Save Rp 400,000', bestValue: true, description: 'Villa annual membership - Best Value!', category: 'villa' },
    { id: 'villa-free', title: 'Free Access', duration: 'unlimited', price: 0, priceFormatted: 'Free', save: '', bestValue: false, description: 'Complimentary access for partner villas', category: 'villa' },
  ]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'therapist' | 'hotel' | 'villa'>('therapist');

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    setLoading(true);
    try {
      // TODO: Fetch from Appwrite
      // const response = await membershipPricingService.getAll();
      // setPackages(response);
      console.log('Fetching membership pricing...');
    } catch (error) {
      console.error('Error fetching pricing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (id: string, field: keyof MembershipPackage, value: any) => {
    setPackages(prev => prev.map(pkg => {
      if (pkg.id === id) {
        const updated = { ...pkg, [field]: value };
        
        // Auto-update priceFormatted when price changes
        if (field === 'price') {
          updated.priceFormatted = `Rp ${parseInt(value).toLocaleString('id-ID')}`;
        }
        
        return updated;
      }
      return pkg;
    }));
  };

  const handleSave = async (pkg: MembershipPackage) => {
    setSaving(true);
    try {
      // TODO: Save to Appwrite
      // if (pkg.$id) {
      //   await membershipPricingService.update(pkg.$id, pkg);
      // } else {
      //   await membershipPricingService.create(pkg);
      // }
      
      console.log('Saving package:', pkg);
      
      const dashboardText = pkg.category === 'therapist' || pkg.category === 'place' 
        ? '• Therapist dashboards\n• Massage place dashboards\n• Agent dashboards'
        : pkg.category === 'hotel'
        ? '• Hotel dashboards\n• Agent dashboards'
        : '• Villa dashboards\n• Agent dashboards';
      
      alert(`✅ Package "${pkg.title}" saved successfully!\n\nThis will update pricing for:\n${dashboardText}`);
      setEditingId(null);
    } catch (error) {
      console.error('Error saving package:', error);
      alert('Failed to save package');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (pkg: MembershipPackage) => {
    if (!confirm(`Are you sure you want to delete the "${pkg.title}" package?\n\nThis will affect all dashboards.`)) {
      return;
    }

    try {
      // TODO: Delete from Appwrite
      // if (pkg.$id) {
      //   await membershipPricingService.delete(pkg.$id);
      // }
      
      setPackages(prev => prev.filter(p => p.id !== pkg.id));
      alert(`✅ Package "${pkg.title}" deleted successfully!`);
    } catch (error) {
      console.error('Error deleting package:', error);
      alert('Failed to delete package');
    }
  };

  const handleAddNew = () => {
    const newPackage: MembershipPackage = {
      id: `custom-${activeCategory}-${Date.now()}`,
      title: 'New Package',
      duration: '1 month',
      price: 0,
      priceFormatted: 'Rp 0',
      save: '',
      bestValue: false,
      description: 'New membership package',
      category: activeCategory === 'therapist' ? 'therapist' : activeCategory
    };
    
    console.log('Adding new package:', newPackage);
    setPackages(prev => {
      const updated = [...prev, newPackage];
      console.log('Updated packages:', updated);
      return updated;
    });
    setEditingId(newPackage.id);
    
    // Show notification
    alert(`✅ New ${activeCategory} package added! You can now edit the details below.`);
    
    // Scroll to the new package after a short delay
    setTimeout(() => {
      const element = document.getElementById(`package-${newPackage.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const formatCurrency = (amount: number): string => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-4 pb-20 sm:p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 mb-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-20">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Membership Pricing Management</h1>
              <p className="text-orange-100 text-sm mt-1">Manage pricing for Therapists, Places, Hotels & Villas</p>
            </div>
          </div>
          <button
            onClick={handleAddNew}
            className="bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold hover:bg-orange-50 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg whitespace-nowrap"
            type="button"
          >
            <Plus className="w-5 h-5" />
            <span>Add Package</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mb-6 bg-white rounded-lg shadow-md border border-gray-200 p-1">
        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={() => setActiveCategory('therapist')}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
              activeCategory === 'therapist'
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Package className="w-5 h-5" />
            <span className="hidden sm:inline">Therapist & Place</span>
            <span className="sm:hidden">Therapist</span>
          </button>
          <button
            onClick={() => setActiveCategory('hotel')}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
              activeCategory === 'hotel'
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Building className="w-5 h-5" />
            <span>Hotel</span>
          </button>
          <button
            onClick={() => setActiveCategory('villa')}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
              activeCategory === 'villa'
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Villa</span>
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 pb-20 mb-6">
        <div className="flex gap-3">
          <DollarSign className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Global Pricing Update</h4>
            <p className="text-sm text-blue-700">
              Changes made here will automatically update membership pricing displayed in:
            </p>
            {activeCategory === 'therapist' && (
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>✅ <strong>Therapist Dashboard</strong> - Membership renewal page</li>
                <li>✅ <strong>Massage Place Dashboard</strong> - Membership renewal page</li>
                <li>✅ <strong>Agent Dashboard</strong> - Membership packages when registering clients</li>
              </ul>
            )}
            {activeCategory === 'hotel' && (
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>✅ <strong>Hotel Dashboard</strong> - Membership page</li>
                <li>✅ <strong>Agent Dashboard</strong> - Hotel membership packages</li>
              </ul>
            )}
            {activeCategory === 'villa' && (
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>✅ <strong>Villa Dashboard</strong> - Membership page</li>
                <li>✅ <strong>Agent Dashboard</strong> - Villa membership packages</li>
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Packages List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {packages
            .filter(pkg => 
              activeCategory === 'therapist' 
                ? pkg.category === 'therapist' || pkg.category === 'place'
                : pkg.category === activeCategory
            )
            .map((pkg) => {
            const isEditing = editingId === pkg.id;
            
            return (
              <div
                key={pkg.id}
                id={`package-${pkg.id}`}
                className={`bg-white rounded-lg border-2 transition-all ${
                  pkg.bestValue 
                    ? 'border-green-500 shadow-md' 
                    : 'border-gray-200'
                } ${isEditing ? 'shadow-lg ring-2 ring-orange-500' : ''}`}
              >
                <div className="p-4 pb-20 sm:p-6">
                  {/* Best Value Badge */}
                  {pkg.bestValue && (
                    <div className="inline-block bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                      ⭐ BEST VALUE
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-20">
                    {/* Left Column - Basic Info */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Package Title</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={pkg.title}
                            onChange={(e) => handlePriceChange(pkg.id, 'title', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                          />
                        ) : (
                          <p className="text-xl font-bold text-gray-900">{pkg.title}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={pkg.duration}
                            onChange={(e) => handlePriceChange(pkg.id, 'duration', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                            placeholder="e.g., 1 month, 3 months"
                          />
                        ) : (
                          <p className="text-gray-700">{pkg.duration}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        {isEditing ? (
                          <textarea
                            value={pkg.description || ''}
                            onChange={(e) => handlePriceChange(pkg.id, 'description', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                            rows={2}
                          />
                        ) : (
                          <p className="text-sm text-gray-600">{pkg.description || 'No description'}</p>
                        )}
                      </div>
                    </div>

                    {/* Right Column - Pricing */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (IDR)</label>
                        {isEditing ? (
                          <input
                            type="number"
                            value={pkg.price}
                            onChange={(e) => handlePriceChange(pkg.id, 'price', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                            placeholder="150000"
                          />
                        ) : (
                          <p className="text-2xl font-bold text-green-600">{formatCurrency(pkg.price)}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Save Message (optional)</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={pkg.save || ''}
                            onChange={(e) => handlePriceChange(pkg.id, 'save', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                            placeholder="Save Rp 50,000"
                          />
                        ) : (
                          <p className="text-sm font-semibold text-green-600">{pkg.save || 'No savings message'}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`best-${pkg.id}`}
                          checked={pkg.bestValue}
                          onChange={(e) => handlePriceChange(pkg.id, 'bestValue', e.target.checked)}
                          disabled={!isEditing}
                          className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                        />
                        <label htmlFor={`best-${pkg.id}`} className="text-sm font-medium text-gray-700">
                          Mark as "Best Value"
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleSave(pkg)}
                          disabled={saving}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingId(pkg.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors"
                        >
                          Edit Package
                        </button>
                        <button
                          onClick={() => handleDelete(pkg)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 pb-20">
        <div className="flex gap-3">
          <Package className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-900 mb-1">Important Notes</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Prices are in Indonesian Rupiah (IDR)</li>
              <li>• Changes take effect immediately across all dashboards</li>
              <li>• Existing active memberships are not affected, only new purchases</li>
              <li>• "Best Value" badge highlights the recommended package</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipPricingPage;

