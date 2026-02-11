-- Políticas RLS para la tabla profiles.
-- Ejecuta este SQL en Supabase: SQL Editor → New query → pegar y Run.
-- Sin estas políticas, el cliente (anon key + JWT) puede recibir 0 filas o no poder insertar.

-- Activar RLS en la tabla
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Quitar políticas anteriores (por si ya existen)
DROP POLICY IF EXISTS "Users can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Cualquier usuario autenticado puede ver cualquier perfil (incluido el de otros)
CREATE POLICY "Users can read all profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- Solo puede crear su propio perfil
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Solo puede actualizar su propio perfil
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
