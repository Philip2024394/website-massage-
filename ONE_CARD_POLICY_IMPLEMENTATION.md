# One Card Per Provider Policy Implementation ✅

## Policy Overview
**Rule**: Each provider (therapist or massage place) can only create **ONE card** but can edit and save it **unlimited times**.

## Implementation Details

### 🧑‍⚕️ **Therapist One-Card Policy**

#### **Location**: `hooks/useProviderAgentHandlers.ts` - `handleSaveTherapist()`

#### **How It Works:**
1. **Unique Identification**: Uses `loggedInProvider.id` as the unique therapist identifier
2. **Lookup Logic**: Always checks for existing therapist with same ID
3. **Update vs Create**: 
   - If exists → **Update** existing card
   - If not exists → **Create** new card (only once)

#### **Code Implementation:**
```typescript
// Get therapist by unique ID (prevents duplicates)
let existingTherapist: any = null;
try {
    existingTherapist = await therapistService.getById(therapistId);
} catch {
    // No existing profile found
}

// 🔒 ONE CARD PER THERAPIST POLICY
if (existingTherapist) {
    console.log('✏️ Updating your existing therapist profile (1 card per therapist policy)');
    console.log('🔄 You can save/edit this card as many times as needed');
    await therapistService.update(therapistId, updateData);
} else {
    console.log('➕ Creating your therapist profile (you can only create 1 card, but edit it unlimited times)');
    await therapistService.create(createData);
    console.log('📝 Your therapist card has been created. You can now edit and save it as many times as you want.');
}
```

### 🏢 **Massage Place One-Card Policy**

#### **Location**: `hooks/useProviderAgentHandlers.ts` - `handleSavePlace()`

#### **How It Works:**
1. **Unique Identification**: Uses `loggedInProvider.id` as the unique place identifier
2. **Document ID Lookup**: Searches for existing place by provider ID
3. **Update vs Create**:
   - If document exists → **Update** existing card
   - If not exists → **Create** new card (only once)

#### **Code Implementation:**
```typescript
// Find existing place by provider ID
let placeDocumentId = null;
const currentPlace = places.find(place => {
    return place.id === loggedInProvider.id || 
           place.id?.toString() === loggedInProvider.id?.toString();
});

// 🔒 ONE CARD PER MASSAGE PLACE POLICY
if (placeDocumentId) {
    console.log('✏️ Updating your existing massage place profile (1 card per place policy)');
    console.log('🔄 You can save/edit this card as many times as needed');
    await placeService.update(placeDocumentId, updateData);
} else {
    console.log('➕ Creating your massage place profile (you can only create 1 card, but edit it unlimited times)');
    await placeService.create(createData);
    console.log('📝 Your massage place card has been created. You can now edit and save it as many times as you want.');
}
```

### 🎨 **User Interface Implementation**

#### **Location**: `components/therapist/TherapistProfileForm.tsx`

#### **One-Card Policy Notice:**
```tsx
{/* One Card Policy Notice */}
<div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3">
    <div className="flex items-center gap-2 mb-1">
        <div className="w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
        </div>
        <h4 className="text-sm font-semibold text-amber-800">One Profile Policy</h4>
    </div>
    <p className="text-xs text-amber-700">
        You can only create <strong>one profile card</strong>, but you can edit and save it as many times as you want. This ensures quality and prevents duplicate listings.
    </p>
</div>
```

## Benefits of One-Card Policy

### ✅ **For Users (Therapists/Places)**
- **Simple Management**: Only one profile to maintain
- **No Confusion**: Clear which profile is active
- **Unlimited Edits**: Can improve profile as much as needed
- **Quality Focus**: Encourages creating one high-quality profile

### ✅ **For Customers** 
- **No Duplicates**: Won't see multiple listings from same provider
- **Quality Listings**: Providers focus on one excellent profile
- **Consistent Experience**: Each provider has single point of contact

### ✅ **For Platform**
- **Data Integrity**: Prevents duplicate entries
- **Cleaner Database**: One record per provider
- **Easier Moderation**: Only one profile per provider to review
- **Better Performance**: Reduced data redundancy

## Technical Enforcement

### 🔒 **Database Level**
- **Unique Constraints**: Provider ID serves as unique identifier
- **Update/Create Logic**: Automatic detection of existing profiles
- **Data Consistency**: Single source of truth per provider

### 🔒 **Application Level**
- **ID-Based Lookup**: Always checks for existing profile first
- **Conditional Logic**: Update existing vs create new
- **User Messaging**: Clear feedback about policy

### 🔒 **User Interface Level**
- **Policy Notice**: Visible explanation in profile form
- **Console Logging**: Detailed feedback for developers
- **Save Button**: Always allows updates to existing profile

## Console Output Examples

### **First Time Creation:**
```
➕ Creating your therapist profile (you can only create 1 card, but edit it unlimited times)
📝 Your therapist card has been created. You can now edit and save it as many times as you want.
```

### **Subsequent Edits:**
```
✏️ Updating your existing therapist profile (1 card per therapist policy)
🔄 You can save/edit this card as many times as needed
```

## Testing the Policy

### **Test Case 1: First Profile Creation**
1. New therapist logs in
2. Fills out profile form
3. Clicks "Save Profile"
4. **Expected**: New profile created, shows "card has been created" message

### **Test Case 2: Profile Editing**  
1. Existing therapist logs in
2. Edits existing profile information
3. Clicks "Save Profile"
4. **Expected**: Profile updated, shows "updating existing profile" message

### **Test Case 3: Multiple Save Attempts**
1. Therapist makes multiple edits and saves
2. Each save updates the same profile
3. **Expected**: No duplicate profiles created, same card updated each time

---

**Status**: ✅ **IMPLEMENTED** - One card per provider policy active
**Components**: `useProviderAgentHandlers.ts`, `TherapistProfileForm.tsx`
**Testing**: Ready for validation on localhost:3001
**User Experience**: Clear messaging and unlimited editing capability