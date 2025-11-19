Stripe Webhook (Sellers + Members)

Overview
- Handles Stripe webhooks to activate seller plans (Local/Global) and member subscriptions.
- Matches the Appwrite user via `client_reference_id` (preferred) or email fallback.
- Updates Appwrite documents:
  - Sellers: set `planTier` and `subscriptionStatus` on `marketplaceSellers` collection
  - Members: upsert a record in a `memberships` collection with `tier` and `status`

Recommended Flow
1) Use Checkout Sessions (recommended over static Payment Links) so we can set metadata:
   - client_reference_id: Appwrite User ID
   - metadata.kind: `seller_local` | `seller_global` | `member_basic` | `member_pro` | `member_premium`
   - metadata.sellerId (optional): existing seller doc id for exact mapping
2) Webhook validates signature and updates Appwrite accordingly.

Env Vars (Appwrite Function)
- STRIPE_WEBHOOK_SECRET: Your signing secret
- STRIPE_API_KEY: Secret key for Stripe API (to expand line items)
- APPWRITE_ENDPOINT: e.g. https://syd.cloud.appwrite.io/v1
- APPWRITE_PROJECT_ID: e.g. 68f23b11000d25eb3664
- APPWRITE_API_KEY: Appwrite API key with databases.write
- APPWRITE_DATABASE_ID: e.g. 68f76ee1000e64ca8d05
- APPWRITE_COLLECTION_SELLERS: marketplace sellers collection id
- APPWRITE_COLLECTION_MEMBERSHIPS: memberships collection id
- PRICE_ID_SELLER_LOCAL: Stripe Price ID for seller Local plan
- PRICE_ID_SELLER_GLOBAL: Stripe Price ID for seller Global plan
- PRICE_ID_MEMBER_BASIC: Stripe Price ID for member Basic plan
- PRICE_ID_MEMBER_PRO: Stripe Price ID for member Pro plan
- PRICE_ID_MEMBER_PREMIUM: Stripe Price ID for member Premium plan

Important Notes
- If you prefer Payment Links, append `client_reference_id` and `prefilled_email` to the link if supported. If not, switch to Checkout Session creation for reliability.
- For Payment Links without metadata, webhook will fall back to `session.customer_email` and match sellers by `ownerEmail`.

Deployment Steps (Appwrite Cloud Functions)
1) Create a new function: Runtime Node.js 18+
2) Add the above environment variables
3) Upload the `index.ts` compiled to JS and `package.json` with `stripe` and `node-appwrite`
4) Set HTTP event with a public endpoint
5) Add webhook in Stripe dashboard pointing to your function URL

Test Locally
- Use `stripe listen --forward-to localhost:8787/webhook` and run this handler behind a local server. Ensure raw body is provided to the Stripe signature check.
