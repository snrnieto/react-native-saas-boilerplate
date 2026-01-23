# Sistema de Diseño UI

Sistema de diseño completo y reutilizable con tokens, temas intercambiables, y componentes base.

## Características

- ✅ **Design Tokens**: Colores, espaciado, tipografía, bordes, sombras
- ✅ **Sistema de Temas**: Light/Dark mode con fácil intercambio de colores
- ✅ **ThemeProvider**: Provider de React para inyectar tema globalmente
- ✅ **Componentes Base**: Button, Input, Card listos para usar
- ✅ **Integración Tailwind**: Tokens disponibles como clases de Tailwind
- ✅ **Type-safe**: TypeScript en todo el sistema

## Estructura

```
src/ui/
├── tokens.ts          # Todos los design tokens (colores, spacing, etc.)
├── themes.ts          # Temas light/dark que mapean tokens semánticos
├── ThemeProvider.tsx  # Provider + hook useTheme
├── components/        # Componentes base (Button, Input, Card)
└── index.ts           # Exportaciones principales
```

## Uso Rápido

### 1. El ThemeProvider ya está integrado

El `ThemeProvider` está integrado en `src/providers/Providers.tsx`, así que ya está disponible en toda la app.

### 2. Usar el tema en componentes

```tsx
import { useTheme } from '@/src/ui';

export default function MyComponent() {
  const { theme, mode, toggleMode } = useTheme();
  const { colors, spacing } = theme;

  return (
    <View style={{ 
      backgroundColor: colors.background.primary,
      padding: spacing.md 
    }}>
      <Text style={{ color: colors.text.primary }}>
        Hello World
      </Text>
      <Button onPress={toggleMode}>
        Toggle {mode === 'light' ? 'Dark' : 'Light'} Mode
      </Button>
    </View>
  );
}
```

### 3. Usar componentes base

```tsx
import { Button, Input, Card } from '@/src/ui';

export default function LoginScreen() {
  return (
    <Card>
      <Input
        label="Email"
        placeholder="Enter your email"
        size="md"
      />
      <Button
        variant="primary"
        size="lg"
        fullWidth
      >
        Sign In
      </Button>
    </Card>
  );
}
```

### 4. Usar con Tailwind (NativeWind)

Los tokens están disponibles como clases de Tailwind:

```tsx
<View className="bg-primary-500 p-md rounded-lg">
  <Text className="text-neutral-900 text-base font-semibold">
    Hello
  </Text>
</View>
```

## Cambiar Colores del Tema

Para cambiar los colores, edita `src/ui/themes.ts`:

```typescript
// En lightTheme o darkTheme
colors: {
  primary: colorPalette.primary[500], // Cambia a otro color
  // ...
}
```

O cambia la paleta base en `src/ui/tokens.ts`:

```typescript
export const colorPalette = {
  primary: {
    500: '#tu-color-aqui', // Cambia el color base
    // ...
  },
  // ...
}
```

## Tokens Disponibles

### Colores

- **Paleta base**: `primary`, `secondary`, `neutral`, `success`, `warning`, `error`, `info`
- **Escala**: Cada color tiene variaciones de `50` (más claro) a `900` (más oscuro)
- **Semánticos**: `text.*`, `background.*`, `border.*`, etc.

### Spacing

- `xs: 4px`, `sm: 8px`, `md: 16px`, `lg: 24px`, `xl: 32px`, etc.

### Typography

- **Font sizes**: `xs`, `sm`, `base`, `lg`, `xl`, `2xl`, etc.
- **Font weights**: `thin`, `light`, `normal`, `medium`, `semibold`, `bold`, etc.
- **Line heights**: `none`, `tight`, `normal`, `relaxed`, `loose`

### Borders

- **Radius**: `sm: 4px`, `md: 8px`, `lg: 12px`, `xl: 16px`, `full`
- **Width**: `none`, `thin: 1px`, `base: 2px`, `thick: 4px`

### Shadows

- **Elevation** (React Native): `sm`, `md`, `lg`, `xl`, `2xl`
- **Box shadow** (Web): `sm`, `md`, `lg`, `xl`, `2xl`

## Componentes

### Button

```tsx
<Button
  variant="primary" | "secondary" | "outline" | "ghost" | "danger"
  size="sm" | "md" | "lg"
  loading={false}
  disabled={false}
  fullWidth={false}
  onPress={() => {}}
>
  Click me
</Button>
```

### Input

```tsx
<Input
  label="Email"
  placeholder="Enter email"
  size="sm" | "md" | "lg"
  state="default" | "error" | "disabled"
  error={false}
  errorMessage="Error message"
  helperText="Helper text"
  leftElement={<Icon />}
  rightElement={<Icon />}
  fullWidth={false}
/>
```

### Card

```tsx
<Card
  variant="default" | "outlined" | "elevated"
  padding="none" | "sm" | "md" | "lg" | "xl"
>
  <Text>Card content</Text>
</Card>
```

## Hooks Disponibles

### useTheme()

Hook principal que retorna el tema completo y controles de modo.

```tsx
const { theme, mode, setMode, toggleMode } = useTheme();
```

### useThemeColors()

Hook para acceder solo a los colores.

```tsx
const colors = useThemeColors();
```

### useThemeSpacing()

Hook para acceder solo al espaciado.

```tsx
const spacing = useThemeSpacing();
```

### useThemeTypography()

Hook para acceder solo a la tipografía.

```tsx
const typography = useThemeTypography();
```

## Ejemplos

### Cambiar tema manualmente

```tsx
const { setMode } = useTheme();

<Button onPress={() => setMode('dark')}>
  Dark Mode
</Button>
```

### Toggle tema

```tsx
const { toggleMode } = useTheme();

<Button onPress={toggleMode}>
  Toggle Theme
</Button>
```

### Usar colores semánticos

```tsx
const { colors } = useTheme();

<View style={{ backgroundColor: colors.background.primary }}>
  <Text style={{ color: colors.text.primary }}>Primary text</Text>
  <Text style={{ color: colors.text.secondary }}>Secondary text</Text>
  <Text style={{ color: colors.error }}>Error message</Text>
</View>
```

## Mejores Prácticas

1. **Usa colores semánticos**: En lugar de `colors.primary[500]`, usa `colors.primary` (ya mapeado por el tema)
2. **Usa spacing tokens**: No uses valores hardcodeados, usa `spacing.md` en lugar de `16`
3. **Usa componentes base**: Extiende los componentes base en lugar de crear desde cero
4. **Mantén consistencia**: Todos los componentes deben usar el mismo sistema de tokens

## Agregar Nuevos Temas

Para agregar un nuevo tema (ej: "blue", "green"):

1. Agrega el tema en `src/ui/themes.ts`:

```typescript
export const blueTheme: Theme = {
  mode: 'blue',
  colors: {
    primary: colorPalette.info[500], // Usa azul como primary
    // ... mapea todos los colores
  },
  // ... resto de tokens
};
```

2. Agrega al mapa de temas:

```typescript
export const themes: Record<ThemeMode, Theme> = {
  light: lightTheme,
  dark: darkTheme,
  blue: blueTheme, // Nuevo tema
};
```

3. Actualiza el tipo `ThemeMode`:

```typescript
export type ThemeMode = 'light' | 'dark' | 'blue';
```

## Notas

- El sistema detecta automáticamente el tema del sistema (light/dark)
- Puedes desactivar el seguimiento del sistema con `followSystem={false}` en ThemeProvider
- Todos los tokens están type-safe con TypeScript
- Compatible con NativeWind para usar clases de Tailwind
