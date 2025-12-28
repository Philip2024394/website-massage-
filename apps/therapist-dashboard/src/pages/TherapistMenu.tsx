import React, { useState, useEffect, useRef } from 'react';
import { Therapist } from '../../../../types';
import { therapistMenusService } from '../../../../lib/appwriteService';
import { showToast } from '../../../../utils/showToastPortal';
import { Plus, Trash2, Save, Menu as MenuIcon, CheckCircle2, Home } from 'lucide-react';

interface MenuService {
  id: string;
  serviceName: string;
  min60?: string;  // Editable minimum for 60min duration
  price60: string;
  min90?: string;  // Editable minimum for 90min duration
  price90: string;
  min120?: string; // Editable minimum for 120min duration
  price120: string;
}

interface TherapistMenuProps {
  therapist: Therapist | null;
  onNavigate?: (page: string) => void;
}

const TherapistMenu: React.FC<TherapistMenuProps> = ({ therapist, onNavigate }) => {
  const [services, setServices] = useState<MenuService[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadMenu = async () => {
      if (!therapist) {
        console.log('⚠️ No therapist data available');
        return;
      }
      
      setLoading(true);
      try {
        const therapistId = String(therapist.$id || therapist.id);
        console.log('🔄 Loading menu for therapist:', therapistId);
        
        const menuDoc = await therapistMenusService.getByTherapistId(therapistId);
        console.log('📄 Menu document received:', menuDoc);
        
        if (menuDoc?.menuData) {
          const parsed = JSON.parse(menuDoc.menuData);
          console.log('✅ Parsed menu data:', parsed);
          setServices(parsed || []);
        } else {
          console.log('ℹ️ No existing menu found - starting fresh');
          setServices([]);
        }
      } catch (e) {
        console.error('❌ Failed to load menu:', e);
        if (e instanceof Error) {
          console.error('Error details:', e.message, e.stack);
        }
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, [therapist]);

  const addNewService = () => {
    const newService: MenuService = {
      id: Date.now().toString(),
      serviceName: '',
      min60: '60',
      price60: '',
      min90: '90',
      price90: '',
      min120: '120',
      price120: ''
    };
    setServices([...services, newService]);
  };

  const removeService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
    // Trigger auto-save after removing
    triggerAutoSave();
  };

  const updateService = (id: string, field: keyof MenuService, value: string) => {
    setServices(services.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
    // Trigger auto-save after updating
    triggerAutoSave();
  };

  // Auto-save function with debounce
  const triggerAutoSave = () => {
    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set status to saving after short delay
    autoSaveTimerRef.current = setTimeout(() => {
      performAutoSave();
    }, 2000); // Wait 2 seconds after last change
  };

  const performAutoSave = async () => {
    if (!therapist) return;

    // Filter valid services (must have a name)
    const validServices = services.filter(s => s.serviceName.trim());
    
    if (validServices.length === 0) return;

    const menuDataString = JSON.stringify(validServices);
    const dataSize = new Blob([menuDataString]).size;
    
    // Check if data exceeds Appwrite's 50000 character limit
    if (dataSize > 50000) {
      console.warn(`⚠️ Menu data too large: ${dataSize} bytes (limit: 50000)`);
      showToast(`⚠️ Menu too large (${dataSize}/50000 chars). Remove items or shorten names.`, 'error');
      setAutoSaveStatus('idle');
      return;
    }

    setAutoSaveStatus('saving');
    try {
      await therapistMenusService.saveMenu(
        String(therapist.$id || therapist.id),
        menuDataString
      );
      
      setAutoSaveStatus('saved');
      
      // Reset to idle after 2 seconds
      setTimeout(() => {
        setAutoSaveStatus('idle');
      }, 2000);
      
    } catch (error) {
      console.error('❌ Auto-save failed:', error);
      if (error instanceof Error && error.message.includes('50000 chars')) {
        showToast(`❌ Menu data exceeds 50000 character limit. Please remove some items.`, 'error');
      }
      setAutoSaveStatus('idle');
    }
  };

  const handleSave = async () => {
    if (!therapist) {
      showToast('❌ No therapist data found', 'error');
      console.error('❌ SAVE FAILED: No therapist data');
      return;
    }

    // Validate that all services have at least a name
    const validServices = services.filter(s => s.serviceName.trim());
    
    if (validServices.length === 0) {
      showToast('⚠️ Add at least one service with a name', 'error');
      console.error('❌ SAVE FAILED: No valid services (all services must have a name)');
      return;
    }

    const menuDataString = JSON.stringify(validServices);
    const dataSize = new Blob([menuDataString]).size;

    console.log('💾 SAVING MENU...');
    console.log('👤 Therapist ID:', therapist.$id || therapist.id);
    console.log('📋 Valid Services Count:', validServices.length);
    console.log('📊 Menu Data Size:', dataSize, 'bytes (limit: 50000)');
    console.log('📄 Menu Data:', menuDataString);

    // Check size limit before saving
    if (dataSize > 50000) {
      showToast(`❌ Menu too large: ${dataSize}/50000 characters. Remove ${Math.ceil((dataSize - 50000) / 100)} items or shorten names/prices.`, 'error');
      console.error(`❌ Data size ${dataSize} exceeds 50000 char limit`);
      return;
    }

    setSaving(true);
    try {
      const result = await therapistMenusService.saveMenu(
        String(therapist.$id || therapist.id),
        menuDataString
      );
      
      console.log('✅ SAVE SUCCESS! Result:', result);
      showToast(`✅ Menu saved! ${validServices.length} services (${dataSize}/50000 chars)`, 'success');
      
      // Update local state to reflect saved data
      setServices(validServices);
    } catch (error) {
      console.error('❌ SAVE FAILED! Error details:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      showToast(`❌ Failed to save menu: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  // All features now available for standard 30% commission plan
  const isPremium = true; // Always true - no premium restrictions

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-sm mx-auto bg-white min-h-screen shadow-sm">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MenuIcon className="w-6 h-6 text-orange-500" />
              <h2 className="text-gray-900 text-2xl font-bold">Therapist Menu</h2>
            </div>
            
            {/* Home Button */}
            {onNavigate && (
              <button
                onClick={() => onNavigate('status')}
                className="p-2 rounded-full hover:bg-orange-50 text-orange-500 transition-colors"
                title="Back to Status"
              >
                <Home className="w-6 h-6" />
              </button>
            )}
            
            {/* Auto-Save Status Indicator */}
            {autoSaveStatus !== 'idle' && (
              <div className="flex items-center gap-2">
                {autoSaveStatus === 'saving' && (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent"></div>
                    <span className="text-xs text-gray-600">Saving...</span>
                  </>
                )}
                {autoSaveStatus === 'saved' && (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">Saved!</span>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="mt-2 flex items-center gap-2">
              
              {/* Data Size Indicator */}
              {services.length > 0 && (() => {
                const validServices = services.filter(s => s.serviceName.trim());
                const dataSize = new Blob([JSON.stringify(validServices)]).size;
                const percentage = (dataSize / 50000) * 100;
                const isNearLimit = percentage > 80;
                const isOverLimit = dataSize > 50000;
                
                return (
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${
                    isOverLimit ? 'bg-red-100' : isNearLimit ? 'bg-yellow-100' : 'bg-green-100'
                  }`}>
                    <span className={`text-xs font-medium ${
                      isOverLimit ? 'text-red-700' : isNearLimit ? 'text-yellow-700' : 'text-green-700'
                    }`}>
                      📊 {dataSize}/50000 chars
                    </span>
                  </div>
                );
              })()}
            </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* All features available - no premium restriction */}
          <>
              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-blue-700 mb-2">
                  📋 <strong>Auto-Save Enabled:</strong> Your changes save automatically after 2 seconds. No need to click save!
                </p>
                <p className="text-xs text-gray-600">
                  💡 <strong>Tip:</strong> Leave price empty to hide that duration. Edit Min values to set custom minimum booking times.
                </p>
              </div>

              {/* Services List - One Line Per Service */}
              <div className="space-y-3">
                {services.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No services added yet. Click "+ Add New Service" to start.
                  </div>
                )}
                
                {services.map((service, index) => (
                  <div key={service.id} className="bg-white border-2 border-orange-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                    {/* Service Name - Full Width on Top */}
                    <div className="mb-3">
                      <input
                        type="text"
                        value={service.serviceName}
                        onChange={e => updateService(service.id, 'serviceName', e.target.value)}
                        className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold focus:border-orange-500 outline-none"
                        placeholder="Service name"
                      />
                    </div>

                    {/* Duration Containers + Delete Button Row */}
                    <div className="flex items-start gap-2">
                      {/* 60 Minutes Container */}
                      <div className="flex-1">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <span className="text-[10px] text-gray-600 font-semibold">Min:</span>
                          <input
                            type="text"
                            value={service.min60 || ''}
                            onChange={e => {
                              const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                              updateService(service.id, 'min60', value);
                            }}
                            onBlur={e => {
                              if (!e.target.value) {
                                updateService(service.id, 'min60', '60');
                              }
                            }}
                                              className="w-14 border-2 border-orange-300 rounded px-2 py-1 text-xs font-bold text-center focus:border-orange-500 focus:outline-none bg-white"
                                              placeholder="60"
                                              maxLength={3}
                                            />
                                            <span className="text-[10px] text-gray-600">min</span>
                                          </div>
                                          <input
                                            type="text"
                                            value={service.price60}
                                            onChange={e => {
                                              const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                                              updateService(service.id, 'price60', value);
                                            }}
                                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm font-bold text-center focus:border-orange-500 focus:outline-none"
                                            placeholder="150"
                                            maxLength={3}
                                          />
                                          <div className="text-[9px] text-gray-500 text-center mt-0.5">×1000</div>
                                        </div>

                                        {/* 90 Minutes Container */}
                                        <div className="flex-1">
                                          <div className="flex items-center justify-center gap-1 mb-1">
                                            <span className="text-[10px] text-gray-600 font-semibold">Min:</span>
                                            <input
                                              type="text"
                                              value={service.min90 || ''}
                                              onChange={e => {
                                                const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                                                updateService(service.id, 'min90', value);
                                              }}
                                              onBlur={e => {
                                                if (!e.target.value) {
                                                  updateService(service.id, 'min90', '90');
                                                }
                                              }}
                                              className="w-14 border-2 border-orange-300 rounded px-2 py-1 text-xs font-bold text-center focus:border-orange-500 focus:outline-none bg-white"
                                              placeholder="90"
                                              maxLength={3}
                                            />
                                            <span className="text-[10px] text-gray-600">min</span>
                                          </div>
                                          <input
                                            type="text"
                                            value={service.price90}
                                            onChange={e => {
                                              const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                                              updateService(service.id, 'price90', value);
                                            }}
                                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm font-bold text-center focus:border-orange-500 focus:outline-none"
                                            placeholder="200"
                                            maxLength={3}
                                          />
                                          <div className="text-[9px] text-gray-500 text-center mt-0.5">×1000</div>
                                        </div>

                                        {/* 120 Minutes Container */}
                                        <div className="flex-1">
                                          <div className="flex items-center justify-center gap-1 mb-1">
                                            <span className="text-[10px] text-gray-600 font-semibold">Min:</span>
                                            <input
                                              type="text"
                                              value={service.min120 || ''}
                                              onChange={e => {
                                                const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                                                updateService(service.id, 'min120', value);
                                              }}
                                              onBlur={e => {
                                                if (!e.target.value) {
                                                  updateService(service.id, 'min120', '120');
                                                }
                                              }}
                                              className="w-14 border-2 border-orange-300 rounded px-2 py-1 text-xs font-bold text-center focus:border-orange-500 focus:outline-none bg-white"
                                              placeholder="120"
                                              maxLength={3}
                                            />
                                            <span className="text-[10px] text-gray-600">min</span>
                                          </div>
                                          <input
                                            type="text"
                                            value={service.price120}
                                            onChange={e => {
                                              const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                                              updateService(service.id, 'price120', value);
                                            }}
                                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm font-bold text-center focus:border-orange-500 focus:outline-none"
                                            placeholder="250"
                                            maxLength={3}
                                          />
                                          <div className="text-[9px] text-gray-500 text-center mt-0.5">×1000</div>
                                        </div>

                                        {/* Delete Button */}
                                        <button
                                          onClick={() => removeService(service.id)}
                                          className="flex items-center justify-center p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                                          aria-label="Delete service"
                                        >
                                          <Trash2 className="w-5 h-5" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* Add Service Button */}
                                <button
                                  onClick={addNewService}
                                  className="w-full py-3 px-4 bg-white border-2 border-dashed border-orange-300 text-orange-600 rounded-xl font-semibold hover:bg-orange-50 flex items-center justify-center gap-2"
                                >
                                  <Plus className="w-5 h-5" />
                                  Add New Service
                                </button>

                                {/* Save Button */}
                                <button
                                  onClick={handleSave}
                                  disabled={saving}
                                  className={`w-full py-3 px-4 rounded-xl font-bold text-white mt-3 flex items-center justify-center gap-2 transition-all ${
                                    saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
                                  }`}
                                >
                                  {saving ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                      Saving...
                                    </>
                                  ) : (
                                    <>
                                      <Save className="w-5 h-5" />
                                      Save Menu
                                    </>
                                  )}
                                </button>
              </>
          </div>
        </div>
      </main>
    );
};

export default TherapistMenu;