/**
 * MoreCustomersPage - Comprehensive guide for therapists to increase bookings
 * 
 * @ts-expect-error - Temporary: lucide-react ForwardRefExoticComponent incompatible with React 19 types
 * This file works correctly at runtime. Type fix pending lucide-react or @types/react update.
 */
import React, { useState } from 'react';
import { 
  Users, Star, TrendingUp, Clock, Eye, DollarSign, Camera, Edit3, MessageCircle,
  ChevronRight, ChevronDown, CheckCircle, AlertCircle, Gift, Zap, Target, 
  Image, FileText, Phone, MapPin, Calendar, Heart, Award, Shield, Sparkles,
  Timer, Activity, BarChart3, PieChart, ThumbsUp, BookOpen, Lightbulb, Crown
} from 'lucide-react';
import TherapistPageHeader from '../../components/therapist/TherapistPageHeader';
import HelpTooltip from '../../components/therapist/HelpTooltip';
import { moreCustomersHelp } from './constants/helpContent';

interface MoreCustomersPageProps {
  therapist: any;
  onBack: () => void;
  language?: 'en' | 'id';
}

const MoreCustomersPage: React.FC<MoreCustomersPageProps> = ({ 
  therapist, 
  onBack,
  language = 'id' 
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('dashboard-features');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <TherapistPageHeader
        title="Therapist Dashboard"
        subtitle="Panduan Mendapat Lebih Banyak Pelanggan - Tips dan strategi komprehensif untuk meningkatkan booking dan pendapatan Anda"
        onBackToStatus={onBack}
        icon={<Users className="w-6 h-6 text-orange-600" />}
        actions={
          <HelpTooltip
            {...moreCustomersHelp.profileOptimization}
            position="left"
            size="md"
          />
        }
      />

      {/* Legacy Header - Hidden but kept for layout reference */}
      <div className="hidden bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={onBack}
            className="mb-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            ← Kembali
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2">Panduan Mendapat Lebih Banyak Pelanggan</h1>
              <p className="text-orange-100">
                Tips dan strategi komprehensif untuk meningkatkan booking dan pendapatan Anda
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        
        {/* Welcome and Introduction Section */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-green-800 mb-3">
                Halo Member! Selamat Datang di IndaStreet! 🎉
              </h2>
              <p className="text-green-700 mb-4 leading-relaxed">
                Senang sekali memiliki Anda sebagai member valid IndaStreet dan kami sangat antusias untuk berbagi pengetahuan mengenai booking atau tambahan booking.
              </p>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <p className="text-green-800 font-semibold mb-2">📈 Fakta Penting:</p>
                <p className="text-green-700">
                  Selalu ingat bahwa profil yang lengkap <span className="font-bold text-green-800">meningkatkan traffic hingga 80%</span> dibandingkan profil basic. Mari kita diskusikan perbedaannya agar Anda yakin profil Anda akan diperhatikan pengguna dan memiliki pilihan pijat yang menarik.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Photo Guidelines Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-500" />
            1. Foto Profil Profesional - Kunci Pertama Kesuksesan
          </h3>
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Tips Foto Profesional:
              </h4>
              <ul className="text-blue-700 space-y-2 ml-4">
                <li>• <strong>Cahaya alami:</strong> Gunakan cahaya siang hari di luar ruangan</li>
                <li>• <strong>Background natural:</strong> Setting pohon yang bagus, bunga, atau pemandangan bukit</li>
                <li>• <strong>Tanpa warna background:</strong> Hindari background berwarna-warni</li>
                <li>• <strong>Generasi muda:</strong> Saat ini mudah menambah background gambar untuk foto Anda</li>
                <li>• <strong>Koneksi personal:</strong> Pengguna suka melihat siapa yang mereka booking</li>
              </ul>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
              <p className="text-yellow-800">
                <strong>💡 Mengapa foto penting?</strong> Meluangkan sedikit waktu untuk foto yang baik akan sangat bermanfaat untuk akun Anda. Pelanggan ingin melihat siapa yang akan melayani mereka.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Strategy Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            2. Slider Harga - Strategi Pricing yang Efektif
          </h3>
          <div className="space-y-4">
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-green-800 mb-3">
                <strong>Memiliki slider price list adalah hal terpenting kedua</strong> untuk pengguna yang mencari layanan Anda. Dan jangan khawatir jika Anda hanya memiliki satu jenis pijat!
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Strategi Variasi Paket:
              </h4>
              <p className="text-purple-700 mb-3">
                Mari tingkatkan penawaran dengan menambahkan nama paket yang berbeda tapi untuk jenis pijat yang sama. Misalnya <strong>Traditional Massage</strong>:
              </p>
              <div className="grid gap-3">
                <div className="bg-white rounded-lg p-3 border border-purple-200">
                  <p className="text-purple-800 font-medium">💑 Couple Traditional Massage</p>
                  <p className="text-sm text-purple-600">Paket romantis untuk pasangan</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-purple-200">
                  <p className="text-purple-800 font-medium">🎓 Student Massage</p>
                  <p className="text-sm text-purple-600">Harga khusus untuk pelajar/mahasiswa</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-purple-200">
                  <p className="text-purple-800 font-medium">🏢 Office Massage</p>
                  <p className="text-sm text-purple-600">Layanan pijat untuk pekerja kantoran</p>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-400">
              <p className="text-orange-800">
                <strong>🎯 Pro Tip:</strong> Dengan slider harga Anda, tambahkan opsi dan harga untuk berbagai paket. Ini memberikan pelanggan lebih banyak pilihan dan meningkatkan nilai booking Anda.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats Overview */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-500" />
            Status Performa Anda Saat Ini
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <Eye className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">156</p>
              <p className="text-xs text-blue-700">Profile Views</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <Star className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">4.7</p>
              <p className="text-xs text-green-700">Rating</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <Calendar className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">23</p>
              <p className="text-xs text-purple-700">Booking Bulan Ini</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <Clock className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-600">45.5j</p>
              <p className="text-xs text-orange-700">Online Bulan Ini</p>
            </div>
          </div>
        </div>

        {/* Dashboard Features Importance */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <button
            onClick={() => toggleSection('dashboard-features')}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-orange-500" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-900">
                  Pentingnya Setiap Fitur Dashboard
                </h3>
                <p className="text-sm text-gray-600">
                  Memahami fungsi dan dampak setiap fitur untuk performa optimal
                </p>
              </div>
            </div>
            {expandedSection === 'dashboard-features' ? (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {expandedSection === 'dashboard-features' && (
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Camera className="w-5 h-5 text-blue-500" />
                    <h4 className="font-semibold text-gray-900">Foto Profil Profesional</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Meningkatkan kepercayaan pelanggan hingga 70%</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Foto wajah yang ramah dan profesional</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Cahaya yang bagus, latar belakang bersih</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span className="text-orange-600 font-medium">Hindari foto selfie atau foto grup</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="w-5 h-5 text-purple-500" />
                    <h4 className="font-semibold text-gray-900">Deskripsi yang Menarik</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Ceritakan pengalaman dan keahlian Anda</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Sebutkan sertifikat atau pelatihan yang dimiliki</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Gunakan bahasa yang hangat dan profesional</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span className="text-orange-600 font-medium">Min 100 kata, maksimal 300 kata</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="w-5 h-5 text-green-500" />
                    <h4 className="font-semibold text-gray-900">Status Online Konsisten</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Minimal 8 jam per hari online</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Update status secara real-time</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Meningkatkan ranking di hasil pencarian</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-red-600 font-medium">Online &lt; 6 jam = ranking turun drastis</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <MessageCircle className="w-5 h-5 text-blue-500" />
                    <h4 className="font-semibold text-gray-900">Response Rate Cepat</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Balas pesan dalam 10 menit</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Terima/tolak booking dalam 5 menit</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Rate 95%+ = prioritas tinggi di pencarian</span>
                    </li>
                  </ul>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* Menu Strategy */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <button
            onClick={() => toggleSection('menu-strategy')}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-purple-500" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-900">
                  Strategi Menu & Harga yang Menarik Pelanggan
                </h3>
                <p className="text-sm text-gray-600">
                  Cara menciptakan variasi menu dari satu jenis massage
                </p>
              </div>
            </div>
            {expandedSection === 'menu-strategy' ? (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {expandedSection === 'menu-strategy' && (
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              
              {/* Psychology of Choice */}
              <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-blue-500" />
                  <h4 className="font-bold text-blue-900">Psikologi Pilihan Pelanggan</h4>
                </div>
                <p className="text-sm text-blue-800 mb-3">
                  <strong>Fakta:</strong> Pelanggan lebih suka memilih daripada hanya ada 1 opsi. 
                  Dengan memberikan variasi nama untuk massage yang sama, Anda menciptakan persepsi nilai lebih.
                </p>
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <Crown className="w-4 h-4" />
                  <span className="font-medium">Strategi ini digunakan restoran dan spa premium!</span>
                </div>
              </div>

              {/* Menu Examples */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Traditional Menu */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Heart className="w-5 h-5 text-red-500" />
                    <h4 className="font-bold text-gray-900">Menu Tradisional</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Traditional Massage</p>
                        <p className="text-xs text-gray-600">Teknik pijat tradisional Indonesia</p>
                      </div>
                      <span className="text-orange-600 font-bold">Rp 120k</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Balinese Massage</p>
                        <p className="text-xs text-gray-600">Relaksasi dengan aroma terapi</p>
                      </div>
                      <span className="text-orange-600 font-bold">Rp 135k</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Deep Tissue Massage</p>
                        <p className="text-xs text-gray-600">Untuk otot tegang dan stress</p>
                      </div>
                      <span className="text-orange-600 font-bold">Rp 150k</span>
                    </div>
                  </div>
                </div>

                {/* Specialty Menu */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <h4 className="font-bold text-gray-900">Menu Spesialisasi</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Student Massage</p>
                        <p className="text-xs text-gray-600">Harga khusus pelajar (60 menit)</p>
                      </div>
                      <span className="text-green-600 font-bold">Rp 80k</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Couple Massage</p>
                        <p className="text-xs text-gray-600">Untuk 2 orang bersamaan</p>
                      </div>
                      <span className="text-orange-600 font-bold">Rp 200k</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Office Massage</p>
                        <p className="text-xs text-gray-600">Khusus untuk karyawan kantor</p>
                      </div>
                      <span className="text-orange-600 font-bold">Rp 160k</span>
                    </div>
                  </div>
                </div>

                {/* Targeted Menu */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-blue-500" />
                    <h4 className="font-bold text-gray-900">Menu Target Specific</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Foot Massage</p>
                        <p className="text-xs text-gray-600">Fokus kaki dan betis (45 menit)</p>
                      </div>
                      <span className="text-orange-600 font-bold">Rp 90k</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Back Massage</p>
                        <p className="text-xs text-gray-600">Khusus punggung dan bahu (45 menit)</p>
                      </div>
                      <span className="text-orange-600 font-bold">Rp 95k</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Head & Neck Massage</p>
                        <p className="text-xs text-gray-600">Hilangkan sakit kepala (30 menit)</p>
                      </div>
                      <span className="text-orange-600 font-bold">Rp 70k</span>
                    </div>
                  </div>
                </div>

                {/* Premium Menu */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Crown className="w-5 h-5 text-purple-500" />
                    <h4 className="font-bold text-gray-900">Menu Premium</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Royal Treatment</p>
                        <p className="text-xs text-gray-600">Full body + aromaterapi (120 menit)</p>
                      </div>
                      <span className="text-purple-600 font-bold">Rp 250k</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Executive Package</p>
                        <p className="text-xs text-gray-600">Untuk eksekutif sibuk (90 menit)</p>
                      </div>
                      <span className="text-purple-600 font-bold">Rp 200k</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Luxury Spa Experience</p>
                        <p className="text-xs text-gray-600">All inclusive dengan music (150 menit)</p>
                      </div>
                      <span className="text-purple-600 font-bold">Rp 350k</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Menu Strategy Tips */}
              <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Tips Sukses Menu Strategy
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-green-800">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600">1.</span>
                    <span>Buat deskripsi yang spesifik untuk setiap menu</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600">2.</span>
                    <span>Variasikan harga untuk menciptakan opsi budget</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600">3.</span>
                    <span>Target audience yang berbeda (student, couple, office)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600">4.</span>
                    <span>Update menu berdasarkan demand customer</span>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Pricing & Discount Strategy */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <button
            onClick={() => toggleSection('pricing-strategy')}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-900">
                  Strategi Harga & Diskon Pintar
                </h3>
                <p className="text-sm text-gray-600">
                  Kapan turunkan harga, kapan beri diskon, dan cara analisa traffic
                </p>
              </div>
            </div>
            {expandedSection === 'pricing-strategy' ? (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {expandedSection === 'pricing-strategy' && (
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              
              {/* Traffic Analysis */}
              <div className="mb-6 bg-white rounded-xl p-5 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  Analisa Traffic untuk Keputusan Harga
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="font-medium text-red-700">Traffic Rendah</span>
                    </div>
                    <p className="text-xs text-red-600 mb-3">&lt; 50 views per minggu</p>
                    <div className="space-y-2 text-xs text-red-700">
                      <p>• Turunkan harga 10-20%</p>
                      <p>• Aktifkan promosi diskon</p>
                      <p>• Update foto profil</p>
                      <p>• Perbaiki deskripsi</p>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium text-yellow-700">Traffic Normal</span>
                    </div>
                    <p className="text-xs text-yellow-600 mb-3">50-150 views per minggu</p>
                    <div className="space-y-2 text-xs text-yellow-700">
                      <p>• Pertahankan harga current</p>
                      <p>• Monitor conversion rate</p>
                      <p>• Test A/B menu baru</p>
                      <p>• Fokus service quality</p>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="font-medium text-green-700">Traffic Tinggi</span>
                    </div>
                    <p className="text-xs text-green-600 mb-3">&gt; 150 views per minggu</p>
                    <div className="space-y-2 text-xs text-green-700">
                      <p>• Naikkan harga 5-15%</p>
                      <p>• Tambahkan menu premium</p>
                      <p>• Focus on quality clients</p>
                      <p>• Build waiting list</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-blue-800 font-medium mb-2">
                    💡 <strong>Pro Tip:</strong> Gunakan data traffic di dashboard untuk keputusan pricing
                  </p>
                  <p className="text-xs text-blue-700">
                    Traffic naik tapi booking turun? Harga terlalu tinggi. Traffic rendah? Harga mungkin terlalu tinggi atau profil kurang menarik.
                  </p>
                </div>
              </div>

              {/* Discount Strategy */}
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-purple-500" />
                  Strategi Diskon Efektif
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-800 mb-3">Kapan Memberikan Diskon:</h5>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-red-700">Traffic Turun &gt; 30%</p>
                          <p className="text-xs text-red-600">Beri diskon 15-25% untuk menarik kembali customer</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <Clock className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-orange-700">Jam Sepi (10-14, 20-22)</p>
                          <p className="text-xs text-orange-600">Diskon 10% untuk jam-jam tidak peak</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <Calendar className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-blue-700">Weekday Promotion</p>
                          <p className="text-xs text-blue-600">Senin-Kamis diskon 15% karena demand rendah</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-800 mb-3">Jenis Diskon yang Efektif:</h5>
                    <div className="space-y-3">
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm font-medium text-green-700 mb-1">First Timer Discount</p>
                        <p className="text-xs text-green-600">20% untuk customer baru - builds database</p>
                      </div>
                      
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-sm font-medium text-purple-700 mb-1">Bundle Package</p>
                        <p className="text-xs text-purple-600">3 session = harga 2.5 session - customer retention</p>
                      </div>
                      
                      <div className="p-3 bg-pink-50 rounded-lg border border-pink-200">
                        <p className="text-sm font-medium text-pink-700 mb-1">Referral Bonus</p>
                        <p className="text-xs text-pink-600">Diskon 25% jika refer teman - organic marketing</p>
                      </div>
                      
                      <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                        <p className="text-sm font-medium text-indigo-700 mb-1">Loyalty Program</p>
                        <p className="text-xs text-indigo-600">Booking ke-5 gratis - builds repeat customers</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Timing & Availability Strategy */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <button
            onClick={() => toggleSection('timing-strategy')}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Timer className="w-5 h-5 text-indigo-500" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-900">
                  Master Timing & Ketersediaan
                </h3>
                <p className="text-sm text-gray-600">
                  Strategi waktu online optimal dan busy time analysis
                </p>
              </div>
            </div>
            {expandedSection === 'timing-strategy' ? (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {expandedSection === 'timing-strategy' && (
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              
              {/* 8 Hours Rule */}
              <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-5 border-l-4 border-red-500">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                  <h4 className="font-bold text-red-900">WAJIB: Minimal 8 Jam Online Per Hari</h4>
                </div>
                <div className="text-sm text-red-800 space-y-2">
                  <p>• <strong>Algoritma sistem</strong> akan menurunkan ranking Anda jika online &lt; 6 jam per hari</p>
                  <p>• <strong>Customer expectation:</strong> Therapist yang konsisten online dianggap lebih profesional</p>
                  <p>• <strong>Income opportunity:</strong> 8 jam online = 2-4x lebih banyak booking</p>
                  <p>• <strong>Competition advantage:</strong> Therapist online 8+ jam selalu ranking atas</p>
                </div>
              </div>

              {/* Peak Hours Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-5 border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-500" />
                    Peak Hours (Jam Sibuk)
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div>
                        <p className="font-medium text-green-900">18:00 - 22:00</p>
                        <p className="text-xs text-green-700">After work hours</p>
                      </div>
                      <div className="text-right">
                        <span className="text-green-600 font-bold text-sm">Peak 🔥</span>
                        <p className="text-xs text-green-600">40% total booking</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div>
                        <p className="font-medium text-blue-900">14:00 - 17:00</p>
                        <p className="text-xs text-blue-700">Afternoon session</p>
                      </div>
                      <div className="text-right">
                        <span className="text-blue-600 font-bold text-sm">High 📈</span>
                        <p className="text-xs text-blue-600">25% total booking</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div>
                        <p className="font-medium text-purple-900">09:00 - 12:00</p>
                        <p className="text-xs text-purple-700">Weekend mornings</p>
                      </div>
                      <div className="text-right">
                        <span className="text-purple-600 font-bold text-sm">Weekend 🌅</span>
                        <p className="text-xs text-purple-600">20% weekend booking</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-xs text-yellow-700">
                      <strong>💡 Strategy:</strong> Pastikan Anda online dan available di jam-jam peak ini!
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    Low Traffic Hours
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <p className="font-medium text-gray-700">06:00 - 09:00</p>
                        <p className="text-xs text-gray-600">Early morning</p>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-500 font-bold text-sm">Low 📉</span>
                        <p className="text-xs text-gray-500">5% total booking</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <p className="font-medium text-gray-700">10:00 - 14:00</p>
                        <p className="text-xs text-gray-600">Weekday lunch time</p>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-500 font-bold text-sm">Low 📉</span>
                        <p className="text-xs text-gray-500">8% weekday booking</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <p className="font-medium text-gray-700">22:00 - 24:00</p>
                        <p className="text-xs text-gray-600">Late night</p>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-500 font-bold text-sm">Very Low 📉</span>
                        <p className="text-xs text-gray-500">2% total booking</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-xs text-orange-700">
                      <strong>💡 Opportunity:</strong> Berikan diskon 10-15% untuk jam-jam low traffic ini
                    </p>
                  </div>
                </div>
              </div>

              {/* Optimal Schedule Strategy */}
              <div className="mt-6 bg-white rounded-xl p-5 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Strategi Jadwal Optimal
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-gray-800 mb-3">Weekday Schedule (Sen-Jum):</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between p-2 bg-green-50 rounded">
                        <span>09:00 - 12:00</span>
                        <span className="text-green-600 font-medium">Available</span>
                      </div>
                      <div className="flex justify-between p-2 bg-red-50 rounded">
                        <span>12:00 - 14:00</span>
                        <span className="text-red-600 font-medium">Break</span>
                      </div>
                      <div className="flex justify-between p-2 bg-green-50 rounded">
                        <span>14:00 - 22:00</span>
                        <span className="text-green-600 font-medium">Available</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">Total: 10 jam online per hari</p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-800 mb-3">Weekend Schedule (Sab-Min):</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between p-2 bg-green-50 rounded">
                        <span>08:00 - 13:00</span>
                        <span className="text-green-600 font-medium">Available</span>
                      </div>
                      <div className="flex justify-between p-2 bg-red-50 rounded">
                        <span>13:00 - 15:00</span>
                        <span className="text-red-600 font-medium">Break</span>
                      </div>
                      <div className="flex justify-between p-2 bg-green-50 rounded">
                        <span>15:00 - 21:00</span>
                        <span className="text-green-600 font-medium">Available</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">Total: 11 jam online per hari</p>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* General Knowledge & Tips */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <button
            onClick={() => toggleSection('general-tips')}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-900">
                  Tips Umum Menarik Lebih Banyak Customer
                </h3>
                <p className="text-sm text-gray-600">
                  Knowledge praktis untuk meningkatkan booking dan customer retention
                </p>
              </div>
            </div>
            {expandedSection === 'general-tips' ? (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {expandedSection === 'general-tips' && (
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* Customer Service Excellence */}
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="w-5 h-5 text-red-500" />
                    <h4 className="font-bold text-gray-900">Customer Service</h4>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>• Balas chat dalam max 10 menit</p>
                    <p>• Konfirmasi booking dalam 5 menit</p>
                    <p>• Kirim reminder H-1 sebelum session</p>
                    <p>• Follow up setelah treatment</p>
                    <p>• Tanyakan feedback dan rating</p>
                  </div>
                </div>

                {/* Professional Appearance */}
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-5 h-5 text-blue-500" />
                    <h4 className="font-bold text-gray-900">Professional Image</h4>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>• Foto profil berkualitas tinggi</p>
                    <p>• Deskripsi lengkap dan menarik</p>
                    <p>• Tampilkan sertifikat/awards</p>
                    <p>• Update status secara konsisten</p>
                    <p>• Bahasa yang profesional tapi hangat</p>
                  </div>
                </div>

                {/* Social Proof */}
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <ThumbsUp className="w-5 h-5 text-green-500" />
                    <h4 className="font-bold text-gray-900">Social Proof</h4>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>• Minta review positif dari customer</p>
                    <p>• Screenshot testimonial WA</p>
                    <p>• Share success stories (permission)</p>
                    <p>• Display rating dan jumlah customer</p>
                    <p>• Join komunitas therapist</p>
                  </div>
                </div>

                {/* Location Strategy */}
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-purple-500" />
                    <h4 className="font-bold text-gray-900">Location Strategy</h4>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>• Target area dengan daya beli tinggi</p>
                    <p>• Dekat dengan hotel, apartment</p>
                    <p>• Area bisnis dan perkantoran</p>
                    <p>• Mudah akses transportasi</p>
                    <p>• Consider travel time dalam pricing</p>
                  </div>
                </div>

                {/* Upselling Techniques */}
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                    <h4 className="font-bold text-gray-900">Upselling Tips</h4>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>• Tawarkan extended time (+30 min)</p>
                    <p>• Add-on services (aromatherapy)</p>
                    <p>• Package deals (3x session)</p>
                    <p>• Couple treatment upgrade</p>
                    <p>• Special occasion pricing</p>
                  </div>
                </div>

                {/* Retention Strategy */}
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-5 h-5 text-indigo-500" />
                    <h4 className="font-bold text-gray-900">Customer Retention</h4>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>• Loyalty program (5th session free)</p>
                    <p>• Birthday discount special</p>
                    <p>• Regular customer priority booking</p>
                    <p>• Personal touch (remember preferences)</p>
                    <p>• Seasonal promotion exclusive</p>
                  </div>
                </div>

              </div>

              {/* Success Metrics */}
              <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-200">
                <h4 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Target Metrics untuk Success
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-white rounded-lg p-3 border border-indigo-200">
                    <p className="text-2xl font-bold text-indigo-600">95%+</p>
                    <p className="text-xs text-indigo-700">Response Rate</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-indigo-200">
                    <p className="text-2xl font-bold text-indigo-600">4.5+</p>
                    <p className="text-xs text-indigo-700">Average Rating</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-indigo-200">
                    <p className="text-2xl font-bold text-indigo-600">8+j</p>
                    <p className="text-xs text-indigo-700">Online per Hari</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-indigo-200">
                    <p className="text-2xl font-bold text-indigo-600">30+</p>
                    <p className="text-xs text-indigo-700">Booking per Bulan</p>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Action Plan */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl text-white p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold">Action Plan - Mulai Hari Ini!</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-bold mb-2">Days 1-2: Foundation</h4>
              <ul className="space-y-1 text-sm text-orange-100">
                <li>✓ Update foto profil profesional</li>
                <li>✓ Tulis deskripsi lengkap 200+ kata</li>
                <li>✓ Set jadwal online 8+ jam per hari</li>
                <li>✓ Buat 5-6 variasi menu massage</li>
              </ul>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-bold mb-2">Days 3-4: Optimization</h4>
              <ul className="space-y-1 text-sm text-orange-100">
                <li>✓ Monitor traffic dan adjust pricing</li>
                <li>✓ Setup discount strategy</li>
                <li>✓ Implement customer retention program</li>
                <li>✓ Focus pada peak hours availability</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-white/10 rounded-lg">
            <p className="text-sm text-orange-100">
              <strong>💪 Komitment:</strong> Ikuti panduan ini secara konsisten selama 1 bulan, 
              dan Anda akan melihat peningkatan 50-200% dalam jumlah booking!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MoreCustomersPage;