/**
 * NativeBillingPlaceholder – IBillingService placeholder for iOS/Android.
 *
 * Used by BillingProvider when Platform.OS !== 'web' until Task 4.4 (RevenueCatAdapter)
 * is implemented. Implements IBillingService so the app does not crash; returns empty
 * offerings and failed purchase/restore with a clear message.
 *
 * When Task 4.4 is done: implement RevenueCatAdapter and switch BillingProvider
 * to use it instead of this placeholder.
 */

import type { IBillingService } from "../../services/billing/IBillingService";
import type {
  Offerings,
  PurchaseOptions,
  PurchaseResult,
  RestoreResult,
} from "../../services/billing/types";

const MESSAGE =
  "In-app billing on this platform will be available after RevenueCatAdapter (Task 4.4) is implemented.";

export class NativeBillingPlaceholder implements IBillingService {
  async getOfferings(): Promise<Offerings> {
    return { products: [] };
  }

  async purchase(
    _productIdOrPlanId: string,
    _options?: PurchaseOptions
  ): Promise<PurchaseResult> {
    return { success: false, error: MESSAGE };
  }

  async restorePurchases(): Promise<RestoreResult> {
    return { success: false, error: MESSAGE };
  }
}
