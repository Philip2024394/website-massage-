// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
/**
 * TherapistLegal - Terms of Service and Privacy Policy
 */
import React, { useState } from 'react';
import { FileText, Shield, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import TherapistLayout from '../../components/therapist/TherapistLayout';
import HelpTooltip from '../../components/therapist/HelpTooltip';
import { legalHelp } from './constants/helpContent';

interface TherapistLegalProps {
  therapist: any;
  onBack: () => void;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
  language?: string;
}

const TherapistLegalPage: React.FC<TherapistLegalProps> = ({ therapist, onBack, onNavigate, onLogout, language: propLanguage = 'id' }) => {
  const language = propLanguage || 'id';
  
  // Simple dictionary object
  const dict = {
    therapistDashboard: {
      thisMonth: 'bulan ini'
    }
  };
  
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['intro']));

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const termsContent = [
    {
      id: 'intro',
      title: 'SYARAT & KETENTUAN INDASTREET',
      content: `Terakhir Diperbarui: 28 Januari 2026

Syarat & Ketentuan ini ("Syarat") mengatur akses dan penggunaan platform IndaStreet ("IndaStreet", "Platform", "kami", "kita").

Dengan membuat akun atau menggunakan Platform, Anda mengkonfirmasi bahwa Anda telah membaca, memahami, dan setuju untuk terikat secara hukum dengan Syarat ini.`
    },
    {
      id: 'platform-role',
      title: '1. PERAN & TUJUAN PLATFORM',
      content: `1.1 Layanan Platform

IndaStreet beroperasi secara eksklusif sebagai marketplace digital dan platform fasilitasi lalu lintas.

IndaStreet:
• Menghubungkan terapis pijat independen dan tempat pijat dengan pelanggan
• Menyediakan alat listing, booking, komunikasi, dan fasilitasi pembayaran

IndaStreet TIDAK:
• Menyediakan layanan pijat atau wellness
• Mempekerjakan terapis pijat
• Mengontrol bagaimana layanan diberikan

1.2 Tidak Ada Hubungan Kerja

Tidak ada dalam Syarat ini yang menciptakan hubungan kerja antara IndaStreet dan Penyedia Layanan.`
    },
    {
      id: 'independent-contractor',
      title: '2. STATUS KONTRAKTOR INDEPENDEN',
      content: `2.1 Wiraswasta

Semua Penyedia Layanan beroperasi sebagai kontraktor independen yang bekerja sendiri.

Anda:
• Mengontrol kapan, dimana, dan apakah Anda bekerja
• Memutuskan booking mana yang diterima atau ditolak
• Menentukan metode dan standar layanan Anda sendiri

2.2 Pajak & Kewajiban Hukum

Anda bertanggung jawab penuh atas:
• Pelaporan dan pembayaran semua pajak penghasilan
• PPN atau pajak konsumsi serupa (jika berlaku)
• Persyaratan registrasi bisnis`
    },
    {
      id: 'account-eligibility',
      title: '3. KELAYAKAN & PENGGUNAAN AKUN',
      content: `3.1 Kelayakan

Untuk menggunakan IndaStreet, Anda harus:
• Berusia minimal 18 tahun
• Memiliki kapasitas hukum untuk menyediakan layanan pijat
• Memiliki lisensi yang diperlukan oleh hukum

3.2 Akurasi Akun

Anda setuju untuk:
• Memberikan informasi yang akurat dan benar
• Memelihara detail kontak yang terkini
• Menggunakan gambar profil yang profesional`
    }
  ];

  const privacyContent = [
    {
      id: 'data-collection',
      title: 'PENGUMPULAN DATA PRIBADI',
      content: `Kami mengumpulkan data yang diperlukan untuk operasi platform:

• Informasi profil dan kontak
• Detail layanan dan ketersediaan
• Riwayat transaksi dan pembayaran
• Data lokasi untuk matching

Data dikumpulkan hanya dengan persetujuan Anda dan sesuai hukum yang berlaku.`
    }
  ];

  const handleContactSupport = (topic: string = 'Terms') => {
    const message = encodeURIComponent(`Hi i would like to know little more regarding ${topic}`);
    const whatsappUrl = `https://wa.me/6281392000050?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const content = activeTab === 'terms' ? termsContent : privacyContent;

  return (
    <TherapistLayout
      therapist={therapist}
      currentPage="legal"
      onNavigate={onNavigate}
      language={language}
      onLogout={onLogout}
    >
      <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-white">
        <div className="max-w-sm mx-auto px-4 py-6">
          {/* Tab Switcher */}
          <div className="mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 flex gap-2">
              <button
                onClick={() => setActiveTab('terms')}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
                  activeTab === 'terms'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FileText className="w-4 h-4 mx-auto mb-1" />
                Syarat & Ketentuan
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
                  activeTab === 'privacy'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Shield className="w-4 h-4 mx-auto mb-1" />
                Kebijakan Privasi
              </button>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-3">
            {content.map((section) => (
              <div key={section.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h2 className="text-sm font-bold text-gray-900 text-left">{section.title}</h2>
                  {expandedSections.has(section.id) ? (
                    <ChevronUp className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {expandedSections.has(section.id) && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <div className="pt-3 space-y-2">
                      {section.content.split('\n').map((paragraph, i) => (
                        paragraph.trim() && (
                          <p key={i} className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                            {paragraph}
                          </p>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Support Contact */}
          <div className="mt-6">
            <button 
              onClick={handleContactSupport}
              className="w-full bg-white border-2 border-orange-500 text-orange-600 rounded-xl py-3 font-bold hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
            >
              <FileText className="w-5 h-5" />
              Hubungi Support via WhatsApp
            </button>
          </div>
        </div>
      </div>
    </TherapistLayout>
  );
};

export default TherapistLegalPage;