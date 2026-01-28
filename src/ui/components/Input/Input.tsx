/**
 * Input Component
 *
 * Input reutilizable que usa el sistema de tokens del tema.
 * Soporta diferentes estados: default, error, disabled.
 */

import React, { forwardRef, useCallback, useState } from "react";
import {
  Platform,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../../ThemeProvider";

// ============================================
// TYPES
// ============================================

export type InputSize = "sm" | "md" | "lg";
export type InputState = "default" | "error" | "disabled";

export interface InputProps extends Omit<TextInputProps, "style"> {
  /**
   * Input label
   */
  label?: string;
  /**
   * Helper text or error message
   */
  helperText?: string;
  /**
   * Input size
   * @default 'md'
   */
  size?: InputSize;
  /**
   * Input state
   * @default 'default'
   */
  state?: InputState;
  /**
   * Show error state
   * @default false
   */
  error?: boolean;
  /**
   * Error message (overrides helperText when error is true)
   */
  errorMessage?: string;
  /**
   * Left icon/element
   */
  leftElement?: React.ReactNode;
  /**
   * Right icon/element
   */
  rightElement?: React.ReactNode;
  /**
   * Custom container styles
   */
  containerStyle?: ViewStyle;
  /**
   * Custom input styles
   */
  inputStyle?: TextStyle;
  /**
   * Full width input
   * @default false
   */
  fullWidth?: boolean;
}

// ============================================
// INPUT COMPONENT
// ============================================

// Suppress native focus outline (browser orange ring) on web
const focusRingReset: TextStyle =
  Platform.OS === "web"
    ? ({
        outlineStyle: "none",
        outlineWidth: 0,
        outlineColor: "transparent",
      } as unknown as TextStyle)
    : {};

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      helperText,
      size = "md",
      state = "default",
      error = false,
      errorMessage,
      leftElement,
      rightElement,
      containerStyle,
      inputStyle,
      fullWidth = false,
      editable = true,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const { theme } = useTheme();
    const { colors, spacing, borders, typography } = theme;
    const [isFocused, setIsFocused] = useState(false);

    const isError = error || state === "error";
    const isDisabled = state === "disabled" || !editable;
    const finalState: InputState = isError
      ? "error"
      : isDisabled
        ? "disabled"
        : "default";

    const handleFocus = useCallback(
      (e: any) => {
        setIsFocused(true);
        onFocus?.(e);
      },
      [onFocus],
    );

    const handleBlur = useCallback(
      (e: any) => {
        setIsFocused(false);
        onBlur?.(e);
      },
      [onBlur],
    );

    // Get size styles
    const getSizeStyles = (): { container: ViewStyle; input: TextStyle } => {
      switch (size) {
        case "sm":
          return {
            container: {
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              minHeight: 36,
            },
            input: {
              fontSize: typography.fontSize.sm,
            },
          };

        case "md":
          return {
            container: {
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.md,
              minHeight: 44,
            },
            input: {
              fontSize: typography.fontSize.base,
            },
          };

        case "lg":
          return {
            container: {
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.lg,
              minHeight: 52,
            },
            input: {
              fontSize: typography.fontSize.lg,
            },
          };

        default:
          return {
            container: {},
            input: {},
          };
      }
    };

    // Get state styles — thin border, subtle default, focus uses theme primary (no orange)
    const getStateStyles = (): { container: ViewStyle; input: TextStyle } => {
      const baseContainer: ViewStyle = {
        borderWidth: borders.width.thin,
        borderRadius: borders.radius.lg,
        backgroundColor: colors.background.secondary,
        borderColor: colors.primaryLight,
      };

      const baseInput: TextStyle = {
        color: colors.text.primary,
        flex: 1,
        ...focusRingReset,
      };

      switch (finalState) {
        case "error":
          return {
            container: {
              ...baseContainer,
              borderColor: colors.error,
            },
            input: baseInput,
          };

        case "disabled":
          return {
            container: {
              ...baseContainer,
              backgroundColor: colors.background.tertiary,
              borderColor: colors.border.light,
              opacity: 0.6,
            },
            input: {
              ...baseInput,
              color: colors.text.disabled,
            },
          };

        default:
          return {
            container: baseContainer,
            input: baseInput,
          };
      }
    };

    const sizeStyles = getSizeStyles();
    const stateStyles = getStateStyles();

    // Apply focus border (theme primary) when focused and not error/disabled
    const focusBorderColor =
      finalState === "default" && isFocused ? colors.border.focus : undefined;

    const containerStyleFinal: ViewStyle = {
      ...stateStyles.container,
      ...sizeStyles.container,
      ...(focusBorderColor && { borderColor: focusBorderColor }),
      flexDirection: "row",
      alignItems: "center",
      ...(fullWidth && { width: "100%" }),
      ...containerStyle,
    };

    const inputStyleFinal: TextStyle = {
      ...stateStyles.input,
      ...sizeStyles.input,
      ...inputStyle,
    };

    const displayHelperText = errorMessage || helperText;
    const helperTextColor = isError ? colors.error : colors.text.secondary;

    return (
      <View style={fullWidth ? { width: "100%" } : undefined}>
        {label && (
          <Text
            style={{
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.primary,
              marginBottom: spacing.xs,
            }}
          >
            {label}
          </Text>
        )}

        <View style={containerStyleFinal}>
          {leftElement && (
            <View style={{ marginRight: spacing.sm }}>{leftElement}</View>
          )}

          <TextInput
            ref={ref}
            style={inputStyleFinal}
            placeholderTextColor={colors.text.tertiary}
            editable={!isDisabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            underlineColorAndroid="transparent"
            {...props}
          />

          {rightElement && (
            <View style={{ marginLeft: spacing.sm }}>{rightElement}</View>
          )}
        </View>

        {displayHelperText && (
          <Text
            style={{
              fontSize: typography.fontSize.xs,
              color: helperTextColor,
              marginTop: spacing.xs,
            }}
          >
            {displayHelperText}
          </Text>
        )}
      </View>
    );
  },
);

Input.displayName = "Input";
