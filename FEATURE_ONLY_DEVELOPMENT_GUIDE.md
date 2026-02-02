# 🎯 FEATURE-ONLY DEVELOPMENT GUIDE

## 📋 **DEVELOPMENT PROTOCOL**

### **NEW FEATURE WORKFLOW**

1. **Feature Request Received**
   ```
   ✅ Create in: /src_v2/features/[feature-name]/
   ✅ Structure: Component + Actions + Types
   ✅ Integration: Via shell routing only
   ```

2. **UI Component Needed**
   ```
   ✅ Create in: /src_v2/ui/[component-name]/
   ✅ Make it reusable and generic
   ✅ Export via /src_v2/ui/index.ts
   ```

3. **Core Functionality Needed**
   ```
   🛑 STOP: Don't modify core directly
   ✅ Submit CoreExtensionRequest
   ✅ Design API specification
   ✅ Get architectural approval
   ```

---

## 🏗️ **DIRECTORY STRUCTURE**

### **FROZEN ZONES** 🔒
```
/src_v2/core/               ← NO MODIFICATIONS
├── booking/                ← LOCKED
├── chat/                   ← LOCKED
├── clients/                ← LOCKED
└── services/               ← LOCKED

/src_v2/shell/              ← NO MODIFICATIONS  
├── AppShell.tsx            ← LOCKED
├── routes.tsx              ← LOCKED
└── index.ts                ← LOCKED
```

### **DEVELOPMENT ZONES** ✅
```
/src_v2/features/           ← ALL NEW FEATURES
├── therapist-dashboard/    ← Example: Complete feature
├── booking-flow/           ← Future: New booking UI
├── payment-system/         ← Future: Payment handling
└── notifications/          ← Future: User notifications

/src_v2/ui/                 ← ALL NEW UI COMPONENTS
├── Button/                 ← Reusable button component
├── Modal/                  ← Reusable modal system  
├── Form/                   ← Form components
└── Layout/                 ← Layout utilities
```

---

## 🔒 **CORE EXTENSION PROCESS**

### **When You Need Core Changes**

**WRONG APPROACH:** ❌
```typescript
// DON'T DO THIS - Directly modifying core
// /src_v2/core/booking/index.ts
export function myNewFeatureFunction() {
  // Adding feature-specific logic to core
}
```

**RIGHT APPROACH:** ✅
```typescript
// 1. Submit extension request
const requestId = requestCoreExtension({
  featureName: 'Advanced Booking Filters',
  requiredCoreChange: 'Add filtering capability to BookingService',
  businessJustification: 'Users need to filter bookings by date range and status',
  architecturalImpact: 'New optional parameters to existing functions',
  alternativesConsidered: [
    'Client-side filtering (performance issues)',
    'Separate service (data duplication)'
  ]
});

// 2. Design in feature directory first
// /src_v2/features/booking-filters/BookingFilters.tsx
export const BookingFilters = () => {
  // Feature implementation using EXISTING core functions
  // Until core extension is approved
};
```

---

## 📋 **DEVELOPMENT CHECKLIST**

### **Before Starting Any Work:**

- [ ] **Is this a new feature?** → `/src_v2/features/`
- [ ] **Is this a UI component?** → `/src_v2/ui/`  
- [ ] **Does it need core changes?** → Submit extension request
- [ ] **Is it a bug fix?** → Identify location and justification

### **Feature Development:**

- [ ] Create feature directory: `/src_v2/features/[name]/`
- [ ] Implement using existing core functions only
- [ ] Add feature to shell routing if needed
- [ ] Write tests in feature directory
- [ ] Document feature boundaries

### **UI Development:**

- [ ] Create component directory: `/src_v2/ui/[name]/`
- [ ] Make component reusable and generic
- [ ] Add to `/src_v2/ui/index.ts` exports
- [ ] Write component tests
- [ ] Document props and usage

---

## 🛡️ **FREEZE ENFORCEMENT**

### **Automatic Checks:**
```typescript
// Example enforcement
if (filePath.includes('/src_v2/core/') || filePath.includes('/src_v2/shell/')) {
  if (changeType !== 'critical-bug-fix') {
    throw new Error('🚫 FREEZE VIOLATION: Core/Shell modifications prohibited');
  }
}
```

### **Violation Examples:**
❌ **PROHIBITED:**
- "Refactor core booking service for better performance"
- "Small improvement to shell routing"
- "Update core client configuration" 
- "Optimize shell error handling"

✅ **ALLOWED:**
- "Fix critical memory leak in booking service"
- "Patch security vulnerability in client auth"
- "Resolve production crash in shell routing"

---

## 🎯 **BENEFITS OF FEATURE-ONLY DEVELOPMENT**

### **Stability Benefits:**
- ✅ Core never breaks from feature development
- ✅ Shell remains stable regardless of new features
- ✅ Bugs are isolated to specific features
- ✅ Rollback only affects individual features

### **Development Benefits:**
- ✅ Clear boundaries and responsibilities
- ✅ Parallel feature development possible
- ✅ No merge conflicts in core systems
- ✅ Easier testing and validation

### **Team Benefits:**
- ✅ Junior developers can't break core
- ✅ Feature teams work independently  
- ✅ Architecture stays clean and focused
- ✅ Technical debt stays localized

---

## 🚀 **SUCCESS METRICS**

### **Architecture Health:**
- **Core Stability**: Zero unexpected modifications
- **Shell Integrity**: Routing and layout unchanged
- **Feature Isolation**: No cross-feature dependencies
- **Extension Process**: All core needs go through design

### **Development Velocity:**
- **Feature Speed**: Faster development in isolated areas
- **Bug Resolution**: Issues contained to specific features
- **Team Productivity**: No stepping on each other's code
- **Release Confidence**: Core stability guarantees

---

*This guide establishes the discipline needed to prevent architectural decay while enabling rapid feature development.*