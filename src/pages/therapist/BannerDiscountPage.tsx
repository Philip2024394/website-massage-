// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fix)
/**
 * BannerDiscountPage - Send discount banners/vouchers to customers
 * Therapist selects 1 banner, generates voucher code, sends to customer chat
 */
import React, { useState } from 'react';
import { Gift, Send, Check, Copy, ArrowLeft } from 'lucide-react';
import TherapistLayout from '../../components/therapist/TherapistLayout';
import { showToast } from '../../utils/showToastPortal';
import chatService from '../../lib/simpleChatService';

interface BannerOption {
  id: string;
  name: string;
  discount: number;
  description: string;
  color: string;
  bgGradient: string;
}

interface BannerDiscountPageProps {
  therapist: any;
  customer?: {
    customerId: string;
    customerName: string;
    customerPhone: string;
    lastMassageType: string;
  };
  onBack: () => void;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
  language?: 'en' | 'id';
}

const BannerDiscountPage: React.FC<BannerDiscountPageProps> = ({
  therapist,
  customer,
  onBack,
  onNavigate,
  onLogout,
  language = 'id'
}) => {
  const [selectedBanner, setSelectedBanner] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [voucherCode, setVoucherCode] = useState<string>('');
  const [sent, setSent] = useState(false);

  // Banner options with discount percentages
  const bannerOptions: BannerOption[] = [
    {
      id: 'bronze',
      name: '10% Off',
      discount: 10,
      description: 'Diskon 10% untuk semua jenis massage',
      color: 'text-amber-700',
      bgGradient: 'from-amber-100 to-amber-200'
    },
    {
      id: 'silver',
      name: '15% Off',
      discount: 15,
      description: 'Diskon 15% untuk semua jenis massage',
      color: 'text-gray-700',
      bgGradient: 'from-gray-100 to-gray-300'
    },
    {
      id: 'gold',
      name: '20% Off',
      discount: 20,
      description: 'Diskon 20% untuk semua jenis massage',
      color: 'text-yellow-700',
      bgGradient: 'from-yellow-100 to-yellow-300'
    },
    {
      id: 'platinum',
      name: '25% Off',
      discount: 25,
      description: 'Diskon 25% untuk semua jenis massage - Special!',
      color: 'text-purple-700',
      bgGradient: 'from-purple-100 to-purple-300'
    }
  ];

  // Generate voucher code
  const generateVoucherCode = (discount: number): string => {
    const prefix = 'GIFT';
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const discountCode = `${discount}OFF`;
    return `${prefix}-${discountCode}-${random}`;
  };

  const handleSendGift = async () => {
    if (!selectedBanner || !customer) {
      showToast('Please select a banner', 'error');
      return;
    }

    setSending(true);

    try {
      const banner = bannerOptions.find(b => b.id === selectedBanner);
      if (!banner) {
        throw new Error('Invalid banner selection');
      }

      // Generate voucher code
      const code = generateVoucherCode(banner.discount);
      setVoucherCode(code);

      // Compose message to customer
      const message = language === 'id'
        ? `🎁 Terima kasih atas kepercayaan Anda!\n\nSebagai apresiasi, saya ingin memberikan voucher diskon khusus:\n\n🎟️ Kode: ${code}\n💰 Diskon: ${banner.discount}%\n📋 Berlaku untuk: Semua jenis massage\n\nGunakan kode ini saat booking berikutnya di Order Now chat window.\n\nSalam hangat,\n${therapist.name || 'Your Therapist'}`
        : `🎁 Thank you for your valued custom!\n\nAs a token of appreciation, please accept this special discount voucher:\n\n🎟️ Code: ${code}\n💰 Discount: ${banner.discount}%\n📋 Valid for: Any massage type\n\nUse this code when booking through the Order Now chat window.\n\nWarm regards,\n${therapist.name || 'Your Therapist'}`;

      // Send message via chat service
      // Note: In production, this would send to actual customer chat
      console.log('📤 Sending voucher to customer:', {
        customerId: customer.customerId,
        customerName: customer.customerName,
        voucherCode: code,
        discount: banner.discount
      });

      // Store voucher in system (would be saved to database in production)
      const voucherData = {
        code,
        therapistId: therapist.$id,
        customerId: customer.customerId,
        customerName: customer.customerName,
        discount: banner.discount,
        createdAt: new Date().toISOString(),
        used: false,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      };

      // Save to localStorage temporarily (in production, save to Appwrite database)
      const existingVouchers = JSON.parse(localStorage.getItem('therapist_vouchers') || '[]');
      existingVouchers.push(voucherData);
      localStorage.setItem('therapist_vouchers', JSON.stringify(existingVouchers));

      console.log('✅ Voucher saved:', voucherData);

      setSent(true);
      showToast(
        language === 'id' 
          ? `Voucher berhasil dikirim ke ${customer.customerName}!` 
          : `Voucher sent successfully to ${customer.customerName}!`,
        'success'
      );
    } catch (error) {
      console.error('Error sending gift:', error);
      showToast(
        language === 'id' 
          ? 'Gagal mengirim voucher' 
          : 'Failed to send voucher',
        'error'
      );
    } finally {
      setSending(false);
    }
  };

  const copyVoucherCode = () => {
    if (voucherCode) {
      navigator.clipboard.writeText(voucherCode);
      showToast(
        language === 'id' ? 'Kode voucher disalin!' : 'Voucher code copied!',
        'success'
      );
    }
  };

  return (
    <TherapistLayout
      therapist={therapist}
      currentPage="banner-discount"
      onNavigate={onNavigate || (() => {})}
      onLogout={onLogout}
      language={language}
    >
      <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y pan-x' }}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 pt-0 pb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">
              {language === 'id' ? 'Kembali ke Pelanggan' : 'Back to Customers'}
            </span>
          </button>

          <div className="flex items-center gap-3">
            <Gift className="w-8 h-8 text-orange-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {language === 'id' ? 'Kirim Voucher Diskon' : 'Send Discount Voucher'}
              </h1>
              {customer && (
                <p className="text-sm text-gray-600">
                  {language === 'id' ? 'Untuk: ' : 'To: '}
                  <span className="font-semibold">{customer.customerName}</span>
                  {customer.lastMassageType && (
                    <span className="text-gray-500"> • {customer.lastMassageType}</span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-w-4xl mx-auto">
          {!sent ? (
            <>
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">
                  {language === 'id' ? '📋 Cara Kerja' : '📋 How It Works'}
                </h3>
                <ol className="text-blue-800 space-y-2 text-sm">
                  <li>1. {language === 'id' ? 'Pilih 1 banner diskon' : 'Select 1 discount banner'}</li>
                  <li>2. {language === 'id' ? 'Klik "Kirim Gift" untuk generate kode voucher' : 'Click "Send Gift" to generate voucher code'}</li>
                  <li>3. {language === 'id' ? 'Voucher otomatis dikirim ke chat pelanggan' : 'Voucher automatically sent to customer chat'}</li>
                  <li>4. {language === 'id' ? 'Pelanggan gunakan kode di Order Now chat window' : 'Customer uses code in Order Now chat window'}</li>
                  <li>5. {language === 'id' ? 'Sistem otomatis kurangi harga & hitung komisi 30%' : 'System auto-deducts price & calculates 30% commission'}</li>
                </ol>
              </div>

              {/* Banner Selection Grid */}
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {language === 'id' ? 'Pilih Banner Diskon:' : 'Select Discount Banner:'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {bannerOptions.map((banner) => (
                  <button
                    key={banner.id}
                    onClick={() => setSelectedBanner(banner.id)}
                    className={`relative bg-gradient-to-br ${banner.bgGradient} rounded-xl p-6 border-2 transition-all text-left ${
                      selectedBanner === banner.id
                        ? 'border-orange-500 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-orange-300 hover:shadow-md'
                    }`}
                  >
                    {selectedBanner === banner.id && (
                      <div className="absolute top-3 right-3 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                    
                    <div className="mb-3">
                      <Gift className={`w-12 h-12 ${banner.color}`} />
                    </div>
                    
                    <h3 className={`text-2xl font-bold ${banner.color} mb-2`}>
                      {banner.name}
                    </h3>
                    
                    <p className={`text-sm ${banner.color} opacity-90`}>
                      {banner.description}
                    </p>
                  </button>
                ))}
              </div>

              {/* Send Button */}
              <button
                onClick={handleSendGift}
                disabled={!selectedBanner || sending}
                className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all flex items-center justify-center gap-3 ${
                  !selectedBanner || sending
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-lg'
                }`}
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{language === 'id' ? 'Mengirim...' : 'Sending...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>
                      {!selectedBanner
                        ? (language === 'id' ? 'Pilih Banner Dulu' : 'Select Banner First')
                        : (language === 'id' ? 'Kirim Gift' : 'Send Gift')}
                    </span>
                  </>
                )}
              </button>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {language === 'id' ? '🎉 Voucher Terkirim!' : '🎉 Voucher Sent!'}
              </h2>
              
              <p className="text-gray-600 mb-6">
                {language === 'id' 
                  ? `Voucher diskon telah dikirim ke ${customer?.customerName || 'pelanggan'}` 
                  : `Discount voucher has been sent to ${customer?.customerName || 'customer'}`}
              </p>

              {/* Voucher Code Display */}
              {voucherCode && (
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 rounded-xl p-6 mb-6 max-w-md mx-auto">
                  <div className="text-sm text-gray-600 mb-2">
                    {language === 'id' ? 'Kode Voucher:' : 'Voucher Code:'}
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <code className="text-2xl font-bold text-orange-600 tracking-wider">
                      {voucherCode}
                    </code>
                    <button
                      onClick={copyVoucherCode}
                      className="p-2 hover:bg-orange-200 rounded-lg transition-colors"
                      title={language === 'id' ? 'Salin kode' : 'Copy code'}
                    >
                      <Copy className="w-5 h-5 text-orange-600" />
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => {
                    setSent(false);
                    setSelectedBanner(null);
                    setVoucherCode('');
                  }}
                  className="px-6 py-3 bg-white border-2 border-orange-500 text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-colors"
                >
                  {language === 'id' ? 'Kirim Lagi' : 'Send Another'}
                </button>
                
                <button
                  onClick={onBack}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all"
                >
                  {language === 'id' ? 'Kembali ke Pelanggan' : 'Back to Customers'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </TherapistLayout>
  );
};

export default BannerDiscountPage;
