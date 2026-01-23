/**
 * Button Component
 * 
 * Botón reutilizable que usa el sistema de tokens del tema.
 * Soporta múltiples variantes y tamaños.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../../ThemeProvider';

// ============================================
// TYPES
// ============================================

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  /**
   * Button text
   */
  children: React.ReactNode;
  /**
   * Button variant
   * @default 'primary'
   */
  variant?: ButtonVariant;
  /**
   * Button size
   * @default 'md'
   */
  size?: ButtonSize;
  /**
   * Show loading state
   * @default false
   */
  loading?: boolean;
  /**
   * Disable button
   * @default false
   */
  disabled?: boolean;
  /**
   * Full width button
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Custom styles
   */
  style?: ViewStyle;
  /**
   * Custom text styles
   */
  textStyle?: TextStyle;
}

// ============================================
// BUTTON COMPONENT
// ============================================

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  ...props
}: ButtonProps) {
  const { theme } = useTheme();
  const { colors, spacing, borders, typography } = theme;

  // Get variant styles
  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    const baseContainer: ViewStyle = {
      borderRadius: borders.radius.md,
      borderWidth: borders.width.base,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    const baseText: TextStyle = {
      fontWeight: typography.fontWeight.semibold,
    };

    switch (variant) {
      case 'primary':
        return {
          container: {
            ...baseContainer,
            backgroundColor: disabled ? colors.border.default : colors.primary,
            borderColor: 'transparent',
          },
          text: {
            ...baseText,
            color: colors.text.inverse,
          },
        };

      case 'secondary':
        return {
          container: {
            ...baseContainer,
            backgroundColor: disabled ? colors.border.default : colors.secondary,
            borderColor: 'transparent',
          },
          text: {
            ...baseText,
            color: colors.text.inverse,
          },
        };

      case 'outline':
        return {
          container: {
            ...baseContainer,
            backgroundColor: 'transparent',
            borderColor: disabled ? colors.border.default : colors.primary,
          },
          text: {
            ...baseText,
            color: disabled ? colors.text.disabled : colors.primary,
          },
        };

      case 'ghost':
        return {
          container: {
            ...baseContainer,
            backgroundColor: 'transparent',
            borderColor: 'transparent',
          },
          text: {
            ...baseText,
            color: disabled ? colors.text.disabled : colors.primary,
          },
        };

      case 'danger':
        return {
          container: {
            ...baseContainer,
            backgroundColor: disabled ? colors.border.default : colors.error,
            borderColor: 'transparent',
          },
          text: {
            ...baseText,
            color: colors.text.inverse,
          },
        };

      default:
        return {
          container: baseContainer,
          text: baseText,
        };
    }
  };

  // Get size styles
  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          container: {
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            minHeight: 32,
          },
          text: {
            fontSize: typography.fontSize.sm,
          },
        };

      case 'md':
        return {
          container: {
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            minHeight: 40,
          },
          text: {
            fontSize: typography.fontSize.base,
          },
        };

      case 'lg':
        return {
          container: {
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.lg,
            minHeight: 48,
          },
          text: {
            fontSize: typography.fontSize.lg,
          },
        };

      default:
        return {
          container: {},
          text: {},
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const containerStyle: ViewStyle = {
    ...variantStyles.container,
    ...sizeStyles.container,
    ...(fullWidth && { width: '100%' }),
    ...(disabled && { opacity: 0.6 }),
    ...style,
  };

  const textStyleFinal: TextStyle = {
    ...variantStyles.text,
    ...sizeStyles.text,
    ...textStyle,
  };

  return (
    <TouchableOpacity
      style={containerStyle}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyles.text.color}
        />
      ) : (
        <Text style={textStyleFinal}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}
