/**
 * Supabase client with service role for Edge Functions.
 * Bypasses RLS so webhooks can write to subscriptions and webhook_events.
 */
import { createClient } from "npm:@supabase/supabase-js@2";

const url = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

export const supabase = createClient(url, serviceRoleKey);
