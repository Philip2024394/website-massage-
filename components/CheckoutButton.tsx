import React, { useCallback, useMemo, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

interface CheckoutButtonProps {
  // Use either a direct Payment Link URL or a price ID for Checkout Session
  label?: string;
  priceId?: string;
  paymentLinkUrl?: string;
  quantity?: number;
  // Optional metadata to send to your backend
  metadata?: Record<string, string>;
  // Optional success/cancel URLs if your backend requires them
  successUrl?: string;
  cancelUrl?: string;
  className?: string;
}

/**
 * CheckoutButton supports two modes:
 * 1) Payment Links (no backend): set VITE_STRIPE_PAYMENT_LINK_URL or pass paymentLinkUrl prop
 * 2) Checkout Session (backend): set VITE_CHECKOUT_ENDPOINT and VITE_STRIPE_PUBLISHABLE_KEY
 */
const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  label = 'Pay with Stripe',
  priceId,
  paymentLinkUrl,
  quantity = 1,
  metadata,
  successUrl,
  cancelUrl,
  className
}) => {
  const [loading, setLoading] = useState(false);

  const envPaymentLinkUrl = import.meta.env.VITE_STRIPE_PAYMENT_LINK_URL as string | undefined;
  const envCheckoutEndpoint = import.meta.env.VITE_CHECKOUT_ENDPOINT as string | undefined;
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;

  const effectivePaymentLink = paymentLinkUrl || envPaymentLinkUrl;

  const handlePaymentLinks = useCallback(() => {
    if (!effectivePaymentLink) return;
    const url = new URL(effectivePaymentLink);
    if (quantity && quantity > 0) url.searchParams.set('quantity', String(quantity));
    window.location.href = url.toString();
  }, [effectivePaymentLink, quantity]);

  const handleCheckoutSession = useCallback(async () => {
    if (!envCheckoutEndpoint || !publishableKey) {
      console.error('Stripe checkout not configured: missing VITE_CHECKOUT_ENDPOINT or VITE_STRIPE_PUBLISHABLE_KEY');
      return;
    }
    setLoading(true);
    try {
      const body = {
        priceId,
        quantity,
        metadata,
        successUrl: successUrl || window.location.origin + '/?checkout=success',
        cancelUrl: cancelUrl || window.location.origin + '/?checkout=cancel'
      };
      const res = await fetch(envCheckoutEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Failed to create checkout session');
      const json = await res.json();
      const sessionId = json.id || json.sessionId;
      if (!sessionId) throw new Error('No session ID returned');
      const stripe = await loadStripe(publishableKey);
      if (!stripe) throw new Error('Stripe failed to initialize');
      await stripe.redirectToCheckout({ sessionId });
    } catch (err) {
      console.error('Stripe checkout error:', err);
    } finally {
      setLoading(false);
    }
  }, [envCheckoutEndpoint, publishableKey, priceId, quantity, metadata, successUrl, cancelUrl]);

  const canUsePaymentLinks = !!effectivePaymentLink;
  const canUseCheckout = !!(envCheckoutEndpoint && publishableKey);

  const onClick = useCallback(() => {
    if (canUsePaymentLinks) return handlePaymentLinks();
    if (canUseCheckout) return handleCheckoutSession();
    console.warn('Stripe is not configured. Set VITE_STRIPE_PAYMENT_LINK_URL or VITE_CHECKOUT_ENDPOINT + VITE_STRIPE_PUBLISHABLE_KEY');
  }, [canUsePaymentLinks, canUseCheckout, handlePaymentLinks, handleCheckoutSession]);

  const disabled = loading || (!canUsePaymentLinks && !canUseCheckout);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={className || 'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow disabled:opacity-50'}
    >
      {loading ? 'Please wait…' : label}
    </button>
  );
};

export default CheckoutButton;
