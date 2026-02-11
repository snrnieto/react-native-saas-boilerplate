/**
 * RevenueCat webhook handler. Verifies Authorization Bearer, logs to webhook_events, upserts subscriptions.
 * Configure verify_jwt = false in config.toml. Set REVENUECAT_WEBHOOK_AUTH in Supabase secrets (Bearer token).
 */
import { ensureWebhookIdempotency, updateWebhookEventResult } from "../_shared/webhook-events.ts";
import { supabase } from "../_shared/supabase.ts";

const REVENUECAT_SUBSCRIPTION_TYPES = [
  "TEST",
  "INITIAL_PURCHASE",
  "RENEWAL",
  "CANCELLATION",
  "UNCANCELLATION",
  "NON_RENEWING_PURCHASE",
  "SUBSCRIPTION_PAUSED",
  "EXPIRATION",
  "BILLING_ISSUE",
  "PRODUCT_CHANGE",
  "TRANSFER",
  "SUBSCRIPTION_EXTENDED",
  "TEMPORARY_ENTITLEMENT_GRANT",
  "REFUND_REVERSED",
];

type SubscriptionStatus = "ACTIVE" | "CANCELLED" | "PAST_DUE" | "TRIALING" | "EXPIRED";

function mapRevenueCatTypeToStatus(type: string): SubscriptionStatus {
  switch (type) {
    case "INITIAL_PURCHASE":
    case "RENEWAL":
    case "UNCANCELLATION":
    case "PRODUCT_CHANGE":
    case "TRANSFER":
    case "SUBSCRIPTION_EXTENDED":
    case "TEMPORARY_ENTITLEMENT_GRANT":
    case "REFUND_REVERSED":
    case "TEST":
      return "ACTIVE";
    case "CANCELLATION":
      return "CANCELLED";
    case "EXPIRATION":
      return "EXPIRED";
    case "BILLING_ISSUE":
      return "PAST_DUE";
    case "SUBSCRIPTION_PAUSED":
      return "ACTIVE";
    case "NON_RENEWING_PURCHASE":
      return "ACTIVE";
    default:
      return "ACTIVE";
  }
}

function jsonResponse(body: object, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const authHeader = req.headers.get("Authorization");
  const expectedToken = Deno.env.get("REVENUECAT_WEBHOOK_AUTH") ?? "";
  if (expectedToken && (!authHeader || authHeader !== `Bearer ${expectedToken}`)) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  let body: {
    api_version?: string;
    event?: {
      id?: string;
      type?: string;
      app_user_id?: string;
      original_app_user_id?: string;
      transferred_to?: string[];
      expiration_at_ms?: number | null;
      purchased_at_ms?: number;
      product_id?: string;
      entitlement_ids?: string[] | null;
      entitlement_id?: string;
      transaction_id?: string;
      original_transaction_id?: string;
      [key: string]: unknown;
    };
  };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const event = body.event;
  if (!event) {
    return jsonResponse({ error: "Missing event" }, 400);
  }

  const eventId = event.id ?? event.transaction_id ?? crypto.randomUUID();
  const eventType = event.type ?? "";

  if (!REVENUECAT_SUBSCRIPTION_TYPES.includes(eventType)) {
    return jsonResponse({ received: true, skipped: "event type not handled" }, 200);
  }

  const isNew = await ensureWebhookIdempotency("REVENUECAT", eventId, body);
  if (!isNew) {
    return jsonResponse({ received: true, duplicate: true }, 200);
  }

  try {
    // TRANSFER has transferred_to, not app_user_id; use first transferred_to as target user
    const userId =
      event.app_user_id ??
      event.original_app_user_id ??
      (event.transferred_to && event.transferred_to[0] ? event.transferred_to[0] : null);
    if (!userId) {
      await updateWebhookEventResult("REVENUECAT", eventId, {
        success: false,
        errorMessage: "Missing app_user_id / original_app_user_id / transferred_to",
      });
      return jsonResponse({ error: "Missing user id in event" }, 400);
    }

    const externalId = event.transaction_id ?? event.original_transaction_id ?? eventId;
    const externalProductId =
      event.entitlement_ids?.[0] ?? event.entitlement_id ?? event.product_id ?? null;
    const status = mapRevenueCatTypeToStatus(eventType);
    const purchasedAtMs = event.purchased_at_ms;
    const expirationAtMs = event.expiration_at_ms;
    const currentPeriodStart = purchasedAtMs
      ? new Date(purchasedAtMs).toISOString()
      : null;
    const currentPeriodEnd =
      expirationAtMs != null ? new Date(expirationAtMs).toISOString() : null;

    const now = new Date().toISOString();
    const row = {
      user_id: userId,
      provider: "REVENUECAT",
      external_id: String(externalId),
      external_product_id: externalProductId,
      status,
      plan_type: "PRO",
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
      cancel_at_period_end: false,
      canceled_at: status === "CANCELLED" ? now : null,
      metadata: event as Record<string, unknown>,
      updated_at: now,
    };

    const { error } = await supabase
      .from("subscriptions")
      .upsert(row, { onConflict: "provider,external_id" });

    if (error) {
      await updateWebhookEventResult("REVENUECAT", eventId, {
        success: false,
        errorMessage: error.message,
      });
      return jsonResponse({ error: error.message }, 500);
    }

    await updateWebhookEventResult("REVENUECAT", eventId, { success: true });
    return jsonResponse({ received: true }, 200);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await updateWebhookEventResult("REVENUECAT", eventId, { success: false, errorMessage: msg });
    return jsonResponse({ error: msg }, 500);
  }
});
