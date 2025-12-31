import React, { useState, useEffect } from 'react';
import { Menu, Plus, Edit3, Trash2, Clock, DollarSign, Users, Star } from 'lucide-react';

interface PlaceMenuPricingProps {
  placeId: string;
  onBack?: () => void;
}

const PlaceMenuPricing: React.FC<PlaceMenuPricingProps> = ({ placeId, onBack }) => {
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isAddingService, setIsAddingService] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    // Simulate services data
    setServices([
      {
        id: 1,
        name: 'Traditional Indonesian Massage',
        category: 'traditional',
        duration: 60,
        price: 250000,
        description: 'Authentic Indonesian massage techniques using traditional oils',
        popularity: 95,
        bookingsCount: 156,
        rating: 4.8,
        available: true
      },
      {
        id: 2,
        name: 'Balinese Deep Tissue Massage',
        category: 'therapeutic',
        duration: 90,
        price: 350000,
        description: 'Deep tissue massage with Balinese techniques for muscle tension relief',
        popularity: 88,
        bookingsCount: 124,
        rating: 4.9,
        available: true
      },
      {
        id: 3,
        name: 'Hot Stone Therapy',
        category: 'premium',
        duration: 120,
        price: 450000,
        description: 'Relaxing hot stone massage for ultimate stress relief',
        popularity: 76,
        bookingsCount: 89,
        rating: 4.7,
        available: true
      },
      {
        id: 4,
        name: 'Aromatherapy Massage',
        category: 'wellness',
        duration: 75,
        price: 300000,
        description: 'Therapeutic massage with essential oils for holistic wellness',
        popularity: 82,
        bookingsCount: 107,
        rating: 4.6,
        available: false
      }
    ]);

    setCategories([
      { id: 'all', name: 'All Services', count: 4 },
      { id: 'traditional', name: 'Traditional', count: 1 },
      { id: 'therapeutic', name: 'Therapeutic', count: 1 },
      { id: 'premium', name: 'Premium', count: 1 },
      { id: 'wellness', name: 'Wellness', count: 1 }
    ]);
  }, [placeId]);

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      traditional: 'bg-green-100 text-green-700',
      therapeutic: 'bg-blue-100 text-blue-700',
      premium: 'bg-purple-100 text-purple-700',
      wellness: 'bg-pink-100 text-pink-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const filteredServices = services.filter(service => {
    if (selectedCategory === 'all') return true;
    return service.category === selectedCategory;
  });

  const ServiceCard = ({ service }: { service: any }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
            {!service.available && (
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                Unavailable
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4 mb-3">
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getCategoryColor(service.category)}`}>
              {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
            </span>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{service.duration} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-900 font-medium">{service.rating}</span>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mb-4">{service.description}</p>
          
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{service.bookingsCount} bookings</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Popularity: {service.popularity}%</span>
            </div>
          </div>
        </div>
        
        <div className="text-right ml-4">
          <div className="text-2xl font-bold text-orange-600 mb-2">
            {formatCurrency(service.price)}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditingService(service)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Menu className="w-6 h-6 text-orange-600" />
              </div>
              Menu & Pricing
            </h1>
            <p className="text-gray-600 mt-1">Manage your massage services and pricing</p>
          </div>
          <button
            onClick={() => setIsAddingService(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Service
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Menu className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Services</p>
              <p className="text-2xl font-bold text-gray-900">{services.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg. Price</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(services.reduce((sum, s) => sum + s.price, 0) / services.length)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">
                {services.reduce((sum, s) => sum + s.bookingsCount, 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg. Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {(services.reduce((sum, s) => sum + s.rating, 0) / services.length).toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                selectedCategory === category.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                selectedCategory === category.id
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {category.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-4">
        {filteredServices.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Menu className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
          <p className="text-gray-600">No services match the selected category.</p>
        </div>
      )}

      {/* Add/Edit Service Modal */}
      {(isAddingService || editingService) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              <p className="text-gray-600">Fill in the details for your massage service</p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Name</label>
                <input
                  type="text"
                  placeholder="e.g., Traditional Indonesian Massage"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  defaultValue={editingService?.name || ''}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    defaultValue={editingService?.category || ''}
                  >
                    <option value="">Select category</option>
                    <option value="traditional">Traditional</option>
                    <option value="therapeutic">Therapeutic</option>
                    <option value="premium">Premium</option>
                    <option value="wellness">Wellness</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    placeholder="60"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    defaultValue={editingService?.duration || ''}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (IDR)</label>
                <input
                  type="number"
                  placeholder="250000"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  defaultValue={editingService?.price || ''}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe your massage service..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  defaultValue={editingService?.description || ''}
                />
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="available"
                  className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  defaultChecked={editingService?.available !== false}
                />
                <label htmlFor="available" className="text-sm font-medium text-gray-700">
                  Service is available for booking
                </label>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsAddingService(false);
                  setEditingService(null);
                }}
                className="flex-1 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="flex-1 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600">
                {editingService ? 'Update Service' : 'Add Service'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceMenuPricing;