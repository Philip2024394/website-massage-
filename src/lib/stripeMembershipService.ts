/**
 * Stripe Membership Service — Monthly/Yearly subscription checkout
 *
 * BACKEND INTEGRATION:
 * - Set VITE_STRIPE_PUBLISHABLE_KEY in .env for client-side Stripe.js
 * - Backend must create Stripe Checkout Sessions (use Stripe secret key server-side only)
 * - Create Products and Prices in Stripe Dashboard per country/currency (GBP, USD, AUD, EUR)
 * - Webhook: checkout.session.completed → create/update partner account, grant dashboard access
 *
 * This file provides the client-side flow; actual session creation is done by your backend API.
 */

export interface CreateCheckoutParams {
  countryCode: string;
  currency: string;
  /** 'month' | 'year' */
  interval: 'month' | 'year';
  /** Amount in smallest unit (e.g. cents): 1999 = €19.99 */
  amount: number;
  /** Partner email for prefill and account link */
  email?: string;
  /** Success URL after payment */
  successUrl: string;
  /** Cancel URL if user abandons */
  cancelUrl: string;
  /** Optional: existing partner ID to attach subscription */
  partnerId?: string;
  /** First month free: backend should set subscription trial_period_days: 30 */
  firstMonthFree?: boolean;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

/**
 * Create a Stripe Checkout Session for membership subscription.
 * CALL YOUR BACKEND HERE — do not use Stripe secret key on the client.
 *
 * Example backend (Node/Express):
 *   POST /api/membership/create-checkout-session
 *   Body: { countryCode, currency, interval, amount, email, successUrl, cancelUrl, partnerId }
 *   Returns: { sessionId, url }
 *   Backend uses stripe.checkout.sessions.create({ mode: 'subscription', line_items: [...], ... })
 */
export async function createMembershipCheckoutSession(
  params: CreateCheckoutParams
): Promise<CheckoutSessionResponse> {
  const baseUrl =
    typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_URL
      ? import.meta.env.VITE_APP_URL
      : typeof window !== 'undefined'
        ? window.location.origin
        : '';

  const response = await fetch(
    `${baseUrl}/api/membership/create-checkout-session`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        countryCode: params.countryCode,
        currency: params.currency.toLowerCase(),
        interval: params.interval,
        amount: params.amount,
        email: params.email,
        successUrl: params.successUrl,
        cancelUrl: params.cancelUrl,
        partnerId: params.partnerId,
        firstMonthFree: params.firstMonthFree,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.message || `Checkout session failed: ${response.status}`);
  }

  const data = await response.json();
  return { sessionId: data.sessionId, url: data.url };
}

/**
 * Redirect to Stripe Checkout. Use after createMembershipCheckoutSession.
 * If no backend is present, this will fail; replace with a stub that redirects to a "coming soon" or manual signup.
 */
export function redirectToStripeCheckout(url: string): void {
  if (typeof window !== 'undefined' && url) {
    window.location.href = url;
  }
}

/**
 * Optional: Load Stripe.js for future use (e.g. Payment Element on your own page).
 * Requires VITE_STRIPE_PUBLISHABLE_KEY.
 */
export function getStripePublishableKey(): string | null {
  if (typeof import.meta === 'undefined') return null;
  const key = (import.meta.env?.VITE_STRIPE_PUBLISHABLE_KEY as string) || '';
  return key.trim() || null;
}
