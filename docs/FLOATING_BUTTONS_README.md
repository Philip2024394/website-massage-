# 🎯 Floating Button URL Mapping System

A comprehensive floating action button system with URL mapping for deep linking and navigation.

## 🚀 Features

- **URL Mapping**: Each floating button has its own unique URL for deep linking
- **Role-Based Display**: Buttons appear based on user roles (customer, therapist, place, guest)
- **Page-Specific Buttons**: Different buttons for different pages
- **Analytics Tracking**: Built-in Google Analytics event tracking
- **Responsive Design**: Mobile-optimized with touch-friendly interactions
- **Accessibility**: Full keyboard navigation and screen reader support
- **Expandable Menus**: Multiple buttons collapse into an expandable menu

## 📁 File Structure

```
config/
├── floatingButtonConfig.ts     # Button configuration and management
hooks/
├── useFloatingButtonNavigation.ts  # Navigation hook
components/
├── FloatingButtonManager.tsx   # Main component
examples/
├── FloatingButtonUsageExamples.tsx  # Usage examples
```

## 🛠 Quick Setup

1. **Import the FloatingButtonManager** in your main App component:

```tsx
import FloatingButtonManager from './components/FloatingButtonManager';

function App() {
  return (
    <div className="app">
      {/* Your existing content */}
      
      <FloatingButtonManager
        currentPage={currentPage}
        setPage={setPage}
        userRole={userRole}
      />
    </div>
  );
}
```

2. **Configure buttons** in `config/floatingButtonConfig.ts`:

```typescript
{
  id: 'support-chat',
  name: 'Support Chat',
  icon: 'MessageCircle',
  url: '/chat/support',
  page: 'chat',
  position: 'bottom-right',
  color: 'bg-orange-500',
  hoverColor: 'hover:bg-orange-600',
  description: 'Open support chat window',
  enabled: true,
  roles: ['customer', 'therapist'],
  pages: ['home', 'booking-flow']
}
```

## 🎯 Available Buttons

| Button ID | Name | URL | Target Page | Description |
|-----------|------|-----|-------------|-------------|
| `support-chat` | Support Chat | `/chat/support` | chat | Open support chat window |
| `booking-quick` | Quick Booking | `/booking/quick` | booking-flow | Quick booking shortcut |
| `website-link` | Website | `/website` | website-management | Visit IndaStreet Website |
| `notifications` | Notifications | `/notifications` | notifications | View notifications |
| `therapist-availability` | Set Availability | `/dashboard/therapist/availability` | therapistAvailability | Update availability |
| `emergency-contact` | Emergency Contact | `/emergency/contact` | customer-support | Emergency support |
| `feedback` | Feedback | `/feedback` | customer-support | Send feedback |
| `help` | Help | `/help` | faq | Get help and FAQ |

## 🔧 Configuration

### Button Configuration Object

```typescript
interface FloatingButtonConfig {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  icon: string;                  // Lucide icon name
  url: string;                   // URL path
  page: Page;                    // Target page
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  color: string;                 // Tailwind background color class
  hoverColor: string;           // Tailwind hover color class
  description: string;          // Tooltip description
  enabled: boolean;             // Whether button is active
  roles?: string[];             // User roles that can see this button
  pages?: Page[];               // Pages where this button appears
}
```

### Position Options

- `bottom-right` - Bottom right corner (default for most buttons)
- `bottom-left` - Bottom left corner
- `top-right` - Top right corner
- `top-left` - Top left corner

### User Roles

- `guest` - Unauthenticated users
- `customer` - Regular customers
- `therapist` - Massage therapists
- `place` - Massage place owners
- `admin` - Administrator users

## 🎮 Usage Examples

### Basic Usage

```tsx
<FloatingButtonManager
  currentPage="home"
  setPage={setPage}
  userRole="customer"
/>
```

### Using Navigation Hook

```tsx
const { navigateToButton, openButtonInNewTab } = useFloatingButtonNavigation({
  currentPage: 'home',
  setPage,
  userRole: 'customer'
});

// Navigate to support chat
const handleSupportClick = () => {
  navigateToButton('support-chat');
};

// Open booking in new tab
const handleBookingClick = () => {
  openButtonInNewTab('booking-quick');
};
```

### Adding Custom Buttons

```typescript
import { addFloatingButtonConfig } from '../config/floatingButtonConfig';

addFloatingButtonConfig({
  id: 'custom-promo',
  name: 'Special Offer',
  icon: 'Star',
  url: '/promo/special',
  page: 'todays-discounts',
  position: 'bottom-right',
  color: 'bg-yellow-500',
  hoverColor: 'hover:bg-yellow-600',
  description: 'Special promotion',
  enabled: true,
  roles: ['customer'],
  pages: ['home']
});
```

### Updating Button Configuration

```typescript
import { updateFloatingButtonConfig } from '../config/floatingButtonConfig';

updateFloatingButtonConfig('support-chat', {
  color: 'bg-blue-500',
  hoverColor: 'hover:bg-blue-600',
  enabled: false
});
```

## 🔗 URL Integration

### Automatic URL Updates

When a floating button is clicked, the system automatically:
1. Updates the browser URL with the button's target URL
2. Adds tracking parameters (`?source=floating-button&button-id=support-chat`)
3. Navigates to the target page
4. Tracks analytics events

### Direct URL Access

Users can directly access floating button targets via URL:
- `https://yoursite.com/chat/support?source=floating-button`
- `https://yoursite.com/booking/quick?source=floating-button`

### URL Parameters

The system automatically adds these parameters:
- `source=floating-button` - Indicates navigation source
- `button-id={buttonId}` - Which button was clicked

## 📱 Responsive Behavior

- **Mobile**: Buttons are touch-optimized with larger hit areas
- **Desktop**: Hover effects and tooltips
- **Multiple Buttons**: Automatically collapse into expandable menu
- **Positioning**: Adjusts based on screen size and available space

## 🎨 Customization

### Styling

Buttons use Tailwind CSS classes and can be customized:

```tsx
<FloatingButtonManager
  currentPage={currentPage}
  setPage={setPage}
  userRole={userRole}
  className="custom-floating-buttons"
/>
```

### Custom Icons

Add new icons to the icon map in `FloatingButtonManager.tsx`:

```typescript
import { YourCustomIcon } from 'lucide-react';

const iconMap = {
  MessageCircle,
  Calendar,
  YourCustomIcon,
  // ... other icons
};
```

## 📊 Analytics

The system automatically tracks these events:
- `floating_button_click` - When a button is clicked
- `floating_button_new_tab` - When opened in new tab

Event properties include:
- `button_id` - Button identifier
- `button_name` - Button display name
- `source_page` - Current page
- `target_page` - Destination page

## 🚀 Integration with Existing Components

### HomePage Integration

```tsx
import FloatingButtonManager from './components/FloatingButtonManager';

const HomePage = ({ page, setPage, user }) => {
  return (
    <div className="homepage">
      {/* Existing content */}
      
      <FloatingButtonManager
        currentPage={page}
        setPage={setPage}
        userRole={user?.role || 'guest'}
      />
    </div>
  );
};
```

### Therapist Dashboard Integration

```tsx
const TherapistDashboard = ({ page, setPage }) => {
  return (
    <div className="dashboard">
      {/* Dashboard content */}
      
      <FloatingButtonManager
        currentPage={page}
        setPage={setPage}
        userRole="therapist"
      />
    </div>
  );
};
```

## 🔧 API Reference

### Functions

#### `getFloatingButtonsForPage(page, userRole)`
Returns available buttons for a specific page and user role.

#### `getFloatingButtonById(id)`
Get button configuration by ID.

#### `updateFloatingButtonConfig(id, updates)`
Update existing button configuration.

#### `addFloatingButtonConfig(config)`
Add new button configuration.

#### `removeFloatingButtonConfig(id)`
Remove button configuration.

### Hooks

#### `useFloatingButtonNavigation({ currentPage, setPage, userRole })`
Returns navigation functions and available buttons.

#### `useFloatingButtonState(buttonId)`
Returns state and configuration for a specific button.

## 🐛 Troubleshooting

### Buttons Not Showing
1. Check if button is enabled: `button.enabled === true`
2. Verify user role matches: `button.roles.includes(userRole)`
3. Confirm page is allowed: `button.pages.includes(currentPage)`

### URL Not Updating
1. Ensure `setPage` function is provided
2. Check if page type exists in `pageTypes.ts`
3. Verify URL mapping in `useURLRouting.ts`

### Icons Not Displaying
1. Confirm icon name exists in Lucide React
2. Add icon to `iconMap` in `FloatingButtonManager.tsx`
3. Check for typos in icon name

## 📝 Contributing

When adding new buttons:
1. Add configuration to `floatingButtonConfig.ts`
2. Update URL mappings in `hooks/useURLRouting.ts`
3. Add page type to `types/pageTypes.ts`
4. Add route handler in `AppRouter.tsx`
5. Test on different devices and user roles

## 🎯 Best Practices

1. **Limit Buttons**: Don't show more than 4-5 buttons per page
2. **User Context**: Only show relevant buttons for user role
3. **Performance**: Use lazy loading for button components
4. **Accessibility**: Always provide aria-labels and tooltips
5. **Analytics**: Track button usage to optimize placement
6. **Mobile First**: Design for touch interactions first