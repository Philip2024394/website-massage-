/**
 * 🔒 CORE SYSTEM LOCK - THERAPIST MENU MANAGER
 * ============================================
 * 
 * 🔒 LOCKED CORE FUNCTIONALITY (DO NOT MODIFY):
 * - Default menu service display and integration logic
 * - Single active window slider behavior and state management
 * - Countdown timer functionality and auto-collapse triggers
 * - Badge system integration and dynamic assignment
 * - Live booking system integration with Appwrite backend
 * - Menu state persistence and session consistency
 * - Auto-hiding of default services when real items uploaded
 * - Service interaction patterns and UX flow
 * 
 * ✅ SAFE UI MODIFICATIONS:
 * - Colors, gradients, and visual styling of service cards
 * - Badge positioning, animations, and visual effects
 * - Dashboard notice styling and info box appearance
 * - Typography, spacing, and responsive layout
 * - Card hover effects and micro-interactions
 * - Loading states and transition animations
 * 
 * 🚨 BUSINESS IMPACT: REVENUE & UX CRITICAL
 * Protected functionality ensures:
 * - All therapist profiles have professional service offerings (50 unique services)
 * - Consistent booking experience across platform
 * - Dynamic badge system drives customer engagement
 * - Reliable slider behavior prevents UX confusion
 * - Live booking capability generates direct revenue
 * 
 * 🔒 PROTECTION LEVEL: MAXIMUM - CUSTOMER-FACING SYSTEM
 */

import React, { useState, useEffect } from 'react';
import ServiceBadges from '../badges/ServiceBadges';
import { useEnhancedMenuData } from '../../hooks/useEnhancedMenuData';
import { MenuService } from '../../services/enhancedMenuDataService';
import { Plus, Edit3, Save, X, Trash2, Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import '../../styles/badges.css';
import { logger } from '../../utils/logger';

// Simple rotate icon component to replace lucide-react import
const RotateCcw = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface TherapistMenuManagerProps {
  therapistId: string;
  onServiceChange?: (serviceCount: number) => void;
  showBadges?: boolean;
  allowEdit?: boolean;
  className?: string;
}

interface EditingService extends Partial<MenuService> {
  isEditing?: boolean;
  isNew?: boolean;
}

/**
 * 🎯 COMPREHENSIVE THERAPIST MENU MANAGER
 * Full CRUD operations for default and real menu services with badge integration
 */
const TherapistMenuManager: React.FC<TherapistMenuManagerProps> = ({
  therapistId,
  onServiceChange,
  showBadges = true,
  allowEdit = true,
  className = ''
}) => {
  const {
    menuData,
    hasDefaultMenu,
    hasRealMenu,
    totalServices,
    isLoading,
    error,
    badgeRefreshKey,
    refreshBadges,
    addService,
    updateService,
    deleteService,
    refreshMenu,
    clearDefaultAssignments,
    exportMenu,
    importMenu
  } = useEnhancedMenuData(therapistId);

  // Local state for editing
  const [editingServices, setEditingServices] = useState<Record<string, EditingService>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newService, setNewService] = useState<EditingService>({
    name: '',
    description: '',
    category: 'relaxation',
    price60: 150,
    price90: 200,
    price120: 280,
    isNew: true
  });
  const [importData, setImportData] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);

  // Notify parent of service count changes
  useEffect(() => {
    onServiceChange?.(totalServices);
  }, [totalServices, onServiceChange]);

  // Handle service editing
  const startEditing = (service: MenuService) => {
    setEditingServices(prev => ({
      ...prev,
      [service.id]: { ...service, isEditing: true }
    }));
  };

  const cancelEditing = (serviceId: string) => {
    setEditingServices(prev => {
      const updated = { ...prev };
      delete updated[serviceId];
      return updated;
    });
  };

  const saveEditing = async (serviceId: string) => {
    const editingService = editingServices[serviceId];
    if (!editingService) return;

    try {
      await updateService(serviceId, editingService);
      cancelEditing(serviceId);
    } catch (error) {
      logger.error('Failed to save service:', error);
    }
  };

  const updateEditingService = (serviceId: string, updates: Partial<MenuService>) => {
    setEditingServices(prev => ({
      ...prev,
      [serviceId]: { ...prev[serviceId], ...updates }
    }));
  };

  // Handle adding new service
  const handleAddService = async () => {
    if (!newService.name?.trim()) {
      alert('Service name is required');
      return;
    }

    try {
      await addService(newService);
      setNewService({
        name: '',
        description: '',
        category: 'relaxation',
        price60: 150,
        price90: 200,
        price120: 280,
        isNew: true
      });
      setShowAddForm(false);
    } catch (error) {
      logger.error('Failed to add service:', error);
    }
  };

  // Handle delete with confirmation
  const handleDeleteService = async (service: MenuService) => {
    const confirmMessage = service.isDefault 
      ? `Delete default service "${service.name}"? This will remove it from your menu.`
      : `Delete "${service.name}"? This action cannot be undone.`;

    if (window.confirm(confirmMessage)) {
      try {
        await deleteService(service.id);
      } catch (error) {
        logger.error('Failed to delete service:', error);
      }
    }
  };

  // Handle import
  const handleImport = () => {
    try {
      const success = importMenu(importData);
      if (success) {
        setImportData('');
        setShowImportDialog(false);
        alert('Menu imported successfully!');
      } else {
        alert('Failed to import menu. Please check the data format.');
      }
    } catch (error) {
      alert('Invalid import data format.');
    }
  };

  // Handle export
  const handleExport = () => {
    const exportedData = exportMenu();
    const blob = new Blob([exportedData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `therapist-${therapistId}-menu-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
          <div>
            <h3 className="text-red-800 font-semibold">Error Loading Menu</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button
              onClick={refreshMenu}
              className="mt-3 text-red-700 hover:text-red-800 text-sm underline"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Default Menu Notice - Show only when default menu exists but no real menu */}
      {hasDefaultMenu && !hasRealMenu && (
        <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">
                Default Menu Items Active
              </h3>
              <p className="text-sm text-blue-700 leading-relaxed">
                <strong>Note:</strong> If you haven't uploaded your own menu yet, we've added example services to your menu so users can book immediately. All example services are traditional massage types with service-focused names. These items are fully bookable using your existing prices (60, 90, 120 min). Once you upload your real services, the example items will automatically disappear.
              </p>
              <div className="mt-3 flex items-center text-xs text-blue-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                All default services are fully bookable now
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header with status and controls */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Menu Management
              {hasDefaultMenu && !hasRealMenu && (
                <span className="ml-3 text-lg text-blue-600 font-normal">
                  (Live Example Services Active)
                </span>
              )}
            </h2>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className={`flex items-center gap-2 ${hasRealMenu ? 'text-green-600' : 'text-gray-500'}`}>
                <CheckCircle className="w-4 h-4" />
                {hasRealMenu ? `${menuData.filter(s => !s.isDefault).length} Custom Services` : 'No Custom Services'}
              </span>
              <span className={`flex items-center gap-2 ${hasDefaultMenu ? 'text-blue-600' : 'text-gray-500'}`}>
                <AlertCircle className="w-4 h-4" />
                {hasDefaultMenu ? `${menuData.filter(s => s.isDefault).length} Live Example Services` : 'No Example Services'}
              </span>
              <span className="text-gray-600">
                Total: {totalServices} services {hasDefaultMenu && !hasRealMenu && '(All Bookable Now!)'}
              </span>
            </div>
            
            {hasDefaultMenu && !hasRealMenu && (
              <div className="mt-3 flex items-center text-sm text-blue-700 bg-blue-50 px-3 py-2 rounded-lg">
                <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>
                  Your example services are <strong>live and bookable</strong> now. 
                  Edit them below or add your own services to get started!
                </span>
              </div>
            )}
          </div>

          {allowEdit && (
            <div className="flex items-center gap-2">
              <button
                onClick={refreshBadges}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Refresh Badges"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                onClick={handleExport}
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                title="Export Menu"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowImportDialog(true)}
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                title="Import Menu"
              >
                <Upload className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Quick actions */}
        {allowEdit && (
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add New Service
            </button>
            
            {hasDefaultMenu && (
              <button
                onClick={clearDefaultAssignments}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                title="This will remove all example services and reset your default menu"
              >
                <RotateCcw className="w-4 h-4" />
                Clear Example Services
              </button>
            )}
            
            {hasDefaultMenu && !hasRealMenu && (
              <div className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                <span>
                  <strong>Tip:</strong> Edit any example service to make it your own, or add completely new services above.
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add new service form */}
      {showAddForm && allowEdit && (
        <div className="bg-white rounded-xl border-2 border-orange-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Service</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Name *
              </label>
              <input
                type="text"
                value={newService.name || ''}
                onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="e.g., Deep Tissue Massage"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={newService.description || ''}
                onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                rows={3}
                placeholder="Brief description of the service..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={newService.category || 'relaxation'}
                onChange={(e) => setNewService(prev => ({ ...prev, category: e.target.value as any }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="relaxation">Relaxation / Wellness</option>
                <option value="office_student">Office / Student</option>
                <option value="specialty">Specialty / Adventure</option>
                <option value="body_focus">Body Focus / Technique</option>
                <option value="quick_express">Quick / Express</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">60min Price</label>
                <input
                  type="number"
                  value={newService.price60 || 150}
                  onChange={(e) => setNewService(prev => ({ ...prev, price60: parseInt(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-center focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">90min Price</label>
                <input
                  type="number"
                  value={newService.price90 || 200}
                  onChange={(e) => setNewService(prev => ({ ...prev, price90: parseInt(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-center focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">120min Price</label>
                <input
                  type="number"
                  value={newService.price120 || 280}
                  onChange={(e) => setNewService(prev => ({ ...prev, price120: parseInt(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-center focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddService}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Add Service
            </button>
          </div>
        </div>
      )}

      {/* Services List */}
      <div className="space-y-4">
        {menuData.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
            <p className="text-gray-600 text-lg mb-4">No services found</p>
            {allowEdit && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors mx-auto"
              >
                <Plus className="w-5 h-5" />
                Add Your First Service
              </button>
            )}
          </div>
        ) : (
          menuData.map((service) => {
            const isEditing = editingServices[service.id]?.isEditing;
            const editingData = editingServices[service.id] || service;

            return (
              <div
                key={service.id}
                className={`relative bg-white rounded-xl border-2 p-6 transition-all ${
                  service.isDefault 
                    ? 'border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-lg hover:shadow-xl' 
                    : 'border-gray-200 hover:border-orange-300 hover:shadow-md'
                } hover:scale-[1.01] transform`}
              >
                {/* Service Badges */}
                {showBadges && (
                  <ServiceBadges
                    serviceId={service.id}
                    serviceName={service.name}
                    refreshKey={badgeRefreshKey}
                    animate={true}
                    maxBadges={2}
                    className="badge-container-top-right"
                  />
                )}

                {/* Service Header */}
                <div className="flex items-start justify-between mb-4 pr-16">
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editingData.name || ''}
                          onChange={(e) => updateEditingService(service.id, { name: e.target.value })}
                          className="text-xl font-bold bg-white border border-gray-300 rounded px-3 py-1 w-full focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                        <textarea
                          value={editingData.description || ''}
                          onChange={(e) => updateEditingService(service.id, { description: e.target.value })}
                          className="bg-white border border-gray-300 rounded px-3 py-2 w-full text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          rows={2}
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              {service.name}
                            </h3>
                            {service.isDefault && (
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs px-2.5 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-medium shadow-sm">
                                  🎯 Example / Default – Traditional Massage
                                </span>
                                <span className="text-xs text-blue-600 font-medium">
                                  Fully Bookable Now
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {service.description && (
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {service.description}
                          </p>
                        )}
                        
                        {service.isDefault && (
                          <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-xs text-blue-700">
                              💡 <strong>Live Example Service:</strong> This service uses your existing pricing structure. 
                              Customers can book this immediately. Edit or delete as needed – it will convert to your custom service.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  {allowEdit && (
                    <div className="flex items-center gap-2 ml-4">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => saveEditing(service.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Save Changes"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => cancelEditing(service.id)}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditing(service)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Service"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteService(service)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Service"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Pricing */}
                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-700">Pricing</h4>
                    {service.isDefault && (
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full font-medium">
                        Uses Your Base Prices
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {['60', '90', '120'].map((duration) => {
                      const priceKey = `price${duration}` as keyof typeof service;
                      const price = isEditing 
                        ? editingData[priceKey] 
                        : service[priceKey];

                      return (
                        <div 
                          key={duration} 
                          className={`text-center p-3 rounded-lg border ${
                            service.isDefault 
                              ? 'bg-blue-50 border-blue-200' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="text-sm font-medium text-gray-600 mb-1">
                            {duration} min
                          </div>
                          {isEditing ? (
                            <input
                              type="number"
                              value={Number(price) || 0}
                              onChange={(e) => updateEditingService(service.id, { 
                                [priceKey]: parseInt(e.target.value) 
                              })}
                              className="w-full text-center border border-gray-300 rounded px-2 py-1 text-sm font-bold focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                          ) : (
                            <div className={`text-sm font-bold ${
                              service.isDefault ? 'text-blue-600' : 'text-orange-600'
                            }`}>
                              Rp {((Number(price) || 0) * 1000).toLocaleString('id-ID')}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {service.isDefault && !isEditing && (
                    <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200 mt-3">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        <span className="font-medium">Ready for Booking:</span> 
                        Customers can book this service immediately using these prices.
                      </div>
                    </div>
                  )}
                </div>

                {/* Service Stats */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                  <span>Category: {service.category?.replace('_', ' ')}</span>
                  <span>Popularity: {'★'.repeat(service.popularity)}</span>
                  {service.bookingCount > 0 && <span>{service.bookingCount} bookings</span>}
                  {service.isDefault && <span>Auto-assigned default</span>}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Import Dialog */}
      {showImportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Import Menu Data</h3>
            </div>
            
            <div className="p-6">
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                rows={12}
                placeholder="Paste exported menu JSON data here..."
              />
            </div>
            
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowImportDialog(false);
                  setImportData('');
                }}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!importData.trim()}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistMenuManager;