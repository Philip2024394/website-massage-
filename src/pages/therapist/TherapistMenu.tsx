import React, { useState, useEffect, useRef } from 'react';
import { FloatingChatWindow } from '../../chat';
import { Therapist } from '../../types';
import { therapistMenusService } from '@lib/appwriteService';
import { showToast } from '../../utils/showToastPortal';
import { Plus, Trash2, Save, Menu as MenuIcon, CheckCircle2, Clock } from 'lucide-react';
import TherapistLayout from '../../components/therapist/TherapistLayout';

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
  onLogout?: () => void;
  language?: 'en' | 'id';
}

const TherapistMenu: React.FC<TherapistMenuProps> = ({ therapist, onNavigate, onLogout, language = 'id' }) => {
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

  const handleBackToStatus = () => {
    if (onNavigate) {
      onNavigate('therapist-status');
    }
  };

  const handleNavigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <TherapistLayout
      therapist={therapist}
      currentPage="custom-menu"
      onNavigate={handleNavigate}
      language={language}
      onLogout={onLogout}
    >
    <main className="bg-gray-50 pb-20">
      <div className="max-w-sm mx-auto bg-white shadow-sm">

        {/* Content Area */}
        <div className="px-8 py-6">
          <div className="flex items-center gap-2 mb-4">
              
              {/* Data Size Indicator */}
              {services.length > 0 && (() => {
                const validServices = services.filter(s => s.serviceName.trim());
                const dataSize = new Blob([JSON.stringify(validServices)]).size;
                const percentage = (dataSize / 50000) * 100;
                const isNearLimit = percentage > 80;
                const isOverLimit = dataSize > 50000;
                
                // Return empty since we removed the display
                return null;
              })()}
            </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Info Text about Min Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>💡 Tips:</strong> Kosongkan kotak "Min" jika Anda tidak ingin durasi tersebut muncul pada slider harga menu untuk pelanggan.
            </p>
          </div>

          {/* Comprehensive Help Section */}
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <MenuIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-orange-900 text-lg">Panduan Lengkap Menu Harga</h3>
                <p className="text-sm text-orange-700">Cara menggunakan sistem menu pricing</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Service Name Section */}
              <div className="bg-white/70 rounded-lg p-4 border border-orange-200">
                <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                  📝 Nama Layanan
                </h4>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li><strong>Contoh bagus:</strong> "Traditional Massage", "Relaxation Therapy", "Deep Tissue"</li>
                  <li><strong>Tips:</strong> Gunakan nama yang menarik dan profesional</li>
                  <li><strong>Variasi:</strong> Student Massage, Couple Massage, Office Massage, Foot Massage</li>
                  <li><strong>Jangan:</strong> Menggunakan nama yang membingungkan atau terlalu panjang</li>
                </ul>
              </div>

              {/* Duration & Min Box Section */}
              <div className="bg-white/70 rounded-lg p-4 border border-orange-200">
                <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                  ⏰ Kotak "Min" (Durasi Minimum)
                </h4>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li><strong>Jika diisi:</strong> Durasi ini akan muncul di slider harga untuk pelanggan</li>
                  <li><strong>Jika kosong:</strong> Durasi ini TIDAK akan ditampilkan ke pelanggan</li>
                  <li><strong>Contoh:</strong> Isi "60" untuk menampilkan opsi 60 menit</li>
                  <li><strong>Fleksibel:</strong> Bisa isi angka custom seperti 45, 75, 105 menit</li>
                  <li><strong>Strategy:</strong> Kosongkan durasi yang tidak Anda tawarkan</li>
                </ul>
              </div>

              {/* Pricing Strategy Section */}
              <div className="bg-white/70 rounded-lg p-4 border border-orange-200">
                <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                  💰 Strategi Harga (x1000)
                </h4>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li><strong>Format:</strong> Masukkan angka tanpa ribu (150 = Rp 150.000)</li>
                  <li><strong>60 menit:</strong> Biasanya 100-200 (Rp 100k-200k)</li>
                  <li><strong>90 menit:</strong> Biasanya 150-250 (Rp 150k-250k)</li>
                  <li><strong>120 menit:</strong> Biasanya 200-300 (Rp 200k-300k)</li>
                  <li><strong>💡 Tips:</strong> Buat harga progresif (60min {'<'} 90min {'<'} 120min)</li>
                </ul>
              </div>

              {/* Customer View Section */}
              <div className="bg-white/70 rounded-lg p-4 border border-orange-200">
                <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                  👁️ Yang Dilihat Pelanggan
                </h4>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li><strong>Slider harga:</strong> Hanya durasi yang diisi kotak "Min"</li>
                  <li><strong>Nama layanan:</strong> Ditampilkan sebagai opsi pilihan</li>
                  <li><strong>Harga final:</strong> Otomatis dikalikan 1000 (150 → Rp 150.000)</li>
                  <li><strong>Booking:</strong> Pelanggan pilih layanan + durasi + konfirmasi harga</li>
                </ul>
              </div>

              {/* Best Practices Section */}
              <div className="bg-white/70 rounded-lg p-4 border border-orange-200">
                <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                  🎯 Best Practices
                </h4>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li><strong>Minimal 1 layanan:</strong> Buat setidaknya satu layanan dengan harga</li>
                  <li><strong>Harga kompetitif:</strong> Riset harga terapis lain di area Anda</li>
                  <li><strong>Update berkala:</strong> Sesuaikan harga berdasarkan demand</li>
                  <li><strong>Variasi menarik:</strong> Buat nama layanan yang unik dan profesional</li>
                  <li><strong>Auto-save:</strong> Sistem menyimpan otomatis setiap 2 detik</li>
                  <li><strong>Limit data:</strong> Maksimal 50.000 karakter total</li>
                </ul>
              </div>

              {/* Example Section */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                  📚 Contoh Menu Sukses
                </h4>
                <div className="text-sm text-gray-700 space-y-2">
                  <div className="bg-white/70 p-3 rounded border">
                    <strong>Layanan:</strong> "Traditional Relaxation Massage"<br/>
                    <strong>60 min:</strong> Min=60, Harga=150 (Rp 150.000)<br/>
                    <strong>90 min:</strong> Min=90, Harga=200 (Rp 200.000)<br/>
                    <strong>120 min:</strong> Min=(kosong), Harga=(kosong) ← Tidak ditampilkan
                  </div>
                  <div className="bg-white/70 p-3 rounded border">
                    <strong>Layanan:</strong> "Student Special Massage"<br/>
                    <strong>60 min:</strong> Min=60, Harga=100 (Rp 100.000)<br/>
                    <strong>90 min:</strong> Min=(kosong) ← Tidak ditampilkan<br/>
                    <strong>120 min:</strong> Min=(kosong) ← Tidak ditampilkan
                  </div>
                </div>
              </div>

              {/* Troubleshooting Section */}
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                  🔧 Troubleshooting
                </h4>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li><strong>Tidak bisa save:</strong> Pastikan ada minimal 1 layanan dengan nama</li>
                  <li><strong>Data terlalu besar:</strong> Kurangi jumlah layanan atau perpendek nama</li>
                  <li><strong>Harga tidak muncul:</strong> Pastikan kotak "Min" terisi angka</li>
                  <li><strong>Auto-save gagal:</strong> Check koneksi internet dan coba manual save</li>
                  <li><strong>Pelanggan tidak lihat:</strong> Pastikan sudah klik "Simpan Menu"</li>
                </ul>
              </div>
            </div>
          </div>

          {/* All features available - no premium restriction */}
          <>
              {/* Services List - One Line Per Service */}
              <div className="space-y-3">
                {services.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Belum ada layanan. Klik "+ Tambah Layanan Baru" untuk memulai.
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
                        placeholder="Nama layanan"
                      />
                    </div>

                    {/* Duration Containers + Delete Button Row */}
                    <div className="flex items-start gap-1.5 horizontal-scroll-safe">
                      {/* 60 Minutes Container */}
                      <div className="flex-1 min-w-[80px]">
                        <div className="flex items-center justify-center gap-0.5 mb-1">
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
                                              className="w-12 border-2 border-orange-300 rounded px-1 py-0.5 text-xs font-bold text-center focus:border-orange-500 focus:outline-none bg-white"
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
                                            className="w-full border border-gray-300 rounded px-1.5 py-1.5 text-sm font-bold text-center focus:border-orange-500 focus:outline-none"
                                            placeholder="150"
                                            maxLength={3}
                                          />
                                          <div className="text-[9px] text-gray-500 text-center mt-0.5">×1000</div>
                                        </div>

                                        {/* 90 Minutes Container */}
                                        <div className="flex-1 min-w-[80px]">
                                          <div className="flex items-center justify-center gap-0.5 mb-1">
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
                                              className="w-12 border-2 border-orange-300 rounded px-1 py-0.5 text-xs font-bold text-center focus:border-orange-500 focus:outline-none bg-white"
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
                                            className="w-full border border-gray-300 rounded px-1.5 py-1.5 text-sm font-bold text-center focus:border-orange-500 focus:outline-none"
                                            placeholder="200"
                                            maxLength={3}
                                          />
                                          <div className="text-[9px] text-gray-500 text-center mt-0.5">×1000</div>
                                        </div>

                                        {/* 120 Minutes Container */}
                                        <div className="flex-1 min-w-[80px]">
                                          <div className="flex items-center justify-center gap-0.5 mb-1">
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
                                              className="w-12 border-2 border-orange-300 rounded px-1 py-0.5 text-xs font-bold text-center focus:border-orange-500 focus:outline-none bg-white"
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
                                            className="w-full border border-gray-300 rounded px-1.5 py-1.5 text-sm font-bold text-center focus:border-orange-500 focus:outline-none"
                                            placeholder="250"
                                            maxLength={3}
                                          />
                                          <div className="text-[9px] text-gray-500 text-center mt-0.5">×1000</div>
                                        </div>

                                        {/* Delete Button */}
                                        <button
                                          onClick={() => removeService(service.id)}
                                          className="flex-shrink-0 flex items-center justify-center p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
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
                                  Tambah Layanan Baru
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
                                      Menyimpan...
                                    </>
                                  ) : (
                                    <>
                                      <Save className="w-5 h-5" />
                                      Simpan Menu
                                    </>
                                  )}
                                </button>
              </>
          </div>
        </div>
      </main>
    </TherapistLayout>
    );
};

export default TherapistMenu;
