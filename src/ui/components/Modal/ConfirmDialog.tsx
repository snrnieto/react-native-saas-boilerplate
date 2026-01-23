/**
 * ConfirmDialog Component
 * 
 * Dialog de confirmación reutilizable que funciona en Web, iOS y Android.
 * Usa el componente Modal y el sistema de diseño.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../ThemeProvider';
import { Modal } from './Modal';
import { Button } from '../Button';

// ============================================
// TYPES
// ============================================

export interface ConfirmDialogProps {
  /**
   * Whether dialog is visible
   */
  visible: boolean;
  /**
   * Dialog title
   */
  title: string;
  /**
   * Dialog message/description
   */
  message: string;
  /**
   * Confirm button text
   * @default 'Confirm'
   */
  confirmText?: string;
  /**
   * Cancel button text
   * @default 'Cancel'
   */
  cancelText?: string;
  /**
   * Confirm button variant
   * @default 'danger'
   */
  confirmVariant?: 'primary' | 'secondary' | 'danger';
  /**
   * Callback when confirmed
   */
  onConfirm: () => void;
  /**
   * Callback when cancelled
   */
  onCancel: () => void;
  /**
   * Whether action is loading
   * @default false
   */
  loading?: boolean;
}

// ============================================
// CONFIRM DIALOG COMPONENT
// ============================================

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  const { theme } = useTheme();
  const { colors, spacing, typography } = theme;

  return (
    <Modal
      visible={visible}
      onClose={onCancel}
      showOverlay={true}
      closeOnOverlayPress={!loading}
    >
      <View style={{ gap: spacing.lg }}>
        {/* Title */}
        <Text
          style={{
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
          }}
        >
          {title}
        </Text>

        {/* Message */}
        <Text
          style={{
            fontSize: typography.fontSize.base,
            color: colors.text.secondary,
            lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
          }}
        >
          {message}
        </Text>

        {/* Actions */}
        <View
          style={{
            flexDirection: 'row',
            gap: spacing.md,
            marginTop: spacing.sm,
          }}
        >
          <Button
            variant="outline"
            size="md"
            onPress={onCancel}
            disabled={loading}
            style={{ flex: 1 }}
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            size="md"
            onPress={onConfirm}
            loading={loading}
            disabled={loading}
            style={{ flex: 1 }}
          >
            {confirmText}
          </Button>
        </View>
      </View>
    </Modal>
  );
}
