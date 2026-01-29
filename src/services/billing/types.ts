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
  price: string; // localized price string (e.g. "$9.99")
  priceAmountMicros?: number; // for sorting/comparison if provider exposes it
  currencyCode?: string;
}

/**
 * Catalog of products/plans returned by the payment provider.
 * Structure may vary by provider; adapters map to this shape.
 */
export interface Offerings {
  products: Product[];
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
