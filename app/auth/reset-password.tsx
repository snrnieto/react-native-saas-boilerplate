/**
 * Reset Password Screen
 *
 * Pantalla para establecer la nueva contraseña después de hacer clic en el link
 * del correo de recuperación. Maneja el deep link con los tokens de Supabase.
 */

import { useAuth } from "@/src/providers/auth";
import { useTheme } from "@/src/ui/ThemeProvider";
import { supabaseClient } from "@/src/adapters/supabase/client";
import { Button, Card, Input } from "@/src/ui/components";
import { useToast } from "@/src/ui/components/Toast/ToastContext";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";

const isWeb = Platform.OS === "web";

function parseTokensFromUrl(url: string): { access_token?: string; refresh_token?: string } | null {
    try {
        const hashPart = url.includes("#") ? url.split("#")[1] : "";
        if (!hashPart) return null;
        const params = new URLSearchParams(hashPart);
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        if (!access_token) return null;
        return { access_token, refresh_token: refresh_token || undefined };
    } catch {
        return null;
    }
}

export default function ResetPasswordScreen() {
    const { updatePassword, signOut } = useAuth();
    const { theme } = useTheme();
    const router = useRouter();
    const { showSuccess, showError } = useToast();
    const { t } = useTranslation();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [sessionReady, setSessionReady] = useState(false);
    const [processingLink, setProcessingLink] = useState(true);

    useEffect(() => {
        async function initSession() {
            try {
                // 1. On web, Supabase (detectSessionInUrl) may have already processed the hash
                //    and set the session. Check session first.
                let { data: { session } } = await supabaseClient.auth.getSession();
                if (session) {
                    setSessionReady(true);
                    setProcessingLink(false);
                    return;
                }

                // 2. On web, Supabase may still be processing the hash - wait briefly and retry
                if (isWeb) {
                    await new Promise((r) => setTimeout(r, 300));
                    const retry = await supabaseClient.auth.getSession();
                    if (retry.data.session) {
                        setSessionReady(true);
                        setProcessingLink(false);
                        return;
                    }
                }

                // 3. Try to get tokens from URL (mobile, or web if URL still has hash)
                const url = await Linking.getInitialURL();
                const tokens = url && url.includes("auth/reset-password") ? parseTokensFromUrl(url) : null;
                if (tokens?.access_token) {
                    const { error: sessionError } = await supabaseClient.auth.setSession({
                        access_token: tokens.access_token,
                        refresh_token: tokens.refresh_token || "",
                    });
                    if (!sessionError) {
                        setSessionReady(true);
                        setProcessingLink(false);
                        return;
                    }
                    throw sessionError;
                }
            } catch (err: any) {
                console.error("Error initializing recovery session:", err);
                showError(err?.message || t("auth.error.generic"), { position: "bottom" });
            }
            setSessionReady(false);
            setProcessingLink(false);
        }

        initSession();

        const subscription = Linking.addEventListener("url", ({ url }) => {
            const tokens = url?.includes("auth/reset-password") ? parseTokensFromUrl(url) : null;
            if (tokens?.access_token) {
                supabaseClient.auth
                    .setSession({ access_token: tokens.access_token, refresh_token: tokens.refresh_token || "" })
                    .then(({ error }) => {
                        if (!error) setSessionReady(true);
                    })
                    .catch((e) => showError(e?.message || t("auth.error.generic"), { position: "bottom" }));
            }
        });

        return () => subscription.remove();
    }, [showError, t]);

    const validateForm = (): boolean => {
        const newErrors: string[] = [];
        if (!password) {
            newErrors.push(t("auth.error.passwordRequired"));
        } else if (password.length < 6) {
            newErrors.push(t("auth.error.weakPassword"));
        }
        if (password !== confirmPassword) {
            newErrors.push(t("auth.passwordsDoNotMatch"));
        }
        setError(newErrors.length > 0 ? newErrors[0] : null);
        return newErrors.length === 0;
    };

    const handleUpdatePassword = async () => {
        if (!validateForm()) return;

        try {
            setIsLoading(true);
            await updatePassword(password);
            showSuccess(t("auth.passwordUpdatedSuccess"), { position: "bottom" });
            await signOut();
            setTimeout(() => {
                router.replace("/login" as any);
            }, 1500);
        } catch (err: any) {
            const errorMessage = err?.message || t("auth.error.generic");
            setError(errorMessage);
            showError(errorMessage, { position: "bottom" });
        } finally {
            setIsLoading(false);
        }
    };

    const { colors, spacing, typography } = theme;

    if (processingLink) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background.primary }}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ marginTop: spacing.md, color: colors.text.secondary }}>
                    {t("auth.loading")}
                </Text>
            </View>
        );
    }

    if (!sessionReady) {
        return (
            <View style={{ flex: 1, justifyContent: "center", padding: spacing.lg, backgroundColor: colors.background.primary }}>
                <Text
                    style={{
                        fontSize: typography.fontSize.base,
                        color: colors.text.secondary,
                        textAlign: "center",
                        marginBottom: spacing.lg,
                    }}
                >
                    {t("auth.invalidResetLink")}
                </Text>
                <Button onPress={() => router.replace("/forgot-password" as any)} fullWidth>
                    {t("auth.resetPassword")}
                </Button>
                <Pressable
                    onPress={() => router.replace("/login" as any)}
                    style={{ marginTop: spacing.lg, alignItems: "center" }}
                >
                    <Text style={{ fontSize: typography.fontSize.base, color: colors.primary }}>
                        {t("auth.backToLogin")}
                    </Text>
                </Pressable>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{
                flex: 1,
                backgroundColor: colors.background.primary,
            }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: "center",
                    padding: spacing.lg,
                }}
                keyboardShouldPersistTaps="handled"
            >
                <View
                    style={{
                        maxWidth: 400,
                        width: "100%",
                        alignSelf: "center",
                    }}
                >
                    <View style={{ marginBottom: spacing["2xl"] }}>
                        <Text
                            style={{
                                fontSize: typography.fontSize["4xl"],
                                fontWeight: typography.fontWeight.bold,
                                color: colors.text.primary,
                                marginBottom: spacing.sm,
                                textAlign: "center",
                            }}
                        >
                            {t("auth.setNewPasswordTitle")}
                        </Text>
                        <Text
                            style={{
                                fontSize: typography.fontSize.base,
                                color: colors.text.secondary,
                                textAlign: "center",
                                lineHeight: 22,
                            }}
                        >
                            {t("auth.setNewPasswordDescription")}
                        </Text>
                    </View>

                    <Card padding="lg">
                        <View style={{ gap: spacing.md }}>
                            <Input
                                label={t("auth.newPasswordPlaceholder")}
                                placeholder={t("auth.newPasswordPlaceholder")}
                                value={password}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    if (error) setError(null);
                                }}
                                secureTextEntry
                                autoCapitalize="none"
                                autoCorrect={false}
                                autoComplete="new-password"
                                error={!!error}
                                errorMessage={error || undefined}
                                size="md"
                                fullWidth
                            />

                            <Input
                                label={t("auth.confirmPasswordPlaceholder")}
                                placeholder={t("auth.confirmPasswordPlaceholder")}
                                value={confirmPassword}
                                onChangeText={(text) => {
                                    setConfirmPassword(text);
                                    if (error) setError(null);
                                }}
                                secureTextEntry
                                autoCapitalize="none"
                                autoCorrect={false}
                                autoComplete="new-password"
                                error={!!error && !password}
                                size="md"
                                fullWidth
                            />

                            <View style={{ marginTop: spacing.sm }}>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    fullWidth
                                    loading={isLoading}
                                    onPress={handleUpdatePassword}
                                >
                                    {t("auth.resetPassword")}
                                </Button>
                            </View>
                        </View>
                    </Card>

                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                            marginTop: spacing.lg,
                            gap: spacing.xs,
                        }}
                    >
                        <Text style={{ fontSize: typography.fontSize.base, color: colors.text.secondary }}>
                            {t("auth.rememberPassword")}
                        </Text>
                        <Pressable onPress={() => router.replace("/login" as any)}>
                            <Text
                                style={{
                                    fontSize: typography.fontSize.base,
                                    fontWeight: typography.fontWeight.semibold,
                                    color: colors.primary,
                                }}
                            >
                                {t("auth.signIn")}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
