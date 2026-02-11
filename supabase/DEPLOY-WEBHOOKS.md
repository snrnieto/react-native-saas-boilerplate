# Subir las Edge Functions (webhooks) a Supabase

Haz estos pasos **en tu terminal** (PowerShell o CMD), desde la raíz del proyecto.

## 1. Entrar al proyecto

```bash
cd c:\Users\Sebastian\Documents\Proyectos\react-native-saas-boilerplate
```

## 2. Iniciar sesión en Supabase

```bash
npx supabase login
```

Se abrirá el navegador para que inicies sesión. Cuando termines, vuelve a la terminal.

## 3. Ver el ID de tu proyecto (project ref)

```bash
npx supabase projects list
```

Busca el proyecto **saas-boilerplate** y copia la columna **id** (o **ref**). Es algo como `abcdefghijklmnop` (unas 20 letras/números).

Si no ves la lista, asegúrate de haber hecho `npx supabase login` antes.

## 4. Enlazar este repo con el proyecto de Supabase

Sustituye `TU_PROJECT_REF` por el id que copiaste:

```bash
npx supabase link --project-ref TU_PROJECT_REF
```

Te pedirá la contraseña de la base de datos si no está guardada. Puedes usar la que ves en el Dashboard de Supabase → Project Settings → Database.

## 5. Subir las dos funciones

```bash
npx supabase functions deploy paddle-webhook --no-verify-jwt
npx supabase functions deploy revenuecat-webhook --no-verify-jwt
```

Si todo va bien, al final verás las URLs de las funciones, por ejemplo:

- `https://TU_PROJECT_REF.supabase.co/functions/v1/paddle-webhook`
- `https://TU_PROJECT_REF.supabase.co/functions/v1/revenuecat-webhook`

Esas URLs son las que configuras en Paddle y en RevenueCat como endpoint de webhook.

## Resumen rápido (cuando ya hayas hecho login y link alguna vez)

```bash
cd c:\Users\Sebastian\Documents\Proyectos\react-native-saas-boilerplate
npx supabase functions deploy paddle-webhook --no-verify-jwt
npx supabase functions deploy revenuecat-webhook --no-verify-jwt
```

## Scripts en package.json

También puedes usar:

- `npm run supabase:login` — inicia sesión
- `npm run supabase:link` — enlaza el proyecto (necesitas el project ref)
- `npm run supabase:functions:deploy` — despliega **todas** las funciones con `--no-verify-jwt`

Si usas `supabase:functions:deploy` se suben las dos (paddle-webhook y revenuecat-webhook) de una vez.

---

## Probar que todo funciona

### 1. Configurar el secret de Paddle en Supabase (obligatorio)

Para que la firma del webhook sea válida, el secret que usa Paddle debe coincidir con el de Supabase.

**Dónde sacar el Endpoint secret key en Paddle**

Paddle no muestra el secret al crear el destination; solo después. Puedes obtenerlo de dos formas:

**Opción A – Desde el Dashboard (Simulations)**  
1. Developer tools → **Simulations**.  
2. Abre una simulación que use tu destination (o crea una nueva y elige tu destination).  
3. En la pantalla de la simulación suele haber un enlace o botón tipo **“View more”** que revela el **webhook secret key** de ese destination. Cópialo (empieza por `pdl_ntfset_...`).

**Opción B – Desde el Dashboard (Edit destination)**  
1. Developer tools → **Notifications**.  
2. En la lista, clic en los **tres puntos (⋮)** del destination que apunta a tu Supabase.  
3. **Edit destination**.  
4. En el formulario de edición, busca un campo o sección que diga **Secret key**, **Endpoint secret** o **View more** para revelar el secret. Si lo ves, cópialo.

**Opción C – Por API (si no lo ves en el Dashboard)**  
La API key que uses **debe tener el permiso** `notification_setting.read`. Si no, Paddle responde **403 Forbidden** (“You aren't permitted to perform this request”).

1. En Paddle: Developer tools → **API keys**.  
2. Crea una **nueva API key** (o edita una existente) y asígnale al menos el permiso **Notification settings (Read)** / `notification_setting.read`. Guarda la key (solo se muestra una vez).  
3. En **Notifications**, al abrir tu destination la URL del navegador suele tener el id, p. ej. `.../notifications/ntfset_01hxxx...`. El id es el que empieza por `ntfset_...`.  
4. Haz un GET con esa API key:

   ```bash
   curl -X GET "https://api.paddle.com/notification-settings/ntfset_TU_ID_AQUI" -H "Authorization: Bearer TU_API_KEY"
   ```

   (Sustituye `ntfset_TU_ID_AQUI` por el id del destination y `TU_API_KEY` por la API key que tiene permiso **Notification settings (Read)**.)  
5. En la respuesta JSON busca el campo **`endpoint_secret_key`**. Ese valor es el que pones en Supabase (suele empezar por `pdl_ntfset_...`).

**Configurarlo en Supabase**  
1. La URL del destination en Paddle debe ser:  
   `https://tanpeudtyvlvoblizrvc.supabase.co/functions/v1/paddle-webhook`  
2. En **Supabase**: Dashboard del proyecto → **Settings** → **Edge Functions** → **Secrets** → añade:
   - Name: `PADDLE_WEBHOOK_SECRET`
   - Value: el Endpoint secret key que obtuviste (el valor completo, p. ej. `pdl_ntfset_...`).

Sin este secret, la función responderá **401 Invalid signature**.

### 2. Probar con el simulador de Paddle

1. Entra en **Paddle** (sandbox o producción) → **Developer tools** → **Simulations**.
2. **New simulation**:
   - **Destination**: elige la notification destination que apunta a tu URL de Supabase (la del paso anterior).
   - **Name**: por ejemplo "Test subscription created".
   - Pestaña **Single event** → elige por ejemplo **subscription.created** (o **Scenario** → "Subscription created").
3. **Create** y luego **Run simulation**.
4. En la misma pantalla, en la pestaña **Response** deberías ver:
   - **Status code: 200**
   - Body algo como `{"received":true}`.

Si ves **401**: el `PADDLE_WEBHOOK_SECRET` en Supabase no coincide con el Endpoint secret key de esa destination en Paddle.  
Si ves **400** y "Missing custom_data.userId": es esperado en simulaciones genéricas; el payload de prueba no lleva `custom_data.userId`. Para una prueba real, en **Single event** puedes personalizar el payload (Customize) y añadir en `data.custom_data` algo como `{"userId": "un-uuid-de-tu-auth-users"}`.

### 3. Comprobar en Supabase y en la base de datos

- **Logs de la función**: Supabase Dashboard → **Edge Functions** → **paddle-webhook** → pestaña **Logs**. Ahí ves cada request y errores si los hay.
- **Registro de webhooks**: En tu base de datos (Prisma Studio o SQL), tabla **webhook_events**: debería aparecer una fila nueva por cada webhook recibido (provider PADDLE, payload, success true/false).
- **Suscripciones**: Si el payload tenía `custom_data.userId` válido, en la tabla **subscriptions** debería aparecer (o actualizarse) la fila para ese usuario y provider PADDLE.

### 4. Probar con curl (solo para comprobar que la URL responde)

```bash
curl -X POST "https://tanpeudtyvlvoblizrvc.supabase.co/functions/v1/paddle-webhook" -H "Content-Type: application/json" -d "{}"
```

Sin firma válida la respuesta será **401** (es lo correcto). Si devolviera 200 con body vacío, cualquiera podría llamar la URL; por eso la función exige `Paddle-Signature` y el secret.
