/**
 * Toast Context
 * 
 * Global state management for Toast notifications.
 */

import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { Platform, SafeAreaView, StyleSheet, View } from 'react-native';
import { Toast, ToastType } from './Toast';

export type ToastPosition = 'top' | 'bottom' | 'center';

export interface ToastOptions {
    type?: ToastType;
    duration?: number;
    position?: ToastPosition;
}

interface ToastData {
    id: string;
    message: string;
    type: ToastType;
    duration: number;
    position: ToastPosition;
}

interface ToastContextValue {
    showToast: (message: string, options?: ToastOptions) => void;
    showSuccess: (message: string, options?: Omit<ToastOptions, 'type'>) => void;
    showError: (message: string, options?: Omit<ToastOptions, 'type'>) => void;
    showInfo: (message: string, options?: Omit<ToastOptions, 'type'>) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastData[]>([]);

    const showToast = useCallback((message: string, options: ToastOptions = {}) => {
        const id = Math.random().toString(36).substring(7);
        const {
            type = 'info',
            duration = 3000,
            position = 'top'
        } = options;

        setToasts(prev => [...prev, { id, message, type, duration, position }]);
    }, []);

    const showSuccess = useCallback((message: string, options?: Omit<ToastOptions, 'type'>) =>
        showToast(message, { ...options, type: 'success' }), [showToast]);

    const showError = useCallback((message: string, options?: Omit<ToastOptions, 'type'>) =>
        showToast(message, { ...options, type: 'error' }), [showToast]);

    const showInfo = useCallback((message: string, options?: Omit<ToastOptions, 'type'>) =>
        showToast(message, { ...options, type: 'info' }), [showToast]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const renderToasts = (position: ToastPosition) => {
        const filteredToasts = toasts.filter(t => t.position === position);

        if (filteredToasts.length === 0) return null;

        return (
            <View style={[styles.toastContainer, styles[position]]} pointerEvents="box-none">
                <SafeAreaView pointerEvents="box-none">
                    {filteredToasts.map(toast => (
                        <Toast
                            key={toast.id}
                            id={toast.id}
                            message={toast.message}
                            type={toast.type}
                            duration={toast.duration}
                            position={toast.position}
                            onDismiss={removeToast}
                        />
                    ))}
                </SafeAreaView>
            </View>
        );
    }

    return (
        <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo }}>
            {children}
            {renderToasts('top')}
            {renderToasts('center')}
            {renderToasts('bottom')}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

const styles = StyleSheet.create({
    toastContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 9999,
        alignItems: 'center',
    },
    top: {
        top: 0,
        paddingTop: Platform.OS === 'android' ? 40 : 10,
    },
    bottom: {
        bottom: 0,
        paddingBottom: Platform.OS === 'android' ? 20 : 34,
        justifyContent: 'flex-end',
    },
    center: {
        top: 0,
        bottom: 0,
        justifyContent: 'center',
    }
});
