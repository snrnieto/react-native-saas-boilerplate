/**
 * Login Screen
 * 
 * Pantalla de inicio de sesión usando los componentes del sistema de diseño.
 */

import { useAuth } from '@/src/providers/auth';
import { useTheme } from '@/src/ui/ThemeProvider';
import { Button, Card, Input } from '@/src/ui/components';
import { useToast } from '@/src/ui/components/Toast/ToastContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';

export default function LoginScreen() {
    const { signIn, isLoading } = useAuth();
    const { theme } = useTheme();
    const router = useRouter();
    const { showError } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const validateForm = (): boolean => {
        const newErrors: { email?: string; password?: string } = {};

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            await signIn(email.trim(), password);
            // Navigation will be handled automatically by AuthGuard
            router.replace('/(tabs)');
        } catch (error: any) {
            showError(
                error?.message || 'Invalid email or password. Please try again.',
                { position: 'bottom' }
            );
        }
    };

    const { colors, spacing, typography } = theme;

    return (
        <KeyboardAvoidingView
            style={{
                flex: 1,
                backgroundColor: colors.background.primary,
            }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: 'center',
                    padding: spacing.lg,
                }}
                keyboardShouldPersistTaps="handled"
            >
                <View
                    style={{
                        maxWidth: 400,
                        width: '100%',
                        alignSelf: 'center',
                    }}
                >
                    {/* Header */}
                    <View style={{ marginBottom: spacing['2xl'] }}>
                        <Text
                            style={{
                                fontSize: typography.fontSize['4xl'],
                                fontWeight: typography.fontWeight.bold,
                                color: colors.text.primary,
                                marginBottom: spacing.sm,
                                textAlign: 'center',
                            }}
                        >
                            Welcome Back
                        </Text>
                        <Text
                            style={{
                                fontSize: typography.fontSize.base,
                                color: colors.text.secondary,
                                textAlign: 'center',
                            }}
                        >
                            Sign in to continue
                        </Text>
                    </View>

                    {/* Login Form */}
                    <Card padding="lg">
                        <View style={{ gap: spacing.md }}>
                            <Input
                                label="Email"
                                placeholder="Enter your email"
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    if (errors.email) {
                                        setErrors((prev) => ({ ...prev, email: undefined }));
                                    }
                                }}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                autoComplete="email"
                                textContentType="emailAddress"
                                importantForAutofill="yes"
                                error={!!errors.email}
                                errorMessage={errors.email}
                                size="md"
                                fullWidth
                            />

                            <Input
                                label="Password"
                                placeholder="Enter your password"
                                value={password}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    if (errors.password) {
                                        setErrors((prev) => ({ ...prev, password: undefined }));
                                    }
                                }}
                                secureTextEntry
                                autoCapitalize="none"
                                autoCorrect={false}
                                autoComplete="password"
                                textContentType="password"
                                importantForAutofill="yes"
                                error={!!errors.password}
                                errorMessage={errors.password}
                                size="md"
                                fullWidth
                            />

                            <View style={{ marginTop: spacing.sm }}>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    fullWidth
                                    loading={isLoading}
                                    onPress={handleLogin}
                                >
                                    Sign In
                                </Button>
                            </View>
                        </View>
                    </Card>

                    {/* Sign Up Link */}
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginTop: spacing.lg,
                            gap: spacing.xs,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: typography.fontSize.base,
                                color: colors.text.secondary,
                            }}
                        >
                            Don't have an account?
                        </Text>
                        <Pressable onPress={() => router.push('/signup' as any)}>
                            <Text
                                style={{
                                    fontSize: typography.fontSize.base,
                                    fontWeight: typography.fontWeight.semibold,
                                    color: colors.primary,
                                }}
                            >
                                Sign Up
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
