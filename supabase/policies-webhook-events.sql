-- Políticas RLS para la tabla webhook_events.
-- Solo las Edge Functions (service role) escriben y leen; la app no debe acceder.

ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role only" ON webhook_events;

-- Sin políticas para authenticated/anon: el cliente no puede leer ni escribir.
-- Las Edge Functions usan SUPABASE_SERVICE_ROLE_KEY y bypasean RLS.
-- Si en el futuro quieres que solo admins lean los logs, añade aquí una política con un rol custom.
