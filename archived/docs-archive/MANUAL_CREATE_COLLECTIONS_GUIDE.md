# 📋 MANUAL INSTRUCTIONS: Create Location Collections in Appwrite Console

## Step-by-Step Guide

### 🏗️ COLLECTION 1: cities

1. **Go to Appwrite Console**
   - Navigate to: https://cloud.appwrite.io/console/project-68f23b11000d25eb3664/databases/database-68f76ee1000e64ca8d05

2. **Create Collection**
   - Click "Create Collection"
   - Collection ID: Leave as "unique()" (auto-generate)
   - Name: `cities`
   - Click "Create"

3. **Add Attributes** (click "Create Attribute" for each):

   | Attribute | Type | Size | Required | Default | Array |
   |-----------|------|------|----------|---------|-------|
   | name | String | 100 | ✅ Yes | - | ❌ No |
   | slug | String | 100 | ✅ Yes | - | ❌ No |
   | aliases | String | 1000 | ❌ No | - | ✅ Yes |
   | latitude | Float | - | ✅ Yes | - | ❌ No |
   | longitude | Float | - | ✅ Yes | - | ❌ No |
   | country | String | 100 | ❌ No | Indonesia | ❌ No |
   | province | String | 200 | ❌ No | - | ❌ No |
   | isActive | Boolean | - | ❌ No | true | ❌ No |
   | displayOrder | Integer | - | ❌ No | 0 | ❌ No |

4. **Create Indexes** (click "Create Index"):
   - **Index 1:**
     - Key: `slug_index`
     - Type: Key
     - Attributes: `slug`
     - Order: ASC
   
   - **Index 2:**
     - Key: `order_index`
     - Type: Key
     - Attributes: `displayOrder`, `name`
     - Order: ASC, ASC

5. **Set Permissions:**
   - Go to "Settings" tab
   - Add Permission: "Any" → "Read"
   - This allows public read access

---

### 🏗️ COLLECTION 2: therapist_locations

1. **Create Collection**
   - Click "Create Collection"
   - Collection ID: Leave as "unique()" (auto-generate)
   - Name: `therapist_locations`
   - Click "Create"

2. **Add Attributes**:

   | Attribute | Type | Size | Required | Default | Array |
   |-----------|------|------|----------|---------|-------|
   | therapistId | String | 100 | ✅ Yes | - | ❌ No |
   | cityId | String | 100 | ✅ Yes | - | ❌ No |
   | address | String | 500 | ❌ No | - | ❌ No |
   | coordinates | String | 200 | ❌ No | - | ❌ No |
   | isPrimary | Boolean | - | ❌ No | true | ❌ No |
   | isActive | Boolean | - | ❌ No | true | ❌ No |

3. **Create Indexes**:
   - **Index 1:**
     - Key: `therapist_index`
     - Type: Key
     - Attributes: `therapistId`
     - Order: ASC
   
   - **Index 2:**
     - Key: `city_index`
     - Type: Key
     - Attributes: `cityId`
     - Order: ASC
   
   - **Index 3:**
     - Key: `active_index`
     - Type: Key
     - Attributes: `isActive`
     - Order: DESC

4. **Set Permissions:**
   - Go to "Settings" tab
   - Add Permission: "Any" → "Read"
   - This allows public read access

---

## ✅ After Creating Collections

1. **Copy Collection IDs:**
   - Go to each collection's Settings tab
   - Copy the Collection ID (starts with something like `6795...`)
   - You'll need these IDs for the next scripts

2. **Update the seed script** with your collection IDs

3. **Run seed script:**
   ```bash
   node seed-cities.mjs
   ```

4. **Run migration script:**
   ```bash
   node migrate-therapist-locations.mjs
   ```

---

## 🎯 Quick Checklist

### cities collection:
- [ ] Collection created with name "cities"
- [ ] 9 attributes added (name, slug, aliases, latitude, longitude, country, province, isActive, displayOrder)
- [ ] 2 indexes created (slug_index, order_index)
- [ ] Permissions set to "Any" → "Read"

### therapist_locations collection:
- [ ] Collection created with name "therapist_locations"
- [ ] 6 attributes added (therapistId, cityId, address, coordinates, isPrimary, isActive)
- [ ] 3 indexes created (therapist_index, city_index, active_index)
- [ ] Permissions set to "Any" → "Read"

---

## 📸 Screenshots Guide

When creating attributes, the form should look like:
- **Attribute Key:** name (lowercase, no spaces)
- **Type:** Select from dropdown
- **Size:** Only for String types
- **Required:** Check if must have value
- **Default:** Optional default value
- **Array:** Check if multiple values allowed

**Important:** Wait for each attribute to finish creating (green checkmark) before creating the next one!

---

## 🚨 Common Issues

**Issue:** "Attribute already exists"
- **Solution:** You already created that attribute, skip to next one

**Issue:** "Index creation failed"
- **Solution:** Make sure all attributes in the index exist first

**Issue:** Can't see collection
- **Solution:** Refresh the database page

---

After completing these steps, you'll have a bulletproof location system ready for 100+ Indonesian cities! 🎉
