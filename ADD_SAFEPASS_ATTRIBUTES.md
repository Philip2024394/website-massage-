# Add SafePass Attributes to Therapists Collection

## Issue
The therapists collection is missing SafePass attributes, causing the error:
```
Unknown attribute: "hotelVillaSafePassStatus"
```

## Solution: Add Attributes to Therapists Collection

### Go to Appwrite Console

1. Open: https://syd.cloud.appwrite.io/console
2. Select Project: `68f23b11000d25eb3664`
3. Go to: **Database** → Select database `68f76ee1000e64ca8d05`
4. Find collection: **therapists_collection_id**
5. Click on **Attributes** tab

### Add the Following Attributes

#### 1. hotelVillaSafePassStatus (Optional)
- **Type:** String (Enum)
- **Key:** `hotelVillaSafePassStatus`
- **Size:** 50
- **Required:** No
- **Array:** No
- **Enum values:** `pending`, `approved`, `active`, `rejected`
- **Default:** (leave empty)

#### 2. hasSafePassVerification (Optional)
- **Type:** Boolean
- **Key:** `hasSafePassVerification`
- **Required:** No
- **Default:** false

#### 3. hotelVillaLetters (Optional)
- **Type:** String
- **Key:** `hotelVillaLetters`
- **Size:** 200
- **Required:** No
- **Array:** No

#### 4. safePassIssuedAt (Optional)
- **Type:** DateTime
- **Key:** `safePassIssuedAt`
- **Required:** No

#### 5. safePassExpiry (Optional)
- **Type:** DateTime
- **Key:** `safePassExpiry`
- **Required:** No

#### 6. safePassPaymentId (Optional)
- **Type:** String
- **Key:** `safePassPaymentId`
- **Size:** 250
- **Required:** No

#### 7. safePassCardUrl (Optional)
- **Type:** String
- **Key:** `safePassCardUrl`
- **Size:** 250
- **Required:** No

#### 8. safePassRejectionReason (Optional)
- **Type:** String
- **Key:** `safePassRejectionReason`
- **Size:** 400
- **Required:** No

#### 9. safePassSubmittedAt (Optional)
- **Type:** DateTime
- **Key:** `safePassSubmittedAt`
- **Required:** No

#### 10. safePassApprovedAt (Optional)
- **Type:** DateTime
- **Key:** `safePassApprovedAt`
- **Required:** No

#### 11. safePassApprovedBy (Optional)
- **Type:** String
- **Key:** `safePassApprovedBy`
- **Size:** 200
- **Required:** No

## Quick Add Commands (if using Appwrite CLI)

```bash
# Set your collection ID
COLLECTION_ID="therapists_collection_id"
DATABASE_ID="68f76ee1000e64ca8d05"

# Add enum attribute
appwrite databases createEnumAttribute \
  --databaseId $DATABASE_ID \
  --collectionId $COLLECTION_ID \
  --key "hotelVillaSafePassStatus" \
  --elements "pending,approved,active,rejected" \
  --required false

# Add boolean attribute
appwrite databases createBooleanAttribute \
  --databaseId $DATABASE_ID \
  --collectionId $COLLECTION_ID \
  --key "hasSafePassVerification" \
  --required false \
  --default false

# Add string attributes
for attr in "hotelVillaLetters:200" "safePassPaymentId:250" "safePassCardUrl:250" "safePassRejectionReason:400" "safePassApprovedBy:200"; do
  IFS=':' read -r key size <<< "$attr"
  appwrite databases createStringAttribute \
    --databaseId $DATABASE_ID \
    --collectionId $COLLECTION_ID \
    --key "$key" \
    --size $size \
    --required false
done

# Add datetime attributes
for attr in "safePassIssuedAt" "safePassExpiry" "safePassSubmittedAt" "safePassApprovedAt"; do
  appwrite databases createDatetimeAttribute \
    --databaseId $DATABASE_ID \
    --collectionId $COLLECTION_ID \
    --key "$attr" \
    --required false
done
```

## After Adding Attributes

Wait 2-3 minutes for Appwrite to build indexes, then run:

```bash
# Verify attributes were added
node verify-safepass-setup.cjs

# Activate SafePass for therapists
node activate-safepass.cjs
```

## Verification Checklist

- [ ] All 11 SafePass attributes added to therapists collection
- [ ] Waited 2-3 minutes for index building
- [ ] Ran verification script - no "unknown attribute" errors
- [ ] Activated SafePass for requested therapists
- [ ] Verified therapists now show `hotelVillaSafePassStatus: 'active'`

## Troubleshooting

### "Attribute already exists" error
- The attribute was already added, skip it

### "Collection not found" error
- Check the collection ID is exactly: `therapists_collection_id`
- Verify you're using the correct database ID

### "Permission denied" error
- Ensure your API key has permission to modify collections
- You may need to use the Appwrite Console UI instead

## Alternative: Use Appwrite Console UI

If CLI doesn't work, use the web console:

1. Go to https://syd.cloud.appwrite.io/console
2. Navigate to your database and therapists collection
3. Click "Attributes" tab
4. Click "Create attribute" button
5. Add each attribute one by one from the list above
6. Wait for each attribute to finish creating before adding the next

## Note on Migration

All attributes are **optional** (not required) to ensure:
- ✅ Existing therapist records remain valid
- ✅ No data migration needed
- ✅ Backward compatibility maintained
- ✅ Can gradually roll out SafePass feature

Therapists without SafePass will simply have these fields as `null` or `undefined`.
