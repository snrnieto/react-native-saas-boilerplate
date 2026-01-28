import { Translation } from '../types';

export const en: Translation = {
    auth: {
        welcome: 'Welcome Back',
        signIn: 'Sign In',
        signUp: 'Sign Up',
        signOut: 'Sign Out',
        emailPlaceholder: 'Enter your email',
        passwordPlaceholder: 'Enter your password',
        loading: 'Loading...',
        forgotPassword: 'Forgot Password?',
        resetPassword: 'Reset Password',
        resetPasswordTitle: 'Reset Password',
        resetPasswordDescription: 'Enter your email address and we\'ll send you a link to reset your password.',
        resetPasswordSuccess: 'Email Sent',
        resetPasswordSuccessMessage: 'If an account exists with this email, you will receive a password reset link shortly.',
        backToLogin: 'Back to Login',
        rememberPassword: 'Remember your password?',
        error: {
            invalidEmail: 'Invalid email address',
            weakPassword: 'Password is too weak',
            generic: 'An error occurred',
        },
    },
    common: {
        save: 'Save',
        cancel: 'Cancel',
        back: 'Back',
        next: 'Next',
        language: 'Language',
        settings: 'Settings',
    },
    profile: {
        title: 'Profile',
        changeLanguage: 'Change Language',
        theme: 'Theme',
        description: 'Manage your personal information',
    },
};
