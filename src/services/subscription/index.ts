/**
 * Subscription Service Module
 * Barrel export for clean imports throughout the application.
 *
 * Implementation:
 * - Default implementation: SupabaseSubscriptionAdapter (see /src/adapters/supabase)
 * - To use: import { SupabaseSubscriptionAdapter } from '@/adapters/supabase'
 */

export type { ISubscriptionService } from "./ISubscriptionService";

export type {
  PlanType,
  SubscriptionProvider,
  SubscriptionRecord,
  SubscriptionStatus,
  SubscriptionStatusResult,
} from "./types";
