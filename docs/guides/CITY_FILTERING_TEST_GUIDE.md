# Strict City Filtering - Testing Guide 🧪

## Quick Test (5 Minutes)

### 1. Open Application
```
URL: http://localhost:3005
Browser: Chrome/Edge (recommended for dev tools)
```

### 2. Test Bandung → Jakarta Switch

#### Step 1: Select Bandung
1. Open landing page
2. City selector should show "Bandung" or prompt selection
3. Click "Select" or "Proceed" after selecting Bandung
4. Navigate to HomePage

**Expected Results**:
- ✅ Hero text shows "**Bandung**" (not "All Indonesia")
- ✅ Subtext shows "**Indonesia**" (not "Jakarta, Indonesia")
- ✅ Therapist tab shows ONLY Bandung therapists
- ✅ Places tab shows ONLY Bandung places
- ✅ Hotels tab shows ONLY Bandung hotels
- ✅ Console logs show "✅ INCLUDED" for Bandung providers
- ✅ Console logs show "❌ EXCLUDED" for Jakarta/other city providers

#### Step 2: Switch to Jakarta
1. Click city selector in header or use location button
2. Change city to "Jakarta"
3. HomePage should refresh automatically

**Expected Results**:
- ✅ Hero text changes to "**Jakarta**"
- ✅ Completely different list of therapists/places/hotels
- ✅ NO Bandung providers visible
- ✅ Console logs confirm filter switch

#### Step 3: Switch to Canggu (Bali)
1. Change city to "Canggu"

**Expected Results**:
- ✅ Hero text shows "**Canggu**"
- ✅ ONLY Canggu providers (beach/resort area)
- ✅ NO Jakarta or Bandung providers
- ✅ NO Seminyak or Ubud providers (different Bali cities)

---

## Console Log Verification

### Open Browser Console
`F12` → Console tab → Filter by "INCLUDED" or "EXCLUDED"

### Expected Logs (Bandung Selected)
```
🔄 Syncing selectedCity from CityContext: "Bandung"

✅ INCLUDED: "Ahmad Massage Therapy" matches city "Bandung"
✅ INCLUDED: "Bandung Spa Center" matches city "Bandung"
❌ EXCLUDED: "Jakarta Wellness Hub" (city: "Jakarta") does not match "Bandung"
❌ EXCLUDED: "Siti's Massage - Jakarta" (city: "Jakarta") does not match "Bandung"
✅ Including featured therapist "Budi Santoso" in city "Bandung" (shows everywhere)

✅ INCLUDED PLACE: "Bandung Reflexology" matches city "Bandung"
❌ EXCLUDED PLACE: "Kemang Spa" (city: "Jakarta") does not match "Bandung"

✅ INCLUDED HOTEL: "Hotel Savoy Bandung" matches city "Bandung"
❌ EXCLUDED HOTEL: "Grand Indonesia Hotel" (city: "Jakarta") does not match "Bandung"
```

### Red Flags 🚩
If you see any of these, filtering is BROKEN:
```
❌ BAD: No "❌ EXCLUDED" logs when switching cities
❌ BAD: Jakarta therapists appear when Bandung selected
❌ BAD: Hero text still shows "All Indonesia"
❌ BAD: No sync log from CityContext
```

---

## Cross-City Contamination Test

### Test Matrix

| Selected City | Should Appear | Should NOT Appear |
|---------------|---------------|-------------------|
| Bandung | Bandung providers | Jakarta, Canggu, Yogyakarta |
| Jakarta | Jakarta providers | Bandung, Canggu, Yogyakarta |
| Canggu | Canggu providers | Seminyak, Ubud, Jakarta |
| Yogyakarta | Yogyakarta providers | Jakarta, Bandung, Semarang |

### How to Test
1. Note down therapist names in each city
2. Switch between cities
3. Verify NO overlap (except featured samples)

**Featured Samples Exception**:
- "Budi Santoso" therapist appears in ALL Indonesia cities ✅
- Sample massage places appear everywhere ✅
- This is intentional for educational purposes

---

## Data Quality Check

### Providers Missing City Data

**Symptom**: Provider doesn't appear in ANY city

**Console Log**:
```
❌ EXCLUDED: "John's Massage" has no city data
```

**Solution**: Update Appwrite record:
1. Open Appwrite console
2. Find provider record
3. Set `city` field to correct city name (e.g., "Bandung")
4. Ensure exact spelling matches city selector options

---

## All 6 Countries Test

### Testing Checklist

#### Indonesia
- [ ] Jakarta → Only Jakarta providers
- [ ] Bandung → Only Bandung providers
- [ ] Canggu → Only Canggu providers
- [ ] Seminyak → Only Seminyak providers
- [ ] Ubud → Only Ubud providers
- [ ] Yogyakarta → Only Yogyakarta providers

#### Malaysia
- [ ] Kuala Lumpur → Only KL providers
- [ ] Penang → Only Penang providers
- [ ] Johor Bahru → Only JB providers

#### Singapore
- [ ] Singapore → All Singapore providers (city-state)

#### Thailand
- [ ] Bangkok → Only Bangkok providers
- [ ] Phuket → Only Phuket providers
- [ ] Chiang Mai → Only Chiang Mai providers
- [ ] Pattaya → Only Pattaya providers

#### Philippines
- [ ] Manila → Only Manila providers
- [ ] Cebu → Only Cebu providers
- [ ] Boracay → Only Boracay providers

#### Vietnam
- [ ] Ho Chi Minh City → Only HCMC providers
- [ ] Hanoi → Only Hanoi providers
- [ ] Da Nang → Only Da Nang providers

---

## Performance Test

### Load Time Check
1. Select city on landing page
2. Time how long until HomePage shows data
3. Check console for fetch/filter logs

**Expected**: < 2 seconds from city selection to filtered results

### Filter Performance
- Filter logic runs in useEffect when selectedCity changes
- Should be instant (< 100ms) for client-side filtering
- Network delay only affects initial data fetch

---

## Edge Cases

### Test 1: No Providers in City
**Setup**: Select a city with no registered providers

**Expected**:
- Empty state message: "No providers available in {city}"
- OR showcase profiles from Yogyakarta (if implemented)
- Console logs: "❌ EXCLUDED" for all providers from other cities

### Test 2: City Name Variations
**Setup**: Test cities with different name formats

**Examples**:
- "Yogyakarta" vs "Jogjakarta" vs "Yogya"
- "Ho Chi Minh City" vs "HCMC" vs "Saigon"

**Expected**: Exact match required, no fuzzy matching

### Test 3: Special Characters
**Setup**: City names with spaces/special chars

**Examples**:
- "Kota Kinabalu"
- "George Town"

**Expected**: Normalized comparison handles spaces correctly

### Test 4: Case Sensitivity
**Setup**: Test mixed case city names

**Examples**:
- "BANDUNG" vs "bandung" vs "Bandung"

**Expected**: All variations match (case-insensitive)

---

## Browser Developer Tools Checklist

### Network Tab
- [ ] Initial data fetch includes city parameter
- [ ] No excessive re-fetching when switching cities
- [ ] Filter happens client-side (no new network request per city)

### Console Tab
- [ ] Filter logs appear for every provider
- [ ] Sync log from CityContext appears
- [ ] No JavaScript errors

### React DevTools (if installed)
- [ ] CityContext shows correct city
- [ ] HomePage `selectedCity` state syncs with context
- [ ] `cityFilteredTherapists`, `cityFilteredPlaces` states update

---

## Regression Test

### Ensure Previous Features Still Work
- [ ] GPS location detection ("Use my GPS location" button)
- [ ] City search on landing page
- [ ] Country auto-detection from IP
- [ ] Currency switches with country (IDR, MYR, SGD, THB, PHP, VND)
- [ ] Language translation works
- [ ] Featured samples (Budi) appear in all cities
- [ ] Therapist availability status (Available/Busy/Offline)
- [ ] Booking button navigates correctly
- [ ] Profile detail pages work
- [ ] Reviews display correctly

---

## Mobile Testing

### Responsive Design Check
1. Open Chrome DevTools
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test on mobile viewport (iPhone, Android)

**Verify**:
- [ ] City selector works on mobile
- [ ] Hero text displays correctly
- [ ] Provider cards are readable
- [ ] Filters apply correctly

---

## Production Readiness Checklist

Before deploying to production:
- [ ] All 6 countries tested
- [ ] Multiple cities per country tested
- [ ] No cross-city contamination
- [ ] Console logs clean (no errors)
- [ ] TypeScript compilation successful
- [ ] Featured samples working
- [ ] Hero text dynamic
- [ ] CityContext sync working
- [ ] Performance acceptable (< 2s load)
- [ ] Mobile responsive
- [ ] All provider types filtered (therapists, places, hotels)

---

## Troubleshooting

### Issue: Wrong City Providers Appearing

**Diagnosis**:
1. Check console logs - are filters running?
2. Check CityContext - is city set correctly?
3. Check provider data - does `city` field match exactly?

**Fix**:
- Update provider records in Appwrite with correct city
- Verify city names match selector options exactly

### Issue: Hero Text Not Updating

**Diagnosis**:
1. Check if CityContext integration exists in HomePage
2. Verify `contextCity` is being read correctly
3. Check useEffect sync logic

**Fix**: Ensure HomePage has `useCityContext()` and sync useEffect

### Issue: No Providers in Any City

**Diagnosis**:
1. Check if data is being fetched (Network tab)
2. Check if filters are too strict
3. Verify provider records have `isLive: true`

**Fix**: 
- Check Appwrite database records
- Ensure `city` field is populated
- Verify `isLive` is set to `true`

---

## Success Criteria ✅

**Definition of Success**:
- ✅ User selects Bandung → Sees ONLY Bandung providers
- ✅ User switches to Jakarta → Sees completely different list (Jakarta only)
- ✅ NO provider appears in wrong city (except featured samples)
- ✅ Hero text updates dynamically
- ✅ Console logs confirm filtering
- ✅ No JavaScript errors
- ✅ Performance is acceptable

**Ready for Production**: When all success criteria met ✅

---

## Test Report Template

```markdown
## City Filtering Test Report

**Date**: [DATE]
**Tester**: [NAME]
**Browser**: [Chrome/Edge/Safari]
**Version**: [Browser Version]

### Test Results

#### Bandung Test
- Hero Text: ✅/❌
- Therapists Filtered: ✅/❌
- Places Filtered: ✅/❌
- Hotels Filtered: ✅/❌
- Console Logs: ✅/❌

#### Jakarta Test
- Hero Text: ✅/❌
- Therapists Filtered: ✅/❌
- Places Filtered: ✅/❌
- Hotels Filtered: ✅/❌
- Console Logs: ✅/❌

#### Cross-City Contamination
- Jakarta in Bandung: ✅ None Found / ❌ Found
- Bandung in Jakarta: ✅ None Found / ❌ Found

#### Performance
- City Switch Speed: [X] seconds
- Initial Load: [X] seconds

### Issues Found
1. [Description]
2. [Description]

### Overall Status
✅ PASS / ❌ FAIL

### Recommendations
[Any suggestions or concerns]
```

---

## Next Steps After Testing

1. ✅ If all tests pass → Mark as production-ready
2. ✅ Update documentation with test results
3. ✅ Deploy to staging environment
4. ✅ User acceptance testing
5. ✅ Deploy to production

**Documentation**: Update [STRICT_CITY_FILTERING.md](STRICT_CITY_FILTERING.md) with test results.

---

## Contact

For issues or questions about city filtering:
- Check console logs first
- Review [STRICT_CITY_FILTERING.md](STRICT_CITY_FILTERING.md)
- Verify Appwrite data quality
- Test with different cities

**Status**: Ready for comprehensive testing ✅
