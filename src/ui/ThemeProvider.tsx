/**
 * ThemeProvider
 * 
 * Provider de React para inyectar el tema actual en toda la aplicación.
 * Incluye el hook useTheme para acceder al tema.
 * 
 * Integrado con useColorScheme de Expo para detectar el tema del sistema.
 */

import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from 'react';
import { useColorScheme as useExpoColorScheme } from '@/components/useColorScheme';
import type { Theme, ThemeMode } from './themes';
import { getTheme, themes } from './themes';

// ============================================
// CONTEXT
// ============================================

interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ============================================
// PROVIDER PROPS
// ============================================

export interface ThemeProviderProps {
  children: ReactNode;
  /**
   * Initial theme mode
   * If not provided, uses system preference
   */
  initialMode?: ThemeMode;
  /**
   * Whether to follow system theme changes
   * @default true
   */
  followSystem?: boolean;
}

// ============================================
// THEME PROVIDER COMPONENT
// ============================================

export function ThemeProvider({
  children,
  initialMode,
  followSystem = true,
}: ThemeProviderProps) {
  const systemColorScheme = useExpoColorScheme();
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (initialMode) {
      return initialMode;
    }
    return systemColorScheme === 'dark' ? 'dark' : 'light';
  });

  // Update mode when system theme changes (if followSystem is true)
  useEffect(() => {
    if (followSystem && !initialMode) {
      const systemMode = systemColorScheme === 'dark' ? 'dark' : 'light';
      setModeState(systemMode);
    }
  }, [systemColorScheme, followSystem, initialMode]);

  // Get current theme
  const theme = useMemo(() => getTheme(mode), [mode]);

  // Set mode function
  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
  };

  // Toggle between light and dark
  const toggleMode = () => {
    setModeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const value = useMemo(
    () => ({
      theme,
      mode,
      setMode,
      toggleMode,
    }),
    [theme, mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// ============================================
// USE THEME HOOK
// ============================================

/**
 * Hook to access the current theme
 * 
 * @returns Theme context value with theme, mode, and mode controls
 * @throws Error if used outside ThemeProvider
 * 
 * @example
 * ```tsx
 * const { theme, mode, toggleMode } = useTheme();
 * const { colors, spacing } = theme;
 * ```
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

// ============================================
// HELPER HOOKS
// ============================================

/**
 * Hook to get only the theme object
 * Useful when you only need the theme, not the mode controls
 */
export function useThemeColors() {
  const { theme } = useTheme();
  return theme.colors;
}

/**
 * Hook to get only the spacing tokens
 */
export function useThemeSpacing() {
  const { theme } = useTheme();
  return theme.spacing;
}

/**
 * Hook to get only the typography tokens
 */
export function useThemeTypography() {
  const { theme } = useTheme();
  return theme.typography;
}
