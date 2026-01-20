# Supabase Auth Adapter

This adapter implements the `IAuthService` interface using Supabase as the authentication provider.

## Features

✅ **Implemented:**
- Email/password authentication (signUp, signIn, signOut)
- Session management (getCurrentUser, getSession, onAuthStateChange)
- Token refresh and validation
- Password reset and update
- Profile updates

🔜 **Coming Soon:**
- OAuth providers (Google, Apple, GitHub, Facebook)

## Setup

### 1. Environment Variables

Add the following to your `.env` file (or configure in `app.json` for Expo):

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Supabase Configuration

Ensure your Supabase project has:
- Email authentication enabled
- Email confirmation configured (optional but recommended)
- Database tables matching the Prisma schema (`users`, `sessions`, `accounts`)

### 3. Usage Example

```typescript
import { SupabaseAuthAdapter } from '@/adapters/supabase';

// Create adapter instance
const authService = new SupabaseAuthAdapter();

// Sign up
const { user, session } = await authService.signUp(
  'user@example.com',
  'securePassword123',
  { name: 'John Doe' }
);

// Sign in
const { user, session } = await authService.signIn(
  'user@example.com',
  'securePassword123'
);

// Get current user
const currentUser = await authService.getCurrentUser();

// Listen to auth changes
const unsubscribe = authService.onAuthStateChange((event, session) => {
  console.log('Auth event:', event, session);
});

// Sign out
await authService.signOut();
```

## Architecture

```
UI Components
    ↓
IAuthService Interface
    ↓
SupabaseAuthAdapter
    ↓
Supabase Client (singleton)
    ↓
Supabase Auth API
```

## Type Mapping

The adapter uses type mappers to convert between Supabase types and our application types:

- `Supabase.User` → `AuthUser`
- `Supabase.Session` → `AuthSession`
- `Supabase.AuthError` → `AuthError` with `AuthErrorCode`

This ensures our application logic never depends directly on Supabase types.

## Error Handling

All Supabase errors are caught and transformed into our `AuthError` class with appropriate `AuthErrorCode`:

- `INVALID_CREDENTIALS` - Invalid email or password
- `EMAIL_ALREADY_EXISTS` - User already registered
- `SESSION_EXPIRED` - Token expired
- `WEAK_PASSWORD` - Password doesn't meet requirements
- etc.

## OAuth Implementation (Future)

OAuth providers will be implemented using:
- **Web**: `supabase.auth.signInWithOAuth()`
- **Mobile**: `expo-web-browser` with OAuth redirects

Example structure already in place in `signInWithProvider()` method.

## Testing

To test the adapter:

1. Start your Expo dev server
2. Import the adapter in a test screen
3. Call the auth methods
4. Verify in Supabase dashboard that users are created/authenticated

## Related Files

- Interface: `src/services/auth/IAuthService.ts`
- Types: `src/services/auth/types.ts`
- Prisma Schema: `prisma/schema.prisma`
