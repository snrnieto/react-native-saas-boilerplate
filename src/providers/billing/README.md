# BillingProvider

Provider que expone el flujo de pago (offerings, purchase, restore) de forma global usando detección de plataforma (`Platform.OS`).

- **Web:** `PaddleAdapter` (Paddle.js).
- **iOS/Android:** `NativeBillingPlaceholder` hasta que se implemente **Task 4.4** (`RevenueCatAdapter` con `react-native-purchases`).

Cuando se implemente la Task 4.4, en `BillingProvider.tsx` sustituir `NativeBillingPlaceholder` por `RevenueCatAdapter` en la rama nativa.

## Uso

```tsx
const { getOfferings, purchase, restorePurchases, platform, isNativePlaceholder } = useBilling();

const offerings = await getOfferings();
await purchase(productId, { userId, email });
await restorePurchases();
```

- `isNativePlaceholder === true` en iOS/Android hasta Task 4.4; la UI puede mostrar "Próximamente en app" o deshabilitar compra en native.
