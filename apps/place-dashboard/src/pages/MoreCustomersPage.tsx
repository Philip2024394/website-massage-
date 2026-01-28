// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState } from 'react';
import { 
  Users, Star, TrendingUp, Clock, Eye, DollarSign, Camera, Edit3, MessageCircle,
  ChevronRight, ChevronDown, CheckCircle, AlertCircle, Gift, Zap, Target, 
  Image, FileText, Phone, MapPin, Calendar, Heart, Award, Shield, Sparkles,
  Timer, Activity, BarChart3, PieChart, ThumbsUp, BookOpen, Lightbulb, Crown
} from 'lucide-react';

interface MoreCustomersPageProps {
  place: any;
  onBack: () => void;
  language?: 'en' | 'id';
}

const MoreCustomersPage: React.FC<MoreCustomersPageProps> = ({ 
  place, 
  onBack,
  language = 'id' 
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('welcome-section');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
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
              <p className="text-green-100">
                Tips dan strategi komprehensif untuk tempat pijat meningkatkan booking dan pendapatan
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
                Senang sekali memiliki Anda sebagai member valid IndaStreet dan kami sangat antusias untuk berbagi pengetahuan mengenai booking atau tambahan booking untuk tempat pijat Anda.
              </p>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <p className="text-green-800 font-semibold mb-2">📈 Fakta Penting:</p>
                <p className="text-green-700">
                  Selalu ingat bahwa profil yang lengkap <span className="font-bold text-green-800">meningkatkan traffic hingga 80%</span> dibandingkan profil basic. Mari kita diskusikan perbedaannya agar Anda yakin tempat pijat Anda akan diperhatikan pengguna dan memiliki pilihan layanan yang menarik.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Photo Guidelines Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-500" />
            1. Foto Tempat Profesional - Kunci Pertama Kesuksesan
          </h3>
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Tips Foto Tempat Pijat yang Menarik:
              </h4>
              <ul className="text-blue-700 space-y-2 ml-4">
                <li>• <strong>Cahaya alami:</strong> Foto ruangan dengan pencahayaan yang baik</li>
                <li>• <strong>Ruangan bersih:</strong> Tampilkan ruang pijat yang rapi dan profesional</li>
                <li>• <strong>Atmosfer nyaman:</strong> Hindari background yang berantakan</li>
                <li>• <strong>Fasilitas lengkap:</strong> Tunjukkan fasilitas seperti shower, handuk bersih</li>
                <li>• <strong>Terapis profesional:</strong> Foto terapis dalam seragam yang rapi</li>
              </ul>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
              <p className="text-yellow-800">
                <strong>💡 Mengapa foto tempat penting?</strong> Pelanggan ingin melihat suasana dan kebersihan tempat sebelum booking. Foto yang baik menciptakan kepercayaan dan kenyamanan.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Strategy Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            2. Slider Harga - Strategi Pricing untuk Tempat Pijat
          </h3>
          <div className="space-y-4">
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-green-800 mb-3">
                <strong>Memiliki variasi paket dan harga adalah kunci</strong> untuk menarik berbagai jenis pelanggan dengan budget yang berbeda.
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Contoh Variasi Paket untuk Traditional Massage:
              </h4>
              <div className="grid gap-3">
                <div className="bg-white rounded-lg p-3 border border-purple-200">
                  <p className="text-purple-800 font-medium">👑 Executive Package</p>
                  <p className="text-sm text-purple-600">Termasuk ruang VIP + aromaterapi</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-purple-200">
                  <p className="text-purple-800 font-medium">💑 Couple Massage Room</p>
                  <p className="text-sm text-purple-600">Ruang khusus untuk pasangan</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-purple-200">
                  <p className="text-purple-800 font-medium">🎓 Student Discount</p>
                  <p className="text-sm text-purple-600">Harga khusus untuk pelajar dengan ID card</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-purple-200">
                  <p className="text-purple-800 font-medium">🏢 Corporate Package</p>
                  <p className="text-sm text-purple-600">Paket untuk karyawan perusahaan</p>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-400">
              <p className="text-orange-800">
                <strong>🎯 Pro Tip:</strong> Buat paket yang sama dengan nama berbeda untuk menarik berbagai segment. Pelanggan suka memiliki opsi dan merasa mendapat value terbaik.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Services Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            3. Layanan Tambahan untuk Meningkatkan Revenue
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-semibold text-purple-800 mb-2">💆‍♀️ Add-on Services:</h4>
              <ul className="text-purple-700 space-y-1 text-sm">
                <li>• Hot stone therapy (+50k)</li>
                <li>• Aromaterapi essential oil (+30k)</li>
                <li>• Body scrub treatment (+40k)</li>
                <li>• Facial mask (+35k)</li>
              </ul>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">🛁 Fasilitas Premium:</h4>
              <ul className="text-blue-700 space-y-1 text-sm">
                <li>• Private shower room</li>
                <li>• Sauna access</li>
                <li>• Jacuzzi treatment</li>
                <li>• Refreshment & tea</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-500" />
            Status Performa Tempat Pijat Anda
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <Eye className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">284</p>
              <p className="text-xs text-blue-700">Profile Views</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <Star className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">4.8</p>
              <p className="text-xs text-green-700">Rating Tempat</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <Calendar className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">47</p>
              <p className="text-xs text-purple-700">Booking Bulan Ini</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <Users className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-600">12</p>
              <p className="text-xs text-orange-700">Terapis Aktif</p>
            </div>
          </div>
        </div>

        {/* Success Tips Expandable Section */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <button
            onClick={() => toggleSection('success-tips')}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-900">
                  Tips Sukses Mengelola Tempat Pijat
                </h3>
                <p className="text-sm text-gray-600">
                  Strategi terbukti untuk meningkatkan kepuasan pelanggan dan revenue
                </p>
              </div>
            </div>
            {expandedSection === 'success-tips' ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )}
          </button>
          
          {expandedSection === 'success-tips' && (
            <div className="px-6 pb-6 border-t border-gray-100">
              <div className="grid md:grid-cols-2 gap-6 mt-4">
                <div className="space-y-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Manajemen Terapis:
                    </h4>
                    <ul className="text-green-700 space-y-1 text-sm">
                      <li>• Training rutin untuk skill terapis</li>
                      <li>• Sistem scheduling yang efisien</li>
                      <li>• Performance monitoring bulanan</li>
                      <li>• Insentif untuk terapis terbaik</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Customer Experience:
                    </h4>
                    <ul className="text-blue-700 space-y-1 text-sm">
                      <li>• Ambient music & aromaterapi</li>
                      <li>• Welcome drink & towel</li>
                      <li>• After-service consultation</li>
                      <li>• Follow-up via WhatsApp</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Marketing Strategy:
                    </h4>
                    <ul className="text-purple-700 space-y-1 text-sm">
                      <li>• Social media posting rutin</li>
                      <li>• Customer testimonial & review</li>
                      <li>• Referral program reward</li>
                      <li>• Partnership dengan hotel/villa</li>
                    </ul>
                  </div>
                  
                  <div className="bg-orange-50 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                      <Gift className="w-4 h-4" />
                      Loyalty Program:
                    </h4>
                    <ul className="text-orange-700 space-y-1 text-sm">
                      <li>• Stamp card (10 visit = 1 free)</li>
                      <li>• Birthday special discount</li>
                      <li>• Package deal (buy 5 get 1)</li>
                      <li>• VIP member exclusive offer</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl p-6 text-center">
          <h3 className="text-xl font-bold mb-2">Siap Meningkatkan Bisnis Anda? 🚀</h3>
          <p className="mb-4 text-emerald-100">
            Implementasikan tips di atas dan lihat peningkatan booking dalam 30 hari!
          </p>
          <button
            onClick={onBack}
            className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
          >
            Kembali ke Dashboard
          </button>
        </div>

      </div>
    </div>
  );
};

export default MoreCustomersPage;