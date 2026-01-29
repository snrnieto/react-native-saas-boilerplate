/**
 * ISubscriptionService Interface
 *
 * Contract for reading subscription state from the DB provider (e.g. Supabase).
 * The subscriptions table is updated by webhooks; the app only reads.
 * Implemented by an adapter of the DB provider (e.g. SupabaseSubscriptionAdapter).
 * Interchangeable: Supabase, another SQL, etc.
 *
 * Each user has at most one effective active subscription. If they paid on web (Paddle),
 * they are Pro on mobile too; the paywall must check getSubscriptionStatus() and
 * not offer purchase when isActive is true.
 */

import type { SubscriptionStatusResult } from "./types";

export interface ISubscriptionService {
  /**
   * Get subscription status for a user (one effective status per user).
   * Reads from the subscriptions table and derives effective status (isActive, planType, etc.).
   * If the user has an active subscription from any provider (e.g. Paddle on web),
   * isActive is true and the app must not offer purchase again (e.g. on mobile).
   *
   * @param userId - User ID (e.g. auth.users(id) in Supabase)
   * @returns Promise with effective subscription status for the app
   */
  getSubscriptionStatus(userId: string): Promise<SubscriptionStatusResult>;
}
