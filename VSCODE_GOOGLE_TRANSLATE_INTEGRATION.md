# VS Code Google Translate Integration Guide

## 🎯 Overview
This setup automatically activates VS Code Google Translate extension when English or Indonesian is selected **anywhere** in your IndaStreet application - landing page, dashboards, or live menus.

## 🌐 Complete Integration Coverage

### ✅ Language Selection Points That Activate Translation:

1. **Landing Page** (`LandingPage.tsx`)
   - Language dropdown selection triggers translation activation
   - Persists choice across app navigation

2. **Hotel Dashboard** (`HotelDashboardPage.tsx`)
   - Language selection on landing page within dashboard
   - Activates translation for hotel management interface

3. **Villa Dashboard** (`VillaDashboardPage.tsx`)
   - Language selection with multi-language support
   - English/Indonesian activate translation, other languages available

4. **Live Menu Pages** (`HotelVillaMenuPage.tsx`)
   - Guest-facing language selection buttons
   - Both landing page and header language toggles
   - Real-time translation activation for menu content

5. **Global App Level** (`App.tsx`)
   - Master language state changes trigger translation
   - Centralized activation for consistency across components

6. **Language Selector Component** (`SimpleLanguageSelector.tsx`)
   - Reusable component with built-in translation activation
   - Used across multiple pages for consistency

## � How Language Propagation Works

### 1. **User Selects Language**
```
User clicks language → Component handler → VS Code activation → Global state update
```

### 2. **Translation Mode Activation**
- **English selected** → "Indonesian → English" translation mode
- **Indonesian selected** → "English → Indonesian" translation mode

### 3. **Cross-Component Synchronization**
```typescript
// Global language change in App.tsx
useEffect(() => {
    if (language) {
        vscodeTranslateService.activateOnLanguageChange(language);
    }
}, [language]);
```

### 4. **Local Storage Persistence**
- Language preference stored automatically
- VS Code settings updated accordingly
- Maintains translation mode across sessions

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+T` | Quick translate to Indonesian |
| `Ctrl+Shift+E` | Quick translate to English |
| `Ctrl+Alt+T` | Translate selected text |
| `F2` | Show translation popup |

## 🛠️ Development Commands

### Browser Console Commands
When running in development mode, these global functions are available:

```javascript
// Quick translation functions
await translateToIndonesian("Hello world");
// → "Halo dunia"

await translateToEnglish("Selamat datang");
// → "Welcome"
```

### VS Code Tasks
Run these tasks from Command Palette (`Ctrl+Shift+P`):
- `🔤 Activate English to Indonesian Translation`
- `🔤 Activate Indonesian to English Translation`
- `🌐 Test Translation Service`

## 📁 File Structure

```
.vscode/
├── settings.json          # Google Translate extension config
├── keybindings.json       # Custom translation shortcuts
├── tasks.json             # Translation task commands
└── extensions.json        # Recommended extensions

lib/
└── vscodeTranslateService.ts  # Auto-activation service

components/
└── SimpleLanguageSelector.tsx # Updated with auto-activation
```

## 🔄 How It Works

### 1. Language Detection
```typescript
// When language changes in any component
vscodeTranslateService.activateOnLanguageChange('id'); // Indonesian
vscodeTranslateService.activateOnLanguageChange('en'); // English
```

### 2. VS Code Integration
```typescript
// Sends messages to VS Code extension
window.vscode?.postMessage({
    command: 'activateTranslation',
    config: {
        sourceLanguage: 'en',
        targetLanguage: 'id',
        autoActivate: true
    }
});
```

### 3. Visual Feedback
- Shows translation status notifications
- Updates VS Code extension settings automatically
- Provides browser console feedback for development

## 🎨 Visual Indicators

### Translation Status Notifications
When translation mode changes, you'll see:
- Green notification: "English to Indonesian mode activated"
- Green notification: "Indonesian to English mode activated"

### Console Logs
Development logs show:
```
🌐 Language changed to: id
🔤 Indonesian to English mode activated
🔧 Updated VS Code translation settings: {...}
```

## 🔧 Troubleshooting

### Extension Not Activating
1. Ensure Google Translate extension is installed
2. Check if API key is properly set in `.env`
3. Restart VS Code after configuration changes

### Translation Not Working
1. Verify internet connection for Google Translate API
2. Check browser console for error messages
3. Ensure you're running in development mode

### Custom Configuration
You can manually configure translation settings by calling:
```typescript
import { vscodeTranslateService } from './lib/vscodeTranslateService';

// Get current configuration
const config = vscodeTranslateService.getCurrentConfig();

// Translate specific text
vscodeTranslateService.translateSelection("Your text here");
```

## 🌍 Supported Languages

Currently configured for:
- **English** (`en`) ↔ **Indonesian** (`id`)

To add more languages, update:
1. `SUPPORTED_LANGUAGES` in `autoTranslationService.ts`
2. Language pairs in `.vscode/settings.json`
3. Keybindings in `.vscode/keybindings.json`

## 📈 Benefits

✅ **Automatic Activation** - No manual VS Code extension toggling  
✅ **Context Aware** - Switches direction based on selected language  
✅ **Developer Friendly** - Console commands and keyboard shortcuts  
✅ **Visual Feedback** - Clear status notifications  
✅ **Seamless Integration** - Works with existing translation system  
✅ **Professional Workflow** - Streamlined translation development process  

## 🎯 Next Steps

1. **Test the Integration**: Select different languages in your app
2. **Use Keyboard Shortcuts**: Try `Ctrl+Shift+T` for quick translation
3. **Check Console**: Monitor translation activation logs
4. **Customize Settings**: Adjust in `.vscode/settings.json` if needed

The VS Code Google Translate extension will now automatically activate whenever you switch between English and Indonesian in your IndaStreet application! 🚀