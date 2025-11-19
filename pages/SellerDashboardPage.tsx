import React, { useEffect, useMemo, useState } from 'react';
import { COUNTRIES } from '../countries';
import { marketplaceService, type MarketplaceSeller, type MarketplaceProduct } from '../lib/marketplaceService';
import { account, storage, ID } from '../lib/appwrite';
import CheckoutButton from '../components/CheckoutButton';
import { APP_CONFIG } from '../config/appConfig';

type Props = {
  onBack: () => void;
  onNavigate?: (page: string) => void;
  t?: any;
};

const SellerDashboardPage: React.FC<Props> = ({ onBack, onNavigate }) => {
  const [seller, setSeller] = useState<MarketplaceSeller | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [salesMode, setSalesMode] = useState<'local'|'global'>('local');
  const [shippingRates, setShippingRates] = useState<Record<string, number>>({});
  const [planStatus, setPlanStatus] = useState<{ label: string; warn?: string } | null>(null);
  const [contactEmail, setContactEmail] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [whatYouWillReceive, setWhatYouWillReceive] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [image, setImage] = useState('');
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [images, setImages] = useState<(File | null)[]>([null, null, null, null, null]);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [price, setPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [promoPercent, setPromoPercent] = useState<number>(0);
  const [countrySearch, setCountrySearch] = useState('');
  const [condition, setCondition] = useState<string>('New');
  const [myProducts, setMyProducts] = useState<MarketplaceProduct[]>([]);
  const [listOpen, setListOpen] = useState(true);
  const [acceptedPayments, setAcceptedPayments] = useState<string[]>([]);
  const [emailVerified, setEmailVerified] = useState<boolean>(true);
  const [verifyingAction, setVerifyingAction] = useState<boolean>(false);

  const countryOptions = useMemo(() => COUNTRIES.map(c => ({ code: c.code, name: c.name })), []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        let id = localStorage.getItem('marketplace_seller_id') || '';
        let s: MarketplaceSeller | null = null;
        if (id) {
          s = await marketplaceService.getSellerById(id);
        }
        try {
          const me = await account.get();
          setEmailVerified(!!(me as any)?.emailVerification);
        } catch { setEmailVerified(false); }
        if (!s) {
          const me = await account.get().catch(() => null);
          const ownerId = (me as any)?.$id;
          if (!ownerId) { onNavigate?.('supplierAuth'); return; }
          s = await marketplaceService.getSellerByOwnerId(ownerId);
          if (s) { try { localStorage.setItem('marketplace_seller_id', s.$id); } catch {} }
        }
        if (!s) { onNavigate?.('sellerRegistration'); return; }
        setSeller(s);
        setSalesMode((s.salesMode as any) || 'local');
        setContactEmail((s.ownerEmail || '').toLowerCase());
        setWebsiteUrl(s.websiteUrl || '');
        try {
          const parsed = s.shippingRates ? JSON.parse(s.shippingRates) : {};
          setShippingRates(parsed);
        } catch {
          setShippingRates({});
        }
        try {
          const methods = s.acceptedPayments ? JSON.parse(s.acceptedPayments) : [];
          if (Array.isArray(methods)) setAcceptedPayments(methods);
        } catch {}
        // compute plan label
        const now = Date.now();
        const inTrial = !!s.trialEndsAt && new Date(s.trialEndsAt).getTime() > now && (s.subscriptionStatus === 'trial');
        if (inTrial) {
          const days = Math.ceil((new Date(s.trialEndsAt!).getTime() - now) / (24*60*60*1000));
          setPlanStatus({ label: `Free Trial • ${days} days left` });
        } else if (s.planTier === 'global' && s.subscriptionStatus === 'active') {
          setPlanStatus({ label: 'Global • Active (Unlimited products)' });
        } else if (s.subscriptionStatus === 'active') {
          setPlanStatus({ label: 'Local • Active (Up to 50 products)' });
        } else {
          setPlanStatus({ label: 'Local • Inactive', warn: 'Subscribe to activate after trial.' });
        }
      } finally { setLoading(false); }
    })();
  }, []);

  const addRate = () => {
    const code = prompt('Enter country code (e.g., SG, MY, AU):');
    if (!code) return;
    const norm = code.trim().toUpperCase();
    const fee = Number(prompt('Enter delivery fee for ' + norm + ':') || '0');
    if (isNaN(fee)) return;
    setShippingRates(prev => ({ ...prev, [norm]: Math.max(0, Math.round(fee)) }));
  };

  const removeRate = (code: string) => {
    setShippingRates(prev => { const copy = { ...prev }; delete copy[code]; return copy; });
  };

  const handleSetRate = (code: string, value: string) => {
    const trimmed = value.trim();
    const num = Number(trimmed);
    setShippingRates(prev => {
      const copy = { ...prev } as Record<string, number>;
      if (trimmed === '' || isNaN(num)) {
        delete copy[code];
        return copy;
      }
      copy[code] = Math.max(0, Math.round(num));
      return copy;
    });
  };

  const saveSettings = async () => {
    if (!seller) return;
    setSaving(true);
    try {
      if (contactEmail && !/^\S+@\S+\.\S+$/.test(contactEmail)) {
        setSaving(false); return;
      }
      if (salesMode === 'global' && !((seller.planTier === 'global') && (seller.subscriptionStatus === 'active'))) {
        setSaving(false); return;
      }
      const ratesStr = salesMode === 'global' ? JSON.stringify(shippingRates) : '{}';
      let normalizedWebsite = websiteUrl.trim();
      if (normalizedWebsite && !/^https?:\/\//i.test(normalizedWebsite)) normalizedWebsite = `https://${normalizedWebsite}`;
      const updated = await marketplaceService.updateSeller(seller.$id, { 
        salesMode, 
        shippingRates: ratesStr,
        acceptedPayments: JSON.stringify(acceptedPayments),
        ownerEmail: contactEmail.trim(),
        websiteUrl: normalizedWebsite
      } as any);
      if (updated) setSeller(updated);
    } finally { setSaving(false); }
  };

  const uploadImagesAndGetUrls = async (): Promise<string[]> => {
    const present = images.filter(Boolean) as File[];
    if (present.length === 0) return image ? [image] : [];
    setUploading(true);
    try {
      const urls: string[] = [];
      const bucketId = '68f76bdd002387590584';
      const endpoint = 'https://syd.cloud.appwrite.io/v1';
      const projectId = '68f23b11000d25eb3664';
      for (const f of present.slice(0,5)) {
        const res: any = await storage.createFile(bucketId, ID.unique(), f);
        const url = `${endpoint}/storage/buckets/${bucketId}/files/${res.$id}/view?project=${projectId}`;
        urls.push(url);
      }
      return urls;
    } finally { setUploading(false); }
  };

  const uploadMainImageAndSetUrl = async (file: File) => {
    setMainImageFile(file);
    setUploading(true);
    try {
      const bucketId = '68f76bdd002387590584';
      const endpoint = 'https://syd.cloud.appwrite.io/v1';
      const projectId = '68f23b11000d25eb3664';
      const res: any = await storage.createFile(bucketId, ID.unique(), file);
      const url = `${endpoint}/storage/buckets/${bucketId}/files/${res.$id}/view?project=${projectId}`;
      setImage(url);
    } finally { setUploading(false); }
  };

  const createProduct = async () => {
    console.log('Create product clicked');
    if (!seller) { console.log('No seller'); return; }
    if (!name.trim()) { alert('Enter product name'); return; }
    if (price < 0) { alert('Price cannot be negative'); return; }
    if (desc.length > 500) { alert('Description must be 500 characters or less'); return; }
    if (videoUrl.trim()) {
      const v = videoUrl.trim();
      const isYouTube = /(^https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(v);
      if (!isYouTube) { alert('Please enter a valid YouTube URL (youtube.com or youtu.be)'); return; }
    }
    
    setCreating(true);
    try {
      console.log('Uploading gallery images...');
      const galleryUrls = await uploadImagesAndGetUrls();
      console.log('Creating product...', { name, price, image });
      const created = await marketplaceService.createProduct({
        $id: '' as any,
        name: name.trim(),
        description: desc.trim().slice(0,500),
        whatYouWillReceive: whatYouWillReceive.trim(),
        videoUrl: videoUrl.trim() || undefined,
        image: image || undefined,
        images: galleryUrls,
        price: Math.round(price),
        stockLevel: Math.max(0, Math.round(stock)),
        condition: condition,
        promoPercent: Math.max(0, Math.min(50, Math.round(promoPercent || 0))),
        sellerId: seller.$id,
        countryCode: seller.countryCode || 'ID',
        currency: ''
      } as any);
      console.log('Product created:', created);
      if (created) {
        setName(''); setDesc(''); setWhatYouWillReceive(''); setVideoUrl(''); setImage(''); setMainImageFile(null); setImages([null,null,null,null,null]); setPrice(0); setStock(0); setCondition('New'); setPromoPercent(0);
        alert('Product created successfully!');
        const list = await marketplaceService.listProductsBySeller(seller.$id);
        setMyProducts(list);
        if (onNavigate) {
          onNavigate('marketplace');
        }
      } else {
        console.error('createProduct returned null - check console for Appwrite errors');
        alert('Failed to create product. Check browser console (F12) for details.');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Error creating product: ' + (error as any).message);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center text-gray-600">Loading…</div>
  );

  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto">
      <header className="bg-white p-4 shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button onClick={onBack} className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200">Back</button>
          <h1 className="text-xl font-bold text-gray-900">Supplier Dashboard</h1>
          <div className="ml-auto text-sm text-gray-600">{seller?.tradingName}</div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto p-4 space-y-6 overflow-y-auto">
        <section className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold mb-2">Plan & Billing</h2>
          <div className="text-sm text-gray-800">{planStatus?.label || 'Local • Trial/Inactive'}</div>
          {planStatus?.warn && <div className="text-xs text-amber-700 mt-1">{planStatus.warn}</div>}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <CheckoutButton label={`Activate Local ${APP_CONFIG.SELLER_LOCAL_PLAN_PRICE_LABEL}`} paymentLinkUrl={APP_CONFIG.SELLER_LOCAL_PLAN_PAYMENT_LINK || undefined} className="w-full inline-flex items-center justify-center px-3 py-2 rounded-lg bg-black text-white" />
            <CheckoutButton label={`Upgrade to Global ${APP_CONFIG.SELLER_GLOBAL_PLAN_PRICE_LABEL}`} paymentLinkUrl={APP_CONFIG.SELLER_GLOBAL_PLAN_PAYMENT_LINK || undefined} className="w-full inline-flex items-center justify-center px-3 py-2 rounded-lg bg-orange-600 text-white" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Local: up to 50 products in your country. Global: unlimited products, sell to configured countries.</p>
        </section>
        <section className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold mb-2">Sales Settings</h2>
          <p className="text-xs text-gray-600 mb-3">Local shows in your country only. Global shows where you set delivery fees.</p>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Contact Email</label>
            <input value={contactEmail} onChange={e=>setContactEmail(e.target.value)} placeholder="you@brand.com" className="w-full border rounded-md px-3 py-2" />
            <p className="text-xs text-gray-500 mt-1">Shown on your shop and product cards for buyers to email you. Optional but recommended.</p>
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Website URL (optional)</label>
            <input value={websiteUrl} onChange={e=>setWebsiteUrl(e.target.value)} placeholder="www.example.com or https://example.com" className="w-full border rounded-md px-3 py-2" />
            <p className="text-xs text-gray-500 mt-1">Shown as a Website button on your product cards and shop.</p>
          </div>
          <div className="flex gap-4 text-sm mb-3">
            <label className="flex items-center gap-2"><input type="radio" checked={salesMode==='local'} onChange={() => setSalesMode('local')} /> Local</label>
            <label className="flex items-center gap-2"><input type="radio" checked={salesMode==='global'} onChange={() => setSalesMode('global')} /> Global</label>
          </div>
          <div className="mt-3">
            <h3 className="font-medium mb-1">Payments They Accept</h3>
            <p className="text-xs text-gray-600 mb-2">These will show on your product cards as accepted payment providers.</p>
            <div className="flex flex-wrap gap-3 text-sm">
              {['Stripe','PayPal','Escrow','Bank Transfer'].map(p => (
                <label key={p} className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={acceptedPayments.includes(p)} onChange={(e)=>{
                    setAcceptedPayments(prev => e.target.checked ? Array.from(new Set([...prev, p])) : prev.filter(x=>x!==p));
                  }} /> {p}
                </label>
              ))}
            </div>
          </div>
          {salesMode==='global' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Search countries</label>
                <input
                  value={countrySearch}
                  onChange={(e)=>setCountrySearch(e.target.value)}
                  placeholder="Type to filter…"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div className="max-h-80 overflow-y-auto border rounded-md">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
                  {COUNTRIES
                    .filter(c => (c.name || '').toLowerCase().includes(countrySearch.toLowerCase()) || (c.code || '').toLowerCase().includes(countrySearch.toLowerCase()))
                    .map(c => (
                      <div key={c.code} className="flex items-center justify-between gap-2 border rounded-md px-2 py-1.5">
                        <div className="text-sm">
                          {c.name} <span className="text-xs text-gray-500">({c.code})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            value={(shippingRates as any)[c.code] ?? ''}
                            onChange={(e)=>handleSetRate(c.code, e.target.value)}
                            placeholder="Fee"
                            className="w-24 border rounded-md px-2 py-1 text-sm"
                          />
                          {(shippingRates as any)[c.code] !== undefined && (
                            <button onClick={()=>removeRate(c.code)} className="text-xs text-red-600 hover:underline">Clear</button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              <p className="text-xs text-gray-500">Set a fee for each country you deliver to. Your products will automatically appear in those countries' marketplaces.</p>
            </div>
          )}
        </section>

        <section className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold mb-2">Add Product</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Name</label>
              <input value={name} onChange={e=>setName(e.target.value)} className="w-full border rounded-md px-3 py-2" placeholder="Product name" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm mb-1">Main Product Image</label>
              <div className="w-32 h-32 border-2 border-dashed rounded-md flex items-center justify-center relative overflow-hidden bg-white">
                {(mainImageFile || image) ? (
                  <img src={mainImageFile ? URL.createObjectURL(mainImageFile) : image} alt="Main" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-gray-500">+ Upload Main Image</span>
                )}
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e)=>{
                  const f = (e.target.files || [])[0];
                  if (f) uploadMainImageAndSetUrl(f);
                }} />
                {(mainImageFile || image) && (
                  <button type="button" onClick={()=>{ setImage(''); setMainImageFile(null); }} className="absolute top-1 right-1 bg-white/80 rounded px-1 text-[10px]">x</button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Upload your main product image</p>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm mb-1">Upload up to 5 Images</label>
              <div className="grid grid-cols-5 gap-2">
                {images.map((f,idx)=> (
                  <div key={idx} className="aspect-square border border-dashed rounded-md flex items-center justify-center relative overflow-hidden bg-white">
                    {f ? (
                      <img src={URL.createObjectURL(f)} alt={`Image ${idx+1}`} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-gray-500">+ Add</span>
                    )}
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e)=>{
                      const file = (e.target.files || [])[0] || null;
                      setImages(prev => { const copy = [...prev]; copy[idx] = file; return copy; });
                    }} />
                    {f && (
                      <button type="button" onClick={()=>setImages(prev=>{ const c=[...prev]; c[idx]=null; return c; })} className="absolute top-1 right-1 bg-white/80 rounded px-1 text-[10px]">x</button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">Tap a box to pick an image from your phone or computer.</p>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm mb-1">Description (max 500)</label>
              <textarea maxLength={500} value={desc} onChange={e=>setDesc(e.target.value)} className="w-full border rounded-md px-3 py-2" rows={4} />
              <div className="text-xs text-gray-500 text-right">{desc.length}/500</div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm mb-1">What You Will Receive (optional)</label>
              <p className="text-xs text-gray-600 mb-1">Explain clearly what the buyer receives when purchasing (e.g., color, shape, size, specifications, warranty/guarantee, inclusions). This helps resolve any issues after delivery.</p>
              <textarea value={whatYouWillReceive} onChange={e=>setWhatYouWillReceive(e.target.value)} className="w-full border rounded-md px-3 py-2" rows={6} placeholder="Full details of included items, variants, sizes, materials, care instructions, guarantee, etc." />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm mb-1">Product Video URL (YouTube) - Optional</label>
              <input value={videoUrl} onChange={e=>setVideoUrl(e.target.value)} className="w-full border rounded-md px-3 py-2" placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..." />
              <p className="text-xs text-gray-500 mt-1">Only YouTube links are allowed</p>
            </div>
            <div>
              <label className="block text-sm mb-1">Price</label>
              <input type="number" value={price || ''} onChange={e=>setPrice(e.target.value === '' ? 0 : Number(e.target.value))} className="w-full border rounded-md px-3 py-2" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm mb-1">Stock</label>
              <input type="number" value={stock || ''} onChange={e=>setStock(e.target.value === '' ? 0 : Number(e.target.value))} className="w-full border rounded-md px-3 py-2" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm mb-1">Condition</label>
              <select value={condition} onChange={e=>setCondition(e.target.value)} className="w-full border rounded-md px-3 py-2">
                <option value="New">New</option>
                <option value="Used">Used</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Promo Percent (1–50)</label>
              <input
                type="number"
                min={0}
                max={50}
                value={promoPercent || 0}
                onChange={e=>{
                  const v = Number(e.target.value);
                  if (isNaN(v)) { setPromoPercent(0); return; }
                  setPromoPercent(Math.max(0, Math.min(50, Math.round(v))));
                }}
                className="w-full border rounded-md px-3 py-2"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">Set a promo percentage to show an orange badge on your product card.</p>
            </div>
            </div>
          </div>
          <div className="pt-3">
            <button disabled={uploading || creating} onClick={createProduct} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
              {uploading ? 'Uploading…' : creating ? 'Creating Product…' : 'Create Product'}
            </button>
          </div>
        </section>

        <section className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">My Products</h2>
            <button onClick={()=>setListOpen(v=>!v)} className="text-sm text-blue-600 hover:underline">{listOpen? 'Hide':'Show'}</button>
          </div>
          {listOpen && (
            <div className="mt-3 divide-y">
              {myProducts.length===0 && (
                <div className="text-sm text-gray-500">No products yet. Click "List My Products" to refresh.</div>
              )}
              {myProducts.map(p => (
                <div key={p.$id} className="py-3 flex items-center gap-3">
                  <img src={p.image || (p.images && p.images[0]) || ''} alt={p.name} className="w-14 h-14 object-cover rounded bg-gray-100" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate flex items-center gap-2">
                      <span className="truncate">{p.name}</span>
                      {p.isActive === false && (
                        <span className="shrink-0 text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">Inactive (Admin)</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 truncate">Stock: {typeof p.stockLevel==='number'? p.stockLevel: 0}</div>
                  </div>
                  <div className="text-sm text-gray-700">{p.price}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default SellerDashboardPage;
