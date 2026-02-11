/**
 * Paddle webhook handler. Verifies Paddle-Signature, logs to webhook_events, upserts subscriptions.
 * Configure verify_jwt = false in config.toml. Set PADDLE_WEBHOOK_SECRET in Supabase secrets.
 */
import { ensureWebhookIdempotency, updateWebhookEventResult } from "../_shared/webhook-events.ts";
import { supabase } from "../_shared/supabase.ts";

const PADDLE_SUBSCRIPTION_EVENTS = [
  "subscription.created",
  "subscription.updated",
  "subscription.canceled",
  "subscription.activated",
  "subscription.past_due",
  "subscription.paused",
  "subscription.resumed",
  "subscription.trialing",
];

function jsonResponse(body: object, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function verifyPaddleSignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader || !secret) return false;
  const parts: Record<string, string> = {};
  for (const part of signatureHeader.split(";")) {
    const [k, v] = part.trim().split("=");
    if (k && v) parts[k] = v;
  }
  const ts = parts["ts"];
  const h1 = parts["h1"];
  if (!ts || !h1) return false;
  const signedPayload = `${ts}:${rawBody}`;
  return verifyHmacSha256Hex(signedPayload, secret, h1);
}

async function verifyHmacSha256Hex(message: string, secret: string, expectedHex: string): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message)
  );
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hex === expectedHex;
}

function mapPaddleStatusToOur(status: string): "ACTIVE" | "CANCELLED" | "PAST_DUE" | "TRIALING" | "EXPIRED" {
  switch (status) {
    case "active":
    case "paused":
      return "ACTIVE";
    case "canceled":
      return "CANCELLED";
    case "past_due":
      return "PAST_DUE";
    case "trialing":
      return "TRIALING";
    case "expired":
      return "EXPIRED";
    default:
      return "ACTIVE";
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const rawBody = await req.text();
  const secret = Deno.env.get("PADDLE_WEBHOOK_SECRET") ?? "";
  const signatureHeader = req.headers.get("Paddle-Signature");

  if (!verifyPaddleSignature(rawBody, signatureHeader, secret)) {
    return jsonResponse({ error: "Invalid signature" }, 401);
  }

  let body: {
    event_id?: string;
    notification_id?: string;
    event_type?: string;
    data?: {
      id?: string;
      status?: string;
      custom_data?: Record<string, string>;
      current_billing_period?: { starts_at?: string; ends_at?: string };
      started_at?: string;
      next_billed_at?: string;
      canceled_at?: string;
      scheduled_change?: { action?: string } | null;
      items?: Array<{ price?: { id?: string } }>;
    };
  };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const eventId = (body.event_id ?? body.notification_id ?? "") as string;
  const eventType = body.event_type ?? "";
  if (!eventId) {
    return jsonResponse({ error: "Missing event_id" }, 400);
  }

  if (!PADDLE_SUBSCRIPTION_EVENTS.includes(eventType)) {
    return jsonResponse({ received: true, skipped: "event type not handled" }, 200);
  }

  const data = body.data;
  if (!data?.id) {
    return jsonResponse({ received: true, skipped: "no subscription data" }, 200);
  }

  const isNew = await ensureWebhookIdempotency("PADDLE", eventId, body);
  if (!isNew) {
    return jsonResponse({ received: true, duplicate: true }, 200);
  }

  try {
    const userId = data.custom_data?.userId ?? data.custom_data?.user_id;
    if (!userId) {
      await updateWebhookEventResult("PADDLE", eventId, {
        success: false,
        errorMessage: "Missing custom_data.userId",
      });
      return jsonResponse({ error: "Missing custom_data.userId" }, 400);
    }

    const externalId = data.id;
    const externalProductId = data.items?.[0]?.price?.id ?? null;
    const status = mapPaddleStatusToOur(data.status ?? "active");
    const period = data.current_billing_period;
    const currentPeriodStart = period?.starts_at ? new Date(period.starts_at).toISOString() : null;
    const currentPeriodEnd = period?.ends_at ? new Date(period.ends_at).toISOString() : null;
    const canceledAt = data.canceled_at ? new Date(data.canceled_at).toISOString() : null;
    const cancelAtPeriodEnd = !!data.scheduled_change?.action;

    const now = new Date().toISOString();
    const row = {
      user_id: userId,
      provider: "PADDLE",
      external_id: externalId,
      external_product_id: externalProductId,
      status,
      plan_type: "PRO",
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
      cancel_at_period_end: cancelAtPeriodEnd,
      canceled_at: canceledAt,
      metadata: data as unknown as Record<string, unknown>,
      updated_at: now,
    };

    const { error } = await supabase
      .from("subscriptions")
      .upsert(row, { onConflict: "provider,external_id" });

    if (error) {
      await updateWebhookEventResult("PADDLE", eventId, {
        success: false,
        errorMessage: error.message,
      });
      return jsonResponse({ error: error.message }, 500);
    }

    await updateWebhookEventResult("PADDLE", eventId, { success: true });
    return jsonResponse({ received: true }, 200);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await updateWebhookEventResult("PADDLE", eventId, { success: false, errorMessage: msg });
    return jsonResponse({ error: msg }, 500);
  }
});
