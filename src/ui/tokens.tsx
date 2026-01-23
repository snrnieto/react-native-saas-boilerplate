/**
 * Design Tokens
 * 
 * Sistema completo de design tokens para el sistema de diseño.
 * Todos los tokens están organizados por secciones para fácil mantenimiento.
 * 
 * Para cambiar colores del tema, modifica los archivos en themes.ts
 */

// ============================================
// COLOR PALETTE
// ============================================
// Paleta base con escala 50-900 (similar a Tailwind)
// Cada color tiene variaciones de 50 (más claro) a 900 (más oscuro)

export const colorPalette = {
  // Primary colors - Color principal de la marca
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Base
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Secondary colors - Color secundario
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7', // Base
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },

  // Neutral colors - Grises para texto y fondos
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373', // Base
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // Success colors - Verde para éxito
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Base
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // Warning colors - Amarillo/Naranja para advertencias
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Base
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Error colors - Rojo para errores
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Base
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Info colors - Azul para información
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Base
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
} as const;

// ============================================
// SPACING
// ============================================
// Sistema de espaciado basado en 4px (unidad base)
// Usado para padding, margin, gap, etc.

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 64,
  '5xl': 80,
  '6xl': 96,
} as const;

// ============================================
// TYPOGRAPHY
// ============================================
// Sistema tipográfico: tamaños, pesos, alturas de línea

export const typography = {
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  },

  // Font weights
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  // Line heights
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter spacing
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
    widest: 1,
  },
} as const;

// ============================================
// BORDERS
// ============================================
// Border radius y border widths

export const borders = {
  // Border radius
  radius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 20,
    '3xl': 24,
    full: 9999,
  },

  // Border widths
  width: {
    none: 0,
    thin: 1,
    base: 2,
    thick: 4,
  },
} as const;

// ============================================
// SHADOWS
// ============================================
// Sistema de sombras para elevación
// En React Native se usa elevation, en Web se usa box-shadow

export const shadows = {
  // Elevation para React Native (Android)
  elevation: {
    none: 0,
    sm: 2,
    md: 4,
    lg: 8,
    xl: 12,
    '2xl': 16,
  },

  // Box shadows para Web
  boxShadow: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
} as const;

// ============================================
// EXPORTS
// ============================================

export type ColorPalette = typeof colorPalette;
export type Spacing = typeof spacing;
export type Typography = typeof typography;
export type Borders = typeof borders;
export type Shadows = typeof shadows;
