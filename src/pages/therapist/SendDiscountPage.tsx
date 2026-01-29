/**
 * 🎁 SEND DISCOUNT PAGE
 * 
 * Allows therapists to send promotional discount codes to past customers.
 * Lists recent customers with chat history for easy selection.
 */

import React, { useState, useEffect } from 'react';
import { Gift, Search, User, MessageCircle, Clock, Plus, TrendingUp, Users, Percent, CheckCircle, Filter, ArrowUpDown } from 'lucide-react';
import { databases, Query } from '../../lib/appwrite';
import { APPWRITE_CONFIG } from '../../lib/appwrite.config';
import SendDiscountModal from '../../components/SendDiscountModal';
import TherapistPageHeader from '../../components/therapist/TherapistPageHeader';
import HelpTooltip from '../../components/therapist/HelpTooltip';
import { sendDiscountHelp } from './constants/helpContent';
import { showErrorToast } from '../../lib/toastUtils';
import { generateTherapistDiscount } from '../../services/therapistDiscountService';

interface Customer {
  id: string;
  name: string;
  lastBookingDate: string;
  totalBookings: number;
  hasActiveDiscount?: boolean;
}

interface SendDiscountPageProps {
  therapist: any;
  language: 'en' | 'id';
  onBack?: () => void;
}

const SendDiscountPage: React.FC<SendDiscountPageProps> = ({ therapist, language, onBack }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  
  // Elite Workflow State
  const [selectedBanner, setSelectedBanner] = useState<{percentage: number, imageUrl: string} | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [sendingToCustomer, setSendingToCustomer] = useState<string | null>(null);
  const [sentCustomers, setSentCustomers] = useState<Set<string>>(new Set());
  const [fadingOutCustomers, setFadingOutCustomers] = useState<Set<string>>(new Set());
  
  // Stats state
  const [stats, setStats] = useState({
    totalDiscountsSent: 0,
    activeDiscounts: 0,
    usedDiscounts: 0,
    successRate: 0
  });
  
  // Filter & Sort state
  const [filterType, setFilterType] = useState<'all' | 'active' | 'no-discount'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'bookings'>('recent');

  const t = {
    en: {
      title: 'Send Discount',
      subtitle: 'Send to customers with chat history or reviews',
      searchPlaceholder: 'Search customers...',
      recentCustomers: 'Recent Customers',
      noCustomers: 'No customers found',
      noCustomersSubtext: 'Customers from your bookings will appear here',
      lastBooking: 'Last booking',
      totalBookings: 'bookings',
      sendDiscount: 'Send Discount',
      hasDiscount: 'Has active discount',
      loading: 'Loading customers...',
      // Stats
      totalSent: 'Total Sent',
      activeNow: 'Active Now',
      usedDiscounts: 'Used',
      successRate: 'Success Rate',
      // Filters
      allCustomers: 'All Customers',
      withDiscount: 'Has Discount',
      noDiscount: 'No Discount',
      sortRecent: 'Recent First',
      sortBookings: 'Most Bookings',
      filterBy: 'Filter',
      sortBy: 'Sort',
      // Elite workflow
      selectBanner: 'Select a discount banner to begin',
      customerSelectable: 'Click customer name to send',
      confirmSend: 'Confirm Send',
      confirmMessage: 'Send {{percentage}}% discount to {{name}}?',
      sending: 'Sending...',
      discountSent: 'Discount Sent',
      cancel: 'Cancel',
      expiryMessage: 'Valid for 7 days from today'
    },
    id: {
      title: 'Kirim Diskon',
      subtitle: 'Kirim ke pelanggan dengan riwayat chat atau review',
      searchPlaceholder: 'Cari pelanggan...',
      recentCustomers: 'Pelanggan Terbaru',
      noCustomers: 'Tidak ada pelanggan',
      noCustomersSubtext: 'Pelanggan dari booking Anda akan muncul di sini',
      lastBooking: 'Booking terakhir',
      totalBookings: 'booking',
      sendDiscount: 'Kirim Diskon',
      hasDiscount: 'Ada diskon aktif',
      loading: 'Memuat pelanggan...',
      // Stats
      totalSent: 'Total Terkirim',
      activeNow: 'Aktif Sekarang',
      usedDiscounts: 'Terpakai',
      successRate: 'Tingkat Sukses',
      // Filters
      allCustomers: 'Semua Pelanggan',
      withDiscount: 'Ada Diskon',
      noDiscount: 'Tanpa Diskon',
      sortRecent: 'Terbaru',
      sortBookings: 'Paling Banyak Booking',
      filterBy: 'Filter',
      sortBy: 'Urutkan',
      // Elite workflow
      selectBanner: 'Pilih banner diskon untuk mulai',
      customerSelectable: 'Klik nama pelanggan untuk kirim',
      confirmSend: 'Konfirmasi Kirim',
      confirmMessage: 'Kirim diskon {{percentage}}% ke {{name}}?',
      sending: 'Mengirim...',
      discountSent: 'Diskon Terkirim',
      cancel: 'Batal',
      expiryMessage: 'Berlaku 7 hari dari hari ini'
    },
  };

  const labels = t[language] || t.id;

  // Get therapist ID (Appwrite uses $id)
  const therapistId = therapist?.$id || therapist?.id;

  useEffect(() => {
    loadCustomers();
    loadDiscountStats();
  }, [therapistId]);

  const loadDiscountStats = async () => {
    if (!therapistId) return;
    
    try {
      // Fetch all discount codes sent by this therapist
      const discountsResponse = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        'discount_codes',
        [
          Query.equal('providerId', therapistId),
          Query.limit(1000)
        ]
      );
      
      const totalSent = discountsResponse.documents.length;
      const active = discountsResponse.documents.filter((d: any) => 
        !d.isUsed && new Date(d.expiresAt) > new Date()
      ).length;
      const used = discountsResponse.documents.filter((d: any) => d.isUsed).length;
      const successRate = totalSent > 0 ? Math.round((used / totalSent) * 100) : 0;
      
      setStats({
        totalDiscountsSent: totalSent,
        activeDiscounts: active,
        usedDiscounts: used,
        successRate
      });
    } catch (error) {
      console.error('Failed to load discount stats:', error);
    }
  };

  const loadCustomers = async () => {
    if (!therapistId) return;
    
    setLoading(true);
    try {
      // Fetch bookings for this therapist
      const bookingsCollection = APPWRITE_CONFIG.collections.bookings;
      if (!bookingsCollection) {
        setCustomers([]);
        return;
      }

      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        bookingsCollection,
        [
          Query.equal('therapistId', therapistId),
          Query.equal('status', 'completed'), // Only completed bookings
          Query.orderDesc('$createdAt'),
          Query.limit(100)
        ]
      );

      // Filter: Only customers from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Group by customer and get unique customers
      const customerMap = new Map<string, Customer>();
      
      for (const booking of response.documents) {
        const customerId = (booking as any).customerId || (booking as any).userId;
        const customerName = (booking as any).customerName || (booking as any).userName || 'Unknown';
        const bookingDate = new Date((booking as any).$createdAt || new Date());
        
        // Skip bookings older than 30 days
        if (bookingDate < thirtyDaysAgo) continue;
        if (!customerId) continue;
        
        if (customerMap.has(customerId)) {
          const existing = customerMap.get(customerId)!;
          existing.totalBookings++;
        } else {
          customerMap.set(customerId, {
            id: customerId,
            name: customerName,
            lastBookingDate: (booking as any).$createdAt || new Date().toISOString(),
            totalBookings: 1,
            hasActiveDiscount: false
          });
        }
      }

      // Check for active discounts
      try {
        const discountsResponse = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          'discount_codes',
          [
            Query.equal('providerId', therapistId),
            Query.equal('isUsed', false),
            Query.greaterThan('expiresAt', new Date().toISOString())
          ]
        );
        
        for (const discount of discountsResponse.documents) {
          const userId = (discount as any).userId;
          if (customerMap.has(userId)) {
            customerMap.get(userId)!.hasActiveDiscount = true;
          }
        }
      } catch (e) {
        console.log('Could not check discounts:', e);
      }

      setCustomers(Array.from(customerMap.values()));
    } catch (error) {
      console.error('Failed to load customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers
    .filter(c => {
      // Search filter
      if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Type filter
      if (filterType === 'active' && !c.hasActiveDiscount) return false;
      if (filterType === 'no-discount' && c.hasActiveDiscount) return false;
      
      return true;
    })
    .sort((a, b) => {
      // Sort logic
      if (sortBy === 'bookings') {
        return b.totalBookings - a.totalBookings;
      }
      // Default: recent first
      return new Date(b.lastBookingDate).getTime() - new Date(a.lastBookingDate).getTime();
    });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const sendDiscountBanner = async (customerId: string, customerName: string, percentage: number, imageUrl: string) => {
    try {
      // Generate unique discount code (7 days validity)
      const discountResult = await generateTherapistDiscount({
        therapistId: therapistId || '',
        therapistName: therapist?.name || '',
        customerId,
        customerName,
        discountPercentage: percentage as 5 | 10 | 15 | 20,
        source: 'chat_banner',
        bannerImageUrl: imageUrl,
        validityDays: 7
      });

      if (!discountResult.success) {
        return { success: false, error: discountResult.error };
      }

      const discountCode = discountResult.code.code;
      
      // TODO: Send to chat window with banner + discount code
      // Backend API: POST /api/chat/send-discount-banner
      // Should:
      // 1. Send banner image to customer's chat window
      // 2. Send message with discount code
      // 3. Trigger push notification with MP3 audio
      
      const message = language === 'id' 
        ? `🎁 Terima kasih sudah booking massage dengan kami! Silakan gunakan diskon ${percentage}% ini untuk booking selanjutnya dalam 7 hari.\n\n✨ Kode Diskon: *${discountCode}*\n⏰ Berlaku sampai: ${new Date(discountResult.code.expiresAt).toLocaleDateString('id-ID')}\n\n👉 Masukkan kode ini saat booking untuk mendapatkan diskon otomatis. Kode hanya bisa digunakan 1x dengan saya.`
        : `🎁 Thank you for your past massage booking! Please accept this ${percentage}% discount for your next booking within 7 days.\n\n✨ Discount Code: *${discountCode}*\n⏰ Valid until: ${new Date(discountResult.code.expiresAt).toLocaleDateString('en-US')}\n\n👉 Enter this code during booking to get automatic discount. Code can only be used once with me.`;
      
      console.log('✅ Discount banner sent:', {
        customer: customerName,
        percentage,
        code: discountCode,
        expiresAt: discountResult.code.expiresAt,
        message
      });
      
      // Reload stats to show updated counts
      await loadDiscountStats();
      
      return { success: true, code: discountCode };
    } catch (error) {
      console.error('Failed to send discount banner:', error);
      return { success: false, error: String(error) };
    }
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDiscountModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 overflow-y-auto overflow-x-hidden" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y pan-x' }}>
      {/* Standardized Page Header */}
      <TherapistPageHeader
        title={labels.title}
        subtitle={labels.subtitle}
        onBackToStatus={onBack || (() => {})}
        icon={<Gift className="w-6 h-6 text-orange-600" />}
        actions={
          <div className="px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-300 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Confirm Added
          </div>
        }
      />

      {/* Discount Banners - Mobile Optimized */}
      <div className="px-4 pt-4 pb-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-gray-900">Discount Banners</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {selectedBanner ? labels.customerSelectable : labels.selectBanner}
              </p>
            </div>
            <HelpTooltip 
              {...sendDiscountHelp.selectCustomers}
              position="left"
              size="sm"
            />
          </div>
          
          {/* 2 Banners Per Row - Clickable */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { percentage: 5, imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20discount%205.png?updatedAt=1761803670532' },
              { percentage: 10, imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20discount%2010.png?updatedAt=1761803828896' },
              { percentage: 15, imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20discount%2015.png?updatedAt=1761803805221' },
              { percentage: 20, imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20discount%2020.png?updatedAt=1761803783034' }
            ].map((banner) => {
              const isSelected = selectedBanner?.percentage === banner.percentage;
              return (
                <button
                  key={banner.percentage}
                  onClick={() => setSelectedBanner(banner)}
                  className={`relative rounded-lg overflow-hidden transition-all duration-300 ${
                    isSelected 
                      ? 'ring-4 ring-orange-500 shadow-lg shadow-orange-500/50 scale-105' 
                      : 'hover:shadow-md'
                  }`}
                >
                  <img 
                    src={banner.imageUrl}
                    alt={`${banner.percentage}% OFF`}
                    className="w-full h-auto"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-orange-500/10 flex items-center justify-center">
                      <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        ✓ Selected
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats - Minimalistic */}
      <div className="px-4 pb-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
          <div className="grid grid-cols-3 gap-3">
            {/* Total Sent */}
            <div className="text-center">
              <TrendingUp className="w-4 h-4 text-orange-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-900">{stats.totalDiscountsSent}</p>
              <p className="text-xs text-gray-500">{labels.totalSent}</p>
            </div>

            {/* Active Now */}
            <div className="text-center border-x border-gray-200">
              <CheckCircle className="w-4 h-4 text-green-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-green-600">{stats.activeDiscounts}</p>
              <p className="text-xs text-gray-500">{labels.activeNow}</p>
            </div>

            {/* Used */}
            <div className="text-center">
              <Percent className="w-4 h-4 text-blue-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-blue-600">{stats.usedDiscounts}</p>
              <p className="text-xs text-gray-500">Used</p>
            </div>

          </div>
        </div>
      </div>

      {/* Search & Filters - Minimalistic */}
      <div className="px-4 pb-3">
        {/* Search Bar */}
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={labels.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        {/* Compact Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filterType === 'all'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            All
          </button>
          
          <button
            onClick={() => setFilterType('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filterType === 'active'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Active
          </button>
          
          <button
            onClick={() => setFilterType('no-discount')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filterType === 'no-discount'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            No Discount
          </button>
        </div>
      </div>

      {/* Customer List - Minimalistic */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700\">Customers</h3>
          <span className="text-xs text-gray-500\">{filteredCustomers.length} total</span>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-500">{labels.loading}</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-600">{labels.noCustomers}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredCustomers.map((customer) => {
              const isSent = sentCustomers.has(customer.id);
              const isFading = fadingOutCustomers.has(customer.id);
              const isSending = sendingToCustomer === customer.id;
              const isSelectable = selectedBanner && !isSent && !isSending;
              
              // Hide customers that are fading out
              if (isFading) return null;
              
              return (
                <button
                  key={customer.id}
                  onClick={() => {
                    if (isSelectable) {
                      setSelectedCustomer(customer);
                      setShowConfirmDialog(true);
                    }
                  }}
                  disabled={!isSelectable || isSent || isSending}
                  className={`w-full bg-white rounded-lg border p-3 text-left transition-all duration-300 ${
                    isSent 
                      ? 'border-green-300 bg-green-50 opacity-75' 
                      : isSelectable 
                        ? 'border-orange-300 hover:border-orange-500 hover:shadow-md cursor-pointer animate-pulse'
                        : 'border-gray-200 opacity-50 cursor-not-allowed'
                  }`}
                  style={isFading ? {
                    opacity: 0,
                    transform: 'scale(0.95)',
                    transition: 'all 2s ease-out'
                  } : undefined}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className={`text-sm font-semibold ${
                        isSent ? 'text-green-700' : 'text-gray-900'
                      }`}>
                        {customer.name}
                      </h3>
                    </div>
                    
                    {isSending && (
                      <div className="flex items-center gap-2 text-xs text-orange-600">
                        <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                        {labels.sending}
                      </div>
                    )}
                    
                    {isSent && (
                      <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                        ✓ {labels.discountSent}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && selectedCustomer && selectedBanner && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-scale-in">
            {/* Banner Preview */}
            <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100">
              <img 
                src={selectedBanner.imageUrl}
                alt={`${selectedBanner.percentage}% OFF`}
                className="w-full h-auto rounded-lg shadow-md"
              />
            </div>
            
            {/* Content */}
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {labels.confirmSend}
              </h3>
              <p className="text-sm text-gray-600 mb-1">
                {labels.confirmMessage
                  .replace('{{percentage}}', selectedBanner.percentage.toString())
                  .replace('{{name}}', selectedCustomer.name)}
              </p>
              <p className="text-xs text-orange-600 font-medium">
                {labels.expiryMessage}
              </p>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2 p-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setSelectedCustomer(null);
                }}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                {labels.cancel}
              </button>
              <button
                onClick={async () => {
                  if (!selectedCustomer || !selectedBanner) return;
                  
                  setShowConfirmDialog(false);
                  setSendingToCustomer(selectedCustomer.id);
                  
                  // Send discount banner with MP3 notification
                  const result = await sendDiscountBanner(
                    selectedCustomer.id,
                    selectedCustomer.name,
                    selectedBanner.percentage,
                    selectedBanner.imageUrl
                  );
                  
                  if (result.success) {
                    // Mark as sent
                    setSentCustomers(prev => new Set([...prev, selectedCustomer.id]));
                    setSendingToCustomer(null);
                    
                    // Show "Discount Sent" for 2 seconds, then fade out
                    setTimeout(() => {
                      setFadingOutCustomers(prev => new Set([...prev, selectedCustomer.id]));
                      
                      // Remove from list after fade animation (2s)
                      setTimeout(() => {
                        setCustomers(prev => prev.filter(c => c.id !== selectedCustomer.id));
                        setFadingOutCustomers(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(selectedCustomer.id);
                          return newSet;
                        });
                      }, 2000);
                    }, 2000);
                  } else {
                    // Handle error
                    setSendingToCustomer(null);
                    showErrorToast('Failed to send discount. Please try again.');
                  }
                  
                  setSelectedCustomer(null);
                  setSelectedBanner(null);
                }}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                {labels.confirmSend}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Discount Modal */}
      {selectedCustomer && (
        <SendDiscountModal
          isOpen={showDiscountModal}
          onClose={() => {
            setShowDiscountModal(false);
            setSelectedCustomer(null);
          }}
          providerId={therapist?.id || ''}
          providerType="therapist"
          providerName={therapist?.name || 'Therapist'}
          customerId={selectedCustomer.id}
          customerName={selectedCustomer.name}
          onSuccess={(code, percentage) => {
            console.log(`✅ Discount ${percentage}% sent: ${code}`);
            // Refresh data
            loadCustomers();
            loadDiscountStats();
          }}
        />
      )}
    </div>
  );
};

export default SendDiscountPage;
