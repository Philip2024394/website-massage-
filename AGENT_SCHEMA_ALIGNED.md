# ✅ Agent Collection - Schema Aligned with Your Appwrite Setup

## 🔥 Your Actual Appwrite Agent Schema

Based on your provided schema, here's the complete mapping:

---

## 📋 Required Attributes (Your Schema)

### ✅ **agentId** 
- **Type**: String (64 chars)
- **Required**: ✅ Yes  
- **Purpose**: Unique agent identifier (linked to Appwrite user ID)
- **Usage**: `agentId: user.$id` in signup

### ✅ **name**
- **Type**: String (255 chars)
- **Required**: ✅ Yes
- **Purpose**: Agent full name
- **Usage**: Auto-generated from email username

### ✅ **email**
- **Type**: String (255 chars) 
- **Required**: ✅ Yes
- **Purpose**: Login email address
- **Usage**: Primary authentication field

### ✅ **contactNumber**
- **Type**: String (32 chars)
- **Required**: ✅ Yes
- **Purpose**: Primary contact number
- **Default**: `"To be updated"`

### ✅ **agentCode**
- **Type**: String (32 chars)
- **Required**: ✅ Yes
- **Purpose**: Unique referral code
- **Auto-generation**: `AGT + timestamp`

### ✅ **hasAcceptedTerms**
- **Type**: Boolean
- **Required**: ✅ Yes
- **Purpose**: Terms and conditions acceptance
- **Default**: `true` (auto-accepted on signup)

### ✅ **isActive**
- **Type**: Boolean
- **Required**: ✅ Yes
- **Purpose**: Account activation status
- **Default**: `true` (auto-activated)

---

## 📊 Optional Attributes (Your Schema)

### **assignedDate**
- **Type**: DateTime
- **Purpose**: Date agent was assigned to region/territory
- **Default**: Current timestamp on signup

### **region**
- **Type**: String (128 chars)
- **Purpose**: Geographic assignment
- **Default**: `null`

### **successRate**
- **Type**: Double (0-1 range)
- **Purpose**: Success rate calculation
- **Default**: `null`

### **tier**
- **Type**: String (32 chars) 
- **Purpose**: Agent performance tier
- **Values**: `"Standard"` or `"Toptier"`
- **Default**: `"Standard"`

### **lastLogin**
- **Type**: DateTime
- **Purpose**: Track last login time
- **Default**: `null`

### **isLive**
- **Type**: Boolean
- **Purpose**: Live status indicator
- **Default**: `false`

### **activeTherapists**
- **Type**: Integer (min: 0)
- **Purpose**: Count of active referred therapists
- **Default**: `0`

### **password**
- **Type**: String (255 chars)
- **Purpose**: Password field (managed by Appwrite Auth)
- **Default**: `""` (empty string)

### **whatsappNumber**
- **Type**: String (255 chars)
- **Purpose**: WhatsApp contact number
- **Default**: `null`

### **commissionRate**
- **Type**: Integer (max: 23)
- **Purpose**: Commission percentage
- **Values**: `20` (Standard) or `23` (Toptier)
- **Default**: `20`

### **createdAt**
- **Type**: DateTime
- **Purpose**: Account creation timestamp
- **Default**: Current timestamp

### **totalEarnings**
- **Type**: Double
- **Purpose**: Lifetime commission earnings
- **Default**: `0.0`

### **clients**
- **Type**: String (255 chars JSON)
- **Purpose**: JSON array of referred client IDs
- **Default**: `"[]"`

### **idCardImage**
- **Type**: URL
- **Purpose**: ID verification image URL
- **Default**: `null`

---

## 🔧 Updated Agent Creation Code

The authentication has been updated to match your exact schema:

```typescript
const agentData = {
    // Required fields
    agentId: user.$id,                              // Links to Appwrite user
    name: email.split('@')[0],                      // Auto from email
    email: email,                                   // Login email
    contactNumber: 'To be updated',                 // Placeholder
    agentCode: `AGT${Date.now().toString().slice(-6)}`, // Unique code
    hasAcceptedTerms: true,                         // Auto-accepted
    isActive: true,                                 // Auto-activated
    
    // Optional with defaults
    assignedDate: new Date().toISOString(),
    region: null,
    successRate: null,
    tier: 'Standard',
    lastLogin: null,
    isLive: false,
    activeTherapists: 0,
    password: '',
    whatsappNumber: null,
    commissionRate: 20,
    createdAt: new Date().toISOString(),
    totalEarnings: 0.0,
    clients: '[]',
    idCardImage: null
};
```

---

## ✅ Authentication Flow (Updated)

### **Sign Up Process**:
1. ✅ User enters **email + password only**
2. ✅ System creates Appwrite user account
3. ✅ Auto-generates **name** from email username
4. ✅ Creates **agentCode** with timestamp
5. ✅ Sets all required fields with defaults
6. ✅ Account is **auto-activated** (isActive: true)

### **Sign In Process**:
1. ✅ User enters email + password
2. ✅ Appwrite validates credentials  
3. ✅ System finds agent by **agentId** field
4. ✅ Returns agent data for dashboard

---

## 🚀 Dashboard Features Available

With your schema, the agent dashboard supports:

- ✅ **Commission Tracking** (totalEarnings, commissionRate)
- ✅ **Tier Management** (Standard/Toptier with different rates)
- ✅ **Client Management** (clients JSON field)
- ✅ **Performance Metrics** (successRate, activeTherapists)
- ✅ **Geographic Assignment** (region field)
- ✅ **Live Status** (isLive for real-time features)
- ✅ **ID Verification** (idCardImage upload)
- ✅ **Contact Management** (contactNumber, whatsappNumber)

---

## 🎯 Key Benefits

1. **Simplified Registration**: Only email/password required
2. **Auto-Activation**: No admin approval needed
3. **Unique Codes**: Automatic agentCode generation
4. **Flexible Regions**: Support for geographic assignments
5. **Performance Tracking**: Built-in success rate calculation
6. **Commission System**: Tier-based commission rates (20% vs 23%)

---

## ⚡ Status

- ✅ **Authentication Code**: Updated to match your schema
- ✅ **Type Definitions**: Updated Agent interface
- ✅ **Dashboard Integration**: Compatible with your fields
- ✅ **Default Values**: All required fields have sensible defaults
- 🎉 **Ready to Test**: Agent registration should work with your collection!

Your agent system is now fully aligned with your Appwrite schema and ready for testing!