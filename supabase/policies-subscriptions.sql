-- Políticas RLS para la tabla subscriptions.
-- La app solo lee; los webhooks (Edge Functions con service role) escriben sin RLS.

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own subscriptions" ON subscriptions;

-- El usuario solo puede ver sus propias suscripciones (no las de otros)
CREATE POLICY "Users can read own subscriptions"
ON subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- INSERT/UPDATE/DELETE: no hay política para authenticated; solo el service role (webhooks) puede escribir.
