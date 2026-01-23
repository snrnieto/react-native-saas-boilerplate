/**
 * Card Component
 * 
 * Card reutilizable que usa el sistema de tokens del tema.
 * Soporta diferentes variantes y elevaciones.
 */

import React from 'react';
import { View, StyleSheet, type ViewProps, type ViewStyle } from 'react-native';
import { useTheme } from '../../ThemeProvider';

// ============================================
// TYPES
// ============================================

export type CardVariant = 'default' | 'outlined' | 'elevated';

export interface CardProps extends ViewProps {
  /**
   * Card content
   */
  children: React.ReactNode;
  /**
   * Card variant
   * @default 'default'
   */
  variant?: CardVariant;
  /**
   * Custom styles
   */
  style?: ViewStyle;
  /**
   * Padding size
   * @default 'md'
   */
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

// ============================================
// CARD COMPONENT
// ============================================

export function Card({
  children,
  variant = 'default',
  style,
  padding = 'md',
  ...props
}: CardProps) {
  const { theme } = useTheme();
  const { colors, spacing, borders, shadows } = theme;

  // Get variant styles
  const getVariantStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: borders.radius.lg,
      backgroundColor: colors.background.secondary,
    };

    switch (variant) {
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: borders.width.base,
          borderColor: colors.border.default,
        };

      case 'elevated':
        return {
          ...baseStyle,
          // For React Native, use elevation
          elevation: shadows.elevation.md,
          // For Web, shadow will be applied via style
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        };

      default:
        return baseStyle;
    }
  };

  // Get padding
  const getPadding = (): number => {
    switch (padding) {
      case 'none':
        return 0;
      case 'sm':
        return spacing.sm;
      case 'md':
        return spacing.md;
      case 'lg':
        return spacing.lg;
      case 'xl':
        return spacing.xl;
      default:
        return spacing.md;
    }
  };

  const variantStyles = getVariantStyles();
  const paddingValue = getPadding();

  const cardStyle: ViewStyle = {
    ...variantStyles,
    padding: paddingValue,
    ...style,
  };

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
}
