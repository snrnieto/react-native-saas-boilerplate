/**
 * Home Screen
 * 
 * Pantalla principal que muestra la información del usuario logueado.
 */

import { useAuth } from '@/src/providers/auth';
import { useTheme } from '@/src/ui/ThemeProvider';
import { Button, Card, ConfirmDialog } from '@/src/ui/components';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

export default function HomeScreen() {
  const { user, session, signOut, isLoading } = useAuth();
  const { theme } = useTheme();
  const { colors, spacing, typography } = theme;
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [signOutLoading, setSignOutLoading] = useState(false);

  const handleSignOut = () => {
    console.log('handleSignOut');
    setShowSignOutDialog(true);
  };

  const confirmSignOut = async () => {
    try {
      setSignOutLoading(true);
      await signOut();
      setShowSignOutDialog(false);
    } catch (error: any) {
      setShowSignOutDialog(false);
      console.error('Sign out error:', error);
    } finally {
      setSignOutLoading(false);
    }
  };

  const cancelSignOut = () => {
    setShowSignOutDialog(false);
  };

  const formatDate = (date: Date | null | undefined): string => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background.primary,
        }}
      >
        <Text style={{ color: colors.text.secondary }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: colors.background.primary,
      }}
      contentContainerStyle={{
        padding: spacing.lg,
      }}
    >
      <View
        style={{
          maxWidth: 600,
          width: '100%',
          alignSelf: 'center',
          gap: spacing.lg,
        }}
      >
        {/* Header */}
        <View style={{ marginBottom: spacing.md }}>
          <Text
            style={{
              fontSize: typography.fontSize['4xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              marginBottom: spacing.xs,
            }}
          >
            Welcome!
          </Text>
          <Text
            style={{
              fontSize: typography.fontSize.base,
              color: colors.text.secondary,
            }}
          >
            Your account information
          </Text>
        </View>

        {/* User Information Card */}
        <Card variant="elevated" padding="lg">
          <View style={{ gap: spacing.md }}>
            {/* Name */}
            <View>
              <Text
                style={{
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.text.secondary,
                  marginBottom: spacing.xs,
                }}
              >
                Full Name
              </Text>
              <Text
                style={{
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                }}
              >
                {user?.name || 'Not provided'}
              </Text>
            </View>

            {/* Email */}
            <View
              style={{
                paddingTop: spacing.md,
                borderTopWidth: 1,
                borderTopColor: colors.border.light,
              }}
            >
              <Text
                style={{
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.text.secondary,
                  marginBottom: spacing.xs,
                }}
              >
                Email
              </Text>
              <Text
                style={{
                  fontSize: typography.fontSize.base,
                  color: colors.text.primary,
                }}
              >
                {user?.email || 'N/A'}
              </Text>
            </View>

            {/* User ID */}
            <View
              style={{
                paddingTop: spacing.md,
                borderTopWidth: 1,
                borderTopColor: colors.border.light,
              }}
            >
              <Text
                style={{
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.text.secondary,
                  marginBottom: spacing.xs,
                }}
              >
                User ID
              </Text>
              <Text
                style={{
                  fontSize: typography.fontSize.xs,
                  fontFamily: 'monospace',
                  color: colors.text.tertiary,
                }}
              >
                {user?.id || 'N/A'}
              </Text>
            </View>

            {/* Account Created */}
            <View
              style={{
                paddingTop: spacing.md,
                borderTopWidth: 1,
                borderTopColor: colors.border.light,
              }}
            >
              <Text
                style={{
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.text.secondary,
                  marginBottom: spacing.xs,
                }}
              >
                Account Created
              </Text>
              <Text
                style={{
                  fontSize: typography.fontSize.base,
                  color: colors.text.primary,
                }}
              >
                {formatDate(user?.createdAt)}
              </Text>
            </View>

            {/* Email Verified */}
            {user?.emailVerified && (
              <View
                style={{
                  paddingTop: spacing.md,
                  borderTopWidth: 1,
                  borderTopColor: colors.border.light,
                }}
              >
                <Text
                  style={{
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.text.secondary,
                    marginBottom: spacing.xs,
                  }}
                >
                  Email Verified
                </Text>
                <Text
                  style={{
                    fontSize: typography.fontSize.base,
                    color: colors.success,
                  }}
                >
                  ✓ Verified on {formatDate(user.emailVerified)}
                </Text>
              </View>
            )}

            {/* Session Info */}
            {session && (
              <View
                style={{
                  paddingTop: spacing.md,
                  borderTopWidth: 1,
                  borderTopColor: colors.border.light,
                }}
              >
                <Text
                  style={{
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.text.secondary,
                    marginBottom: spacing.xs,
                  }}
                >
                  Session
                </Text>
                <Text
                  style={{
                    fontSize: typography.fontSize.xs,
                    color: colors.text.tertiary,
                  }}
                >
                  Expires: {formatDate(session.expiresAt)}
                </Text>
              </View>
            )}
          </View>
        </Card>

        {/* Sign Out Button */}
        <Button
          variant="danger"
          size="lg"
          fullWidth
          onPress={handleSignOut}
          disabled={isLoading}
        >
          Sign Out
        </Button>
      </View>

      {/* Sign Out Confirmation Dialog */}
      <ConfirmDialog
        visible={showSignOutDialog}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        confirmText="Sign Out"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={confirmSignOut}
        onCancel={cancelSignOut}
        loading={signOutLoading}
      />
    </ScrollView>
  );
}
