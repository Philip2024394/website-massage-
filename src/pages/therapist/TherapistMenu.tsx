import React, { useState, useEffect, useRef } from 'react';
import { FloatingChatWindow } from '../../chat';
import { Therapist } from '../../types';
import { therapistMenusService } from '../../lib/appwriteService';
import { showToast } from '../../utils/showToastPortal';
import { Plus, Trash2, Save, Menu as MenuIcon, CheckCircle2, Clock, ChevronDown, ChevronRight, FileText, DollarSign, Eye, Target, BookOpen, Wrench } from 'lucide-react';
import TherapistLayout from '../../components/therapist/TherapistLayout';
import HelpTooltip from '../../components/therapist/HelpTooltip';
import { menuHelp } from './constants/helpContent';

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
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const toggleGuideSection = (section: string) => {
    setExpandedGuide(expandedGuide === section ? null : section);
  };

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
        <div className="p-4 sm:p-6 space-y-4">
          {/* Page Header */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <MenuIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Panduan Lengkap Menu Harga</h2>
                <p className="text-sm text-gray-500">Cara menggunakan sistem menu pricing</p>
              </div>
            </div>
          </div>

          {/* Collapsible Guide Sections */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            
            {/* Section 1: Nama Layanan */}
            <div className="border-b border-gray-100">
              <button
                onClick={() => toggleGuideSection('nama-layanan')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="font-semibold text-gray-800">Nama Layanan</span>
                </div>
                {expandedGuide === 'nama-layanan' ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {expandedGuide === 'nama-layanan' && (
                <div className="px-4 pb-4 bg-gray-50">
                  <ul className="text-sm text-gray-700 space-y-2 ml-11">
                    <li><span className="font-semibold text-gray-900">Contoh bagus:</span> "Traditional Massage", "Relaxation Therapy", "Deep Tissue"</li>
                    <li><span className="font-semibold text-gray-900">Tips:</span> Gunakan nama yang menarik dan profesional</li>
                    <li><span className="font-semibold text-gray-900">Variasi:</span> Student Massage, Couple Massage, Office Massage, Foot Massage</li>
                    <li><span className="font-semibold text-gray-900">Jangan:</span> Menggunakan nama yang membingungkan atau terlalu panjang</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Section 2: Kotak Min */}
            <div className="border-b border-gray-100">
              <button
                onClick={() => toggleGuideSection('kotak-min')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="font-semibold text-gray-800">Kotak "Min" (Durasi Minimum)</span>
                </div>
                {expandedGuide === 'kotak-min' ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {expandedGuide === 'kotak-min' && (
                <div className="px-4 pb-4 bg-gray-50">
                  <ul className="text-sm text-gray-700 space-y-2 ml-11">
                    <li><span className="font-semibold text-gray-900">Jika diisi:</span> Durasi ini akan muncul di slider harga untuk pelanggan</li>
                    <li><span className="font-semibold text-gray-900">Jika kosong:</span> Durasi ini TIDAK akan ditampilkan ke pelanggan</li>
                    <li><span className="font-semibold text-gray-900">Contoh:</span> Isi "60" untuk menampilkan opsi 60 menit</li>
                    <li><span className="font-semibold text-gray-900">Fleksibel:</span> Bisa isi angka custom seperti 45, 75, 105 menit</li>
                    <li><span className="font-semibold text-gray-900">Strategy:</span> Kosongkan durasi yang tidak Anda tawarkan</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Section 3: Strategi Harga */}
            <div className="border-b border-gray-100">
              <button
                onClick={() => toggleGuideSection('strategi-harga')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="font-semibold text-gray-800">Strategi Harga (x1000)</span>
                </div>
                {expandedGuide === 'strategi-harga' ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {expandedGuide === 'strategi-harga' && (
                <div className="px-4 pb-4 bg-gray-50">
                  <ul className="text-sm text-gray-700 space-y-2 ml-11">
                    <li><span className="font-semibold text-gray-900">Format:</span> Masukkan angka tanpa ribu (150 = Rp 150.000)</li>
                    <li><span className="font-semibold text-gray-900">60 menit:</span> Biasanya 100-200 (Rp 100k-200k)</li>
                    <li><span className="font-semibold text-gray-900">90 menit:</span> Biasanya 150-250 (Rp 150k-250k)</li>
                    <li><span className="font-semibold text-gray-900">120 menit:</span> Biasanya 200-300 (Rp 200k-300k)</li>
                    <li className="text-orange-600 font-medium">💡 Tips: Buat harga progresif (60min {'<'} 90min {'<'} 120min)</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Section 4: Yang Dilihat Pelanggan */}
            <div className="border-b border-gray-100">
              <button
                onClick={() => toggleGuideSection('customer-view')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="font-semibold text-gray-800">Yang Dilihat Pelanggan</span>
                </div>
                {expandedGuide === 'customer-view' ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {expandedGuide === 'customer-view' && (
                <div className="px-4 pb-4 bg-gray-50">
                  <ul className="text-sm text-gray-700 space-y-2 ml-11">
                    <li><span className="font-semibold text-gray-900">Slider harga:</span> Hanya durasi yang diisi kotak "Min"</li>
                    <li><span className="font-semibold text-gray-900">Nama layanan:</span> Ditampilkan sebagai opsi pilihan</li>
                    <li><span className="font-semibold text-gray-900">Harga final:</span> Otomatis dikalikan 1000 (150 → Rp 150.000)</li>
                    <li><span className="font-semibold text-gray-900">Booking:</span> Pelanggan pilih layanan + durasi + konfirmasi harga</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Section 5: Best Practices */}
            <div className="border-b border-gray-100">
              <button
                onClick={() => toggleGuideSection('best-practices')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="font-semibold text-gray-800">Best Practices</span>
                </div>
                {expandedGuide === 'best-practices' ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {expandedGuide === 'best-practices' && (
                <div className="px-4 pb-4 bg-gray-50">
                  <ul className="text-sm text-gray-700 space-y-2 ml-11">
                    <li><span className="font-semibold text-gray-900">Minimal 1 layanan:</span> Buat setidaknya satu layanan dengan harga</li>
                    <li><span className="font-semibold text-gray-900">Harga kompetitif:</span> Riset harga terapis lain di area Anda</li>
                    <li><span className="font-semibold text-gray-900">Update berkala:</span> Sesuaikan harga berdasarkan demand</li>
                    <li><span className="font-semibold text-gray-900">Variasi menarik:</span> Buat nama layanan yang unik dan profesional</li>
                    <li><span className="font-semibold text-gray-900">Auto-save:</span> Sistem menyimpan otomatis setiap 2 detik</li>
                    <li><span className="font-semibold text-gray-900">Limit data:</span> Maksimal 50.000 karakter total</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Section 6: Contoh Menu Sukses */}
            <div className="border-b border-gray-100">
              <button
                onClick={() => toggleGuideSection('contoh-menu')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="font-semibold text-gray-800">Contoh Menu Sukses</span>
                </div>
                {expandedGuide === 'contoh-menu' ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {expandedGuide === 'contoh-menu' && (
                <div className="px-4 pb-4 bg-gray-50">
                  <div className="space-y-3 ml-11">
                    <div className="bg-white p-3 rounded-lg border border-gray-200 text-sm">
                      <p className="font-semibold text-gray-900 mb-1">"Traditional Relaxation Massage"</p>
                      <p className="text-gray-600">60 min: Min=60, Harga=150 (Rp 150.000)</p>
                      <p className="text-gray-600">90 min: Min=90, Harga=200 (Rp 200.000)</p>
                      <p className="text-gray-400 italic">120 min: Min=(kosong) ← Tidak ditampilkan</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200 text-sm">
                      <p className="font-semibold text-gray-900 mb-1">"Student Special Massage"</p>
                      <p className="text-gray-600">60 min: Min=60, Harga=100 (Rp 100.000)</p>
                      <p className="text-gray-400 italic">90 min: Min=(kosong) ← Tidak ditampilkan</p>
                      <p className="text-gray-400 italic">120 min: Min=(kosong) ← Tidak ditampilkan</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 7: Troubleshooting */}
            <div>
              <button
                onClick={() => toggleGuideSection('troubleshooting')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Wrench className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="font-semibold text-gray-800">Troubleshooting</span>
                </div>
                {expandedGuide === 'troubleshooting' ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {expandedGuide === 'troubleshooting' && (
                <div className="px-4 pb-4 bg-gray-50">
                  <ul className="text-sm text-gray-700 space-y-2 ml-11">
                    <li><span className="font-semibold text-gray-900">Tidak bisa save:</span> Pastikan ada minimal 1 layanan dengan nama</li>
                    <li><span className="font-semibold text-gray-900">Data terlalu besar:</span> Kurangi jumlah layanan atau perpendek nama</li>
                    <li><span className="font-semibold text-gray-900">Harga tidak muncul:</span> Pastikan kotak "Min" terisi angka</li>
                    <li><span className="font-semibold text-gray-900">Auto-save gagal:</span> Check koneksi internet dan coba manual save</li>
                    <li><span className="font-semibold text-gray-900">Pelanggan tidak lihat:</span> Pastikan sudah klik "Simpan Menu"</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Tips Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>💡 Tips:</strong> Kosongkan kotak "Min" jika Anda tidak ingin durasi tersebut muncul pada slider harga menu untuk pelanggan.
            </p>
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
