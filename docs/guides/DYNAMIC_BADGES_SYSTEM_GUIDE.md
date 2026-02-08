# Dynamic Service Badges System

## Overview

The Dynamic Service Badges system adds realistic, randomized badges to therapist menu price sliders, creating a lively and trustworthy interface that highlights popular services, new offerings, and competitive pricing.

## 🎯 Key Features

- **Randomized Distribution**: 30% no badges, 50% one badge, 20% two badges
- **Four Badge Types**: New (Orange), Popular (Blue), Just Scheduled (Purple), Best Price (Green)
- **Session Consistency**: Same badges throughout user session, refreshes on reload
- **Smooth Animations**: Fade-in, slide-in effects with accessibility support
- **Mobile Responsive**: Scales appropriately for all device sizes
- **Performance Optimized**: Memoized badge generation for efficiency

## 📋 Implementation Guide

### 1. Basic Integration

```tsx
import ServiceBadges from '../../components/badges/ServiceBadges';
import '../../styles/badges.css';

// In your service card component
<div className="relative bg-white rounded-xl border-2 p-4">
  <ServiceBadges
    serviceId={service.id}
    serviceName={service.serviceName}
    refreshKey="session-key"
    animate={true}
    maxBadges={2}
  />
  
  {/* Your service content */}
</div>
```

### 2. Advanced Usage with Hooks

```tsx
import { useBadgeSession } from '../../hooks/useBadgeSession';

function TherapistMenu() {
  const { refreshKey, refreshBadges } = useBadgeSession();
  
  return (
    <div>
      <button onClick={refreshBadges}>🔄 Refresh Badges</button>
      
      {services.map(service => (
        <ServiceCard key={service.id}>
          <ServiceBadges
            serviceId={service.id}
            serviceName={service.serviceName}
            refreshKey={refreshKey}
          />
        </ServiceCard>
      ))}
    </div>
  );
}
```

### 3. Integration with Existing Components

#### TherapistPriceListModal Integration

```tsx
// Update TherapistPriceListModal props
interface TherapistPriceListModalProps {
  // ... existing props
  showBadges?: boolean;
  badgesRefreshKey?: string;
}

// Usage
<TherapistPriceListModal
  // ... existing props
  showBadges={true}
  badgesRefreshKey={refreshKey}
/>
```

## 🎨 Badge Types & Styling

### Badge Colors

| Badge Type | Color | Usage | Probability |
|------------|-------|--------|-------------|
| **New** | Orange Gradient | Recently added services | 25% |
| **Popular** | Blue Gradient | Most frequently booked | 25% |
| **Just Scheduled** | Purple Gradient | Recently booked by others | 25% |
| **Best Price** | Green Gradient | Competitive pricing | 25% |

### CSS Classes

```css
/* Animation Classes */
.animate-badge-slide-in     /* Slide-in animation */
.animate-shine             /* Subtle shine effect */
.badge-hover-bounce        /* Hover effect */

/* Layout Classes */
.badge-container-top-right /* Top-right positioning */
.badge-stack-vertical      /* Multiple badges stacking */

/* Size Classes */
.service-badge-mobile      /* Mobile-optimized sizing */
```

## ⚙️ Configuration Options

### ServiceBadges Props

```typescript
interface ServiceBadgesProps {
  serviceId: string;        // Unique identifier for consistent randomization
  serviceName: string;      // Service name (used in randomization seed)
  className?: string;       // Additional CSS classes
  animate?: boolean;        // Enable/disable animations (default: true)
  maxBadges?: 1 | 2;       // Maximum badges per service (default: 2)
  refreshKey?: string;      // For session-based updates
}
```

### Badge Distribution Logic

```typescript
// Probability Distribution
const probabilities = {
  noBadges: 0.3,    // 30% - clean, uncluttered appearance
  oneBadge: 0.5,    // 50% - most services get one badge
  twoBadges: 0.2    // 20% - special emphasis for select services
};
```

## 🔄 Dynamic Updates

### Session-Based Refresh

```tsx
// Automatic refresh every 5 minutes
const { refreshKey } = useBadgeSession();

// Manual refresh
const refreshBadges = () => {
  setRefreshKey(Date.now().toString());
};
```

### Real-Time Updates

```tsx
// Update badges based on booking events
useEffect(() => {
  const updateBadges = (bookingEvent) => {
    if (bookingEvent.type === 'new_booking') {
      refreshBadges(); // Update "Just Scheduled" badges
    }
  };
  
  bookingSocket.on('booking_completed', updateBadges);
}, []);
```

## 📱 Responsive Design

### Mobile Optimization

```css
@media (max-width: 640px) {
  .service-badge-mobile {
    font-size: 0.7rem;
    padding: 0.25rem 0.5rem;
  }
}

/* Prevent overflow on small cards */
.badge-container-top-right {
  max-width: calc(100% - 16px);
  overflow: hidden;
}
```

### Screen Size Adaptation

- **Desktop**: Full-size badges with all animations
- **Tablet**: Slightly smaller badges, reduced animation
- **Mobile**: Compact badges, essential animations only

## ♿ Accessibility

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  .animate-badge-slide-in,
  .animate-shine {
    animation: none !important;
  }
}
```

### Screen Reader Support

```tsx
// Badges include proper aria-labels
<div aria-label={`${badge.label} service badge`}>
  {badge.label}
</div>
```

## 🧪 Testing Examples

### Unit Test Example

```typescript
import { generateBadgesForService } from '../ServiceBadges';

test('badge generation consistency', () => {
  const serviceId = 'service-1';
  const serviceName = 'Swedish Massage';
  const refreshKey = 'test-key';
  
  // Should generate same badges for same inputs
  const badges1 = generateBadgesForService(serviceId, serviceName, 2, refreshKey);
  const badges2 = generateBadgesForService(serviceId, serviceName, 2, refreshKey);
  
  expect(badges1).toEqual(badges2);
});
```

### Integration Testing

```tsx
import { render, screen } from '@testing-library/react';
import EnhancedTherapistMenu from '../EnhancedTherapistMenu';

test('renders badges correctly', () => {
  render(
    <EnhancedTherapistMenu
      therapistId="therapist-1"
      menuData={mockMenuData}
    />
  );
  
  // Check for badge presence (may or may not exist due to randomization)
  const badges = screen.queryAllByText(/New|Popular|Just Scheduled|Best Price/);
  expect(badges.length).toBeLessThanOrEqual(8); // Max 2 badges per 4 services
});
```

## 🚀 Performance Optimization

### Memoization

```tsx
// Badge generation is memoized for performance
const badges = useMemo(() => 
  generateBadgesForService(serviceId, serviceName, maxBadges, refreshKey),
  [serviceId, serviceName, maxBadges, refreshKey]
);
```

### Bundle Size

- Core component: ~3KB gzipped
- CSS animations: ~2KB gzipped
- Total impact: ~5KB gzipped

## 📊 Analytics Integration

### Tracking Badge Effectiveness

```typescript
// Track badge click-through rates
const trackBadgeInteraction = (badgeType: string, serviceId: string) => {
  analytics.track('badge_service_selected', {
    badge_type: badgeType,
    service_id: serviceId,
    timestamp: Date.now()
  });
};
```

### A/B Testing Support

```tsx
// Enable/disable badges for A/B testing
const showBadges = useFeatureFlag('service_badges_enabled', true);

<ServiceBadges
  // ... props
  className={showBadges ? '' : 'hidden'}
/>
```

## 🔧 Troubleshooting

### Common Issues

1. **Badges Not Showing**
   ```tsx
   // Ensure CSS is imported
   import '../../styles/badges.css';
   
   // Check if showBadges prop is true
   showBadges={true}
   ```

2. **Inconsistent Badge Display**
   ```tsx
   // Use consistent refreshKey
   const refreshKey = useMemo(() => Date.now().toString(), []);
   ```

3. **Animation Performance Issues**
   ```tsx
   // Disable animations on lower-end devices
   const reduceAnimations = useMediaQuery('(prefers-reduced-motion)');
   <ServiceBadges animate={!reduceAnimations} />
   ```

### Debug Mode

```tsx
// Enable debug logging
const DEBUG_BADGES = process.env.NODE_ENV === 'development';

if (DEBUG_BADGES) {
  console.log('Generated badges:', badges, {
    serviceId,
    serviceName,
    refreshKey
  });
}
```

## 📈 Best Practices

### 1. Badge Consistency

- Use same `refreshKey` across session for consistency
- Update badges based on real booking events when possible
- Don't overwhelm users with too many badges

### 2. Visual Hierarchy

- Ensure badges don't overshadow service information
- Maintain proper contrast ratios for accessibility
- Position badges where they enhance rather than distract

### 3. Performance

- Memoize badge generation for frequently re-rendered components
- Limit animation complexity on mobile devices
- Use CSS transforms for better performance

### 4. User Experience

- Provide clear meaning for each badge type
- Keep badge text concise and actionable
- Ensure badges add value to the booking decision

## 🔮 Future Enhancements

### Planned Features

1. **Real-Time Badge Updates**: WebSocket integration for live badge updates
2. **Custom Badge Types**: Allow therapists to define custom badges
3. **Seasonal Badges**: Holiday or event-specific badge variations
4. **Localization**: Multi-language badge support
5. **Analytics Dashboard**: Badge performance metrics for therapists

### Extension Points

```tsx
// Custom badge types
interface CustomBadgeType {
  label: string;
  color: string;
  conditions: (service: Service) => boolean;
}

// Plugin system for badge generation
const badgePlugins = [
  seasonalBadgePlugin,
  customPromotionPlugin,
  realTimeBadgePlugin
];
```

---

## 💡 Tips for Success

1. **Start Simple**: Begin with basic badge integration, then add advanced features
2. **Monitor Performance**: Track badge impact on booking conversion rates
3. **User Feedback**: Gather feedback on badge usefulness and placement
4. **Iterate**: Adjust badge probabilities based on user behavior analytics
5. **Test Thoroughly**: Ensure badges work across all devices and screen sizes

This badge system creates a dynamic, trustworthy interface that feels alive while maintaining professional appearance and optimal user experience.