# 📋 SaaS Boilerplate Backlog (Jira Ready)

## FASE 1: Infraestructura y Skeleton (Setup)

- [x] **Task 1.1:** Inicializar proyecto Expo (SDK más reciente) con template `tabs` de Expo Router.
- [x] **Task 1.2:** Configurar NativeWind (Tailwind CSS) y configurar soporte para Web, Android e iOS.
- [x] **Task 1.3:** Instalar y configurar librería de componentes (Gluestack/Tamagui) con el tema base.
- [x] **Task 1.4:** Inicializar Prisma en la raíz, crear `schema.prisma` básico y configurar conexión a PostgreSQL (Supabase URL).
- [x] **Task 1.5:** Crear estructura de directorios: `/src/core`, `/src/services`, `/src/adapters`, `/src/providers`, `/src/ui`, `/src/store`.
- [x] **Task 1.6:** Configurar variables de entorno (.env) para Web y Mobile.

## FASE 2: Capa de Abstracción y Auth (Seguridad)

- [x] **Task 2.1:** Definir interfaz de TypeScript `IAuthService` en `/services/auth`.
- [x] **Task 2.2:** Implementar `SupabaseAuthAdapter` cumpliendo la interfaz `IAuthService`.
- [x] **Task 2.3:** Crear `AuthContext` y `AuthProvider` para inyectar el adapter de forma global.
- [x] **Task 2.4:** Configurar Layout de Expo Router para protección de rutas (Auth Guard: redirigir `/login` si no hay sesión).
- [x] **Task 2.5:** Crear pantallas básicas de Auth (Login, Sign Up) usando componentes de la librería elegida y Tailwind.

## FASE 3: Lógica de Negocio y Estado (Core)

- [x] **Task 3.1:** Crear Store global con **Zustand** para la lógica del contador.
- [x] **Task 3.2:** Diseñar UI de la pantalla principal `(app)/index.tsx` que consuma el Store del contador.
- [x] **Task 3.3:** Implementar persistencia básica del contador vinculada al ID del usuario autenticado.
- [x] **Task 3.4:** Crear hook de negocio `useCounter` en `/src/core/hooks` para separar lógica de UI.

## FASE 4: Sistema de Pagos Híbrido (Monetización)

**Orden lógico:** Billing (pagos) → Backend suscripciones (schema + webhooks) → Estado suscripción en app (adapter + provider) → Paywall.

- [x] **Task 4.1:** Diseñar e implementar en Prisma el **schema de suscripciones** en la DB, teniendo en cuenta **múltiples proveedores** (Paddle para web, RevenueCat para móvil). Debe normalizar estado, plan y IDs por proveedor para que backend y webhooks puedan reconciliar ambos orígenes. _Prerrequisito antes de crear los services de billing._
- [x] **Task 4.2:** Definir interfaz de TypeScript `IBillingService` en `/services/billing`.
- [x] **Task 4.3:** Implementar `PaddleAdapter` (Web) usando el SDK de Paddle usando la libreria paddle-js solo para web.
- [ ] **Task 4.4:** Implementar `RevenueCatAdapter` (Native) usando `react-native-purchases`. _(Diferido: BillingProvider ya usa `NativeBillingPlaceholder` en native hasta que se implemente 4.4.)_
- [x] **Task 4.5:** Crear `BillingProvider` con lógica de detección de plataforma (`Platform.OS`) para instanciar el adapter correcto (Paddle/RevenueCat) y exponer flujo de pago.
- [x] **Task 4.6:** Confirmar diseño: **Profile** solo para datos de perfil (bio, avatar, preferencias). **Suscripciones** se gestionan íntegramente en la tabla `subscriptions` por `userId`; la app lee estado vía `ISubscriptionService` / adapter (4.8). _Sin denormalización en Profile._
- [x] **Task 4.7:** Boilerplate de Edge Function (Supabase/Cloudflare) para recibir Webhooks de Paddle/RevenueCat y actualizar la tabla de suscripciones. _Sin esto, la tabla no se llena al pagar._
- [x] **Task 4.8:** Implementar adapter que cumpla `ISubscriptionService` (ej. `SupabaseSubscriptionAdapter`) leyendo de la tabla de suscripciones en la DB. _Requiere 4.1 (tabla) y conviene tener 4.7 (webhooks) para tener datos._
- [x] **Task 4.9:** Crear `SubscriptionProvider` (SubscriptionContext + SubscriptionProvider) que exponga el estado de suscripción (`isActive`, `planType`) de forma global para el paywall y el resto de la app.
- [x] **Task 4.10:** Crear pantalla de "Suscripción" (Paywall) que muestre productos y maneje el flujo de compra. _Usa BillingProvider (pago) y SubscriptionProvider (estado)._

## FASE 5: Integración Final y Sincronización (Backend)

- [ ] **Task 5.1:** Implementar lógica de "Restore Purchases" en los adapters de billing (Paddle/RevenueCat).
- [ ] **Task 5.2:** Testing E2E básico de flujo: Registro -> Pago -> Acceso a contador Pro.
