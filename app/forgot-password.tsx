/**
 * Forgot Password Screen
 * 
 * Pantalla para solicitar el restablecimiento de contraseña.
 * El usuario ingresa su email y se envía un link de recuperación.
 */

import { useAuth } from '@/src/providers/auth';
import { useTheme } from '@/src/ui/ThemeProvider';
import { Button, Card, Input } from '@/src/ui/components';
import { useToast } from '@/src/ui/components/Toast/ToastContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';

export default function ForgotPasswordScreen() {
    const { resetPassword } = useAuth();
    const { theme } = useTheme();
    const router = useRouter();
    const { showSuccess, showError } = useToast();
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const validateEmail = (): boolean => {
        if (!email.trim()) {
            setError('Email is required');
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setError('Please enter a valid email');
            return false;
        }
        setError(null);
        return true;
    };

    const handleResetPassword = async () => {
        if (!validateEmail()) {
            return;
        }

        try {
            setIsLoading(true);
            await resetPassword(email.trim());
            showSuccess(t('auth.resetPasswordSuccess'), {
                position: 'bottom',
            });
            // Regresar al login después de enviar el email
            setTimeout(() => {
                router.replace('/login' as any);
            }, 1500);
        } catch (error: any) {
            console.error('Reset password error:', error);
            const errorMessage = error?.message || t('auth.error.generic');
            setError(errorMessage);
            showError(errorMessage, { position: 'bottom' });
        } finally {
            setIsLoading(false);
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
                            {t('auth.resetPasswordTitle')}
                        </Text>
                        <Text
                            style={{
                                fontSize: typography.fontSize.base,
                                color: colors.text.secondary,
                                textAlign: 'center',
                                lineHeight: 22,
                            }}
                        >
                            {t('auth.resetPasswordDescription')}
                        </Text>
                    </View>

                    {/* Reset Password Form */}
                    <Card padding="lg">
                        <View style={{ gap: spacing.md }}>
                            <Input
                                label="Email"
                                placeholder={t('auth.emailPlaceholder')}
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    if (error) {
                                        setError(null);
                                    }
                                }}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                autoComplete="email"
                                textContentType="emailAddress"
                                importantForAutofill="yes"
                                error={!!error}
                                errorMessage={error || undefined}
                                size="md"
                                fullWidth
                                autoFocus
                            />

                            <View style={{ marginTop: spacing.sm }}>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    fullWidth
                                    loading={isLoading}
                                    onPress={handleResetPassword}
                                >
                                    {t('auth.resetPassword')}
                                </Button>
                            </View>
                        </View>
                    </Card>

                    {/* Back to Login Link */}
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
                            {t('auth.rememberPassword')}
                        </Text>
                        <Pressable onPress={() => router.replace('/login' as any)}>
                            <Text
                                style={{
                                    fontSize: typography.fontSize.base,
                                    fontWeight: typography.fontWeight.semibold,
                                    color: colors.primary,
                                }}
                            >
                                {t('auth.signIn')}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
