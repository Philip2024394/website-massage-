/**
 * Super Elite Gift Voucher Slider – slide-up from bottom.
 * User selects a menu/service to gift, fills recipient name on voucher card,
 * sends request to massage place via WhatsApp for confirmation, then shares
 * the e-gift card via WhatsApp to their friend.
 */

import React, { useState, useMemo } from 'react';
import { X, Gift, ChevronRight, MessageCircle, Share2 } from 'lucide-react';

export interface GiftTreatment {
  id: string;
  name: string;
  duration?: number;
  price: number;
  priceLabel?: string;
}

export interface GiftVoucherSliderProps {
  isOpen: boolean;
  onClose: () => void;
  placeName: string;
  placeId: string;
  whatsappNumber?: string;
  /** Treatments from place pricing (e.g. 60/90/120 min) */
  treatments?: GiftTreatment[];
  /** Additional services (e.g. Hair Salon, Beautician) for gifting */
  additionalServices?: { id: string; name: string; details?: { label?: string; price?: string }[] }[];
  language?: string;
}

function formatPrice(price: number): string {
  return `IDR ${(price / 1000).toFixed(0)}K`;
}

function generateVoucherNumber(): string {
  const d = new Date();
  const datePart = d.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `GIFT-${datePart}-${random}`;
}

function getExpiryDate(): Date {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d;
}

function formatExpiry(date: Date, lang: string): string {
  return date.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

type Step = 'select' | 'details' | 'send' | 'share';

export default function GiftVoucherSlider({
  isOpen,
  onClose,
  placeName,
  placeId,
  whatsappNumber,
  treatments = [],
  additionalServices = [],
  language = 'id',
}: GiftVoucherSliderProps) {
  const isId = language === 'id';
  const [step, setStep] = useState<Step>('select');
  const [selectedItem, setSelectedItem] = useState<{
    type: 'treatment' | 'service';
    id: string;
    name: string;
    priceLabel?: string;
    price?: number;
  } | null>(null);
  const [recipientName, setRecipientName] = useState('');
  const [senderName, setSenderName] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [voucherNumber] = useState(() => generateVoucherNumber());
  const [expiryDate] = useState(() => getExpiryDate());
  const [spaConfirmed, setSpaConfirmed] = useState(false);

  const giftOptions = useMemo(() => {
    const list: { type: 'treatment' | 'service'; id: string; name: string; priceLabel?: string; price?: number }[] = [];
    treatments.forEach((t) => {
      list.push({
        type: 'treatment',
        id: t.id,
        name: t.name,
        priceLabel: formatPrice(t.price),
        price: t.price,
      });
    });
    additionalServices.forEach((s) => {
      const priceStr = s.details?.[0]?.price || '';
      list.push({
        type: 'service',
        id: s.id,
        name: s.name,
        priceLabel: priceStr || (isId ? 'Hubungi untuk harga' : 'Contact for price'),
      });
    });
    return list;
  }, [treatments, additionalServices, isId]);

  const handleSelect = (item: (typeof giftOptions)[0]) => {
    setSelectedItem(item);
    setStep('details');
  };

  const handleBack = () => {
    if (step === 'details') {
      setStep('select');
      setSelectedItem(null);
      setRecipientName('');
      setSenderName('');
      setPersonalMessage('');
    } else if (step === 'send') setStep('details');
    else if (step === 'share') setStep('send');
  };

  const handleSendToSpa = () => {
    if (!whatsappNumber) return;
    const cleanNumber = whatsappNumber.replace(/\D/g, '').replace(/^0/, '62');
    const text = isId
      ? `Halo, saya ingin memesan *Voucher Hadiah* untuk spa ini.\n\n` +
        `📋 Layanan: ${selectedItem?.name}\n` +
        `👤 Penerima: ${recipientName || '-'}\n` +
        `🎟️ No. Voucher: ${voucherNumber}\n` +
        `📅 Berlaku hingga: ${formatExpiry(expiryDate, language)}\n\n` +
        `Mohon konfirmasi ketersediaan dan pembayaran. Terima kasih.`
      : `Hi, I would like to purchase a *Gift Voucher* for this spa.\n\n` +
        `📋 Service: ${selectedItem?.name}\n` +
        `👤 Recipient: ${recipientName || '-'}\n` +
        `🎟️ Voucher No: ${voucherNumber}\n` +
        `📅 Valid until: ${formatExpiry(expiryDate, language)}\n\n` +
        `Please confirm availability and payment. Thank you.`;
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`, '_blank');
    setStep('send');
  };

  const handleMarkConfirmed = () => {
    setSpaConfirmed(true);
    setStep('share');
  };

  const handleShareViaWhatsApp = () => {
    const cardText = isId
      ? `🎁 *Voucher Hadiah Spa* – ${placeName}\n\n` +
        `Untuk: *${recipientName || 'Teman Anda'}*\n` +
        `Layanan: ${selectedItem?.name}\n` +
        `No. Voucher: ${voucherNumber}\n` +
        `Berlaku hingga: ${formatExpiry(expiryDate, language)}\n\n` +
        (personalMessage ? `${personalMessage}\n\n` : '') +
        `Tukarkan voucher ini di ${placeName}.`
      : `🎁 *Spa Gift Voucher* – ${placeName}\n\n` +
        `To: *${recipientName || 'Your friend'}*\n` +
        `Service: ${selectedItem?.name}\n` +
        `Voucher No: ${voucherNumber}\n` +
        `Valid until: ${formatExpiry(expiryDate, language)}\n\n` +
        (personalMessage ? `${personalMessage}\n\n` : '') +
        `Redeem this voucher at ${placeName}.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(cardText)}`, '_blank');
    onClose();
    setStep('select');
    setSelectedItem(null);
    setRecipientName('');
    setSenderName('');
    setPersonalMessage('');
    setSpaConfirmed(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10002] flex flex-col justify-end">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-center py-3">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>
        <div className="px-4 pb-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-500" />
              {step === 'select' && (isId ? 'Gift This Spa' : 'Gift This Spa')}
              {step === 'details' && (isId ? 'Detail Voucher' : 'Voucher Details')}
              {step === 'send' && (isId ? 'Konfirmasi ke Spa' : 'Confirm with Spa')}
              {step === 'share' && (isId ? 'Bagikan Kartu Hadiah' : 'Share Gift Card')}
            </h3>
            <p className="text-xs text-gray-500">{placeName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Step 1: Select service to gift */}
          {step === 'select' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                {isId ? 'Pilih layanan atau paket yang ingin Anda hadiahkan.' : 'Select a service or package to gift.'}
              </p>
              {giftOptions.length === 0 ? (
                <div className="py-8 text-center text-gray-500 text-sm">
                  {isId ? 'Tidak ada layanan tersedia. Hubungi spa untuk voucher custom.' : 'No services available. Contact spa for custom voucher.'}
                </div>
              ) : (
                giftOptions.map((item) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className="w-full p-4 rounded-xl border-2 border-gray-100 hover:border-amber-300 bg-white text-left transition-all flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-sm font-semibold text-gray-900 block">{item.name}</span>
                      {item.priceLabel && (
                        <span className="text-xs text-amber-600 font-medium">{item.priceLabel}</span>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-amber-500" />
                  </button>
                ))
              )}
            </div>
          )}

          {/* Step 2: Voucher details – recipient name + live card preview */}
          {step === 'details' && selectedItem && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  {isId ? 'Nama penerima voucher *' : "Recipient's name *"}
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder={isId ? 'Nama teman / keluarga' : "Friend's or family name"}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  {isId ? 'Nama Anda (pengirim)' : 'Your name (sender)'}
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder={isId ? 'Opsional' : 'Optional'}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  {isId ? 'Pesan pribadi (opsional)' : 'Personal message (optional)'}
                </label>
                <textarea
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                  placeholder={isId ? 'Ucapan untuk penerima...' : 'A message for the recipient...'}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none resize-none transition-all"
                />
              </div>

              {/* Voucher card preview */}
              <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden shadow-lg p-4">
                <p className="text-[10px] uppercase tracking-wider text-amber-700 font-bold mb-2">
                  {isId ? 'Pratinjau voucher' : 'Voucher preview'}
                </p>
                <div className="bg-white rounded-xl border border-amber-200 p-4 space-y-2">
                  <p className="text-center text-lg font-bold text-gray-900">
                    {recipientName || (isId ? 'Nama Penerima' : "Recipient's Name")}
                  </p>
                  <p className="text-center text-sm text-gray-600">{placeName}</p>
                  <p className="text-center text-sm font-semibold text-amber-700">{selectedItem.name}</p>
                  {selectedItem.priceLabel && (
                    <p className="text-center text-xs text-gray-500">{selectedItem.priceLabel}</p>
                  )}
                  <div className="border-t border-amber-100 pt-2 mt-2 flex justify-between text-[10px] text-gray-500">
                    <span>No: {voucherNumber}</span>
                    <span>{isId ? 'Berlaku hingga' : 'Valid until'}: {formatExpiry(expiryDate, language)}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  handleSendToSpa();
                  setStep('send');
                }}
                disabled={!recipientName.trim()}
                className="w-full py-3 rounded-xl bg-amber-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-600 transition-colors"
              >
                {isId ? 'Kirim ke Spa untuk Konfirmasi' : 'Send to Spa for Confirmation'}
              </button>
              <button type="button" onClick={handleBack} className="w-full py-2 text-sm text-gray-500 hover:text-gray-700">
                {isId ? '← Kembali' : '← Back'}
              </button>
            </div>
          )}

          {/* Step 3: Send to spa – user has opened WhatsApp; mark when spa confirmed */}
          {step === 'send' && selectedItem && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {isId
                  ? 'Permintaan voucher telah dikirim ke spa via WhatsApp. Setelah spa mengonfirmasi, Anda dapat membagikan kartu hadiah ke penerima.'
                  : 'Your voucher request was sent to the spa via WhatsApp. Once the spa confirms, you can share the gift card with the recipient.'}
              </p>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-xs text-gray-600 mb-2">
                  {isId ? 'Sudah dapat konfirmasi dari spa?' : 'Did the spa confirm?'}
                </p>
                <button
                  type="button"
                  onClick={handleMarkConfirmed}
                  className="w-full py-3 rounded-xl bg-green-500 text-white font-semibold flex items-center justify-center gap-2 hover:bg-green-600"
                >
                  <MessageCircle className="w-5 h-5" />
                  {isId ? 'Ya, spa sudah konfirmasi' : "Yes, spa confirmed"}
                </button>
              </div>
              <button
                type="button"
                onClick={handleSendToSpa}
                className="w-full py-3 rounded-xl border-2 border-amber-500 text-amber-600 font-semibold flex items-center justify-center gap-2 hover:bg-amber-50"
              >
                <MessageCircle className="w-5 h-5" />
                {isId ? 'Kirim ulang ke WhatsApp Spa' : 'Resend to Spa WhatsApp'}
              </button>
              <button type="button" onClick={handleBack} className="w-full py-2 text-sm text-gray-500 hover:text-gray-700">
                {isId ? '← Kembali' : '← Back'}
              </button>
            </div>
          )}

          {/* Step 4: Share gift card via WhatsApp */}
          {step === 'share' && selectedItem && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {isId
                  ? 'Bagikan kartu hadiah ini ke penerima via WhatsApp. Mereka dapat menukarkan voucher di spa.'
                  : 'Share this gift card with the recipient via WhatsApp. They can redeem the voucher at the spa.'}
              </p>
              <button
                type="button"
                onClick={handleShareViaWhatsApp}
                className="w-full py-3 rounded-xl bg-green-500 text-white font-semibold flex items-center justify-center gap-2 hover:bg-green-600"
              >
                <Share2 className="w-5 h-5" />
                {isId ? 'Bagikan via WhatsApp' : 'Share via WhatsApp'}
              </button>
              <button type="button" onClick={handleBack} className="w-full py-2 text-sm text-gray-500 hover:text-gray-700">
                {isId ? '← Kembali' : '← Back'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
