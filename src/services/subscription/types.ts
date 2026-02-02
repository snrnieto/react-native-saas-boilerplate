/**
 * Subscription service types
 * Aligned with Prisma subscriptions schema (multi-provider: Paddle, RevenueCat).
 * No Prisma/Supabase imports; adapters implement against the DB provider.
 *
 * Business rule: each user has at most one effective active subscription.
 * If they subscribed on web (Paddle), they are Pro everywhere; the app on mobile
 * must not offer purchase again—only show "you're already Pro" using getSubscriptionStatus().
 *
 * Default: users with no subscription rows (0 rows) are on the FREE plan.
 * Newly registered users have no rows until they subscribe; getSubscriptionStatus()
 * must return planType: 'FREE', isActive: false for them.
 */

// ============================================
// ENUMS / DOMAIN TYPES (aligned with schema)
// ============================================

export type SubscriptionProvider = "PADDLE" | "REVENUECAT";

export type SubscriptionStatus = "ACTIVE" | "CANCELLED" | "PAST_DUE" | "TRIALING" | "EXPIRED";

export type PlanType = "FREE" | "PRO";

// ============================================
// RECORD TYPES
// ============================================

/**
 * A single subscription row as read from the DB (subscriptions table).
 * One row per user per provider.
 */
export interface SubscriptionRecord {
  id: string;
  userId: string;
  provider: SubscriptionProvider;
  externalId: string;
  externalProductId: string | null;
  status: SubscriptionStatus;
  planType: PlanType;
  currentPeriodStart: string | null; // ISO 8601 datetime string
  currentPeriodEnd: string | null; // ISO 8601 datetime string
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null; // ISO 8601 datetime string
  metadata: Record<string, unknown> | null;
  createdAt: string; // ISO 8601 datetime string
  updatedAt: string; // ISO 8601 datetime string
}

// ============================================
// RESULT TYPES
// ============================================

/**
 * Effective subscription status for the app (one per user).
 * Derived from all subscription rows (Paddle + RevenueCat): if any row has status ACTIVE,
 * the user has an active subscription and must not be asked to pay again on another platform.
 * - 0 rows (new user, never subscribed): planType FREE, isActive false.
 * - Any row ACTIVE: planType PRO (or from that row), isActive true.
 * - Otherwise (e.g. all EXPIRED/CANCELLED): planType FREE, isActive false.
 */
export interface SubscriptionStatusResult {
  isActive: boolean;
  planType: PlanType;
  currentPeriodStart: string | null; // ISO 8601 datetime string
  currentPeriodEnd: string | null; // ISO 8601 datetime string
  /** User cancelled but remains active until currentPeriodEnd. */
  cancelAtPeriodEnd: boolean;
  subscriptions?: SubscriptionRecord[];
}
