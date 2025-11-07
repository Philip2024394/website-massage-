# PWA Icon Generation Guide

## Critical: App icons are required for PWA installation

The following icons need to be placed in the `/public` folder:

### Required Icons:
- icon-72.png (72x72)
- icon-96.png (96x96) 
- icon-128.png (128x128)
- icon-144.png (144x144)
- icon-152.png (152x152)
- icon-192.png (192x192) - **CRITICAL**
- icon-384.png (384x384)
- icon-512.png (512x512) - **CRITICAL**

### Quick Icon Generation:
1. Create a base 512x512 IndaStreet logo
2. Use online tools like:
   - https://favicon.io/favicon-generator/
   - https://realfavicongenerator.net/
   - https://app-manifest.firebaseapp.com/

### Temporary Placeholder:
```html
<!-- Basic placeholder icons -->
<link rel="icon" type="image/png" sizes="192x192" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏨</text></svg>" />
```

### Brand Colors:
- Primary: #f97316 (Orange)
- Secondary: #ffffff (White)
- Background: #ffffff

### Design Elements:
- IndaStreet logo/text
- Massage/spa themed icon
- Professional appearance
- High contrast for visibility