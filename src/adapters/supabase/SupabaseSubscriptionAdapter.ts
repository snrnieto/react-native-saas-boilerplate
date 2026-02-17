/**
 * Supabase Subscription Adapter
 *
 * Implementation of ISubscriptionService using Supabase.
 * Reads from the subscriptions table (updated by webhooks); app only reads.
 * Derives effective subscription status per user (one active = Pro everywhere).
 */

import type { ISubscriptionService } from "../../services/subscription/ISubscriptionService";
import type {
  PlanType,
  SubscriptionRecord,
  SubscriptionStatus,
  SubscriptionStatusResult,
} from "../../services/subscription/types";
import { supabaseClient } from "./client";

const ACTIVE_STATUSES: SubscriptionStatus[] = ["ACTIVE", "TRIALING"];

export class SupabaseSubscriptionAdapter implements ISubscriptionService {
  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatusResult> {
    const { data: rows, error } = await supabaseClient
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching subscriptions:", error);
      throw error;
    }

    const subscriptions = (rows ?? []).map((row) => this.mapRowToSubscriptionRecord(row));

    if (subscriptions.length === 0) {
      return {
        isActive: false,
        planType: "FREE",
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        subscriptions,
      };
    }

    const activeRecords = subscriptions.filter((r) => ACTIVE_STATUSES.includes(r.status));
    if (activeRecords.length === 0) {
      return {
        isActive: false,
        planType: "FREE",
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        subscriptions,
      };
    }

    // Pick the "best" active row: e.g. latest current_period_end
    const best = activeRecords.sort((a, b) => {
      const endA = a.currentPeriodEnd ?? "";
      const endB = b.currentPeriodEnd ?? "";
      return endB.localeCompare(endA);
    })[0];

    return {
      isActive: true,
      planType: (best.planType as PlanType) ?? "PRO",
      currentPeriodStart: best.currentPeriodStart,
      currentPeriodEnd: best.currentPeriodEnd,
      cancelAtPeriodEnd: best.cancelAtPeriodEnd,
      subscriptions,
    };
  }

  private mapRowToSubscriptionRecord(row: Record<string, unknown>): SubscriptionRecord {
    const toIso = (v: unknown): string | null =>
      v == null ? null : typeof v === "string" ? v : v instanceof Date ? v.toISOString() : null;

    return {
      id: String(row.id ?? ""),
      userId: String(row.user_id ?? ""),
      provider: row.provider as SubscriptionRecord["provider"],
      externalId: String(row.external_id ?? ""),
      externalProductId: row.external_product_id != null ? String(row.external_product_id) : null,
      status: row.status as SubscriptionRecord["status"],
      planType: row.plan_type as SubscriptionRecord["planType"],
      currentPeriodStart: toIso(row.current_period_start),
      currentPeriodEnd: toIso(row.current_period_end),
      cancelAtPeriodEnd: Boolean(row.cancel_at_period_end),
      canceledAt: toIso(row.canceled_at),
      metadata: (row.metadata as Record<string, unknown>) ?? null,
      createdAt: toIso(row.created_at) ?? "",
      updatedAt: toIso(row.updated_at) ?? "",
    };
  }
}
