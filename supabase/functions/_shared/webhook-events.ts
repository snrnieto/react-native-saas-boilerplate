/**
 * Webhook event logging for idempotency and audit.
 */
import { supabase } from "./supabase.ts";

export type WebhookProvider = "PADDLE" | "REVENUECAT";

/**
 * Try to insert a webhook event row. If unique (provider, event_id) fails, the event was already processed.
 * Returns true if this is the first time we see this event (should process), false if duplicate (skip).
 */
export async function ensureWebhookIdempotency(
  provider: WebhookProvider,
  eventId: string,
  payload: unknown
): Promise<boolean> {
  const { error } = await supabase.from("webhook_events").insert({
    provider,
    event_id: eventId,
    payload: payload as Record<string, unknown>,
    processed_at: null,
    success: false,
    error_message: null,
  });
  if (error) {
    if (error.code === "23505") return false; // unique violation = duplicate
    throw error;
  }
  return true;
}

/**
 * Update webhook_events row after processing (set processed_at, success, error_message).
 */
export async function updateWebhookEventResult(
  provider: WebhookProvider,
  eventId: string,
  result: { success: boolean; errorMessage?: string | null }
): Promise<void> {
  await supabase
    .from("webhook_events")
    .update({
      processed_at: new Date().toISOString(),
      success: result.success,
      error_message: result.errorMessage ?? null,
    })
    .eq("provider", provider)
    .eq("event_id", eventId);
}
