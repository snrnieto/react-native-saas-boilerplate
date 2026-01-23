/**
 * Sign Up Screen
 * 
 * Pantalla de registro usando los componentes del sistema de diseño.
 */

import { useAuth } from '@/src/providers/auth';
import { useTheme } from '@/src/ui/ThemeProvider';
import { Button, Card, Input } from '@/src/ui/components';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';

export default function SignUpScreen() {
    const { signUp, isLoading } = useAuth();
    const { theme } = useTheme();
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<{
        name?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
    }>({});

    const validateForm = (): boolean => {
        const newErrors: {
            name?: string;
            email?: string;
            password?: string;
            confirmPassword?: string;
        } = {};

        if (!name.trim()) {
            newErrors.name = 'Name is required';
        } else if (name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

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

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignUp = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            await signUp(email.trim(), password, {
                name: name.trim(),
            });
            // Navigation will be handled automatically by AuthGuard
            router.replace('/(tabs)');
        } catch (error: any) {
            Alert.alert(
                'Sign Up Failed',
                error?.message || 'Unable to create account. Please try again.',
                [{ text: 'OK' }]
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
                            Create Account
                        </Text>
                        <Text
                            style={{
                                fontSize: typography.fontSize.base,
                                color: colors.text.secondary,
                                textAlign: 'center',
                            }}
                        >
                            Sign up to get started
                        </Text>
                    </View>

                    {/* Sign Up Form */}
                    <Card padding="lg">
                        <View style={{ gap: spacing.md }}>
                            <Input
                                label="Full Name"
                                placeholder="Enter your full name"
                                value={name}
                                onChangeText={(text) => {
                                    setName(text);
                                    if (errors.name) {
                                        setErrors((prev) => ({ ...prev, name: undefined }));
                                    }
                                }}
                                autoCapitalize="words"
                                autoCorrect={false}
                                autoComplete="name"
                                textContentType="name"
                                importantForAutofill="yes"
                                error={!!errors.name}
                                errorMessage={errors.name}
                                size="md"
                                fullWidth
                            />

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
                                autoComplete="email"
                                textContentType="emailAddress"
                                error={!!errors.email}
                                errorMessage={errors.email}
                                size="md"
                                fullWidth
                            />

                            <Input
                                label="Password"
                                placeholder="Create a password"
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
                                autoComplete="password-new"
                                textContentType="newPassword"
                                importantForAutofill="yes"
                                error={!!errors.password}
                                errorMessage={errors.password}
                                size="md"
                                fullWidth
                            />

                            <Input
                                label="Confirm Password"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChangeText={(text) => {
                                    setConfirmPassword(text);
                                    if (errors.confirmPassword) {
                                        setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                                    }
                                }}
                                secureTextEntry
                                autoCapitalize="none"
                                autoCorrect={false}
                                autoComplete="password-new"
                                textContentType="newPassword"
                                importantForAutofill="yes"
                                error={!!errors.confirmPassword}
                                errorMessage={errors.confirmPassword}
                                size="md"
                                fullWidth
                            />

                            <View style={{ marginTop: spacing.sm }}>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    fullWidth
                                    loading={isLoading}
                                    onPress={handleSignUp}
                                >
                                    Create Account
                                </Button>
                            </View>
                        </View>
                    </Card>

                    {/* Login Link */}
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
                            Already have an account?
                        </Text>
                        <Pressable onPress={() => router.push('/login' as any)}>
                            <Text
                                style={{
                                    fontSize: typography.fontSize.base,
                                    fontWeight: typography.fontWeight.semibold,
                                    color: colors.primary,
                                }}
                            >
                                Sign In
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
