/**
 * Theme System
 * 
 * Sistema de temas que mapea tokens semánticos a valores de la paleta.
 * Para cambiar colores, modifica los valores aquí.
 * 
 * Estructura:
 * - Types: Definiciones de tipos TypeScript
 * - Light Theme: Tema claro
 * - Dark Theme: Tema oscuro
 */

import { colorPalette, spacing, typography, borders, shadows } from './tokens';

// ============================================
// TYPES
// ============================================

export type ThemeMode = 'light' | 'dark';

export interface Theme {
  mode: ThemeMode;
  
  // Colors - Colores semánticos mapeados desde la paleta
  colors: {
    // Primary colors
    primary: string;
    primaryLight: string;
    primaryDark: string;
    
    // Secondary colors
    secondary: string;
    secondaryLight: string;
    secondaryDark: string;
    
    // Text colors
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      inverse: string;
      disabled: string;
    };
    
    // Background colors
    background: {
      primary: string;
      secondary: string;
      tertiary: string;
      inverse: string;
    };
    
    // Border colors
    border: {
      default: string;
      light: string;
      dark: string;
      focus: string;
    };
    
    // Status colors
    success: string;
    warning: string;
    error: string;
    info: string;
    
    // Overlay
    overlay: string;
  };
  
  // Spacing - Re-exportado directamente
  spacing: typeof spacing;
  
  // Typography - Re-exportado directamente
  typography: typeof typography;
  
  // Borders - Re-exportado directamente
  borders: typeof borders;
  
  // Shadows - Re-exportado directamente
  shadows: typeof shadows;
}

// ============================================
// LIGHT THEME
// ============================================

export const lightTheme: Theme = {
  mode: 'light',
  
  colors: {
    // Primary
    primary: colorPalette.primary[500],
    primaryLight: colorPalette.primary[400],
    primaryDark: colorPalette.primary[600],
    
    // Secondary
    secondary: colorPalette.secondary[500],
    secondaryLight: colorPalette.secondary[400],
    secondaryDark: colorPalette.secondary[600],
    
    // Text
    text: {
      primary: colorPalette.neutral[900],
      secondary: colorPalette.neutral[700],
      tertiary: colorPalette.neutral[500],
      inverse: colorPalette.neutral[50],
      disabled: colorPalette.neutral[400],
    },
    
    // Background
    background: {
      primary: colorPalette.neutral[50],
      secondary: '#ffffff',
      tertiary: colorPalette.neutral[100],
      inverse: colorPalette.neutral[900],
    },
    
    // Border
    border: {
      default: colorPalette.neutral[300],
      light: colorPalette.neutral[200],
      dark: colorPalette.neutral[400],
      focus: colorPalette.primary[500],
    },
    
    // Status
    success: colorPalette.success[500],
    warning: colorPalette.warning[500],
    error: colorPalette.error[500],
    info: colorPalette.info[500],
    
    // Overlay
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  
  spacing,
  typography,
  borders,
  shadows,
};

// ============================================
// DARK THEME
// ============================================

export const darkTheme: Theme = {
  mode: 'dark',
  
  colors: {
    // Primary
    primary: colorPalette.primary[400],
    primaryLight: colorPalette.primary[300],
    primaryDark: colorPalette.primary[500],
    
    // Secondary
    secondary: colorPalette.secondary[400],
    secondaryLight: colorPalette.secondary[300],
    secondaryDark: colorPalette.secondary[500],
    
    // Text
    text: {
      primary: colorPalette.neutral[50],
      secondary: colorPalette.neutral[300],
      tertiary: colorPalette.neutral[500],
      inverse: colorPalette.neutral[900],
      disabled: colorPalette.neutral[600],
    },
    
    // Background
    background: {
      primary: colorPalette.neutral[900],
      secondary: colorPalette.neutral[800],
      tertiary: colorPalette.neutral[700],
      inverse: colorPalette.neutral[50],
    },
    
    // Border
    border: {
      default: colorPalette.neutral[700],
      light: colorPalette.neutral[800],
      dark: colorPalette.neutral[600],
      focus: colorPalette.primary[400],
    },
    
    // Status
    success: colorPalette.success[400],
    warning: colorPalette.warning[400],
    error: colorPalette.error[400],
    info: colorPalette.info[400],
    
    // Overlay
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
  
  spacing,
  typography,
  borders,
  shadows,
};

// ============================================
// THEME MAP
// ============================================

export const themes: Record<ThemeMode, Theme> = {
  light: lightTheme,
  dark: darkTheme,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get theme by mode
 */
export function getTheme(mode: ThemeMode): Theme {
  return themes[mode];
}
