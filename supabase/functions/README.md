# Edge Functions (Webhooks)

Deno-based Supabase Edge Functions for Paddle and RevenueCat webhooks. They write to `webhook_events` (audit/idempotency) and `subscriptions`.

## Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli) installed
- Project linked: `supabase link --project-ref YOUR_PROJECT_REF`

## Secrets (set in Dashboard or CLI)

- **Paddle**: `PADDLE_WEBHOOK_SECRET` – endpoint secret from Paddle notification destination
- **RevenueCat**: `REVENUECAT_WEBHOOK_AUTH` – Bearer token you configure in RevenueCat webhook settings

## Deploy

```bash
# From repo root
supabase functions deploy paddle-webhook --no-verify-jwt
supabase functions deploy revenuecat-webhook --no-verify-jwt
```

`verify_jwt = false` is set in `supabase/config.toml` for both functions so Paddle/RevenueCat can call them without a Supabase JWT.

## Webhook URLs (after deploy)

- Paddle: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/paddle-webhook`
- RevenueCat: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/revenuecat-webhook`

## Local dev

```bash
supabase functions serve paddle-webhook --no-verify-jwt
supabase functions serve revenuecat-webhook --no-verify-jwt
```

Use a tunnel (e.g. Hookdeck, ngrok) to expose the local URL to Paddle/RevenueCat for testing.
