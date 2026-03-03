/**
 * Indastreet Warehouse — Shop Page
 *
 * Data flow (all via Appwrite):
 *   Products  ← shop_products   collection  (static fallback when collection absent)
 *   Config    ← shop_config     collection  (bank details, WhatsApp number)
 *   Orders    → shop_orders     collection  (saved on checkout)
 *   Files     → shop_payments_bucket        (proof-of-payment uploads)
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ShoppingCart,
  Star,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Minus,
  Truck,
  Upload,
  MessageCircle,
  Package,
  Clock,
  CheckCircle,
  Building2,
  Layers,
  Droplets,
  PaintBucket,
  Wrench,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import {
  fetchShopProducts,
  fetchShopConfig,
  createShopOrder,
  uploadProofOfPayment,
  DEFAULT_BANK_DETAILS,
  type AppwriteProduct,
  type BankDetails,
} from '../lib/appwrite/services/shop.service';

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = 'Scaffolding' | 'Plastering' | 'Drywall' | 'Plumbing' | 'Painting';

interface Product {
  id: string;
  category: Category;
  name: string;
  description: string;
  price: number;
  rating: number;
  reviewCount: number;
  images: string[];
  unit: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

// ─── Static Fallback Data ─────────────────────────────────────────────────────
// Used when Appwrite shop_products collection is not yet populated.

const STATIC_PRODUCTS: Product[] = [
  // Scaffolding
  {
    id: 'sc-001', category: 'Scaffolding',
    name: 'Steel Frame Scaffold Set',
    description: 'Heavy-duty galvanised steel scaffold frames ideal for multi-storey construction projects. Includes cross braces, base plates and locking pins.',
    price: 1850, rating: 4.8, reviewCount: 124,
    images: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1485083269755-a7b559a4fe5e?w=800&auto=format&fit=crop',
    ], unit: 'set',
  },
  {
    id: 'sc-002', category: 'Scaffolding',
    name: 'Aluminium Mobile Tower',
    description: 'Lightweight aluminium mobile scaffold tower with integrated ladder, non-slip deck platform and castor wheels with brakes.',
    price: 2400, rating: 4.6, reviewCount: 87,
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop',
    ], unit: 'unit',
  },
  {
    id: 'sc-003', category: 'Scaffolding',
    name: 'Safety Scaffold Clamps (50 pcs)',
    description: 'High-tensile forged steel scaffold couplers. Suitable for 48.3 mm tubes. Drop-forged for maximum load capacity.',
    price: 320, rating: 4.9, reviewCount: 210,
    images: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&auto=format&fit=crop'],
    unit: 'box',
  },
  // Plastering
  {
    id: 'pl-001', category: 'Plastering',
    name: 'Premium Gypsum Plaster (25 kg)',
    description: 'Fast-setting high-strength gypsum plaster for interior walls and ceilings. Smooth finish, low shrinkage.',
    price: 48, rating: 4.7, reviewCount: 305,
    images: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop',
    ], unit: 'bag',
  },
  {
    id: 'pl-002', category: 'Plastering',
    name: 'Pro Plastering Hawk & Trowel Set',
    description: 'Professional-grade kit with stainless steel trowels, lightweight aluminium hawk and corner tools.',
    price: 185, rating: 4.5, reviewCount: 92,
    images: [
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=800&auto=format&fit=crop',
    ], unit: 'set',
  },
  // Drywall
  {
    id: 'dw-001', category: 'Drywall',
    name: 'Standard Plasterboard Sheet 2400×1200',
    description: 'Class A gypsum plasterboard for interior partition walls. Tapered edges for seamless jointing.',
    price: 22, rating: 4.6, reviewCount: 418,
    images: [
      'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop',
    ], unit: 'sheet',
  },
  {
    id: 'dw-002', category: 'Drywall',
    name: 'Moisture-Resistant Drywall Board',
    description: 'Green moisture-resistant plasterboard for bathrooms, kitchens and high-humidity areas. 12.5 mm thick.',
    price: 34, rating: 4.8, reviewCount: 167,
    images: ['https://images.unsplash.com/photo-1485083269755-a7b559a4fe5e?w=800&auto=format&fit=crop'],
    unit: 'sheet',
  },
  {
    id: 'dw-003', category: 'Drywall',
    name: 'Drywall Screw Gun Kit',
    description: 'Cordless drywall screw gun with depth-stop clutch, 2× batteries, charger and 1000 collated screws.',
    price: 420, rating: 4.7, reviewCount: 53,
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&auto=format&fit=crop',
    ], unit: 'kit',
  },
  // Plumbing
  {
    id: 'pb-001', category: 'Plumbing',
    name: 'UPVC Pressure Pipe Bundle (6 m)',
    description: 'Class D UPVC pressure pipes for potable water supply. Bundle of 20 × 6-metre lengths.',
    price: 280, rating: 4.9, reviewCount: 231,
    images: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&auto=format&fit=crop',
    ], unit: 'bundle',
  },
  {
    id: 'pb-002', category: 'Plumbing',
    name: 'Pro Plumber Tool Kit (22 pcs)',
    description: 'Complete professional plumbing toolkit: pipe cutters, adjustable wrenches, basin spanner, plunger, Teflon tape.',
    price: 650, rating: 4.6, reviewCount: 78,
    images: [
      'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=800&auto=format&fit=crop',
    ], unit: 'kit',
  },
  // Painting
  {
    id: 'pa-001', category: 'Painting',
    name: 'Interior Emulsion Paint — White (20 L)',
    description: 'Premium trade-grade brilliant white emulsion. High coverage, washable finish and low VOC.',
    price: 95, rating: 4.8, reviewCount: 502,
    images: [
      'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop',
    ], unit: 'tin',
  },
  {
    id: 'pa-002', category: 'Painting',
    name: 'Pro Decorator Roller & Brush Set',
    description: '9" rollers with long-pile sleeves, extension pole, angled brushes (25/50/75 mm), roller tray and liners.',
    price: 120, rating: 4.7, reviewCount: 189,
    images: [
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1485083269755-a7b559a4fe5e?w=800&auto=format&fit=crop',
    ], unit: 'set',
  },
];

const CATEGORIES: { name: Category; icon: React.ReactNode }[] = [
  { name: 'Scaffolding', icon: <Building2 className="w-5 h-5" /> },
  { name: 'Plastering',  icon: <Layers    className="w-5 h-5" /> },
  { name: 'Drywall',     icon: <Package   className="w-5 h-5" /> },
  { name: 'Plumbing',    icon: <Droplets  className="w-5 h-5" /> },
  { name: 'Painting',    icon: <PaintBucket className="w-5 h-5" /> },
];

// ─── Map Appwrite product to local Product type ───────────────────────────────

function mapAppwriteProduct(doc: AppwriteProduct): Product {
  return {
    id:          doc.$id,
    category:    doc.category as Category,
    name:        doc.name,
    description: doc.description,
    price:       doc.price,
    rating:      doc.rating,
    reviewCount: doc.reviewCount,
    images:      Array.isArray(doc.images) ? doc.images : [],
    unit:        doc.unit,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
      ))}
      <span className="text-xs text-gray-500 ml-1">({count})</span>
    </div>
  );
}

function ImageSlider({ images }: { images: string[] }) {
  const [active, setActive] = useState(0);
  const prev = () => setActive((a) => (a - 1 + images.length) % images.length);
  const next = () => setActive((a) => (a + 1) % images.length);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-video">
        <img src={images[active] || ''} alt="Product" className="w-full h-full object-cover transition-all duration-300" />
        {images.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition">
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">{active + 1} / {images.length}</div>
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button key={i} onClick={() => setActive(i)} className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${i === active ? 'border-orange-500' : 'border-transparent opacity-60 hover:opacity-100'}`}>
              <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Product Detail Modal ─────────────────────────────────────────────────────

function ProductModal({ product, onClose, onAddToCart }: {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, qty: number) => void;
}) {
  const [qty, setQty] = useState(1);
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b">
          <h2 className="font-bold text-gray-900 text-lg leading-tight pr-4">{product.name}</h2>
          <button onClick={onClose} className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="p-4 space-y-5">
          {product.images.length > 0 && <ImageSlider images={product.images} />}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="inline-block px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">{product.category}</span>
              <StarRating rating={product.rating} count={product.reviewCount} />
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-gray-900">${product.price.toLocaleString()}<span className="text-sm font-normal text-gray-500 ml-1">/ {product.unit}</span></p>
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-1.5">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="text-gray-700 hover:text-orange-600"><Minus className="w-4 h-4" /></button>
              <span className="w-6 text-center font-semibold text-gray-900">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="text-gray-700 hover:text-orange-600"><Plus className="w-4 h-4" /></button>
            </div>
          </div>
          <button
            onClick={() => { onAddToCart(product, qty); onClose(); }}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            Add {qty} to Cart — ${(product.price * qty).toLocaleString()}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Checkout Modal ───────────────────────────────────────────────────────────

function CheckoutModal({ cart, bankDetails, onClose, onOrderSent }: {
  cart: CartItem[];
  bankDetails: BankDetails;
  onClose: () => void;
  onOrderSent: () => void;
}) {
  const [seaFreight, setSeaFreight]   = useState('');
  const [selfPickup, setSelfPickup]   = useState(false);
  const [pickupDate, setPickupDate]   = useState('');
  const [pickupTime, setPickupTime]   = useState('');
  const [proofFile,  setProofFile]    = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [name,    setName]    = useState('');
  const [phone,   setPhone]   = useState('');
  const [address, setAddress] = useState('');
  const [step,    setStep]    = useState<'review' | 'payment' | 'confirm'>('review');
  const [saving,  setSaving]  = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const subTotal  = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const freight   = parseFloat(seaFreight) || 0;
  const total     = subTotal + freight;
  const orderRef  = `INS-${Date.now().toString().slice(-6)}`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setProofFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setProofPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const buildWhatsAppMessage = (proofUrl?: string | null) => {
    const lines = [
      `*Indastreet Warehouse — New Order*`,
      `Order Ref: ${orderRef}`,
      ``,
      `*Customer Details*`,
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Address: ${address}`,
      ``,
      `*Order Items*`,
      ...cart.map((i) => `• ${i.product.name} × ${i.quantity} — $${(i.product.price * i.quantity).toLocaleString()}`),
      ``,
      `Subtotal: $${subTotal.toLocaleString()}`,
      `Sea Freight: $${freight.toLocaleString()}`,
      `*Total: $${total.toLocaleString()}*`,
      ``,
    ];
    if (selfPickup && pickupDate && pickupTime) {
      lines.push(`*Delivery: Self Pickup*`, `Pickup Date: ${pickupDate}`, `Pickup Time: ${pickupTime}`);
    } else {
      lines.push(`*Delivery: Sea Freight*`);
    }
    if (proofUrl) {
      lines.push(``, `Proof of payment: ${proofUrl}`);
    } else {
      lines.push(``, `Proof of payment attached. Please confirm order.`);
    }
    return encodeURIComponent(lines.join('\n'));
  };

  const handleSendWhatsApp = async () => {
    setSaving(true);
    setSaveError(null);
    let proofUrl: string | null = null;

    // 1. Upload proof of payment to Appwrite Storage
    if (proofFile) {
      proofUrl = await uploadProofOfPayment(proofFile, orderRef);
    }

    // 2. Save order to Appwrite
    const savedId = await createShopOrder({
      orderRef,
      customerName:    name,
      customerPhone:   phone,
      deliveryAddress: address,
      items:           JSON.stringify(cart.map((i) => ({ id: i.product.id, name: i.product.name, qty: i.quantity, price: i.product.price }))),
      subtotal:        subTotal,
      seaFreight:      freight,
      total,
      selfPickup,
      pickupDate:  selfPickup ? pickupDate : undefined,
      pickupTime:  selfPickup ? pickupTime : undefined,
      proofOfPaymentUrl: proofUrl ?? undefined,
      status:    'pending',
      createdAt: new Date().toISOString(),
    });

    if (!savedId) {
      // Non-fatal — order still goes via WhatsApp even if Appwrite save fails
      setSaveError('Order could not be saved to the database, but you can still send it via WhatsApp.');
    }

    setSaving(false);

    // 3. Open WhatsApp with pre-filled message
    const msg     = buildWhatsAppMessage(proofUrl);
    const waNum   = bankDetails.whatsappNumber.replace(/\D/g, '');
    window.open(`https://wa.me/${waNum}?text=${msg}`, '_blank');
    onOrderSent();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl sm:rounded-2xl rounded-t-2xl max-h-[95vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b">
          <div className="flex items-center gap-3">
            {step !== 'review' && (
              <button onClick={() => setStep(step === 'confirm' ? 'payment' : 'review')} className="text-gray-400 hover:text-gray-700">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="font-bold text-gray-900 text-lg">
              {step === 'review'  && 'Order Review'}
              {step === 'payment' && 'Payment & Shipping'}
              {step === 'confirm' && 'Confirm & Send'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
        </div>

        <div className="p-4 space-y-5">

          {/* ── Step 1: Review ── */}
          {step === 'review' && (
            <>
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    {item.product.images[0] && (
                      <img src={item.product.images[0]} alt={item.product.name} className="w-14 h-14 rounded-lg object-cover" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{item.product.name}</p>
                      <p className="text-xs text-gray-500">{item.product.category}</p>
                      <p className="text-sm font-bold text-orange-600">${(item.product.price * item.quantity).toLocaleString()}</p>
                    </div>
                    <span className="text-sm text-gray-600 font-medium">×{item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800">Your Details</h3>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400" />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone / WhatsApp number"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400" />
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Delivery address / destination port"
                  rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 resize-none" />
              </div>
              <button onClick={() => setStep('payment')} disabled={!name || !phone || !address}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition">
                Continue to Payment
              </button>
            </>
          )}

          {/* ── Step 2: Payment & Shipping ── */}
          {step === 'payment' && (
            <>
              {/* Bank details from Appwrite */}
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-2">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-orange-500" /> Bank Transfer Details
                </h3>
                {[
                  ['Bank',         bankDetails.bankName],
                  ['Account Name', bankDetails.accountName],
                  ['Account No.',  bankDetails.accountNumber],
                  ['Branch Code',  bankDetails.branchCode],
                  ['SWIFT',        bankDetails.swiftCode],
                  ['Reference',    orderRef],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-semibold text-gray-900 text-right">{value}</span>
                  </div>
                ))}
              </div>

              {/* Sea freight */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Truck className="w-4 h-4 text-orange-500" />Sea Freight</h3>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">$</span>
                  <input type="number" value={seaFreight} onChange={(e) => setSeaFreight(e.target.value)}
                    placeholder="Enter sea freight cost"
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400" />
                </div>
                <p className="text-xs text-gray-400">Enter the sea freight quote provided by your shipping agent.</p>
              </div>

              {/* Self pickup */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={selfPickup} onChange={(e) => setSelfPickup(e.target.checked)} className="w-4 h-4 accent-orange-500" />
                  <span className="font-semibold text-gray-800 flex items-center gap-2"><Clock className="w-4 h-4 text-orange-500" />I will arrange my own pickup</span>
                </label>
                {selfPickup && (
                  <div className="pl-7 space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-1 space-y-1">
                        <label className="text-xs text-gray-500">Pickup Date</label>
                        <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <label className="text-xs text-gray-500">Pickup Time</label>
                        <input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
                      </div>
                    </div>
                    <p className="text-xs text-orange-600 font-medium">✓ We will confirm your pickup time via WhatsApp.</p>
                  </div>
                )}
              </div>

              {/* Upload proof */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Upload className="w-4 h-4 text-orange-500" />Upload Proof of Payment</h3>
                <button onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-orange-300 rounded-xl p-4 text-center hover:bg-orange-50 transition">
                  {proofPreview ? (
                    <img src={proofPreview} alt="Proof" className="max-h-32 mx-auto rounded-lg object-contain" />
                  ) : (
                    <div className="text-gray-400 space-y-1">
                      <Upload className="w-8 h-8 mx-auto text-orange-300" />
                      <p className="text-sm">Click to upload screenshot or photo</p>
                      <p className="text-xs">JPG, PNG, PDF accepted</p>
                    </div>
                  )}
                </button>
                <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
                {proofFile && <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" />{proofFile.name} — will be uploaded to Appwrite</p>}
              </div>

              {/* Order total */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${subTotal.toLocaleString()}</span></div>
                <div className="flex justify-between text-gray-600"><span>Sea Freight</span><span>${freight.toLocaleString()}</span></div>
                <div className="flex justify-between font-bold text-gray-900 border-t pt-2 text-base"><span>Total</span><span>${total.toLocaleString()}</span></div>
              </div>

              <button onClick={() => setStep('confirm')}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition">
                Review & Send Order
              </button>
            </>
          )}

          {/* ── Step 3: Confirm ── */}
          {step === 'confirm' && (
            <>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center space-y-2">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto" />
                <p className="font-bold text-gray-900">Almost there!</p>
                <p className="text-sm text-gray-600">
                  Your order will be saved to our system and WhatsApp will open with all details pre-filled.
                  {proofFile && ' Your proof of payment will be uploaded to Appwrite Storage.'}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <p className="font-semibold text-gray-800 mb-2">Order Summary</p>
                {cart.map((i) => (
                  <div key={i.product.id} className="flex justify-between text-gray-600">
                    <span>{i.product.name} ×{i.quantity}</span>
                    <span>${(i.product.price * i.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t pt-2 flex justify-between font-bold text-gray-900">
                  <span>Total (incl. freight)</span><span>${total.toLocaleString()}</span>
                </div>
                {selfPickup && pickupDate && (
                  <p className="text-xs text-orange-600 mt-1">Pickup: {pickupDate} at {pickupTime}</p>
                )}
              </div>

              {saveError && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-start gap-2 text-sm text-yellow-800">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-yellow-500" />
                  <span>{saveError}</span>
                </div>
              )}

              <button onClick={handleSendWhatsApp} disabled={saving}
                className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2">
                {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
                {saving ? 'Saving order…' : 'Save & Send via WhatsApp'}
              </button>

              <p className="text-xs text-center text-gray-400">
                After sending, please also attach your proof of payment image in the WhatsApp chat if not already included in the message.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product, onSelect }: { product: Product; onSelect: (p: Product) => void }) {
  return (
    <div onClick={() => onSelect(product)}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
      <div className="relative overflow-hidden aspect-[4/3]">
        {product.images[0] ? (
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <Package className="w-10 h-10 text-gray-300" />
          </div>
        )}
        <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{product.category}</span>
        {product.images.length > 1 && (
          <span className="absolute top-2 right-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded-full">+{product.images.length - 1}</span>
        )}
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2">{product.name}</h3>
        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{product.description}</p>
        <StarRating rating={product.rating} count={product.reviewCount} />
        <div className="flex items-center justify-between pt-1">
          <p className="text-lg font-bold text-orange-600">${product.price.toLocaleString()}<span className="text-xs font-normal text-gray-400 ml-1">/{product.unit}</span></p>
          <button onClick={(e) => { e.stopPropagation(); onSelect(product); }}
            className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition">View</button>
        </div>
      </div>
    </div>
  );
}

// ─── Cart Drawer ──────────────────────────────────────────────────────────────

function CartDrawer({ cart, onClose, onUpdate, onRemove, onCheckout }: {
  cart: CartItem[];
  onClose: () => void;
  onUpdate: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}) {
  const total = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-sm shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-orange-500" />Cart ({cart.reduce((s, i) => s + i.quantity, 0)})
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Your cart is empty</p>
            </div>
          ) : cart.map((item) => (
            <div key={item.product.id} className="flex gap-3 items-start">
              {item.product.images[0] && (
                <img src={item.product.images[0]} alt={item.product.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 leading-tight">{item.product.name}</p>
                <p className="text-xs text-gray-400">{item.product.category}</p>
                <p className="font-bold text-orange-600 text-sm">${(item.product.price * item.quantity).toLocaleString()}</p>
                <div className="flex items-center gap-2 mt-1">
                  <button onClick={() => onUpdate(item.product.id, item.quantity - 1)} className="text-gray-500 hover:text-orange-500"><Minus className="w-4 h-4" /></button>
                  <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                  <button onClick={() => onUpdate(item.product.id, item.quantity + 1)} className="text-gray-500 hover:text-orange-500"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
              <button onClick={() => onRemove(item.product.id)} className="text-gray-300 hover:text-red-400 mt-1"><X className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div className="border-t p-4 space-y-3">
            <div className="flex justify-between font-bold text-gray-900"><span>Subtotal</span><span>${total.toLocaleString()}</span></div>
            <p className="text-xs text-gray-400">Sea freight added at checkout.</p>
            <button onClick={onCheckout} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition">Proceed to Checkout</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Shop Page ───────────────────────────────────────────────────────────

export default function ShopPage() {
  const [products,     setProducts]     = useState<Product[]>([]);
  const [bankDetails,  setBankDetails]  = useState<BankDetails>(DEFAULT_BANK_DETAILS);
  const [loading,      setLoading]      = useState(true);
  const [loadError,    setLoadError]    = useState<string | null>(null);
  const [usingStatic,  setUsingStatic]  = useState(false);

  const [activeCategory, setActiveCategory]   = useState<Category | 'All'>('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart,           setCart]           = useState<CartItem[]>([]);
  const [showCart,       setShowCart]       = useState(false);
  const [showCheckout,   setShowCheckout]   = useState(false);
  const [orderComplete,  setOrderComplete]  = useState(false);

  // ── Load from Appwrite on mount ──────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [appwriteProducts, config] = await Promise.all([
        fetchShopProducts(),
        fetchShopConfig(),
      ]);

      if (appwriteProducts.length > 0) {
        setProducts(appwriteProducts.map(mapAppwriteProduct));
        setUsingStatic(false);
      } else {
        // Collection empty or not found — use static fallback
        setProducts(STATIC_PRODUCTS);
        setUsingStatic(true);
      }

      setBankDetails(config);
    } catch (err) {
      console.error('[ShopPage] loadData error:', err);
      setLoadError('Could not connect to the server. Showing local catalogue.');
      setProducts(STATIC_PRODUCTS);
      setUsingStatic(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = activeCategory === 'All' ? products : products.filter((p) => p.category === activeCategory);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const addToCart = (product: Product, qty: number) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) return prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i);
      return [...prev, { product, quantity: qty }];
    });
  };

  const updateCart = (id: string, qty: number) => {
    if (qty <= 0) setCart((prev) => prev.filter((i) => i.product.id !== id));
    else setCart((prev) => prev.map((i) => i.product.id === id ? { ...i, quantity: qty } : i));
  };

  const removeFromCart = (id: string) => setCart((prev) => prev.filter((i) => i.product.id !== id));

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Fixed Nav ── */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-orange-500" />
            <span className="font-bold text-gray-900 text-base">Indastreet <span className="text-orange-500">Warehouse</span></span>
          </div>
          <button onClick={() => setShowCart(true)}
            className="relative flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-xl text-sm transition">
            <ShoppingCart className="w-4 h-4" />Cart
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{cartCount}</span>
            )}
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative h-[60vh] sm:h-[70vh] flex items-center justify-center overflow-hidden">
        <img src="https://ik.imagekit.io/7grri5v7d/indastreet%20tool%20belts.png" alt="Indastreet Warehouse" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        <div className="relative text-center text-white px-4 space-y-4">
          <p className="text-orange-400 font-semibold tracking-widest text-xs uppercase">Professional Grade</p>
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">
            Construction<br /><span className="text-orange-400">Supplies & Tools</span>
          </h1>
          <p className="text-gray-200 text-sm sm:text-base max-w-md mx-auto">
            Quality scaffolding, plastering, drywall, plumbing and painting supplies — shipped worldwide by sea freight.
          </p>
          <button onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition mt-2">
            Shop Now <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ── Category Bar ── */}
      <section className="bg-white border-b border-gray-200 sticky top-14 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto">
          <button onClick={() => setActiveCategory('All')}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition ${activeCategory === 'All' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            All
          </button>
          {CATEGORIES.map(({ name, icon }) => (
            <button key={name} onClick={() => setActiveCategory(name)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition ${activeCategory === name ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {icon}{name}
            </button>
          ))}
        </div>
      </section>

      {/* ── Products ── */}
      <main id="products" className="max-w-7xl mx-auto px-4 py-8">

        {/* Appwrite status banner */}
        {usingStatic && !loading && (
          <div className="mb-5 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-blue-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Showing local catalogue — connect <strong>shop_products</strong> in Appwrite to manage products from the CMS.</span>
            </div>
            <button onClick={loadData} className="flex-shrink-0 flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium ml-3">
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        )}
        {loadError && (
          <div className="mb-5 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />{loadError}
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {activeCategory === 'All' ? 'All Products' : activeCategory}
            <span className="ml-2 text-gray-400 font-normal text-base">({filtered.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                  <div className="h-5 bg-gray-200 rounded w-1/2 mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} onSelect={setSelectedProduct} />
            ))}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200 mt-12 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Wrench className="w-4 h-4 text-orange-500" />
          <span className="font-bold text-gray-700">Indastreet Warehouse</span>
        </div>
        <p className="text-xs text-gray-400">Worldwide sea freight · Professional grade · Powered by Appwrite</p>
      </footer>

      {/* ── Modals ── */}
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={addToCart} />
      )}
      {showCart && (
        <CartDrawer cart={cart} onClose={() => setShowCart(false)} onUpdate={updateCart} onRemove={removeFromCart}
          onCheckout={() => { setShowCart(false); setShowCheckout(true); }} />
      )}
      {showCheckout && (
        <CheckoutModal cart={cart} bankDetails={bankDetails} onClose={() => setShowCheckout(false)}
          onOrderSent={() => { setOrderComplete(true); setShowCheckout(false); setCart([]); }} />
      )}

      {/* ── Success Toast ── */}
      {orderComplete && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span className="font-semibold text-sm">Order saved & sent! We'll confirm via WhatsApp.</span>
          <button onClick={() => setOrderComplete(false)} className="ml-2 text-white/70 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  );
}
