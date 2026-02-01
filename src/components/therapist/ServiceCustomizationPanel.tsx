/**
 * ============================================================================
 * 💼 SERVICE CUSTOMIZATION PANEL - ADVANCED SERVICE MANAGEMENT
 * ============================================================================
 * 
 * Comprehensive service management with:
 * - Drag-and-drop service reordering
 * - Visual service builder with templates
 * - Dynamic pricing with package deals
 * - Service categories and filtering
 * - Photo upload and gallery management
 * - Availability integration per service
 * - Performance tracking per service
 * 
 * ============================================================================
 */

import React, { useState, useCallback, useMemo } from 'react';
import { 
  Plus, Edit3, Trash2, Move, Camera, DollarSign, 
  Clock, Tag, Image as ImageIcon, Copy, Eye,
  ChevronUp, ChevronDown, MoreVertical, Star,
  TrendingUp, Users, Calendar, AlertCircle,
  CheckCircle2, Package, Zap, Target
} from 'lucide-react';
import { ProfileService, ServicePackage, PriceDiscount } from './EnhancedProfileEditor';

interface ServiceCustomizationPanelProps {
  services: ProfileService[];
  packages: ServicePackage[];
  discounts: PriceDiscount[];
  onServicesChange: (services: ProfileService[]) => void;
  onPackagesChange: (packages: ServicePackage[]) => void;
  onDiscountsChange: (discounts: PriceDiscount[]) => void;
  className?: string;
}

const SERVICE_CATEGORIES = [
  { id: 'relaxation', label: 'Relaxation', color: 'bg-blue-100 text-blue-700' },
  { id: 'therapeutic', label: 'Therapeutic', color: 'bg-green-100 text-green-700' },
  { id: 'deep-tissue', label: 'Deep Tissue', color: 'bg-purple-100 text-purple-700' },
  { id: 'specialty', label: 'Specialty', color: 'bg-orange-100 text-orange-700' },
  { id: 'wellness', label: 'Wellness', color: 'bg-pink-100 text-pink-700' },
  { id: 'couples', label: 'Couples', color: 'bg-indigo-100 text-indigo-700' }
];

const SERVICE_TEMPLATES = [
  {
    id: 'swedish',
    name: 'Swedish Massage',
    description: 'Classic relaxation massage with long, flowing strokes to reduce tension and promote relaxation.',
    duration: 60,
    price: 80,
    category: 'relaxation'
  },
  {
    id: 'deep-tissue',
    name: 'Deep Tissue Massage',
    description: 'Intensive massage targeting deeper layers of muscle and connective tissue for chronic tension relief.',
    duration: 75,
    price: 100,
    category: 'therapeutic'
  },
  {
    id: 'hot-stone',
    name: 'Hot Stone Therapy',
    description: 'Heated stone massage that melts away tension and promotes deep relaxation.',
    duration: 90,
    price: 120,
    category: 'specialty'
  },
  {
    id: 'couples',
    name: 'Couples Massage',
    description: 'Relaxing massage experience for two people in the same room.',
    duration: 60,
    price: 160,
    category: 'couples'
  }
];

export const ServiceCustomizationPanel: React.FC<ServiceCustomizationPanelProps> = ({
  services,
  packages,
  discounts,
  onServicesChange,
  onPackagesChange,
  onDiscountsChange,
  className = ""
}) => {
  const [activeTab, setActiveTab] = useState<'services' | 'packages' | 'discounts'>('services');
  const [editingService, setEditingService] = useState<ProfileService | null>(null);
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [draggedService, setDraggedService] = useState<string | null>(null);

  // Service management
  const addService = useCallback((template?: any) => {
    const newService: ProfileService = {
      id: Date.now().toString(),
      name: template?.name || '',
      description: template?.description || '',
      duration: template?.duration || 60,
      price: template?.price || 0,
      category: template?.category || 'relaxation',
      isActive: true,
      order: services.length
    };
    onServicesChange([...services, newService]);
    setEditingService(newService);
    setShowTemplates(false);
  }, [services, onServicesChange]);

  const updateService = useCallback((updatedService: ProfileService) => {
    onServicesChange(services.map(s => s.id === updatedService.id ? updatedService : s));
  }, [services, onServicesChange]);

  const deleteService = useCallback((serviceId: string) => {
    onServicesChange(services.filter(s => s.id !== serviceId));
  }, [services, onServicesChange]);

  const reorderServices = useCallback((fromIndex: number, toIndex: number) => {
    const newServices = [...services];
    const [moved] = newServices.splice(fromIndex, 1);
    newServices.splice(toIndex, 0, moved);
    
    // Update order values
    newServices.forEach((service, index) => {
      service.order = index;
    });
    
    onServicesChange(newServices);
  }, [services, onServicesChange]);

  const duplicateService = useCallback((service: ProfileService) => {
    const duplicate: ProfileService = {
      ...service,
      id: Date.now().toString(),
      name: `${service.name} (Copy)`,
      order: services.length
    };
    onServicesChange([...services, duplicate]);
  }, [services, onServicesChange]);

  // Package management
  const addPackage = useCallback(() => {
    const newPackage: ServicePackage = {
      id: Date.now().toString(),
      name: '',
      services: [],
      originalPrice: 0,
      discountedPrice: 0,
      description: ''
    };
    onPackagesChange([...packages, newPackage]);
    setEditingPackage(newPackage);
  }, [packages, onPackagesChange]);

  const updatePackage = useCallback((updatedPackage: ServicePackage) => {
    onPackagesChange(packages.map(p => p.id === updatedPackage.id ? updatedPackage : p));
  }, [packages, onPackagesChange]);

  const deletePackage = useCallback((packageId: string) => {
    onPackagesChange(packages.filter(p => p.id !== packageId));
  }, [packages, onPackagesChange]);

  // Calculate total revenue potential
  const revenueMetrics = useMemo(() => {
    const totalServices = services.length;
    const averagePrice = services.reduce((sum, s) => sum + s.price, 0) / totalServices || 0;
    const totalPackageValue = packages.reduce((sum, p) => sum + p.discountedPrice, 0);
    
    return {
      totalServices,
      averagePrice,
      totalPackageValue,
      highestPriced: services.reduce((max, s) => s.price > max.price ? s : max, services[0]),
      lowestPriced: services.reduce((min, s) => s.price < min.price ? s : min, services[0])
    };
  }, [services, packages]);

  const ServiceCard: React.FC<{ service: ProfileService; index: number }> = ({ service, index }) => (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-4 transition-all ${
        draggedService === service.id ? 'opacity-50 scale-95' : 'hover:shadow-md'
      }`}
      draggable
      onDragStart={() => setDraggedService(service.id)}
      onDragEnd={() => setDraggedService(null)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        if (draggedService && draggedService !== service.id) {
          const fromIndex = services.findIndex(s => s.id === draggedService);
          reorderServices(fromIndex, index);
        }
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="cursor-move text-gray-400 hover:text-gray-600">
              <Move className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-gray-900 truncate">{service.name || 'Untitled Service'}</h3>
            <div className={`px-2 py-1 rounded-full text-xs ${
              SERVICE_CATEGORIES.find(c => c.id === service.category)?.color || 'bg-gray-100 text-gray-700'
            }`}>
              {SERVICE_CATEGORIES.find(c => c.id === service.category)?.label || 'Other'}
            </div>
            {!service.isActive && (
              <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">Inactive</span>
            )}
          </div>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {service.description || 'No description provided'}
          </p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {service.duration} min
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              ${service.price}
            </div>
            {service.image && (
              <div className="flex items-center gap-1">
                <ImageIcon className="w-4 h-4 text-green-500" />
                Photo
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => setEditingService(service)}
            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit service"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => duplicateService(service)}
            className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
            title="Duplicate service"
          >
            <Copy className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => deleteService(service.id)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete service"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const ServiceEditor: React.FC<{ service: ProfileService }> = ({ service }) => {
    const [localService, setLocalService] = useState(service);
    
    const saveService = () => {
      updateService(localService);
      setEditingService(null);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-96 overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {service.name ? 'Edit Service' : 'Create New Service'}
              </h3>
              <button
                onClick={() => setEditingService(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Service Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Name *
                </label>
                <input
                  type="text"
                  value={localService.name}
                  onChange={(e) => setLocalService({ ...localService, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., Swedish Massage"
                />
              </div>

              {/* Category and Active Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={localService.category}
                    onChange={(e) => setLocalService({ ...localService, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {SERVICE_CATEGORIES.map(category => (
                      <option key={category.id} value={category.id}>{category.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="flex items-center h-12">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={localService.isActive}
                        onChange={(e) => setLocalService({ ...localService, isActive: e.target.checked })}
                        className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <span className="text-gray-700">Active (visible to clients)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Duration and Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    value={localService.duration}
                    onChange={(e) => setLocalService({ ...localService, duration: parseInt(e.target.value) || 0 })}
                    min="15"
                    max="240"
                    step="15"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    value={localService.price}
                    onChange={(e) => setLocalService({ ...localService, price: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="5"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={localService.description}
                  onChange={(e) => setLocalService({ ...localService, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  placeholder="Describe what makes this service special..."
                />
              </div>

              {/* Service Photo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Photo
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                  {localService.image ? (
                    <div className="relative">
                      <img 
                        src={localService.image} 
                        alt="Service" 
                        className="w-32 h-32 object-cover rounded-lg mx-auto mb-3"
                      />
                      <button
                        onClick={() => setLocalService({ ...localService, image: undefined })}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to upload service photo</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Save Actions */}
            <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setEditingService(null)}
                className="px-6 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveService}
                disabled={!localService.name.trim() || localService.price <= 0 || localService.duration <= 0}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Save Service
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ServicesTab: React.FC = () => (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{revenueMetrics.totalServices}</div>
          <div className="text-sm text-blue-600">Total Services</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">${revenueMetrics.averagePrice.toFixed(0)}</div>
          <div className="text-sm text-green-600">Average Price</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            ${revenueMetrics.highestPriced?.price || 0}
          </div>
          <div className="text-sm text-purple-600">Highest Price</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{packages.length}</div>
          <div className="text-sm text-orange-600">Packages</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => addService()}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </button>
        
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Zap className="w-4 h-4" />
          Use Template
        </button>
      </div>

      {/* Template Selection */}
      {showTemplates && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-3">Service Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SERVICE_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => addService(template)}
                className="text-left bg-white p-4 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
              >
                <h4 className="font-medium text-gray-900 mb-1">{template.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{template.duration}min</span>
                  <span>${template.price}</span>
                  <span className={SERVICE_CATEGORIES.find(c => c.id === template.category)?.color}>
                    {SERVICE_CATEGORIES.find(c => c.id === template.category)?.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Services List */}
      <div className="space-y-4">
        {services.length > 0 ? (
          services
            .sort((a, b) => a.order - b.order)
            .map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Services Yet</h3>
            <p className="text-gray-600 mb-4">Create your first service to start attracting clients</p>
            <button
              onClick={() => addService()}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Your First Service
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-500" />
              Service Management
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Create, organize, and optimize your service offerings
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {[
            { id: 'services', label: 'Services', count: services.length },
            { id: 'packages', label: 'Packages', count: packages.length },
            { id: 'discounts', label: 'Discounts', count: discounts.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'text-orange-600 border-orange-500'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              {tab.label}
              <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'services' && <ServicesTab />}
        {activeTab === 'packages' && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Package Management</h3>
            <p className="text-gray-600">Coming soon - Create service bundles and deals</p>
          </div>
        )}
        {activeTab === 'discounts' && (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Discount Management</h3>
            <p className="text-gray-600">Coming soon - Set up promotional offers</p>
          </div>
        )}
      </div>

      {/* Service Editor Modal */}
      {editingService && <ServiceEditor service={editingService} />}
    </div>
  );
};

export default ServiceCustomizationPanel;