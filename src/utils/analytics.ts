declare function gtag(...args: unknown[]): void;

const PREMIUM_ITEM = {
  item_id: 'lifetime_premium',
  item_name: 'Lifetime Premium',
  price: 5.0,
};

export function trackPremiumView() {
  gtag('event', 'view_item', { currency: 'USD', value: 5.0, items: [PREMIUM_ITEM] });
}

export function trackBeginCheckout() {
  gtag('event', 'begin_checkout', { currency: 'USD', value: 5.0, items: [PREMIUM_ITEM] });
}

export function trackPurchase() {
  gtag('event', 'purchase', {
    transaction_id: Date.now().toString(),
    currency: 'USD',
    value: 5.0,
    items: [PREMIUM_ITEM],
  });
}
