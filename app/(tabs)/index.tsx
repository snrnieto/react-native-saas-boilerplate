/**
 * Home Screen
 * 
 * Simple counter demonstration.
 * En web se muestra temporalmente el test de Paddle (IBillingService).
 */

import { PaddleBillingTest } from '@/src/adapters/paddle/__test-component';
import { useCounter } from '@/src/core/hooks/useCounter';
import { useAuth } from '@/src/providers/auth';
import { useTheme } from '@/src/ui/ThemeProvider';
import { Button } from '@/src/ui/components';
import { Platform, ScrollView, Text, View } from 'react-native';

export default function HomeScreen() {
  const { count, increment, decrement, reset } = useCounter();
  const { theme } = useTheme();
  const { colors, spacing, typography } = theme;
  const { user } = useAuth();

  const counterBlock = (
    <View style={{ alignItems: 'center' }}>
      <Text
        style={{
          fontSize: typography.fontSize['4xl'],
          fontWeight: typography.fontWeight.bold,
          color: colors.text.primary,
          marginBottom: spacing.xl,
        }}
      >
        Counter
      </Text>

      <Text
        style={{
          fontSize: 96,
          fontWeight: typography.fontWeight.bold,
          color: colors.primary,
          marginBottom: spacing.xl,
        }}
      >
        {count}
      </Text>

      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <Button
          variant="secondary"
          size="lg"
          onPress={decrement}
          style={{ width: 60, height: 60, borderRadius: 30, justifyContent: 'center' }}
        >
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text.primary }}>-</Text>
        </Button>

        <Button
          variant="primary"
          size="lg"
          onPress={increment}
          style={{ width: 60, height: 60, borderRadius: 30, justifyContent: 'center' }}
        >
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text.inverse }}>+</Text>
        </Button>
      </View>

      <Button
        variant="ghost"
        onPress={reset}
        style={{ marginTop: spacing.xl }}
      >
        Reset
      </Button>
    </View>
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background.primary }}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
        paddingBottom: 40,
      }}
    >
      {counterBlock}
      {Platform.OS === 'web' && (
        <View style={{ width: '100%', marginTop: 32 }}>
          <PaddleBillingTest
            userEmail={user?.email}
            userId={user?.id}
          />
        </View>
      )}
    </ScrollView>
  );
}
