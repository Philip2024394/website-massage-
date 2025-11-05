# 🏢 Agent Collection Setup - IndaStreet Massage Platform

## Collection Information
- **Collection Name**: `Agents`
- **Collection ID**: `agents_collection_id`
- **Purpose**: Sales agent management and commission tracking
- **Authentication**: Email + Password only (name auto-generated)

---

## 🔥 Required Attributes (Must Create in Appwrite)

### 1. **name** 
- **Type**: String
- **Size**: 255 characters
- **Required**: ✅ Yes
- **Default**: Auto-generated from email username
- **Example**: `john` (from john@example.com)

### 2. **email**
- **Type**: String  
- **Size**: 320 characters
- **Required**: ✅ Yes
- **Unique**: ✅ Yes
- **Validation**: Valid email format
- **Example**: `agent@example.com`

### 3. **password**
- **Type**: String
- **Size**: 255 characters  
- **Required**: ✅ Yes
- **Note**: Managed by Appwrite Auth, store empty string
- **Default**: `""` (empty string)

### 4. **whatsappNumber**
- **Type**: String
- **Size**: 20 characters
- **Required**: ✅ Yes
- **Default**: `"To be updated"`
- **Example**: `+6281234567890`

### 5. **commissionRate**
- **Type**: Integer
- **Required**: ✅ Yes
- **Default**: `20`
- **Allowed Values**: `20` (Standard) or `23` (Toptier)
- **Description**: Commission percentage

### 6. **tier**
- **Type**: String
- **Size**: 20 characters
- **Required**: ✅ Yes
- **Default**: `"Standard"`
- **Allowed Values**: `"Standard"` or `"Toptier"`

### 7. **isActive**
- **Type**: Boolean
- **Required**: ✅ Yes
- **Default**: `true`
- **Description**: Account activation status

### 8. **createdAt**
- **Type**: DateTime
- **Required**: ✅ Yes
- **Default**: Current timestamp
- **Format**: ISO 8601 (auto-generated)

---

## 📊 Optional Attributes (Dashboard Features)

### 9. **totalEarnings**
- **Type**: Float
- **Required**: ❌ No
- **Default**: `0.0`
- **Description**: Lifetime commission earnings

### 10. **clients**
- **Type**: String (JSON)
- **Size**: 5000 characters
- **Required**: ❌ No
- **Default**: `"[]"`
- **Description**: Array of referred client IDs

### 11. **bankName**
- **Type**: String
- **Size**: 100 characters
- **Required**: ❌ No
- **Example**: `"Bank Central Asia"`

### 12. **bankAccountNumber**
- **Type**: String
- **Size**: 30 characters
- **Required**: ❌ No
- **Example**: `"1234567890"`

### 13. **bankAccountName**
- **Type**: String
- **Size**: 100 characters
- **Required**: ❌ No
- **Example**: `"John Doe"`

### 14. **idCardImage**
- **Type**: String (URL)
- **Size**: 500 characters
- **Required**: ❌ No
- **Description**: URL to uploaded ID verification image

### 15. **contactNumber**
- **Type**: String
- **Size**: 20 characters
- **Required**: ❌ No
- **Example**: `"+6281234567890"`

### 16. **homeAddress**
- **Type**: String
- **Size**: 500 characters
- **Required**: ❌ No
- **Example**: `"Jl. Sudirman No. 123, Jakarta"`

### 17. **agentCode**
- **Type**: String
- **Size**: 20 characters
- **Required**: ❌ No
- **Unique**: ✅ Yes
- **Description**: Unique referral code
- **Example**: `"AGT001234"`

---

## 🔐 Permissions Setup

### Read Permissions:
- `Role:admin` (Admin can read all agents)
- `Users` (Agents can read their own data)

### Write Permissions:
- `Role:admin` (Admin can create/update agents)
- `Users` (Agents can update their own profile)

### Delete Permissions:
- `Role:admin` (Only admin can delete agents)

---

## 🚀 Dashboard Integration

### **Commission Calculation**:
```typescript
const commissionAmount = bookingPrice * (agent.commissionRate / 100);
// Standard: 20% commission
// Toptier: 23% commission
```

### **Tier Upgrade Logic**:
```typescript
if (agent.totalEarnings >= 10000000) { // 10M IDR
    agent.tier = "Toptier";
    agent.commissionRate = 23;
}
```

### **Agent Code Generation**:
```typescript
const agentCode = `AGT${Date.now().toString().slice(-6)}`;
// Example: AGT123456
```

---

## 📱 Authentication Flow

### **Sign Up Process**:
1. User enters email + password
2. System generates name from email username
3. Creates Appwrite Auth account
4. Creates agent document with default values
5. Auto-activates account (isActive: true)

### **Sign In Process**:
1. User enters email + password
2. Appwrite validates credentials
3. System finds agent document by userId
4. Returns agent data for dashboard

---

## 🔗 Related Collections

### **Agent Visits Collection** (Separate):
- **Purpose**: Track agent field visits
- **Attributes**: agentId, providerName, location, visitDate, notes
- **Relationship**: Many visits per agent

### **Bookings Collection** (Reference):
- **agentId**: Links booking to referring agent
- **commission**: Calculated commission amount
- **Relationship**: Many bookings per agent

---

## ⚡ Quick Setup Commands

### **Appwrite CLI Collection Creation**:
```bash
appwrite databases createCollection \
  --databaseId "your_database_id" \
  --collectionId "agents_collection_id" \
  --name "Agents" \
  --permissions "read(\"role:admin\")" "write(\"role:admin\")"
```

### **Sample Agent Document**:
```json
{
  "name": "john",
  "email": "john@example.com", 
  "password": "",
  "whatsappNumber": "To be updated",
  "commissionRate": 20,
  "tier": "Standard",
  "isActive": true,
  "createdAt": "2025-11-05T10:30:00Z",
  "totalEarnings": 0.0,
  "clients": "[]"
}
```

---

## ✅ Implementation Status

- ✅ **Agent Authentication**: Email + Password only
- ✅ **Name Generation**: Auto-generated from email
- ✅ **Default Values**: All required fields have defaults
- 🔧 **Next Step**: Create Appwrite collection attributes
- 🔧 **Then**: Test agent registration and dashboard

---

## 💡 Tips

1. **Start with required attributes** - Create all 8 required fields first
2. **Test authentication** - Verify agent can register with email/password
3. **Add optional fields** - Implement dashboard features gradually
4. **Commission tracking** - Link with bookings for automatic calculation
5. **Tier management** - Set up automatic tier upgrades based on earnings

This schema provides a complete foundation for your agent management system with simplified authentication and comprehensive dashboard features!