/*
  Appwrite Function handler for Stripe webhooks
  - Activates seller plans and member subscriptions
*/
import Stripe from 'stripe';
import { Client, Databases, Query } from 'node-appwrite';

export default async function main(req: any, res: any): Promise<void> {
  const sig = req.headers['stripe-signature'] as string | undefined;
  const rawBody: Buffer = req.bodyRaw || req.rawBody || Buffer.from(req.body || '');

  const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
  const STRIPE_API_KEY = process.env.STRIPE_API_KEY || '';
  const stripe = new Stripe(STRIPE_API_KEY, { apiVersion: '2024-11-20.acacia' as any });

  let event: Stripe.Event;
  try {
    if (!sig || !STRIPE_WEBHOOK_SECRET) throw new Error('Missing signature or secret');
    event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    res.statusCode = 400;
    res.end(`Webhook Error: ${err.message}`);
    return;
  }

  const appwrite = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || '')
    .setProject(process.env.APPWRITE_PROJECT_ID || '')
    .setKey(process.env.APPWRITE_API_KEY || '');
  const db = new Databases(appwrite);

  const DB_ID = process.env.APPWRITE_DATABASE_ID || '';
  const COL_SELLERS = process.env.APPWRITE_COLLECTION_SELLERS || '';
  const COL_MEMBERSHIPS = process.env.APPWRITE_COLLECTION_MEMBERSHIPS || '';

  const PRICE_MAP: Record<string, { kind: 'seller' | 'member'; tier: string }> = {
    [process.env.PRICE_ID_SELLER_LOCAL || '']: { kind: 'seller', tier: 'local' },
    [process.env.PRICE_ID_SELLER_GLOBAL || '']: { kind: 'seller', tier: 'global' },
    [process.env.PRICE_ID_MEMBER_BASIC || '']: { kind: 'member', tier: 'basic' },
    [process.env.PRICE_ID_MEMBER_PRO || '']: { kind: 'member', tier: 'pro' },
    [process.env.PRICE_ID_MEMBER_PREMIUM || '']: { kind: 'member', tier: 'premium' }
  };

  async function activateSellerByRef({ ownerUserId, ownerEmail, tier }: { ownerUserId?: string; ownerEmail?: string; tier: 'local' | 'global' }) {
    if (!COL_SELLERS) return;
    let seller: any = null;
    if (ownerUserId) {
      const sres: any = await db.listDocuments(DB_ID, COL_SELLERS, [Query.equal('ownerUserId', ownerUserId), Query.limit(1)]);
      seller = (sres.documents || [])[0] || null;
    }
    if (!seller && ownerEmail) {
      const sres: any = await db.listDocuments(DB_ID, COL_SELLERS, [Query.equal('ownerEmail', ownerEmail.toLowerCase()), Query.limit(1)]);
      seller = (sres.documents || [])[0] || null;
    }
    if (!seller) return;
    await db.updateDocument(DB_ID, COL_SELLERS, seller.$id, {
      planTier: tier,
      subscriptionStatus: 'active',
      trialEndsAt: null
    });
  }

  async function upsertMembership({ ownerUserId, ownerEmail, tier, status, currentPeriodEnd }: { ownerUserId?: string; ownerEmail?: string; tier: string; status: string; currentPeriodEnd?: string }) {
    if (!COL_MEMBERSHIPS) return;
    let existing: any = null;
    if (ownerUserId) {
      const resE: any = await db.listDocuments(DB_ID, COL_MEMBERSHIPS, [Query.equal('ownerUserId', ownerUserId), Query.limit(1)]);
      existing = (resE.documents || [])[0] || null;
    }
    if (!existing && ownerEmail) {
      const resE: any = await db.listDocuments(DB_ID, COL_MEMBERSHIPS, [Query.equal('ownerEmail', (ownerEmail || '').toLowerCase()), Query.limit(1)]);
      existing = (resE.documents || [])[0] || null;
    }
    if (existing) {
      await db.updateDocument(DB_ID, COL_MEMBERSHIPS, existing.$id, { tier, status, currentPeriodEnd: currentPeriodEnd || existing.currentPeriodEnd || null });
    } else {
      const { ID } = await import('node-appwrite');
      await db.createDocument(DB_ID, COL_MEMBERSHIPS, (ID as any).unique(), { ownerUserId, ownerEmail: (ownerEmail || '').toLowerCase(), tier, status, currentPeriodEnd: currentPeriodEnd || null });
    }
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const sessionId = session.id;
        let items: Stripe.LineItem[] = [];
        try {
          const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 10 });
          items = lineItems.data || [];
        } catch {}
        const priceIds = items.map(i => (i.price as any)?.id).filter(Boolean) as string[];
        const mapping = priceIds.map(pid => PRICE_MAP[pid]).find(Boolean);
        const ownerUserId = (session.client_reference_id as string | undefined) || undefined;
        const ownerEmail = (session.customer_details?.email || session.customer_email || '') || undefined;
        const currentPeriodEnd = session.expires_at ? new Date(session.expires_at * 1000).toISOString() : undefined;
        if (mapping?.kind === 'seller' && (mapping.tier === 'local' || mapping.tier === 'global')) {
          await activateSellerByRef({ ownerUserId, ownerEmail, tier: mapping.tier as any });
        }
        if (mapping?.kind === 'member') {
          await upsertMembership({ ownerUserId, ownerEmail, tier: mapping.tier, status: 'active', currentPeriodEnd });
        }
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscription = invoice.subscription as string | Stripe.Subscription | null;
        let priceId: string | undefined;
        if (invoice.lines?.data?.length) {
          priceId = (invoice.lines.data[0].price as any)?.id;
        }
        const mapping = priceId ? PRICE_MAP[priceId] : undefined;
        let ownerUserId: string | undefined;
        let ownerEmail: string | undefined;
        // Best-effort lookup via customer_email - requires fetching customer
        try {
          if (invoice.customer && typeof invoice.customer === 'string') {
            const cust = await stripe.customers.retrieve(invoice.customer);
            if (!('deleted' in cust)) ownerEmail = (cust.email || undefined) as any;
          }
        } catch {}
        if (mapping?.kind === 'seller' && (mapping.tier === 'local' || mapping.tier === 'global')) {
          await activateSellerByRef({ ownerUserId, ownerEmail, tier: mapping.tier as any });
        }
        if (mapping?.kind === 'member') {
          const periodEnd = invoice.lines?.data?.[0]?.period?.end ? new Date((invoice.lines.data[0].period.end as number) * 1000).toISOString() : undefined;
          await upsertMembership({ ownerUserId, ownerEmail, tier: mapping.tier, status: 'active', currentPeriodEnd: periodEnd });
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const priceId = (sub.items?.data?.[0]?.price as any)?.id as string | undefined;
        const mapping = priceId ? PRICE_MAP[priceId] : undefined;
        let ownerEmail: string | undefined;
        try {
          if (sub.customer && typeof sub.customer === 'string') {
            const cust = await stripe.customers.retrieve(sub.customer);
            if (!('deleted' in cust)) ownerEmail = (cust.email || undefined) as any;
          }
        } catch {}
        if (mapping?.kind === 'seller' && (mapping.tier === 'local' || mapping.tier === 'global')) {
          await activateSellerByRef({ ownerUserId: undefined, ownerEmail, tier: 'local' });
          // Fallback: when canceled, set plan back to local with inactive status
        }
        if (mapping?.kind === 'member') {
          await upsertMembership({ ownerUserId: undefined, ownerEmail, tier: mapping.tier, status: 'canceled' });
        }
        break;
      }
      default:
        // Ignore others
        break;
    }

    res.statusCode = 200;
    res.end(JSON.stringify({ received: true }));
  } catch (e: any) {
    res.statusCode = 500;
    res.end(`Handler error: ${e.message}`);
  }
}
