# SafePass Admin Quick Start Guide

## 🚀 New Feature: Manage All Therapists & Places

### What's New?
A brand new admin interface that lets you activate/deactivate SafePass for **ALL therapists and places** in your system with just one click!

## 📍 Access the New Interface

**URL**: `http://localhost:3000/admin/safepass/all`

Or navigate from admin dashboard → SafePass → All Entities

## ✨ Features

### 1. **View All Entities**
- See all 100+ therapists in your database
- See all places in your database
- Combined view in one interface

### 2. **Quick Activate/Deactivate**
- ✅ **Activate SafePass**: Click green button for any therapist/place
- ❌ **Deactivate SafePass**: Click red button for active entities
- Changes apply instantly

### 3. **Smart Filters**
```
Entity Type:
- All (therapists + places)
- Therapists only
- Places only

Status:
- All
- Active (has SafePass)
- Inactive (no SafePass)

Search:
- Name
- Email
- Location
```

### 4. **Real-time Statistics**
Dashboard shows:
- Total therapists
- Active therapists with SafePass
- Total places
- Active places with SafePass

## 🎯 Common Tasks

### Activate SafePass for a Therapist
1. Go to `/admin/safepass/all`
2. Search for therapist name (or scroll through list)
3. Click **"Activate SafePass"** (green button)
4. Confirmation alert shows:
   - ✅ SafePass activated
   - Issue date: Today
   - Expiry date: 1 year from today

### Deactivate SafePass
1. Find active therapist/place (they have green "Active" badge)
2. Click **"Deactivate SafePass"** (red button)
3. Confirm action
4. SafePass removed instantly

### Activate Multiple Entities
Use filter + activate each one:
1. Filter by "Therapists" or "Places"
2. Filter by "Inactive" to see only entities without SafePass
3. Click through list activating each one

### Find Specific Entity
1. Type name in search box
2. Or type email
3. Or type city/location
4. Results filter automatically as you type

## 📊 Understanding the Interface

### Entity Card Information
```
┌─────────────────────────────────┐
│ [Icon] Name                     │ Active badge (if active)
│        Type (therapist/place)   │
├─────────────────────────────────┤
│ 📧 Email                        │
│ 📍 Location                     │
│ 🗓️ Issued: Feb 7, 2026          │ (if active)
│ ⏰ Expires: Feb 7, 2027         │ (if active)
├─────────────────────────────────┤
│ [Activate/Deactivate Button]    │
└─────────────────────────────────┘
```

### Color Coding
- 🟢 **Green Badge**: SafePass Active
- 🟣 **Purple Icon**: Therapist
- 🔵 **Blue Icon**: Place
- 🟢 **Green Button**: Activate SafePass
- 🔴 **Red Button**: Deactivate SafePass

## ⏱️ Validity Period

**IMPORTANT**: SafePass is now valid for **1 YEAR** (changed from 2 years)

When you activate:
- Issue date = Today
- Expiry date = Today + 1 year
- Example: Activated Feb 7, 2026 → Expires Feb 7, 2027

## 🎨 Interface Layout

```
┌─────────────────────────────────────────────────────────┐
│ 🛡️ SafePass Management                    🔄 Refresh   │
│ Activate and manage SafePass for all...                 │
├─────────────────────────────────────────────────────────┤
│ [Total Therapists] [Active Therapists]                  │
│ [Total Places]     [Active Places]                      │
├─────────────────────────────────────────────────────────┤
│ [Search Box                              ]              │
│ [All][Therapists][Places]  [All][Active][Inactive]     │
├─────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│ │ Therapist│ │ Therapist│ │  Place   │                │
│ │   Card   │ │   Card   │ │   Card   │                │
│ └──────────┘ └──────────┘ └──────────┘                │
│ ... (grid of all entities)                             │
└─────────────────────────────────────────────────────────┘
```

## 📝 Two Admin Interfaces

### Interface 1: Applications (`/admin/safepass`)
**Use for**: Managing applications that therapists/places submit
- Review documents
- Approve/reject applications
- Activate after approval
- Application workflow

### Interface 2: All Entities (`/admin/safepass/all`) ⭐ NEW
**Use for**: Direct activation/deactivation of any entity
- Bypass application workflow
- Instant activation
- Bulk management
- Search and filter

**TIP**: Use Interface 2 for quick activations, Interface 1 for formal application review

## 🔑 Current Active Therapists

As of Feb 7, 2026, you have activated:
1. ✅ **Surtiningsih** - Active until Feb 7, 2027
2. ✅ **Wiwid** - Active until Feb 7, 2027
3. ✅ **Winda** - Active until Feb 7, 2027
4. ✅ **Umi sangadah** - Active until Feb 7, 2027

## 💡 Pro Tips

### Efficient Workflow
1. **Daily**: Check `/admin/safepass` for new applications
2. **Weekly**: Review `/admin/safepass/all` for upcoming expirations
3. **Monthly**: Activate deserving therapists/places in bulk

### Before Activating
- Verify therapist/place has good reviews
- Check if they have completed bookings
- Confirm they meet quality standards
- (Or activate immediately for trusted partners)

### After Activating
- Monitor their performance
- Check customer feedback
- Review expiry dates periodically

### Bulk Operations
To activate many entities at once:
```bash
# Method 1: Use the interface (recommended for small numbers)
- Filter by "Inactive"
- Click through list

# Method 2: Use script (for large batches)
- Edit activate-safepass.cjs
- Add entity names
- Run script
```

## 🔧 Technical Details

### What Happens When You Activate?
```javascript
SafePass Record Created/Updated:
{
  entityType: 'therapist' or 'place',
  entityId: [Their ID],
  entityName: [Their Name],
  hotelVillaSafePassStatus: 'active',
  hasSafePassVerification: true,
  safePassIssuedAt: [Current Date],
  safePassExpiry: [Current Date + 1 year],
  safePassApprovedBy: [Your Admin ID]
}
```

### Data Storage
- Collection: `safepass` (dedicated collection)
- Database: `68f76ee1000e64ca8d05`
- No modifications to therapists/places collections
- Clean data separation

## 🆘 Troubleshooting

### Cannot See Any Entities
- Click "Refresh" button
- Check internet connection
- Verify Appwrite connection

### Activation Not Working
- Check API key is configured
- Verify you have admin permissions
- Check browser console for errors

### Search Not Finding Entity
- Try partial name match
- Check spelling
- Try filtering by type first

## 📞 Quick Reference

```
Activate SafePass:    Green button → Instant activation
Deactivate SafePass:  Red button → Removes certification
Search:               Type to filter instantly
Filters:              Entity type + Status
Stats:                Top cards show totals
Refresh:              Reload all data from database
```

## 🎉 Summary

**New Feature Launched**: `/admin/safepass/all`

**Benefits**:
- ✅ Manage all therapists and places in one place
- ✅ Instant activate/deactivate with one click
- ✅ Search and filter for easy navigation
- ✅ 1-year validity period (changed from 2 years)
- ✅ Real-time statistics
- ✅ Clean, intuitive interface

**Start Using**:
1. Visit `http://localhost:3000/admin/safepass/all`
2. Browse or search for entities
3. Click activate for trusted therapists/places
4. Monitor with filters and stats

Happy SafePass Management! 🛡️
