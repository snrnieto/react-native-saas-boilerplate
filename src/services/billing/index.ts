/**
 * Billing Service Module
 * Barrel export for clean imports throughout the application.
 *
 * Implementation:
 * - Web: PaddleAdapter (see /src/adapters/paddle)
 * - Native (iOS/Android): RevenueCatAdapter (see /src/adapters/revenuecat)
 * - To use: BillingProvider injects the correct adapter by Platform.OS
 */

export type { IBillingService } from "./IBillingService";

export type { Offerings, Product, PurchaseResult, RestoreResult } from "./types";

export { BillingError, BillingErrorCode } from "./types";
