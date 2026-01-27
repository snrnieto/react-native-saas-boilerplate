import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageCode } from './types';

const LANGUAGE_KEY = 'user_language_preference';

export const languageStorage = {
    async getLanguage(): Promise<LanguageCode | null> {
        try {
            const language = await AsyncStorage.getItem(LANGUAGE_KEY);
            return language as LanguageCode | null;
        } catch (error) {
            console.error('Error reading language from storage:', error);
            return null;
        }
    },

    async setLanguage(language: LanguageCode): Promise<void> {
        try {
            await AsyncStorage.setItem(LANGUAGE_KEY, language);
        } catch (error) {
            console.error('Error saving language to storage:', error);
        }
    },
};
