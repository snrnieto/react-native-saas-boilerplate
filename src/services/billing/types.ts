/**
 * Billing service types
 * For products/offerings and purchase/restore flows from the payment provider (Paddle, RevenueCat, etc.).
 * No Paddle/RevenueCat imports; adapters implement against the payment provider.
 */

// ============================================
// OFFERINGS / PRODUCT TYPES
// ============================================

/**
 * A single product or plan offered by the payment provider (Paddle/RevenueCat).
 * Provider-specific fields can be extended in adapters.
 */
export interface Product {
  id: string;
  identifier: string; // product/plan id for purchase()
  title: string;
  description?: string;
  /**
   * Main price to display (typically the total including tax).
   * Localized price string (e.g. "$9.99").
   */
  price: string;
  priceAmountMicros?: number; // for sorting/comparison if provider exposes it
  currencyCode?: string;
  /**
   * Price breakdown (all localized strings).
   * Useful for showing "price + tax" or "includes X tax".
   */
  priceDetails?: {
    /** Total price including tax (what the customer pays). */
    total: string;
    /** Subtotal before tax. */
    subtotal: string;
    /** Tax amount. */
    tax: string;
  };
}

/**
 * Catalog of products/plans returned by the payment provider.
 * Structure may vary by provider; adapters map to this shape.
 */
export interface Offerings {
  products: Product[];
}

// ============================================
// PURCHASE OPTIONS
// ============================================

/**
 * Options for the purchase flow.
 * Pass user info so the payment provider can associate the subscription.
 */
export interface PurchaseOptions {
  /**
   * User's email address.
   * Paddle will pre-fill the checkout with this email.
   */
  email?: string;
  /**
   * Your internal user ID.
   * Paddle will include this in webhooks as customData.userId.
   */
  userId?: string;
  /**
   * Checkout UI locale (e.g. "en", "es").
   * Use the app's current language so checkout matches.
   */
  locale?: string;
  /**
   * Additional custom data to pass to the payment provider.
   * Will be included in webhooks.
   */
  customData?: Record<string, string>;
}

// ============================================
// RESULT TYPES
// ============================================

/**
 * Result of a purchase attempt.
 */
export interface PurchaseResult {
  success: boolean;
  error?: string;
  productId?: string;
  /** Transaction ID from the payment provider (if available). */
  transactionId?: string;
}

/**
 * Result of a restore purchases attempt.
 */
export interface RestoreResult {
  success: boolean;
  error?: string;
}

// ============================================
// ERROR TYPES
// ============================================

/**
 * Billing error codes (purchase/restore).
 */
export enum BillingErrorCode {
  PURCHASE_CANCELLED = "PURCHASE_CANCELLED",
  PURCHASE_FAILED = "PURCHASE_FAILED",
  RESTORE_FAILED = "RESTORE_FAILED",
  PRODUCT_NOT_FOUND = "PRODUCT_NOT_FOUND",
  NETWORK_ERROR = "NETWORK_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * Structured billing error (similar to AuthError).
 */
export class BillingError extends Error {
  constructor(
    public code: BillingErrorCode,
    message: string,
    public originalError?: unknown,
  ) {
    super(message);
    this.name = "BillingError";
  }
}
