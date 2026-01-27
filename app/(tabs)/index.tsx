/**
 * Home Screen
 * 
 * Simple counter demonstration.
 */

import { useCounter } from '@/src/core/hooks/useCounter';
import { useTheme } from '@/src/ui/ThemeProvider';
import { Button } from '@/src/ui/components';
import { Text, View } from 'react-native';

export default function HomeScreen() {
  const { count, increment, decrement, reset } = useCounter();
  const { theme } = useTheme();
  const { colors, spacing, typography } = theme;

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background.primary,
        padding: spacing.lg,
      }}
    >
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
}
