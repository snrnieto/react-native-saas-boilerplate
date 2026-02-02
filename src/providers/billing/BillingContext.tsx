/**
 * BillingContext
 *
 * React Context for billing/payment flow. Provides the active billing service
 * (Paddle on web, RevenueCat placeholder on native until Task 4.4) and
 * convenience methods for offerings, purchase, and restore.
 */

import { createContext, useContext } from "react";
import type { IBillingService } from "../../services/billing/IBillingService";

export type BillingPlatform = "web" | "ios" | "android";

export interface BillingContextValue {
  /** Injected billing service (Paddle on web, native placeholder on iOS/Android). */
  billingService: IBillingService;
  /** Current platform used to select the adapter. */
  platform: BillingPlatform;
  /** Whether the active adapter is the native placeholder (RevenueCat not yet implemented). */
  isNativePlaceholder: boolean;
  getOfferings: IBillingService["getOfferings"];
  purchase: IBillingService["purchase"];
  restorePurchases: IBillingService["restorePurchases"];
}

export const BillingContext = createContext<BillingContextValue | undefined>(
  undefined
);

/**
 * Hook to access the billing context.
 *
 * @returns BillingContextValue
 * @throws Error if used outside of BillingProvider
 */
export function useBilling(): BillingContextValue {
  const context = useContext(BillingContext);

  if (context === undefined) {
    throw new Error("useBilling must be used within a BillingProvider");
  }

  return context;
}
