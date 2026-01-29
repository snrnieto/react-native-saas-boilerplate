/**
 * IBillingService Interface
 *
 * Contract for products and payment flows from the payment provider (Paddle, RevenueCat, etc.).
 * Implemented by PaddleAdapter (Web) and RevenueCatAdapter (Native).
 * Interchangeable: Paddle, RevenueCat, Stripe, etc.
 *
 * Subscription state is read via ISubscriptionService (DB provider), not here.
 */

import type { Offerings, PurchaseOptions, PurchaseResult, RestoreResult } from "./types";

export interface IBillingService {
  /**
   * Get the list of products/plans from the payment provider (for paywall display).
   *
   * @returns Promise with offerings (products) from the provider
   */
  getOfferings(): Promise<Offerings>;

  /**
   * Start the purchase flow for a product/plan.
   *
   * @param productIdOrPlanId - Product or plan identifier from getOfferings()
   * @param options - Optional user info (email, userId) to associate with the purchase
   * @returns Promise with purchase result (success, error, etc.)
   */
  purchase(productIdOrPlanId: string, options?: PurchaseOptions): Promise<PurchaseResult>;

  /**
   * Restore previous purchases (e.g. after reinstall or new device).
   *
   * @returns Promise with restore result (success, error, etc.)
   */
  restorePurchases(): Promise<RestoreResult>;
}
