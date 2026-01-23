# Providers - Centralized Integration Point

Este directorio contiene todos los providers y su configuración centralizada.

## Estructura

```
src/providers/
├── auth/              # AuthProvider y AuthContext
│   ├── AuthContext.tsx
│   ├── AuthProvider.tsx
│   └── index.ts
├── Providers.tsx      # ⭐ Punto central de integración
└── README.md
```

## Providers.tsx - Punto Central de Integración

El archivo `Providers.tsx` es el lugar donde se centralizan **todas** las integraciones de providers y adapters.

### Ventajas

- ✅ **Fácil intercambio**: Cambiar de Supabase a Firebase es solo cambiar una línea
- ✅ **Visibilidad**: Un solo lugar para ver todas las integraciones
- ✅ **Mantenibilidad**: Agregar nuevos providers es simple y claro
- ✅ **Testing**: Fácil crear una versión mock para tests

### Cómo Intercambiar un Adapter

#### Ejemplo: Cambiar de Supabase a Firebase

**Antes:**
```tsx
import { SupabaseAuthAdapter } from '../adapters/supabase';
const authService = useMemo(() => new SupabaseAuthAdapter(), []);
```

**Después:**
```tsx
import { FirebaseAuthAdapter } from '../adapters/firebase';
const authService = useMemo(() => new FirebaseAuthAdapter(), []);
```

¡Eso es todo! Todos los componentes que usan `useAuth()` automáticamente usarán el nuevo adapter.

### Agregar un Nuevo Provider

1. **Crear el provider** (si no existe):
   ```tsx
   // src/providers/billing/BillingProvider.tsx
   export function BillingProvider({ billingService, children }) {
     // ... implementación
   }
   ```

2. **Crear el adapter** (si no existe):
   ```tsx
   // src/adapters/paddle/PaddleAdapter.ts
   export class PaddleAdapter implements IBillingService {
     // ... implementación
   }
   ```

3. **Agregar al Providers.tsx**:
   ```tsx
   import { BillingProvider } from './billing';
   import { PaddleAdapter } from '../adapters/paddle';
   
   export function AppProviders({ children }) {
     const billingService = useMemo(() => new PaddleAdapter(), []);
     
     return (
       <AuthProvider authService={authService}>
         <BillingProvider billingService={billingService}>
           {children}
         </BillingProvider>
       </AuthProvider>
     );
   }
   ```

## Integraciones Actuales

### ✅ AuthProvider
- **Adapter**: `SupabaseAuthAdapter`
- **Ubicación**: `src/adapters/supabase/SupabaseAuthAdapter.ts`
- **Contexto**: `useAuth()` hook
- **Estado**: Activo

### 🔜 Próximas Integraciones (Task 4.4)
- **BillingProvider**: Para manejo de suscripciones
  - Web: `PaddleAdapter`
  - Native: `RevenueCatAdapter`

## Uso en la Aplicación

El `AppProviders` se usa en el layout principal:

```tsx
// app/_layout.tsx
import { AppProviders } from '@/src/providers';

export default function RootLayout() {
  return (
    <AppProviders>
      {/* Tu aplicación */}
    </AppProviders>
  );
}
```

## Testing

Para tests, puedes crear un `MockProviders.tsx`:

```tsx
// __tests__/MockProviders.tsx
import { AppProviders } from '@/src/providers';
import { MockAuthAdapter } from './mocks';

export function TestProviders({ children }) {
  const authService = useMemo(() => new MockAuthAdapter(), []);
  
  return (
    <AuthProvider authService={authService}>
      {children}
    </AuthProvider>
  );
}
```

## Mejores Prácticas

1. **Una instancia por adapter**: Usa `useMemo` para crear instancias únicas
2. **Orden de providers**: Los providers internos pueden depender de los externos
3. **Documentación**: Mantén comentarios claros sobre qué hace cada adapter
4. **Type safety**: Asegúrate de que todos los adapters implementen las interfaces correctas
