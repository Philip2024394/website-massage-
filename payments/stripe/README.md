# Stripe Integration (Client + Options)

This app supports two straightforward ways to accept Stripe payments:

## Option A — Payment Links (no backend)
Fastest to ship. Create a Payment Link in Stripe Dashboard and paste it into your env:

1) In Stripe Dashboard → Payment Links → Create link. Copy the URL.
2) Add to your Vite env (e.g., `.env.local`):

```
VITE_STRIPE_PAYMENT_LINK_URL=https://buy.stripe.com/your_link_here
```

3) Use the `CheckoutButton` component in your UI:

```tsx
import CheckoutButton from '../components/CheckoutButton';

<CheckoutButton label="Buy Now" />
```

You can also pass a `paymentLinkUrl` prop directly if you need multiple links.

## Option B — Stripe Checkout Session (requires backend endpoint)
If you need dynamic pricing or metadata, create an endpoint that returns a Checkout Session ID.

Env vars:
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx_or_pk_test_xxx
VITE_CHECKOUT_ENDPOINT=https://your-api.example.com/api/create-checkout-session
```

Client usage:
```tsx
import CheckoutButton from '../components/CheckoutButton';

<CheckoutButton label="Pay" priceId="price_123" quantity={1} metadata={{ userId: 'abc' }} />
```

### Example Node/Express endpoint
```ts
import express from 'express';
import Stripe from 'stripe';

const app = express();
app.use(express.json());
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-11-20.acacia' });

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { priceId, quantity = 1, metadata, successUrl, cancelUrl } = req.body || {};
    if (!priceId) return res.status(400).json({ error: 'Missing priceId' });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity }],
      success_url: successUrl || 'https://yourapp.com/?checkout=success',
      cancel_url: cancelUrl || 'https://yourapp.com/?checkout=cancel',
      metadata
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

app.listen(3001, () => console.log('Stripe server running on 3001'));
```

## Notes
- For Indonesia, your price/product currency should match what you want to charge; we don’t do any exchange on the client.
- Webhooks: For fulfillment, configure a Stripe webhook to your backend to confirm successful payment events (e.g., `checkout.session.completed`).
- Security: Keep `STRIPE_SECRET_KEY` only on the server (never in the client or Vite env).
