/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string;
  readonly VITE_STRIPE_PAYMENT_LINK_URL?: string;
  readonly VITE_CHECKOUT_ENDPOINT?: string;
  readonly VITE_STRIPE_LINK_EU?: string;
  readonly VITE_STRIPE_LINK_ID?: string;
  readonly VITE_STRIPE_LINK_US?: string;
  readonly VITE_STRIPE_LINK_UK?: string;
  readonly VITE_STRIPE_LINK_AU?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
