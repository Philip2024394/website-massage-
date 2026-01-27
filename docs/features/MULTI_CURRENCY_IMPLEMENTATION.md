# 💱 Multi-Currency System Implementation Guide

## ✅ Complete Implementation

### **What's Been Implemented:**

## 1. **Currency Service** (`lib/currencyService.ts`)

### Supported Currencies:
- 🇮🇩 **Indonesia (IDR)** - Rupiah - `Rp` symbol
- 🇲🇾 **Malaysia (MYR)** - Ringgit - `RM` symbol  
- 🇸🇬 **Singapore (SGD)** - Dollar - `S$` symbol
- 🇹🇭 **Thailand (THB)** - Baht - `฿` symbol
- 🇵🇭 **Philippines (PHP)** - Peso - `₱` symbol
- 🇻🇳 **Vietnam (VND)** - Dong - `₫` symbol

### Features:
✅ Automatic currency formatting with proper locale
✅ Currency conversion from IDR (base currency)
✅ Compact format support (250k vs 250,000)
✅ Price parsing (handles "250k", "250K", "250,000", etc.)
✅ Symbol positioning (before/after based on locale)
✅ Decimal handling (0 for IDR/THB/VND, 2 for others)
✅ Thousands separator (dot for IDR/VN, comma for others)
✅ Persistent country selection via localStorage

### Exchange Rates (IDR as base):
```javascript
ID: 1              // Indonesian Rupiah (base)
MY: 0.00029        // 1 IDR = 0.00029 MYR
SG: 0.000087       // 1 IDR = 0.000087 SGD
TH: 0.0022         // 1 IDR = 0.0022 THB
PH: 0.0036         // 1 IDR = 0.0036 PHP
VN: 1.63           // 1 IDR = 1.63 VND
```

**Note:** In production, fetch real-time rates from an API.

---

## 2. **Updated CityContext** (`context/CityContext.tsx`)

### New Features:
✅ Added `countryCode` to context
✅ Added `setCountry()` function
✅ Automatic currency service sync when country changes
✅ Country persisted in localStorage
✅ Maps country codes to country names

### Usage:
```tsx
const { countryCode, setCountry } = useCityContext();

// When user selects country
setCountry('TH'); // Automatically updates currency to Thai Baht
```

---

## 3. **Currency Hook** (`hooks/useCurrency.ts`)

### Easy currency access for React components:

```tsx
import { useCurrency } from '../hooks/useCurrency';

function MyComponent() {
  const { format, formatFromIDR, symbol, code } = useCurrency();
  
  // Format price in current currency
  const price = format(250000); // "฿550" if Thailand selected
  
  // Format from IDR base amount
  const priceFromIDR = formatFromIDR(250000); // Auto-converts
  
  // Use compact format
  const compact = format(250000, true); // "฿550" or "550k"
  
  return <div>Price: {price}</div>;
}
```

---

## 4. **Landing Page Integration**

✅ Country selection automatically:
  - Updates currency via CityContext
  - Loads native language translations
  - Persists selection

**Flow:**
1. User selects **Thailand** 🇹🇭
2. `setCountry('TH')` is called
3. CurrencyService switches to Thai Baht `฿`
4. Translations load for Thai language
5. All prices automatically display in Baht

---

## 📋 **How to Use in Your Components**

### **Option 1: Use the Hook (Recommended)**

```tsx
import { useCurrency } from '../hooks/useCurrency';

function PriceDisplay() {
  const { format, symbol } = useCurrency();
  
  return (
    <div>
      <span>{symbol}</span>
      <span>{format(pricing['60'])}</span>
    </div>
  );
}
```

### **Option 2: Direct Service Access**

```tsx
import { currencyService } from '../lib/currencyService';

// Format price
const price = currencyService.formatPrice(250000);

// Format from IDR
const converted = currencyService.formatFromIDR(250000);

// Get symbol
const symbol = currencyService.getSymbol();
```

### **Option 3: Use Utility Functions**

```tsx
import { formatPrice, getCurrencySymbol } from '../lib/currencyService';

const price = formatPrice(250000, undefined, true); // Compact format
const symbol = getCurrencySymbol();
```

---

## 🔧 **Integration Checklist**

### **For Dashboards:**
- [ ] Import `useCurrency` hook
- [ ] Replace hardcoded `Rp` symbols with `{symbol}`
- [ ] Replace `formatPrice` functions with `format()`
- [ ] Update price inputs to use `parse()` for parsing
- [ ] Test with different country selections

### **For Profile Cards:**
- [ ] Update `TherapistCard.tsx` price displays
- [ ] Update `TherapistHomeCard.tsx` pricing section
- [ ] Update `MassagePlaceCard.tsx` pricing
- [ ] Replace `Rp` with dynamic symbol

### **For Price Sliders:**
- [ ] Update input parsing to use `currency.parse()`
- [ ] Update display formatting to use `currency.format()`
- [ ] Update placeholder text with current symbol

### **For Price Containers:**
- [ ] Update any hardcoded currency displays
- [ ] Use `formatFromIDR()` if prices stored in IDR
- [ ] Add currency symbol indicators

---

## 💡 **Example Implementations**

### **Dashboard Pricing Section:**

```tsx
import { useCurrency } from '../hooks/useCurrency';

function PricingSection() {
  const { format, parse, symbol } = useCurrency();
  const [price, setPrice] = useState(250000);
  
  const handlePriceChange = (value: string) => {
    const parsed = parse(value); // Handles "250k", "250000", etc.
    setPrice(parsed);
  };
  
  return (
    <div>
      <label>Price ({symbol})</label>
      <input
        type="text"
        value={format(price, true)} // Compact: "250k"
        onChange={(e) => handlePriceChange(e.target.value)}
        placeholder={`e.g., ${symbol}250k`}
      />
      <p>Full amount: {format(price)}</p>
    </div>
  );
}
```

### **Therapist Card:**

```tsx
import { useCurrency } from '../hooks/useCurrency';

function TherapistCard({ therapist }) {
  const { format } = useCurrency();
  
  return (
    <div className="pricing">
      <div>60 min: {format(therapist.pricing['60'])}</div>
      <div>90 min: {format(therapist.pricing['90'])}</div>
      <div>120 min: {format(therapist.pricing['120'])}</div>
    </div>
  );
}
```

### **Admin Dashboard:**

```tsx
import { useCurrency, useCityContext } from '../hooks';

function AdminDashboard() {
  const { countryCode } = useCityContext();
  const { format, code } = useCurrency();
  
  return (
    <div>
      <h2>Dashboard ({code})</h2>
      <p>Country: {countryCode}</p>
      <p>Sample Price: {format(250000)}</p>
    </div>
  );
}
```

---

## 🚀 **Next Steps**

### **Immediate Actions:**
1. ✅ **Test country selection** - Switch between countries and verify currency changes
2. ✅ **Verify translation loading** - Ensure auto-translation works
3. 🔄 **Update components** - Start integrating currency hook into existing components

### **Components to Update (Priority Order):**
1. **TherapistCard.tsx** - Most visible to users
2. **TherapistHomeCard.tsx** - Home page displays
3. **MassagePlaceCard.tsx** - Place listings
4. **Dashboards:**
   - `TherapistDashboard.tsx`
   - `PlaceDashboard.tsx`
   - `FacialDashboard.tsx`
   - `AdminDashboard.tsx`
5. **Booking Components**
6. **Chat Components** (ChatPriceDisplay)
7. **Menu Pages**

### **Future Enhancements:**
- 🔄 Add real-time exchange rate API integration
- 📊 Add currency conversion history
- 🎨 Add currency selector in user settings
- 📱 Mobile-specific currency displays
- 💾 Store prices in IDR, display in local currency

---

## 🧪 **Testing Guide**

### **Test Scenarios:**

1. **Country Selection:**
   - Select Indonesia → Verify `Rp` symbol
   - Select Thailand → Verify `฿` symbol  
   - Select Malaysia → Verify `RM` symbol
   - Select Singapore → Verify `S$` symbol
   - Select Philippines → Verify `₱` symbol
   - Select Vietnam → Verify `₫` symbol

2. **Price Formatting:**
   - Input: `250k` → Parses correctly
   - Input: `250000` → Formats correctly
   - Input: `250,000` → Parses correctly
   - Compact: `250000` → Shows `250k`
   - Full: `250000` → Shows locale-formatted

3. **Currency Conversion:**
   - IDR 250,000 → MYR ~73
   - IDR 250,000 → SGD ~22
   - IDR 250,000 → THB ~550
   - IDR 250,000 → PHP ~900
   - IDR 250,000 → VND ~408,000

4. **Persistence:**
   - Select country → Refresh page → Country persisted
   - Currency remains consistent across sessions

---

## ❗ **Important Notes**

### **Price Storage:**
- All prices in database should remain in **IDR** (base currency)
- Convert to display currency only at UI level
- This simplifies backend and allows easy rate updates

### **Migration Path:**
- Existing prices are already in IDR
- No database migration needed
- Just update display components

### **Performance:**
- Currency calculations are fast (simple multiplication)
- Formatting is cached where possible
- LocalStorage reduces initialization overhead

---

## 📞 **Support**

If you encounter issues:
1. Check browser console for currency logs (`💱` emoji)
2. Verify country selection is working
3. Check localStorage for persisted values
4. Test with different country selections

**Everything is ready! Just integrate `useCurrency()` hook into your components.** 🎉
