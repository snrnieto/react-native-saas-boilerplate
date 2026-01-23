/**
 * Login Screen
 * 
 * Basic login screen placeholder.
 * Full UI implementation will be done in Task 2.5.
 */

import { useAuth } from '@/src/providers/auth';
import { StyleSheet, Text, View } from 'react-native';

export default function LoginScreen() {
    const { isAuthenticated } = useAuth();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <Text style={styles.subtitle}>
                Full login UI will be implemented in Task 2.5
            </Text>
            {isAuthenticated && (
                <Text style={styles.authenticated}>
                    You are already authenticated!
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    authenticated: {
        marginTop: 20,
        fontSize: 14,
        color: '#4CAF50',
    },
});
