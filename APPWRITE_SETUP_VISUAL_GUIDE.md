# 📋 Appwrite Chat System Setup - Visual Layout Guide

## Quick Overview

You need to create **2 items** in Appwrite:

1. ✅ **1 Collection** (`chat_messages`) - Stores all chat messages
2. ✅ **1 Storage Bucket** (`chat_attachments`) - Stores uploaded files
3. ✅ **Update 6 Existing Collections** - Add `chatBlocked` field

---

## 📊 PART 1: Create Collection - `chat_messages`

### Step 1: Navigate to Appwrite Console

```
Appwrite Console
  └─ Databases
      └─ [Your Database Name]
          └─ Click "Add Collection"
```

### Step 2: Collection Settings

```
┌─────────────────────────────────────────────────────────┐
│ CREATE COLLECTION                                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Collection ID:  [chat_messages]                        │
│                                                          │
│  Collection Name: [Chat Messages]                       │
│                                                          │
│                          [Create Collection] ←── Click   │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 PART 2: Add 14 Attributes to `chat_messages`

### Attribute 1: senderId

```
┌─────────────────────────────────────────────────────────┐
│ ADD STRING ATTRIBUTE                                     │
├─────────────────────────────────────────────────────────┤
│  Attribute Key:    [senderId]                           │
│  Size:             [255]                                │
│  Required:         [✓] Yes                              │
│  Array:            [ ] No                               │
│  Default Value:    [Leave Empty]                        │
│                                                          │
│                          [Create] ←── Click              │
└─────────────────────────────────────────────────────────┘
```

### Attribute 2: senderName

```
┌─────────────────────────────────────────────────────────┐
│ ADD STRING ATTRIBUTE                                     │
├─────────────────────────────────────────────────────────┤
│  Attribute Key:    [senderName]                         │
│  Size:             [255]                                │
│  Required:         [✓] Yes                              │
│  Array:            [ ] No                               │
│  Default Value:    [Leave Empty]                        │
│                                                          │
│                          [Create] ←── Click              │
└─────────────────────────────────────────────────────────┘
```

### Attribute 3: senderType

```
┌─────────────────────────────────────────────────────────┐
│ ADD STRING ATTRIBUTE                                     │
├─────────────────────────────────────────────────────────┤
│  Attribute Key:    [senderType]                         │
│  Size:             [50]                                 │
│  Required:         [✓] Yes                              │
│  Array:            [ ] No                               │
│  Default Value:    [Leave Empty]                        │
│                                                          │
│  💡 Values: admin, therapist, place, hotel, villa, user │
│                                                          │
│                          [Create] ←── Click              │
└─────────────────────────────────────────────────────────┘
```

### Attribute 4: recipientId

```
┌─────────────────────────────────────────────────────────┐
│ ADD STRING ATTRIBUTE                                     │
├─────────────────────────────────────────────────────────┤
│  Attribute Key:    [recipientId]                        │
│  Size:             [255]                                │
│  Required:         [✓] Yes                              │
│  Array:            [ ] No                               │
│  Default Value:    [Leave Empty]                        │
│                                                          │
│                          [Create] ←── Click              │
└─────────────────────────────────────────────────────────┘
```

### Attribute 5: recipientName

```
┌─────────────────────────────────────────────────────────┐
│ ADD STRING ATTRIBUTE                                     │
├─────────────────────────────────────────────────────────┤
│  Attribute Key:    [recipientName]                      │
│  Size:             [255]                                │
│  Required:         [✓] Yes                              │
│  Array:            [ ] No                               │
│  Default Value:    [Leave Empty]                        │
│                                                          │
│                          [Create] ←── Click              │
└─────────────────────────────────────────────────────────┘
```

### Attribute 6: recipientType

```
┌─────────────────────────────────────────────────────────┐
│ ADD STRING ATTRIBUTE                                     │
├─────────────────────────────────────────────────────────┤
│  Attribute Key:    [recipientType]                      │
│  Size:             [50]                                 │
│  Required:         [✓] Yes                              │
│  Array:            [ ] No                               │
│  Default Value:    [Leave Empty]                        │
│                                                          │
│  💡 Values: admin, therapist, place, hotel, villa, user │
│                                                          │
│                          [Create] ←── Click              │
└─────────────────────────────────────────────────────────┘
```

### Attribute 7: message

```
┌─────────────────────────────────────────────────────────┐
│ ADD STRING ATTRIBUTE                                     │
├─────────────────────────────────────────────────────────┤
│  Attribute Key:    [message]                            │
│  Size:             [5000]  ←── 5000 for long messages   │
│  Required:         [✓] Yes                              │
│  Array:            [ ] No                               │
│  Default Value:    [Leave Empty]                        │
│                                                          │
│                          [Create] ←── Click              │
└─────────────────────────────────────────────────────────┘
```

### Attribute 8: timestamp

```
┌─────────────────────────────────────────────────────────┐
│ ADD DATETIME ATTRIBUTE                                   │
├─────────────────────────────────────────────────────────┤
│  Attribute Key:    [timestamp]                          │
│  Required:         [✓] Yes                              │
│  Array:            [ ] No                               │
│  Default Value:    [Leave Empty]                        │
│                                                          │
│                          [Create] ←── Click              │
└─────────────────────────────────────────────────────────┘
```

### Attribute 9: read

```
┌─────────────────────────────────────────────────────────┐
│ ADD BOOLEAN ATTRIBUTE                                    │
├─────────────────────────────────────────────────────────┤
│  Attribute Key:    [read]                               │
│  Required:         [✓] Yes                              │
│  Array:            [ ] No                               │
│  Default Value:    [✓] false  ←── Check "false"         │
│                                                          │
│                          [Create] ←── Click              │
└─────────────────────────────────────────────────────────┘
```

### Attribute 10: messageType

```
┌─────────────────────────────────────────────────────────┐
│ ADD STRING ATTRIBUTE                                     │
├─────────────────────────────────────────────────────────┤
│  Attribute Key:    [messageType]                        │
│  Size:             [20]                                 │
│  Required:         [✓] Yes                              │
│  Array:            [ ] No                               │
│  Default Value:    [text]  ←── Type "text"              │
│                                                          │
│  💡 Values: text, file, location, system                │
│                                                          │
│                          [Create] ←── Click              │
└─────────────────────────────────────────────────────────┘
```

### Attribute 11: fileUrl (Optional)

```
┌─────────────────────────────────────────────────────────┐
│ ADD STRING ATTRIBUTE                                     │
├─────────────────────────────────────────────────────────┤
│  Attribute Key:    [fileUrl]                            │
│  Size:             [500]                                │
│  Required:         [ ] No  ←── NOT required             │
│  Array:            [ ] No                               │
│  Default Value:    [Leave Empty]                        │
│                                                          │
│                          [Create] ←── Click              │
└─────────────────────────────────────────────────────────┘
```

### Attribute 12: fileName (Optional)

```
┌─────────────────────────────────────────────────────────┐
│ ADD STRING ATTRIBUTE                                     │
├─────────────────────────────────────────────────────────┤
│  Attribute Key:    [fileName]                           │
│  Size:             [255]                                │
│  Required:         [ ] No  ←── NOT required             │
│  Array:            [ ] No                               │
│  Default Value:    [Leave Empty]                        │
│                                                          │
│                          [Create] ←── Click              │
└─────────────────────────────────────────────────────────┘
```

### Attribute 13: location (Optional)

```
┌─────────────────────────────────────────────────────────┐
│ ADD STRING ATTRIBUTE                                     │
├─────────────────────────────────────────────────────────┤
│  Attribute Key:    [location]                           │
│  Size:             [500]                                │
│  Required:         [ ] No  ←── NOT required             │
│  Array:            [ ] No                               │
│  Default Value:    [Leave Empty]                        │
│                                                          │
│  💡 Stores JSON: {"latitude": 0, "longitude": 0}        │
│                                                          │
│                          [Create] ←── Click              │
└─────────────────────────────────────────────────────────┘
```

### Attribute 14: keepForever (Optional)

```
┌─────────────────────────────────────────────────────────┐
│ ADD BOOLEAN ATTRIBUTE                                    │
├─────────────────────────────────────────────────────────┤
│  Attribute Key:    [keepForever]                        │
│  Required:         [ ] No  ←── NOT required             │
│  Array:            [ ] No                               │
│  Default Value:    [✓] false  ←── Check "false"         │
│                                                          │
│                          [Create] ←── Click              │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 PART 3: Add 3 Indexes to `chat_messages`

### Index 1: chat_participants

```
┌─────────────────────────────────────────────────────────┐
│ CREATE INDEX                                             │
├─────────────────────────────────────────────────────────┤
│  Index Key:        [chat_participants]                  │
│  Index Type:       [Fulltext] ←── Select from dropdown  │
│                                                          │
│  Attributes:       [+] Add Attribute                    │
│                     ├─ [senderId]    ←── Add            │
│                     └─ [recipientId] ←── Add            │
│                                                          │
│  Order:            [ASC] ←── Default                    │
│                                                          │
│                          [Create Index] ←── Click        │
└─────────────────────────────────────────────────────────┘
```

### Index 2: unread_messages

```
┌─────────────────────────────────────────────────────────┐
│ CREATE INDEX                                             │
├─────────────────────────────────────────────────────────┤
│  Index Key:        [unread_messages]                    │
│  Index Type:       [Fulltext] ←── Select from dropdown  │
│                                                          │
│  Attributes:       [+] Add Attribute                    │
│                     ├─ [recipientId] ←── Add            │
│                     └─ [read]        ←── Add            │
│                                                          │
│  Order:            [ASC] ←── Default                    │
│                                                          │
│                          [Create Index] ←── Click        │
└─────────────────────────────────────────────────────────┘
```

### Index 3: message_timeline

```
┌─────────────────────────────────────────────────────────┐
│ CREATE INDEX                                             │
├─────────────────────────────────────────────────────────┤
│  Index Key:        [message_timeline]                   │
│  Index Type:       [Key] ←── Select "Key" not "Fulltext"│
│                                                          │
│  Attributes:       [+] Add Attribute                    │
│                     └─ [timestamp] ←── Add              │
│                                                          │
│  Order:            [ASC] ←── Select ASC                 │
│                                                          │
│                          [Create Index] ←── Click        │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 PART 4: Set Permissions for `chat_messages`

### Navigate to Permissions Tab

```
┌─────────────────────────────────────────────────────────┐
│ COLLECTION: chat_messages                                │
├─────────────────────────────────────────────────────────┤
│  Tabs:  [Settings] [Attributes] [Indexes] [Permissions] │
│                                               ↑          │
│                                         Click Here       │
└─────────────────────────────────────────────────────────┘
```

### Add Permissions

```
┌─────────────────────────────────────────────────────────┐
│ PERMISSIONS                                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [+ Add Role]                                           │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Permission 1: CREATE                                │ │
│  ├────────────────────────────────────────────────────┤ │
│  │  Role:    [Any] ←── Select "Any"                   │ │
│  │           (or [Users] if you want authenticated)   │ │
│  │                                                     │ │
│  │  ☑ Create                                          │ │
│  │                                                     │ │
│  │                          [Add] ←── Click            │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Permission 2: READ                                  │ │
│  ├────────────────────────────────────────────────────┤ │
│  │  Role:    [Any] ←── Select "Any"                   │ │
│  │                                                     │ │
│  │  ☑ Read                                            │ │
│  │                                                     │ │
│  │                          [Add] ←── Click            │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Permission 3: UPDATE                                │ │
│  ├────────────────────────────────────────────────────┤ │
│  │  Role:    [Any] ←── Select "Any"                   │ │
│  │                                                     │ │
│  │  ☑ Update                                          │ │
│  │                                                     │ │
│  │                          [Add] ←── Click            │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ⚠️ Note: Don't add DELETE permission for users        │
│           Only admins should be able to delete          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 PART 5: Create Storage Bucket - `chat_attachments`

### Step 1: Navigate to Storage

```
Appwrite Console
  └─ Storage
      └─ Click "Add Bucket"
```

### Step 2: Bucket Settings

```
┌─────────────────────────────────────────────────────────┐
│ CREATE STORAGE BUCKET                                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Bucket ID:          [chat_attachments]                 │
│                                                          │
│  Bucket Name:        [Chat Attachments]                 │
│                                                          │
│  Maximum File Size:  [10485760]  ←── 10MB in bytes      │
│                      (or use slider to set 10 MB)       │
│                                                          │
│  Allowed File        [jpg, jpeg, png, pdf, doc, docx]   │
│  Extensions:         ↑ Type these separated by commas   │
│                                                          │
│  Compression:        [✓] Enabled  ←── Check this        │
│                                                          │
│  Encryption:         [✓] Enabled  ←── Check this        │
│                                                          │
│  Antivirus:          [✓] Enabled  ←── Check if available│
│                                                          │
│                          [Create Bucket] ←── Click       │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 PART 6: Set Permissions for `chat_attachments` Bucket

```
┌─────────────────────────────────────────────────────────┐
│ BUCKET PERMISSIONS: chat_attachments                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Permission 1: CREATE (Upload Files)                │ │
│  ├────────────────────────────────────────────────────┤ │
│  │  Role:    [Any] ←── Select "Any"                   │ │
│  │                                                     │ │
│  │  ☑ Create                                          │ │
│  │                                                     │ │
│  │                          [Add] ←── Click            │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Permission 2: READ (Download Files)                │ │
│  ├────────────────────────────────────────────────────┤ │
│  │  Role:    [Any] ←── Select "Any"                   │ │
│  │                                                     │ │
│  │  ☑ Read                                            │ │
│  │                                                     │ │
│  │                          [Add] ←── Click            │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ⚠️ Note: Don't add DELETE permission for regular users │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 PART 7: Update Existing Collections (Add `chatBlocked` Field)

You need to add a `chatBlocked` field to **6 existing collections**:

### Collections to Update:
1. ✅ `therapists`
2. ✅ `places`
3. ✅ `hotels`
4. ✅ `villas`
5. ✅ `users`
6. ✅ `agents`

### For EACH Collection Above, Add This Attribute:

```
┌─────────────────────────────────────────────────────────┐
│ ADD BOOLEAN ATTRIBUTE                                    │
├─────────────────────────────────────────────────────────┤
│  Collection:       [therapists] ←── Or places/hotels etc│
│                                                          │
│  Attribute Key:    [chatBlocked]                        │
│  Required:         [ ] No  ←── NOT required             │
│  Array:            [ ] No                               │
│  Default Value:    [✓] false  ←── Check "false"         │
│                                                          │
│  💡 Purpose: Allows admin to block users from chatting  │
│                                                          │
│                          [Create] ←── Click              │
└─────────────────────────────────────────────────────────┘
```

**Repeat for all 6 collections!**

---

## ✅ VERIFICATION CHECKLIST

### Collection: `chat_messages`

- [ ] Collection created with ID: `chat_messages`
- [ ] 14 Attributes added:
  - [ ] senderId (String, 255, Required)
  - [ ] senderName (String, 255, Required)
  - [ ] senderType (String, 50, Required)
  - [ ] recipientId (String, 255, Required)
  - [ ] recipientName (String, 255, Required)
  - [ ] recipientType (String, 50, Required)
  - [ ] message (String, 5000, Required)
  - [ ] timestamp (DateTime, Required)
  - [ ] read (Boolean, Required, Default: false)
  - [ ] messageType (String, 20, Required, Default: text)
  - [ ] fileUrl (String, 500, Optional)
  - [ ] fileName (String, 255, Optional)
  - [ ] location (String, 500, Optional)
  - [ ] keepForever (Boolean, Optional, Default: false)
- [ ] 3 Indexes added:
  - [ ] chat_participants (Fulltext, senderId + recipientId)
  - [ ] unread_messages (Fulltext, recipientId + read)
  - [ ] message_timeline (Key, timestamp, ASC)
- [ ] Permissions set:
  - [ ] Create: Any
  - [ ] Read: Any
  - [ ] Update: Any

### Storage Bucket: `chat_attachments`

- [ ] Bucket created with ID: `chat_attachments`
- [ ] Max file size: 10 MB (10485760 bytes)
- [ ] Allowed extensions: jpg, jpeg, png, pdf, doc, docx
- [ ] Compression: Enabled
- [ ] Encryption: Enabled
- [ ] Permissions set:
  - [ ] Create: Any
  - [ ] Read: Any

### Existing Collections Updated

- [ ] `therapists` - chatBlocked field added
- [ ] `places` - chatBlocked field added
- [ ] `hotels` - chatBlocked field added
- [ ] `villas` - chatBlocked field added
- [ ] `users` - chatBlocked field added
- [ ] `agents` - chatBlocked field added

---

## 🎯 QUICK SUMMARY

### What You Created:

```
┌─────────────────────────────────────────────────────────┐
│ APPWRITE RESOURCES FOR CHAT SYSTEM                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📊 COLLECTION: chat_messages                           │
│     ├─ 14 Attributes                                    │
│     ├─ 3 Indexes                                        │
│     └─ 3 Permissions (Create, Read, Update)            │
│                                                          │
│  📦 STORAGE BUCKET: chat_attachments                    │
│     ├─ 10 MB max file size                             │
│     ├─ 6 allowed file types                            │
│     └─ 2 Permissions (Create, Read)                    │
│                                                          │
│  🔄 UPDATED 6 COLLECTIONS                               │
│     ├─ therapists → Added chatBlocked                  │
│     ├─ places → Added chatBlocked                      │
│     ├─ hotels → Added chatBlocked                      │
│     ├─ villas → Added chatBlocked                      │
│     ├─ users → Added chatBlocked                       │
│     └─ agents → Added chatBlocked                      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 NEXT STEPS

After completing this Appwrite setup:

1. ✅ Follow **MEMBER_CHAT_INTEGRATION.md** to add chat to dashboards
2. ✅ Follow **CHAT_QUICK_START.md** for testing checklist
3. ✅ Test the chat system thoroughly

---

## 📞 HELP

**Can't find how to add attributes?**
- Go to Collection → Attributes tab → Click "Add Attribute" button

**Can't find how to add indexes?**
- Go to Collection → Indexes tab → Click "Create Index" button

**Can't find how to set permissions?**
- Go to Collection → Settings tab → Scroll to Permissions section

**Need more details?**
- See **APPWRITE_CHAT_SCHEMA.md** for complete reference

---

**Estimated Setup Time:** 30-45 minutes

**Last Updated:** October 2025  
**Version:** 1.0
