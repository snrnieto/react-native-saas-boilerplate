/**
 * Toast Component
 * 
 * A unified notification component for Web and Mobile.
 * Displays messages with success, error, or info styling.
 */

import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../ThemeProvider';
import { ToastPosition } from './ToastContext';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
    id: string;
    message: string;
    type?: ToastType;
    duration?: number;
    position?: ToastPosition;
    onDismiss: (id: string) => void;
}

export function Toast({
    id,
    message,
    type = 'info',
    duration = 3000,
    position = 'top',
    onDismiss,
}: ToastProps) {
    const { theme } = useTheme();
    const { colors, spacing, borders, typography } = theme;

    // Animation value (opacity and translateY)
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Enter animation
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
        }).start();

        // Auto-dismiss timer
        const timer = setTimeout(() => {
            dismiss();
        }, duration);

        return () => clearTimeout(timer);
    }, []);

    const dismiss = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
        }).start(() => {
            onDismiss(id);
        });
    };

    const getIconName = () => {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'times-circle'; // More standard for error
            case 'info': return 'info-circle';
        }
    };

    const getIconColor = () => {
        switch (type) {
            case 'success': return '#4ADE80'; // Bright green
            case 'error': return '#F87171'; // Bright red
            case 'info': return '#60A5FA'; // Bright blue
        }
    };

    // Determine initial translate Y based on position
    const getTranslateYRange = () => {
        switch (position) {
            case 'bottom': return [30, 0];
            case 'center': return [10, 0];
            case 'top': default: return [-30, 0];
        }
    };

    const [startY, endY] = getTranslateYRange();

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity: fadeAnim,
                    transform: [
                        {
                            translateY: fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [startY, endY]
                            })
                        },
                        {
                            scale: fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.95, 1]
                            })
                        }
                    ],
                    // Native "Capsule" Toast Look
                    backgroundColor: theme.mode === 'dark' ? 'rgba(30, 30, 30, 0.95)' : 'rgba(50, 50, 50, 0.95)',
                    borderRadius: 50, // Capsule shape
                    shadowColor: "#000",
                    shadowOffset: {
                        width: 0,
                        height: 4,
                    },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 10,
                    marginBottom: position === 'bottom' ? 20 : 10,
                    marginTop: position === 'bottom' ? 10 : 20,
                    maxWidth: 450,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.1)'
                }
            ]}
        >
            <View style={styles.content}>
                <View
                    style={{
                        marginRight: 10,
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderRadius: 20,
                        padding: 6,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <FontAwesome
                        name={getIconName()}
                        size={16}
                        color={getIconColor()}
                    />
                </View>

                <Text
                    style={{
                        flex: 1,
                        fontSize: 14,
                        color: '#FFFFFF', // Put text white always for high contrast on dark toast
                        fontWeight: '600',
                        letterSpacing: 0.3
                    }}
                    numberOfLines={2}
                >
                    {message}
                </Text>

                <TouchableOpacity
                    onPress={dismiss}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                    style={{ marginLeft: 10, opacity: 0.6 }}
                >
                    <FontAwesome name="times" size={12} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 'auto', // Allow it to shrink to content
        minWidth: 200, // But keep a minimum
        alignSelf: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        justifyContent: 'center',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    }
});
