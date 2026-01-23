# AuthProvider

React Context Provider para inyectar el adapter de autenticación de forma global en la aplicación.

## Características

- ✅ Inyección de dependencias del adapter de autenticación
- ✅ Estado de autenticación reactivo (usuario, sesión, loading)
- ✅ Suscripción automática a cambios de estado de autenticación
- ✅ Acceso conveniente a todos los métodos del servicio de autenticación
- ✅ Type-safe con TypeScript

## Uso

### 1. Configurar el Provider en el Layout Principal

```tsx
// app/_layout.tsx
import { AuthProvider } from '@/src/providers/auth';
import { SupabaseAuthAdapter } from '@/src/adapters/supabase';

export default function RootLayout() {
  return (
    <AuthProvider authService={new SupabaseAuthAdapter()}>
      {/* Tu aplicación aquí */}
    </AuthProvider>
  );
}
```

### 2. Usar el Hook `useAuth` en Componentes

```tsx
// app/(tabs)/index.tsx
import { useAuth } from '@/src/providers/auth';
import { useState } from 'react';

export default function HomeScreen() {
  const { user, isAuthenticated, isLoading, signIn, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    try {
      await signIn(email, password);
      console.log('Signed in successfully!');
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (!isAuthenticated) {
    return (
      <View>
        <TextInput value={email} onChangeText={setEmail} placeholder="Email" />
        <TextInput 
          value={password} 
          onChangeText={setPassword} 
          placeholder="Password" 
          secureTextEntry 
        />
        <Button onPress={handleSignIn} title="Sign In" />
      </View>
    );
  }

  return (
    <View>
      <Text>Welcome, {user?.name || user?.email}!</Text>
      <Button onPress={signOut} title="Sign Out" />
    </View>
  );
}
```

### 3. Métodos Disponibles

El contexto expone todos los métodos del `IAuthService`:

```tsx
const {
  // Estado
  user,              // AuthUser | null
  session,           // AuthSession | null
  isLoading,         // boolean
  isAuthenticated,   // boolean

  // Servicio de autenticación
  authService,       // IAuthService instance

  // Métodos de autenticación
  signUp,            // (email, password, metadata?) => Promise<AuthResponse>
  signIn,            // (email, password) => Promise<AuthResponse>
  signInWithProvider, // (provider) => Promise<AuthResponse>
  signOut,           // () => Promise<void>

  // Métodos de sesión
  getCurrentUser,    // () => Promise<AuthUser | null>
  getSession,        // () => Promise<AuthSession | null>
  refreshSession,    // () => Promise<AuthSession>
  isSessionValid,    // () => Promise<boolean>

  // Métodos de perfil
  resetPassword,     // (email) => Promise<PasswordResetResponse>
  updatePassword,    // (newPassword) => Promise<void>
  updateProfile,     // (data) => Promise<AuthUser>
} = useAuth();
```

## Ejemplo Completo: Pantalla de Login

```tsx
import { useAuth } from '@/src/providers/auth';
import { useState } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';

export default function LoginScreen() {
  const { signIn, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await signIn(email, password);
      // La navegación se manejará automáticamente por el Auth Guard
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to sign in');
    }
  };

  return (
    <View>
      <Text>Login</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />
      <Button
        title={isLoading ? 'Loading...' : 'Sign In'}
        onPress={handleLogin}
        disabled={isLoading}
      />
    </View>
  );
}
```

## Inyección de Dependencias

El `AuthProvider` acepta cualquier implementación de `IAuthService`, lo que permite:

- **Testing**: Inyectar un mock adapter para pruebas
- **Flexibilidad**: Cambiar de Supabase a Firebase u otro provider sin cambiar el código de los componentes
- **Desarrollo**: Usar diferentes adapters en diferentes entornos

```tsx
// Ejemplo: Mock adapter para testing
class MockAuthAdapter implements IAuthService {
  // ... implementación mock
}

// En tests
<AuthProvider authService={new MockAuthAdapter()}>
  <TestComponent />
</AuthProvider>
```

## Estado de Autenticación

El provider se suscribe automáticamente a los cambios de estado de autenticación:

- `SIGNED_IN`: Actualiza usuario y sesión
- `SIGNED_OUT`: Limpia usuario y sesión
- `TOKEN_REFRESHED`: Actualiza la sesión
- `USER_UPDATED`: Actualiza el usuario
- `PASSWORD_RECOVERY`: No cambia el estado (solo notificación)

## Notas

- El estado `isLoading` es `true` durante la inicialización (al montar el provider)
- El estado se actualiza automáticamente cuando ocurren eventos de autenticación
- No es necesario llamar manualmente a `getCurrentUser()` o `getSession()` después de `signIn` o `signUp` - el estado se actualiza automáticamente
