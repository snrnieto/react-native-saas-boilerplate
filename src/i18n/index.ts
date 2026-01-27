import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { languageStorage } from './languageStorage';
import { en } from './locales/en';
import { es } from './locales/es';
import { LanguageCode } from './types';

// Detect device language
const getDeviceLanguage = (): LanguageCode => {
    const deviceLocales = getLocales();
    const deviceLanguage = deviceLocales[0]?.languageCode;

    if (deviceLanguage === 'es') {
        return 'es';
    }
    return 'en'; // Fallback to English
};

// Initialize i18next
const initI18n = async () => {
    // 1. Check if user has a stored preference
    let language: LanguageCode | null = await languageStorage.getLanguage();

    // 2. If no preference, use device language
    if (!language) {
        language = getDeviceLanguage();
    }

    await i18n
        .use(initReactI18next)
        .init({
            resources: {
                en: { translation: en },
                es: { translation: es },
            },
            lng: language,
            fallbackLng: 'en',
            interpolation: {
                escapeValue: false, // react already safes from xss
            },
            compatibilityJSON: 'v3' as any, // Required for Android
        });
};

export default initI18n;
