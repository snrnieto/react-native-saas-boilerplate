export interface IAuthTranslations {
    welcome: string;
    signIn: string;
    signUp: string;
    signOut: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    loading: string;
    forgotPassword: string;
    resetPassword: string;
    resetPasswordTitle: string;
    resetPasswordDescription: string;
    resetPasswordSuccess: string;
    resetPasswordSuccessMessage: string;
    setNewPasswordTitle: string;
    setNewPasswordDescription: string;
    newPasswordPlaceholder: string;
    confirmPasswordPlaceholder: string;
    passwordUpdatedSuccess: string;
    invalidResetLink: string;
    passwordsDoNotMatch: string;
    backToLogin: string;
    rememberPassword: string;
    error: {
        invalidEmail: string;
        weakPassword: string;
        passwordRequired: string;
        generic: string;
    };
}

export interface ICommonTranslations {
    save: string;
    cancel: string;
    back: string;
    next: string;
    language: string;
    settings: string;
}

export interface IProfileTranslations {
    title: string;
    changeLanguage: string;
    theme: string;
    description: string;
}

export interface Translation {
    auth: IAuthTranslations;
    common: ICommonTranslations;
    profile: IProfileTranslations;
}

export type LanguageCode = 'en' | 'es';
