/**
 * BillingProvider
 *
 * React Provider that selects the billing adapter by platform (Platform.OS) and
 * exposes the payment flow globally.
 *
 * - Web: PaddleAdapter (Paddle.js)
 * - iOS/Android: NativeBillingPlaceholder until Task 4.4 (RevenueCatAdapter)
 *
 * When Task 4.4 is implemented, replace NativeBillingPlaceholder with
 * RevenueCatAdapter in the platform branch below.
 */

import { useMemo, type ReactNode } from "react";
import { Platform } from "react-native";
import { PaddleAdapter } from "../../adapters/paddle";
import { NativeBillingPlaceholder } from "../../adapters/revenuecat";
import type { BillingPlatform } from "./BillingContext";
import { BillingContext } from "./BillingContext";

export interface BillingProviderProps {
  children: ReactNode;
}

function getBillingPlatform(): BillingPlatform {
  if (Platform.OS === "web") return "web";
  if (Platform.OS === "ios") return "ios";
  if (Platform.OS === "android") return "android";
  return "web";
}

/**
 * BillingProvider Component
 *
 * Instantiates the correct IBillingService by platform and provides it via context.
 */
export function BillingProvider({ children }: BillingProviderProps) {
  const platform = useMemo(() => getBillingPlatform(), []);

  const billingService = useMemo(() => {
    if (Platform.OS === "web") {
      return new PaddleAdapter();
    }
    // Native: use placeholder until Task 4.4 (RevenueCatAdapter) is implemented
    return new NativeBillingPlaceholder();
  }, []);

  const isNativePlaceholder = Platform.OS !== "web";

  const contextValue = useMemo(
    () => ({
      billingService,
      platform,
      isNativePlaceholder,
      getOfferings: billingService.getOfferings.bind(billingService),
      purchase: billingService.purchase.bind(billingService),
      restorePurchases: billingService.restorePurchases.bind(billingService),
    }),
    [billingService, platform, isNativePlaceholder]
  );

  return (
    <BillingContext.Provider value={contextValue}>
      {children}
    </BillingContext.Provider>
  );
}
