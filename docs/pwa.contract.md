# PWA CONTRACT (LOCKED)

⚠️ **CRITICAL**: This contract defines production PWA architecture.
🚫 **DO NOT MODIFY**: AI tools must not alter PWA definitions without explicit approval.
📋 **SOURCE OF TRUTH**: Always refer to this file for PWA requirements.

---

## PWA ARCHITECTURE

### **Service Worker**
- **File**: `public/sw.js`
- **Contract**: Handles cache management, offline support, push notifications
- **Registration**: Automatic in main.tsx

### **Web App Manifest**
- **File**: `public/manifest.json`
- **Contract**: Defines PWA metadata, icons, display modes
- **Theme**: Dark theme with professional branding

### **Push Notifications**
- **VAPID Public Key**: `BNzl3bapWKfqGqHj3nVMRsGBcdMO7yb-DCNcKSLpuJKdSKJkEjhf7vIR2M10K1yfxI1FCQYC-VFN1pYf5crnRTqo`
- **VAPID Private Key**: ENVIRONMENT VARIABLE ONLY
- **Service**: Appwrite Functions or external service

---

## PWA CAPABILITIES

### **Offline Support**
- **Cache Strategy**: Cache First for static assets
- **Network Strategy**: Network First for API calls
- **Fallback**: Offline page for uncached routes

### **Install Prompt**
- **Trigger**: Manual install button in UI
- **Criteria**: A2HS (Add to Home Screen) standards
- **Platform**: iOS Safari, Android Chrome, Desktop browsers

### **Background Sync**
- **Contract**: Queue API operations when offline
- **Sync**: Retry failed requests when online
- **Storage**: IndexedDB for offline data

---

## NOTIFICATION SYSTEM

### **Push Notification Types**
1. **Booking Notifications** - New booking alerts
2. **Chat Messages** - Real-time message notifications  
3. **System Alerts** - Critical system notifications
4. **Marketing** - Promotional content (opt-in required)

### **Notification Permissions**
- **Request**: Explicit user consent required
- **Storage**: Store permission state in localStorage
- **Fallback**: In-app notifications if push denied

### **Message Payload Structure**
```typescript
{
  title: string;
  body: string;
  icon: string;
  badge: string;
  tag: string;          // Notification grouping
  data: {               // Custom payload
    type: 'booking' | 'chat' | 'system' | 'marketing';
    targetId?: string;  // Booking ID, Chat ID, etc.
    action?: string;    // Deep link action
  }
}
```

---

## CONFIGURATION REQUIREMENTS

### **Manifest.json Requirements**
```json
{
  "name": "Therapeutic Massage",
  "short_name": "TherapyMassage",
  "theme_color": "#1F2937",
  "background_color": "#111827",
  "display": "standalone",
  "start_url": "/",
  "icons": [
    // Minimum required sizes: 192x192, 512x512
  ]
}
```

### **Service Worker Requirements**
- **Cache Version**: Increment on updates
- **Network Timeout**: 3 seconds maximum
- **Cache Size Limit**: 50MB maximum
- **Update Strategy**: Update on page reload

---

## SECURITY REQUIREMENTS

### **VAPID Keys**
- **Public**: Safe to expose in client-side code
- **Private**: SERVER-SIDE ONLY, never in frontend
- **Rotation**: Every 6 months for production

### **Service Worker Security**
- **HTTPS Only**: No HTTP support allowed
- **Origin Validation**: Verify notification origin
- **Content Security Policy**: Strict CSP headers

### **Notification Security**
- **Data Validation**: Sanitize all notification content
- **Permission Checks**: Verify user consent before sending
- **Rate Limiting**: Prevent notification spam

---

## PROHIBITED MODIFICATIONS

### **Never Change**
- VAPID public key without server coordination
- Service worker cache strategy without testing
- Notification permission flow
- Manifest theme/branding without approval

### **Never Add**  
- Automatic notification requests on page load
- Sensitive data in notification payloads
- Unvalidated push message handlers
- Cache strategies that break offline functionality

---

## PWA VALIDATION

### **Required PWA Features**
- ✅ Web App Manifest with required fields
- ✅ Service Worker with offline support
- ✅ HTTPS deployment
- ✅ Responsive design
- ✅ Fast loading (< 3 seconds)

### **Lighthouse PWA Score**
- **Target**: 90+ score
- **Metrics**: Performance, Accessibility, Best Practices, PWA
- **Testing**: Regular Lighthouse audits required

---

## DEPLOYMENT REQUIREMENTS

### **Production Checklist**
- ✅ VAPID keys properly configured
- ✅ Service worker cache versioning updated
- ✅ Manifest icons optimized
- ✅ Push notification service configured
- ✅ Offline fallback pages tested

---

**Last Updated**: January 20, 2026  
**Contract Version**: Production v1.0  
**Compliance**: Enterprise PWA Architecture