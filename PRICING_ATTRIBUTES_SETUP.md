# 🔧 Appwrite Pricing Attributes Setup

## Collection: `therapists_collection_id`

### Required Pricing Attributes to Add:

Go to your Appwrite Console → Database → `therapists_collection_id` collection and add these 3 attributes:

#### 1. price_60min
- **Type:** String
- **Size:** 10
- **Required:** No
- **Default:** ""
- **Array:** No
- **Description:** Price for 60-minute massage (stored as "350" for 350k)

#### 2. price_90min  
- **Type:** String
- **Size:** 10
- **Required:** No
- **Default:** ""
- **Array:** No
- **Description:** Price for 90-minute massage (stored as "500" for 500k)

#### 3. price_120min
- **Type:** String  
- **Size:** 10
- **Required:** No
- **Default:** ""
- **Array:** No
- **Description:** Price for 120-minute massage (stored as "650" for 650k)

### Why This Fixes Your Issues:

1. **Empty by Default:** New therapists start with empty pricing fields instead of showing incorrect data
2. **Simple Storage:** Stores just the number (e.g., "350") instead of complex JSON
3. **Display Ready:** Easy to format as "350k" on cards and "Rp 350,000" in detailed views
4. **Dashboard Friendly:** Form inputs can directly save to these attributes

### Alternative: Keep Existing `pricing` Attribute

If you prefer to keep the existing JSON structure, update the default value:

#### pricing
- **Type:** String
- **Size:** 100
- **Required:** No  
- **Default:** `{"60": 0, "90": 0, "120": 0}`
- **Array:** No

This ensures new therapists have valid JSON with zero values instead of null/undefined.