// Google Analytics 4 E-Commerce Event Helper for Green Basket TCR

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-CY6KWZ944D";

// Track generic event
export function trackEvent(action: string, params: Record<string, any> = {}) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, params);
  }
}

// Track Pageview on App Router client route changes
export function trackPageView(url: string) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", GA_TRACKING_ID, {
      page_path: url,
    });
  }
}

// Track Search
export function trackSearch(searchTerm: string) {
  trackEvent("search", {
    search_term: searchTerm,
  });
}

// Track View Item (Product Detail Page)
export function trackViewItem(product: {
  id: string;
  name: string;
  price: number;
  category?: string;
  variant?: string;
}) {
  trackEvent("view_item", {
    currency: "INR",
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        item_category: product.category || "Produce",
        item_variant: product.variant || "Standard",
        quantity: 1,
      },
    ],
  });
}

// Track Add to Cart
export function trackAddToCart(item: {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  variant?: string;
}) {
  trackEvent("add_to_cart", {
    currency: "INR",
    value: item.price * item.quantity,
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        item_category: item.category || "Produce",
        item_variant: item.variant || "Standard",
        quantity: item.quantity,
      },
    ],
  });
}

// Track Remove from Cart
export function trackRemoveFromCart(item: {
  id: string;
  name: string;
  price: number;
  quantity: number;
  variant?: string;
}) {
  trackEvent("remove_from_cart", {
    currency: "INR",
    value: item.price * item.quantity,
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        item_variant: item.variant || "Standard",
        quantity: item.quantity,
      },
    ],
  });
}

// Track Begin Checkout
export function trackBeginCheckout(items: any[], totalValue: number) {
  trackEvent("begin_checkout", {
    currency: "INR",
    value: totalValue,
    items: items.map((item) => ({
      item_id: item.id || item.product_id,
      item_name: item.name,
      price: item.price,
      item_variant: item.variantLabel || item.variant?.label,
      quantity: item.quantity,
    })),
  });
}

// Track Purchase (Order Success)
export function trackPurchase(order: {
  orderNumber: string;
  total: number;
  shipping: number;
  items: any[];
}) {
  trackEvent("purchase", {
    transaction_id: order.orderNumber,
    value: order.total,
    currency: "INR",
    shipping: order.shipping,
    items: order.items.map((item) => ({
      item_id: item.id || item.product_id,
      item_name: item.name,
      price: item.price,
      item_variant: item.variantLabel || item.variant?.label,
      quantity: item.quantity,
    })),
  });
}
