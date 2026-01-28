/**
 * Profile Screen
 * 
 * Allows users to view and edit their profile, and sign out.
 */

import { languageStorage } from '@/src/i18n/languageStorage';
import { LanguageCode } from '@/src/i18n/types';
import { useAuth } from '@/src/providers/auth';
import { useProfile } from '@/src/providers/profile/ProfileContext';
import { useTheme } from '@/src/ui/ThemeProvider';
import { Button, Card, ConfirmDialog, Input } from '@/src/ui/components';
import { useToast } from '@/src/ui/components/Toast/ToastContext';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
    const { t, i18n } = useTranslation();
    const { user, signOut, updateProfile: updateAuthProfile, isLoading: isAuthLoading } = useAuth();
    const { profile, updateProfile: updateExtendedProfile, isLoading: isProfileLoading } = useProfile();
    const { theme } = useTheme();
    const { colors, spacing, typography } = theme;
    const { showSuccess, showError } = useToast();

    // Form state
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [bio, setBio] = useState('');
    const [phone, setPhone] = useState('');

    // Loading states
    const [isSaving, setIsSaving] = useState(false);
    const [showSignOutDialog, setShowSignOutDialog] = useState(false);
    const [signOutLoading, setSignOutLoading] = useState(false);

    // Update local state when user/profile changes
    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
        }
        if (profile) {
            setBio(profile.bio || '');
            setPhone(profile.phone || '');
        }
    }, [user, profile]);

    const handleSaveProfile = async () => {
        if (!user) return;

        try {
            setIsSaving(true);

            // 1. Update Auth Data (Name)
            if (name !== user.name) {
                await updateAuthProfile({
                    name,
                });
            }

            // 2. Update Profile Data (Bio, Phone)
            await updateExtendedProfile({
                bio,
                phone,
            });

            showSuccess(t('common.save') + ' success', { position: 'bottom' }); // Simplified for now
        } catch (error: any) {
            console.error('Update profile error:', error);
            const message = error.message || 'Failed to update profile';
            showError(message, { position: 'bottom' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSignOut = () => {
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
            showError('Failed to sign out', { position: 'bottom' });
        } finally {
            setSignOutLoading(false);
        }
    };

    const cancelSignOut = () => {
        setShowSignOutDialog(false);
    };

    const changeLanguage = async (lang: LanguageCode) => {
        await i18n.changeLanguage(lang);
        await languageStorage.setLanguage(lang);
    };

    const isLoading = isAuthLoading || isProfileLoading;

    if (isLoading && !user) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: colors.background.primary,
                }}
            >
                <Text style={{ color: colors.text.secondary }}>{t('auth.loading')}</Text>
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
                            fontSize: typography.fontSize['3xl'],
                            fontWeight: typography.fontWeight.bold,
                            color: colors.text.primary,
                            marginBottom: spacing.xs,
                        }}
                    >
                        {t('profile.title')}
                    </Text>
                    <Text
                        style={{
                            fontSize: typography.fontSize.base,
                            color: colors.text.secondary,
                        }}
                    >
                        {t('profile.description')}
                    </Text>
                </View>

                {/* Edit Profile Form */}
                <Card variant="elevated" padding="lg">
                    <View style={{ gap: spacing.lg }}>
                        <Input
                            label="Full Name"
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your name"
                            autoCapitalize="words"
                        />

                        <Input
                            label="Email Address"
                            value={email}
                            editable={false}
                            placeholder={t('auth.emailPlaceholder')}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            containerStyle={{ opacity: 0.7 }}
                        />

                        <Input
                            label="Bio"
                            value={bio}
                            onChangeText={setBio}
                            placeholder="Tell us about yourself"
                            multiline
                            numberOfLines={3}
                            inputStyle={{ minHeight: 80, textAlignVertical: 'top' }}
                        />

                        <Input
                            label="Phone Number"
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="+1 (555) 000-0000"
                            keyboardType="phone-pad"
                        />

                        <View style={{ marginTop: spacing.sm }}>
                            <Button
                                variant="primary"
                                onPress={handleSaveProfile}
                                loading={isSaving}
                                disabled={isSaving}
                            >
                                {t('common.save')}
                            </Button>
                        </View>
                    </View>
                </Card>

                {/* Language Settings */}
                <View style={{ gap: spacing.md }}>
                    <Text
                        style={{
                            fontSize: typography.fontSize.lg,
                            fontWeight: typography.fontWeight.semibold,
                            color: colors.text.primary,
                        }}
                    >
                        {t('common.language')}
                    </Text>
                    <Card variant="outlined" padding="md">
                        <View style={{ flexDirection: 'row', gap: spacing.md }}>
                            <TouchableOpacity
                                onPress={() => changeLanguage('en')}
                                style={{
                                    padding: spacing.sm,
                                    backgroundColor: i18n.language === 'en' ? colors.primary : 'transparent',
                                    borderRadius: 4,
                                    borderWidth: 1,
                                    borderColor: colors.border.default
                                }}
                            >
                                <Text style={{ color: i18n.language === 'en' ? 'white' : colors.text.primary }}>English</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => changeLanguage('es')}
                                style={{
                                    padding: spacing.sm,
                                    backgroundColor: i18n.language === 'es' ? colors.primary : 'transparent',
                                    borderRadius: 4,
                                    borderWidth: 1,
                                    borderColor: colors.border.default
                                }}
                            >
                                <Text style={{ color: i18n.language === 'es' ? 'white' : colors.text.primary }}>Español</Text>
                            </TouchableOpacity>
                        </View>
                    </Card>
                </View>


                {/* Account Actions */}
                <View style={{ gap: spacing.md }}>
                    <Text
                        style={{
                            fontSize: typography.fontSize.lg,
                            fontWeight: typography.fontWeight.semibold,
                            color: colors.text.primary,
                        }}
                    >
                        {t('common.settings')}
                    </Text>

                    <Button
                        variant="danger"
                        onPress={handleSignOut}
                        disabled={isLoading}
                    >
                        {t('auth.signOut')}
                    </Button>
                </View>
            </View>

            {/* Sign Out Confirmation Dialog */}
            <ConfirmDialog
                visible={showSignOutDialog}
                title={t('auth.signOut')}
                message="Are you sure you want to sign out?"
                confirmText={t('auth.signOut')}
                cancelText={t('common.cancel')}
                confirmVariant="danger"
                onConfirm={confirmSignOut}
                onCancel={cancelSignOut}
                loading={signOutLoading}
            />
        </ScrollView>
    );
}
