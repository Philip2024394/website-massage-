# Appwrite Setup Guide for Discount System

## Overview
This guide will help you set up the Appwrite backend for the promotional discount system.

## Step 1: Create Active Discounts Collection

### Collection Details
- **Collection ID**: `active_discounts`
- **Name**: Active Discounts
- **Permissions**: 
  - **Read**: Any (public can view active discounts)
  - **Create**: Users (providers can create discounts)
  - **Update**: Users (providers can update their discounts)
  - **Delete**: Users (providers can delete their discounts)

### Attributes

| Attribute Name | Type | Size | Required | Default | Array |
|---------------|------|------|----------|---------|-------|
| `providerId` | String | 255 | Yes | - | No |
| `providerName` | String | 255 | Yes | - | No |
| `providerType` | String (Enum) | 20 | Yes | - | No |
| `percentage` | Integer | - | Yes | - | No |
| `expiresAt` | DateTime | - | Yes | - | No |
| `duration` | Integer | - | Yes | - | No |
| `activatedAt` | DateTime | - | Yes | - | No |
| `imageUrl` | URL | 500 | Yes | - | No |
| `location` | String | 255 | No | "" | No |
| `rating` | Float | - | No | 0 | No |
| `profilePicture` | URL | 500 | No | "" | No |

### Enum Values for `providerType`
- `therapist`
- `place`

### Indexes

1. **Provider Lookup**
   - Type: Fulltext
   - Attributes: `providerId`, `providerType`
   - Key: `provider_lookup`

2. **Active Discounts**
   - Type: Fulltext
   - Attributes: `expiresAt`
   - Key: `active_discounts_time`

3. **Recent Activations**
   - Type: Fulltext
   - Attributes: `activatedAt`
   - Key: `recent_activations`

## Step 2: Update Appwrite Config

Add the collection ID to your `lib/appwrite.config.ts`:

\`\`\`typescript
collections: {
    // ... existing collections
    activeDiscounts: 'active_discounts',
}
\`\`\`

## Step 3: Set Up Realtime Subscriptions

The discount system uses Appwrite Realtime to automatically update all users when:
- A new discount is activated
- A discount expires
- A discount is manually deactivated

This is already implemented in `/lib/discountService.ts` via the `subscribeToDiscounts()` function.

## Step 4: Configure Notifications Collection (Optional)

If you want to send in-app notifications when discounts are activated, ensure your `notifications` collection has these attributes:

| Attribute Name | Type | Required |
|---------------|------|----------|
| `customerId` | String | Yes |
| `providerId` | String | Yes |
| `providerType` | String (Enum) | Yes |
| `type` | String (Enum) | Yes |
| `message` | String | Yes |
| `percentage` | Integer | No |
| `expiresAt` | DateTime | No |
| `isRead` | Boolean | Yes |
| `createdAt` | DateTime | Yes |

### Enum Values for `type`
- `booking_confirmed`
- `booking_cancelled`
- `review_received`
- `discount_offer` ← **NEW**
- `system_message`

## Step 5: Configure Chat Rooms Collection

For the broadcast feature to work, ensure your `chat_rooms` collection exists with:

| Attribute Name | Type | Required |
|---------------|------|----------|
| `customerId` | String | Yes |
| `providerId` | String | Yes |
| `providerType` | String (Enum) | Yes |
| `createdAt` | DateTime | Yes |

This allows the system to find all customers who have chatted with a provider.

## Step 6: Test the System

### 6.1 Activate a Discount
1. Log in as a therapist or massage place
2. Go to Dashboard → Discounts tab
3. Select a discount percentage (5%, 10%, 15%, or 20%)
4. Choose duration (4, 8, 12, or 24 hours)
5. Click "Activate"

### 6.2 Verify in Appwrite Console
1. Go to Appwrite Console → Databases → Active Discounts collection
2. You should see a new document with:
   - Provider details
   - Percentage
   - Expiration timestamp
   - Duration

### 6.3 Check Public Discounts Page
1. Navigate to "Today's Discounts" from the main menu
2. You should see the active discount with countdown timer
3. Filter by provider type (therapist/spa)
4. Try sorting by discount, time, or rating

### 6.4 Verify Realtime Updates
1. Open two browser windows
2. In window 1: Activate a discount
3. In window 2: Watch "Today's Discounts" page auto-update without refresh

## Step 7: Set Up Cleanup Job (Optional but Recommended)

To automatically delete expired discounts from the database, set up an Appwrite Function:

### Function Details
- **Name**: Cleanup Expired Discounts
- **Runtime**: Node.js 18
- **Schedule**: `0 * * * *` (every hour)
- **Code**:

\`\`\`javascript
import { Client, Databases, Query } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client);
  const databaseId = '68f76ee1000e64ca8d05';
  const collectionId = 'active_discounts';

  try {
    const now = new Date().toISOString();
    
    // Find expired discounts
    const expired = await databases.listDocuments(
      databaseId,
      collectionId,
      [Query.lessThan('expiresAt', now)]
    );

    // Delete each expired discount
    let deletedCount = 0;
    for (const doc of expired.documents) {
      await databases.deleteDocument(databaseId, collectionId, doc.$id);
      deletedCount++;
    }

    log(\`Cleaned up \${deletedCount} expired discounts\`);
    return res.json({ success: true, deleted: deletedCount });
  } catch (err) {
    error('Cleanup failed:', err);
    return res.json({ success: false, error: err.message });
  }
};
\`\`\`

## Step 8: WhatsApp Business API Integration (Optional)

For WhatsApp notifications, you'll need:

1. **WhatsApp Business API Account**
2. **Update `/lib/discountBroadcastService.ts`** with your API credentials
3. **Add phone numbers** to user profiles
4. **Configure message templates** in WhatsApp Business Manager

Example integration:

\`\`\`typescript
import axios from 'axios';

export const broadcastViaWhatsApp = async (
    phoneNumbers: string[],
    providerName: string,
    percentage: number,
    duration: number,
    bookingLink: string
): Promise<{ success: boolean; sentCount: number }> => {
    try {
        const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL;
        const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY;

        const promises = phoneNumbers.map(phone => 
            axios.post(WHATSAPP_API_URL, {
                to: phone,
                type: 'template',
                template: {
                    name: 'discount_offer',
                    language: { code: 'en' },
                    components: [{
                        type: 'body',
                        parameters: [
                            { type: 'text', text: providerName },
                            { type: 'text', text: percentage.toString() },
                            { type: 'text', text: duration.toString() },
                            { type: 'text', text: bookingLink }
                        ]
                    }]
                }
            }, {
                headers: { 'Authorization': \`Bearer \${WHATSAPP_API_KEY}\` }
            })
        );

        await Promise.all(promises);
        return { success: true, sentCount: phoneNumbers.length };
    } catch (error) {
        console.error('WhatsApp broadcast failed:', error);
        return { success: false, sentCount: 0 };
    }
};
\`\`\`

## Troubleshooting

### Issue: Discounts not appearing on public page
- Check Appwrite Console → Active Discounts collection
- Verify `expiresAt` is in the future
- Check browser console for errors
- Verify realtime subscription is active

### Issue: Broadcast not sending to customers
- Check `chat_rooms` collection exists
- Verify customers have `customerId` field
- Check `notifications` collection permissions
- Look for errors in browser console

### Issue: Discount expired but still showing
- Run cleanup function manually
- Check countdown timer logic
- Verify timezone settings match Appwrite server

## Security Best Practices

1. **Rate Limiting**: Limit discount activations to 1 per provider per hour
2. **Validation**: Verify provider owns the account before activating
3. **Sanitization**: Sanitize all input data before saving to database
4. **Permissions**: Use Appwrite permissions to restrict access
5. **Audit Log**: Track who activates/deactivates discounts

## Next Steps

1. ✅ Create `active_discounts` collection in Appwrite
2. ✅ Add collection ID to config
3. ✅ Test discount activation
4. ✅ Verify realtime updates
5. ✅ Set up cleanup function
6. ⏳ Configure WhatsApp API (optional)
7. ⏳ Add analytics tracking
8. ⏳ Implement rate limiting

---

## Support

If you encounter issues, check:
- Appwrite Console logs
- Browser console errors
- Network tab for failed requests
- Collection permissions

For more help, refer to:
- [Appwrite Documentation](https://appwrite.io/docs)
- [Appwrite Realtime Guide](https://appwrite.io/docs/realtime)
- [Appwrite Functions Guide](https://appwrite.io/docs/functions)
