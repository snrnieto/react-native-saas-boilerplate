# 📋 SaaS Boilerplate Backlog (Jira Ready)

## FASE 1: Infraestructura y Skeleton (Setup)
- [X] **Task 1.1:** Inicializar proyecto Expo (SDK más reciente) con template `tabs` de Expo Router.
- [X] **Task 1.2:** Configurar NativeWind (Tailwind CSS) y configurar soporte para Web, Android e iOS.
- [X] **Task 1.3:** Instalar y configurar librería de componentes (Gluestack/Tamagui) con el tema base.
- [X] **Task 1.4:** Inicializar Prisma en la raíz, crear `schema.prisma` básico y configurar conexión a PostgreSQL (Supabase URL).
- [X] **Task 1.5:** Crear estructura de directorios: `/src/core`, `/src/services`, `/src/adapters`, `/src/providers`, `/src/ui`, `/src/store`.
- [X] **Task 1.6:** Configurar variables de entorno (.env) para Web y Mobile.

## FASE 2: Capa de Abstracción y Auth (Seguridad)
- [X] **Task 2.1:** Definir interfaz de TypeScript `IAuthService` en `/services/auth`.
- [X] **Task 2.2:** Implementar `SupabaseAuthAdapter` cumpliendo la interfaz `IAuthService`.
- [X] **Task 2.3:** Crear `AuthContext` y `AuthProvider` para inyectar el adapter de forma global.
- [X] **Task 2.4:** Configurar Layout de Expo Router para protección de rutas (Auth Guard: redirigir `/login` si no hay sesión).
- [X] **Task 2.5:** Crear pantallas básicas de Auth (Login, Sign Up) usando componentes de la librería elegida y Tailwind.

## FASE 3: Lógica de Negocio y Estado (Core)
- [X] **Task 3.1:** Crear Store global con **Zustand** para la lógica del contador.
- [X] **Task 3.2:** Diseñar UI de la pantalla principal `(app)/index.tsx` que consuma el Store del contador.
- [X] **Task 3.3:** Implementar persistencia básica del contador vinculada al ID del usuario autenticado.
- [X] **Task 3.4:** Crear hook de negocio `useCounter` en `/src/core/hooks` para separar lógica de UI.

## FASE 4: Sistema de Pagos Híbrido (Monetización)
- [X] **Task 4.1:** Diseñar e implementar en Prisma el **schema de suscripciones** en la DB, teniendo en cuenta **múltiples proveedores** (Paddle para web, RevenueCat para móvil). Debe normalizar estado, plan y IDs por proveedor para que backend y webhooks puedan reconciliar ambos orígenes. *Prerrequisito antes de crear los services de billing.*
- [ ] **Task 4.2:** Definir interfaz de TypeScript `IBillingService` en `/services/billing`.
- [ ] **Task 4.3:** Implementar `PaddleAdapter` (Web) usando el SDK de Paddle usando la libreria paddle-js solo para web.
- [ ] **Task 4.4:** Implementar `RevenueCatAdapter` (Native) usando `react-native-purchases`.
- [ ] **Task 4.5:** Crear `BillingProvider` con lógica de detección de plataforma (`Platform.OS`) para instanciar el adapter correcto.
- [ ] **Task 4.6:** Crear pantalla de "Suscripción" (Paywall) que muestre productos y maneje el flujo de compra.

## FASE 5: Integración Final y Sincronización (Backend)
- [ ] **Task 5.1:** Actualizar `schema.prisma` para incluir campos de suscripción (`subscription_id`, `plan_type`, `status`).
- [ ] **Task 5.2:** Boilerplate de Edge Function (Supabase/Cloudflare) para recibir Webhooks de Paddle/RevenueCat.
- [ ] **Task 5.3:** Implementar lógica de "Restore Purchases" en los adapters.
- [ ] **Task 5.4:** Testing E2E básico de flujo: Registro -> Pago -> Acceso a contador Pro.