# AuthGuard - Route Protection

Componente para proteger rutas y redirigir usuarios no autenticados a la pantalla de login.

## Características

- ✅ Protección automática de rutas
- ✅ Redirección a `/login` si no hay sesión
- ✅ Rutas públicas configurables
- ✅ Estado de carga mientras verifica autenticación
- ✅ Redirección automática desde login si ya está autenticado

## Uso

### Integración en el Layout

El `AuthGuard` está integrado en el layout principal (`app/_layout.tsx`):

```tsx
import { AuthGuard } from '@/src/core/guards';

export default function RootLayout() {
  return (
    <AppProviders>
      <AuthGuard>
        <Stack>
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </AuthGuard>
    </AppProviders>
  );
}
```

### Configuración de Rutas Públicas

Por defecto, las siguientes rutas son públicas:
- `login`
- `signup`
- `reset-password`

Puedes personalizar las rutas públicas:

```tsx
<AuthGuard 
  publicRoutes={['login', 'signup', 'reset-password', 'public-page']}
  redirectTo="/login"
>
  {children}
</AuthGuard>
```

## Comportamiento

### Usuario No Autenticado

1. Intenta acceder a una ruta protegida (ej: `/(tabs)`)
2. `AuthGuard` detecta que no hay sesión
3. Redirige automáticamente a `/login`
4. Muestra estado de carga durante la verificación

### Usuario Autenticado

1. Intenta acceder a `/login`
2. `AuthGuard` detecta que ya está autenticado
3. Redirige automáticamente a `/(tabs)` (pantalla principal)

### Estado de Carga

Mientras se verifica el estado de autenticación, se muestra un indicador de carga:

```tsx
<View>
  <ActivityIndicator size="large" />
  <Text>Loading...</Text>
</View>
```

## Rutas Protegidas vs Públicas

### Rutas Protegidas (requieren autenticación)
- `/(tabs)` - Pantalla principal
- `/modal` - Modales
- Cualquier otra ruta no listada en `publicRoutes`

### Rutas Públicas (no requieren autenticación)
- `/login` - Pantalla de login
- `/signup` - Pantalla de registro (futuro)
- `/reset-password` - Recuperación de contraseña (futuro)

## Implementación Técnica

El `AuthGuard` utiliza:
- `useAuth()` hook para obtener el estado de autenticación
- `useRouter()` de Expo Router para navegación
- `useSegments()` para detectar la ruta actual
- `useEffect` para manejar redirecciones reactivas

## Testing

Para probar el guard:

1. **Sin autenticación**: Intenta acceder a `/(tabs)` → Debe redirigir a `/login`
2. **Con autenticación**: Intenta acceder a `/login` → Debe redirigir a `/(tabs)`
3. **Rutas públicas**: Accede a `/login` sin autenticación → Debe permitir acceso

## Notas

- El guard se ejecuta después de que `AppProviders` inicializa el `AuthProvider`
- La verificación de autenticación es asíncrona, por lo que hay un estado de carga
- Las redirecciones son automáticas y no requieren intervención manual
