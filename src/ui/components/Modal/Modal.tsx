/**
 * Modal Component
 * 
 * Modal reutilizable que funciona en Web, iOS y Android.
 * Usa el sistema de tokens del tema.
 */

import React from 'react';
import {
  Modal as RNModal,
  View,
  TouchableOpacity,
  type ModalProps as RNModalProps,
  type ViewStyle,
  Platform,
} from 'react-native';
import { useTheme } from '../../ThemeProvider';

// ============================================
// TYPES
// ============================================

export interface ModalProps extends Omit<RNModalProps, 'style'> {
  /**
   * Modal content
   */
  children: React.ReactNode;
  /**
   * Whether modal is visible
   */
  visible: boolean;
  /**
   * Callback when modal should close (usually sets visible to false)
   */
  onClose: () => void;
  /**
   * Whether to show backdrop overlay
   * @default true
   */
  showOverlay?: boolean;
  /**
   * Whether clicking overlay closes modal
   * @default true
   */
  closeOnOverlayPress?: boolean;
  /**
   * Custom container styles
   */
  containerStyle?: ViewStyle;
  /**
   * Custom content styles
   */
  contentStyle?: ViewStyle;
  /**
   * Animation type
   * @default 'slide' for native, 'fade' for web
   */
  animationType?: 'none' | 'slide' | 'fade';
}

// ============================================
// MODAL COMPONENT
// ============================================

export function Modal({
  children,
  visible,
  onClose,
  showOverlay = true,
  closeOnOverlayPress = true,
  containerStyle,
  contentStyle,
  animationType,
  ...props
}: ModalProps) {
  const { theme } = useTheme();
  const { colors, spacing } = theme;

  // Default animation: slide for native, fade for web
  const defaultAnimation = Platform.OS === 'web' ? 'fade' : 'slide';
  const finalAnimationType = animationType || defaultAnimation;

  const overlayStyle: ViewStyle = {
    flex: 1,
    backgroundColor: showOverlay ? colors.overlay : 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  };

  const defaultContentStyle: ViewStyle = {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType={finalAnimationType}
      onRequestClose={onClose}
      {...props}
    >
      <TouchableOpacity
        style={[overlayStyle, containerStyle]}
        activeOpacity={1}
        onPress={closeOnOverlayPress ? onClose : undefined}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={[defaultContentStyle, contentStyle]}
        >
          {children}
        </TouchableOpacity>
      </TouchableOpacity>
    </RNModal>
  );
}
