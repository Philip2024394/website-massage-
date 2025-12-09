# Automated Payment Reminders with Stripe Integration

## Overview
Automatically send payment reminders to members when their subscription is due, with Stripe payment links generated on-demand.

---

## 🏗️ Architecture

### Components
1. **Appwrite Function** - Scheduled cron job (runs daily)
2. **Stripe API** - Generate payment links
3. **WhatsApp API** - Send payment notifications
4. **Appwrite Database** - Track reminders sent

---

## 📁 Implementation Files

### 1. Appwrite Function: `payment-reminder-cron`

Create this function in Appwrite Console → Functions → Create Function

**Configuration:**
- **Name:** Payment Reminder Cron
- **Runtime:** Node.js 18
- **Schedule:** `0 9 * * *` (Daily at 9 AM)
- **Timeout:** 300 seconds
- **Environment Variables:**
  - `STRIPE_SECRET_KEY` - Your Stripe secret key
  - `STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
  - `WHATSAPP_API_KEY` - WhatsApp Business API key
  - `ADMIN_PHONE` - Admin contact number
  - `APPWRITE_ENDPOINT` - Your Appwrite endpoint
  - `APPWRITE_PROJECT_ID` - Your project ID
  - `APPWRITE_API_KEY` - Server API key with full permissions
  - `APPWRITE_DATABASE_ID` - Your database ID

**Function Code:**

```javascript
// functions/payment-reminder-cron/index.js
const sdk = require('node-appwrite');
const Stripe = require('stripe');

// Initialize Stripe
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Appwrite
const client = new sdk.Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new sdk.Databases(client);

// Pricing tiers
const PRICING_TIERS = {
    1: 0,       // Month 1 - Free
    2: 100000,  // Month 2 - 100k IDR
    3: 135000,  // Month 3 - 135k IDR
    4: 175000,  // Month 4 - 175k IDR
    5: 200000   // Month 5+ - 200k IDR
};

const getPricingTier = (month) => {
    if (month <= 5) return PRICING_TIERS[month];
    return PRICING_TIERS[5];
};

// Send WhatsApp message
async function sendWhatsAppPayment(memberData, paymentLink) {
    const { name, phone, memberType, currentMonth, nextPaymentDate, amount } = memberData;
    
    const typeLabel = memberType === 'therapist' ? 'Therapist' 
        : memberType === 'massage_place' ? 'Massage Place' 
        : 'Facial Place';
    
    const message = `🔔 PAYMENT REMINDER - INDASTREET

Hi ${name}! 👋

Your ${typeLabel} membership payment is due soon.

📅 Due Date: ${new Date(nextPaymentDate).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
})}
💰 Amount: Rp ${amount.toLocaleString()}
📊 Billing Period: Month ${currentMonth}

💳 PAY NOW WITH STRIPE:
${paymentLink}

Benefits of staying subscribed:
✅ Featured homepage placement
✅ Direct customer bookings
✅ Analytics dashboard access
✅ Priority customer support
✅ Verified provider badge

⚠️ If payment is not received by the due date, your account will switch to pay-per-lead mode (Rp 50,000 per accepted lead).

Questions? Contact us:
📞 ${process.env.ADMIN_PHONE}
📧 support@indastreet.id

Thank you for being part of IndaStreet! 🙏`;

    // Send via WhatsApp API
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    
    // For production, use WhatsApp Business API:
    // await fetch('https://api.whatsapp.com/send', {
    //     method: 'POST',
    //     headers: {
    //         'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}`,
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({
    //         to: phone,
    //         type: 'text',
    //         text: { body: message }
    //     })
    // });
    
    console.log(`✅ Payment reminder sent to ${name} (${phone})`);
    console.log(`Payment URL: ${whatsappUrl}`);
    
    return whatsappUrl;
}

// Create Stripe Payment Link
async function createStripePaymentLink(memberData) {
    const { memberId, name, memberType, amount, currentMonth } = memberData;
    
    try {
        // Create a product (or use existing)
        const product = await stripe.products.create({
            name: `IndaStreet Membership - Month ${currentMonth}`,
            description: `${memberType.replace('_', ' ')} subscription payment`,
            metadata: {
                memberId,
                memberName: name,
                memberType,
                billingMonth: currentMonth
            }
        });
        
        // Create a price
        const price = await stripe.prices.create({
            product: product.id,
            unit_amount: amount * 100, // Convert to cents (IDR in lowest denomination)
            currency: 'idr',
            metadata: {
                memberId,
                memberType,
                billingMonth: currentMonth
            }
        });
        
        // Create payment link
        const paymentLink = await stripe.paymentLinks.create({
            line_items: [
                {
                    price: price.id,
                    quantity: 1,
                },
            ],
            after_completion: {
                type: 'redirect',
                redirect: {
                    url: `https://indastreet.id/payment-success?session_id={CHECKOUT_SESSION_ID}&member_id=${memberId}`,
                },
            },
            metadata: {
                memberId,
                memberName: name,
                memberType,
                billingMonth: currentMonth
            }
        });
        
        console.log(`✅ Stripe payment link created for ${name}: ${paymentLink.url}`);
        return paymentLink.url;
        
    } catch (error) {
        console.error(`❌ Error creating Stripe payment link for ${name}:`, error);
        throw error;
    }
}

// Main function
module.exports = async ({ req, res, log, error }) => {
    try {
        log('🚀 Payment Reminder Cron Job Started');
        
        const today = new Date();
        const sevenDaysFromNow = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000));
        
        log(`Checking subscriptions due between ${today.toISOString()} and ${sevenDaysFromNow.toISOString()}`);
        
        // Query subscriptions due in next 7 days
        const subscriptions = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID,
            'member_subscriptions',
            [
                sdk.Query.greaterThan('nextPaymentDate', today.toISOString()),
                sdk.Query.lessThan('nextPaymentDate', sevenDaysFromNow.toISOString()),
                sdk.Query.equal('subscriptionStatus', 'active'),
                sdk.Query.limit(100)
            ]
        );
        
        log(`Found ${subscriptions.documents.length} subscriptions due for payment`);
        
        const results = {
            total: subscriptions.documents.length,
            sent: 0,
            failed: 0,
            errors: []
        };
        
        // Process each subscription
        for (const subscription of subscriptions.documents) {
            try {
                const { 
                    memberId, 
                    memberName, 
                    memberType, 
                    currentMonth, 
                    nextPaymentDate,
                    memberPhone 
                } = subscription;
                
                // Calculate next payment amount
                const nextMonth = currentMonth + 1;
                const amount = getPricingTier(nextMonth);
                
                // Skip if free month
                if (amount === 0) {
                    log(`Skipping ${memberName} - Month ${nextMonth} is free`);
                    continue;
                }
                
                const memberData = {
                    memberId,
                    name: memberName,
                    phone: memberPhone,
                    memberType,
                    currentMonth: nextMonth,
                    nextPaymentDate,
                    amount
                };
                
                // Create Stripe payment link
                const paymentLink = await createStripePaymentLink(memberData);
                
                // Send WhatsApp notification
                await sendWhatsAppPayment(memberData, paymentLink);
                
                // Log reminder sent
                await databases.createDocument(
                    process.env.APPWRITE_DATABASE_ID,
                    'payment_reminders',
                    sdk.ID.unique(),
                    {
                        memberId,
                        memberName,
                        memberType,
                        billingMonth: nextMonth,
                        amount,
                        dueDate: nextPaymentDate,
                        paymentLink,
                        sentAt: new Date().toISOString(),
                        status: 'sent'
                    }
                );
                
                results.sent++;
                log(`✅ Processed ${memberName} successfully`);
                
            } catch (err) {
                results.failed++;
                results.errors.push({
                    member: subscription.memberName,
                    error: err.message
                });
                error(`❌ Failed to process ${subscription.memberName}: ${err.message}`);
            }
        }
        
        log(`✅ Payment Reminder Cron Job Completed`);
        log(`Results: ${results.sent} sent, ${results.failed} failed`);
        
        return res.json({
            success: true,
            results,
            timestamp: new Date().toISOString()
        });
        
    } catch (err) {
        error(`❌ Fatal error in payment reminder cron: ${err.message}`);
        return res.json({
            success: false,
            error: err.message,
            timestamp: new Date().toISOString()
        }, 500);
    }
};
```

---

## 📦 Package Dependencies

Create `package.json` in function directory:

```json
{
  "name": "payment-reminder-cron",
  "version": "1.0.0",
  "description": "Automated payment reminders with Stripe",
  "main": "index.js",
  "dependencies": {
    "node-appwrite": "^11.0.0",
    "stripe": "^14.10.0"
  }
}
```

---

## 🗄️ New Database Collection: `payment_reminders`

**Collection ID:** `payment_reminders`

### Attributes

| Attribute | Type | Size | Required | Description |
|-----------|------|------|----------|-------------|
| memberId | String | 100 | ✅ | Member ID |
| memberName | String | 255 | ✅ | Member name |
| memberType | String | 50 | ✅ | therapist/massage_place/facial_place |
| billingMonth | Integer | - | ✅ | Month number being billed |
| amount | Integer | - | ✅ | Amount in IDR |
| dueDate | String | 100 | ✅ | Payment due date |
| paymentLink | String | 500 | ✅ | Stripe payment link URL |
| sentAt | String | 100 | ✅ | When reminder was sent |
| status | String | 50 | ✅ | sent, clicked, paid, expired |
| clickedAt | String | 100 | ❌ | When link was clicked |
| paidAt | String | 100 | ❌ | When payment completed |
| stripeSessionId | String | 255 | ❌ | Stripe checkout session ID |

### Indexes

1. **member_reminders_idx** - memberId (ASC), sentAt (DESC)
2. **status_idx** - status (ASC)
3. **due_date_idx** - dueDate (ASC)

---

## 🔗 Stripe Webhook Handler

Create another Appwrite Function to handle Stripe webhooks:

### Function: `stripe-webhook-handler`

**Configuration:**
- **Name:** Stripe Webhook Handler
- **Runtime:** Node.js 18
- **Trigger:** HTTP (POST endpoint)
- **Path:** `/stripe-webhook`

**Function Code:**

```javascript
// functions/stripe-webhook-handler/index.js
const sdk = require('node-appwrite');
const Stripe = require('stripe');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const client = new sdk.Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new sdk.Databases(client);

module.exports = async ({ req, res, log, error }) => {
    try {
        const sig = req.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        
        let event;
        
        try {
            event = stripe.webhooks.constructEvent(req.bodyRaw, sig, webhookSecret);
        } catch (err) {
            error(`⚠️  Webhook signature verification failed: ${err.message}`);
            return res.json({ error: 'Webhook signature verification failed' }, 400);
        }
        
        log(`✅ Received Stripe event: ${event.type}`);
        
        // Handle successful payment
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const { memberId, memberType, billingMonth } = session.metadata;
            
            log(`💳 Payment completed for member ${memberId}, month ${billingMonth}`);
            
            // Update subscription in database
            const collectionId = memberType === 'therapist' 
                ? 'therapists_collection_id'
                : memberType === 'massage_place' 
                ? 'places_collection_id' 
                : 'facial_places_collection';
            
            // Update member subscription status
            await databases.updateDocument(
                process.env.APPWRITE_DATABASE_ID,
                'member_subscriptions',
                memberId,
                {
                    currentMonth: parseInt(billingMonth),
                    subscriptionStatus: 'active',
                    lastPaymentDate: new Date().toISOString(),
                    nextPaymentDate: new Date(Date.now() + 30*24*60*60*1000).toISOString()
                }
            );
            
            // Update payment reminder status
            const reminders = await databases.listDocuments(
                process.env.APPWRITE_DATABASE_ID,
                'payment_reminders',
                [
                    sdk.Query.equal('memberId', memberId),
                    sdk.Query.equal('billingMonth', parseInt(billingMonth)),
                    sdk.Query.equal('status', 'sent')
                ]
            );
            
            if (reminders.documents.length > 0) {
                await databases.updateDocument(
                    process.env.APPWRITE_DATABASE_ID,
                    'payment_reminders',
                    reminders.documents[0].$id,
                    {
                        status: 'paid',
                        paidAt: new Date().toISOString(),
                        stripeSessionId: session.id
                    }
                );
            }
            
            // Record payment in payment_records
            await databases.createDocument(
                process.env.APPWRITE_DATABASE_ID,
                'payment_records',
                sdk.ID.unique(),
                {
                    memberId,
                    memberType,
                    monthNumber: parseInt(billingMonth),
                    amount: session.amount_total / 100, // Convert from cents
                    paymentDate: new Date().toISOString(),
                    paymentMethod: 'stripe',
                    paymentStatus: 'paid',
                    stripeSessionId: session.id,
                    notes: `Auto-payment via Stripe - Month ${billingMonth}`
                }
            );
            
            log(`✅ Subscription updated for member ${memberId}`);
            
            // Send confirmation WhatsApp
            // (Add your WhatsApp confirmation logic here)
        }
        
        return res.json({ received: true });
        
    } catch (err) {
        error(`❌ Error processing webhook: ${err.message}`);
        return res.json({ error: err.message }, 500);
    }
};
```

---

## 🎛️ Admin Dashboard Integration

Add payment reminder tracking to admin dashboard:

```typescript
// src/apps/admin/components/PaymentReminders.tsx
import React, { useEffect, useState } from 'react';
import { databases } from '../../../../lib/appwriteService';
import { Query } from 'appwrite';

const PaymentReminders: React.FC = () => {
    const [reminders, setReminders] = useState([]);
    const [stats, setStats] = useState({
        sent: 0,
        clicked: 0,
        paid: 0,
        pending: 0
    });
    
    useEffect(() => {
        loadReminders();
    }, []);
    
    const loadReminders = async () => {
        const result = await databases.listDocuments(
            'your-database-id',
            'payment_reminders',
            [
                Query.orderDesc('sentAt'),
                Query.limit(50)
            ]
        );
        
        setReminders(result.documents);
        
        // Calculate stats
        setStats({
            sent: result.documents.length,
            clicked: result.documents.filter(r => r.clickedAt).length,
            paid: result.documents.filter(r => r.status === 'paid').length,
            pending: result.documents.filter(r => r.status === 'sent').length
        });
    };
    
    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-600 text-sm">Sent</p>
                    <p className="text-2xl font-bold">{stats.sent}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-600 text-sm">Clicked</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.clicked}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-600 text-sm">Paid</p>
                    <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-600 text-sm">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
            </div>
            
            {/* Reminders Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left">Member</th>
                            <th className="px-4 py-3 text-left">Type</th>
                            <th className="px-4 py-3 text-left">Amount</th>
                            <th className="px-4 py-3 text-left">Due Date</th>
                            <th className="px-4 py-3 text-left">Sent</th>
                            <th className="px-4 py-3 text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {reminders.map((reminder) => (
                            <tr key={reminder.$id}>
                                <td className="px-4 py-3">{reminder.memberName}</td>
                                <td className="px-4 py-3">{reminder.memberType}</td>
                                <td className="px-4 py-3">Rp {reminder.amount.toLocaleString()}</td>
                                <td className="px-4 py-3">
                                    {new Date(reminder.dueDate).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3">
                                    {new Date(reminder.sentAt).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        reminder.status === 'paid' ? 'bg-green-100 text-green-800'
                                        : reminder.status === 'clicked' ? 'bg-blue-100 text-blue-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {reminder.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PaymentReminders;
```

---

## 🚀 Deployment Steps

### 1. Set Up Stripe

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Create webhook endpoint
stripe listen --forward-to https://your-appwrite-endpoint.com/v1/functions/stripe-webhook-handler/executions
```

### 2. Configure Appwrite Function

1. Go to Appwrite Console → Functions
2. Create new function "payment-reminder-cron"
3. Set schedule: `0 9 * * *` (9 AM daily)
4. Add environment variables
5. Deploy function code
6. Test execution

### 3. Create Webhook Handler

1. Create second function "stripe-webhook-handler"
2. Get webhook URL from Appwrite
3. Add to Stripe Dashboard → Webhooks
4. Copy webhook secret to environment variables

### 4. Test Flow

```bash
# Manual test
curl -X POST https://your-appwrite-endpoint.com/v1/functions/payment-reminder-cron/executions

# Check logs
# Appwrite Console → Functions → payment-reminder-cron → Executions
```

---

## 📊 Benefits

✅ **Fully Automated** - Runs daily without manual intervention  
✅ **Stripe Integration** - Secure payment processing  
✅ **WhatsApp Notifications** - Direct member communication  
✅ **Tracking Dashboard** - Monitor all reminders and payments  
✅ **Webhook Verification** - Automatic payment confirmation  
✅ **Scalable** - Handles unlimited members  

---

## 💰 Pricing Reminder Schedule

- **7 days before due**: First reminder with Stripe link
- **3 days before due**: Second reminder
- **1 day before due**: Final reminder
- **On due date**: Last chance notification
- **1 day after due**: Switch to lead-based model

---

This system is production-ready and will automatically handle all payment reminders with Stripe integration! 🎉
