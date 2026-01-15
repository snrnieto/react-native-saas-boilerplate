# Contexto del Proyecto: SaaS Boilerplate Multiplataforma

## 🎯 Objetivo
Crear un boilerplate de SaaS para React Native (Expo) que sea 100% agnóstico a los proveedores de servicios. El código base no debe depender de SDKs específicos, sino de interfaces.

## 🏗️ Arquitectura de Referencia
Se utiliza el **Patrón Adapter**. El flujo de datos es:
`UI (Screens) -> Providers (Context) -> Service Interfaces -> Concrete Adapters (Supabase/Stripe/etc)`

### 1. Servicios Intercambiables (Services & Adapters)
- **Auth:** Definido en `src/services/auth/IAuthService.ts`. 
    - *Implementación inicial:* Supabase.
    - *Regla:* No importar `supabase-js` fuera de su adapter.
- **Billing:** Definido en `src/services/billing/IBillingService.ts`.
    - *Lógica Híbrida:* - Web -> `PaddleAdapter.ts`
        - Native (iOS/Android) -> `RevenueCatAdapter.ts`
    - *Regla:* El `BillingProvider` debe inyectar el adapter correcto según `Platform.OS`.

### 2. Base de Datos y Modelado (Prisma)
- **Prisma** se usa exclusivamente para:
    1. Definir el esquema (`schema.prisma`).
    2. Gestionar migraciones y `push` a la base de datos PostgreSQL.
    3. Generar tipos de TypeScript para el Core.
- **Nota Técnica:** Prisma Client no se ejecuta directamente en el frontend de Expo. La App consume la DB vía Supabase SDK, pero respetando los tipos generados por Prisma.

### 3. Estado y UI
- **Navegación:** Expo Router. Las rutas están divididas en `(auth)` para el flujo de acceso y `(app)` para la lógica protegida.
- **Estado Global:**
    - `AuthContext y Zustand`: Maneja la sesión y el estado de carga inicial y la lógica de negocio core.
- **Estilos:** - Base: NativeWind (Tailwind CSS).
    - Componentes: Librería base (Gluestack/Tamagui) para elementos complejos como Modales o Selects.

## 🛠️ Reglas de Oro para el Desarrollo (Vibe Coding Rules)
1. **No Hardcoding:** Nunca instancies un cliente de servicio (como `supabase`) directamente en una pantalla. Usa siempre el `useAuth()` o el servicio correspondiente a través del Provider.
2. **Type Safety:** Todo modelo de datos en `src/core` debe extender o basarse en los tipos generados por Prisma.
3. **Plataforma:** Antes de implementar un componente, verifica si funciona en Web. Si requiere una librería externa, busca una que sea compatible con los tres targets.
4. **Clean Code:** Mantener las funciones de los servicios pequeñas y con una sola responsabilidad.

## 📂 Directorio de Archivos Clave
- `src/services/`: Contratos (Interfaces TS).
- `src/adapters/`: Código sucio/específico de cada SDK.
- `src/core/`: El "alma" de la app (lógica del contador, hooks de negocio).
- `prisma/`: Definición de la verdad de los datos.