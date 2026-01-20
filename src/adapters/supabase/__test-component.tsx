/**
 * 🧪 ARCHIVO TEMPORAL DE TESTING - SupabaseAuthAdapter
 * 
 * Este componente te permite probar el SupabaseAuthAdapter sin necesidad
 * de crear el AuthProvider aún.
 * 
 * CÓMO USAR:
 * 1. Asegúrate de tener las variables de entorno configuradas
 * 2. Importa este componente en app/(tabs)/index.tsx:
 *    import { SupabaseAuthTest } from '@/adapters/supabase/__test-component';
 * 3. Agrégalo en el JSX: <SupabaseAuthTest />
 * 4. ¡Prueba los botones!
 * 
 * ELIMINAR ESTE ARCHIVO cuando termines el testing.
 */

import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { AuthUser } from '../../services/auth/types';
import { SupabaseAuthAdapter } from './SupabaseAuthAdapter';
import { isSupabaseConfigured } from './client';

const authService = new SupabaseAuthAdapter();

export function SupabaseAuthTest() {
    const [email, setEmail] = useState('test@example.com');
    const [password, setPassword] = useState('password123');
    const [name, setName] = useState('Test User');
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(false);
    const [log, setLog] = useState<string[]>([]);

    const addLog = (message: string) => {
        setLog(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev].slice(0, 10));
    };

    // Test 1: Verificar configuración
    const testConfig = async () => {
        const isConfigured = isSupabaseConfigured();
        addLog(`Supabase configurado: ${isConfigured}`);
        
        if (!isConfigured) {
            Alert.alert('❌ Error', 'Supabase no está configurado. Revisa tus variables de entorno.');
            return;
        }

        // Test de conexión a la base de datos
        addLog(`🔍 Probando conexión...`);
        try {
            const session = await authService.getSession();
            addLog(`✅ Conexión exitosa (session: ${session ? 'activa' : 'ninguna'})`);
            
            Alert.alert(
                '✅ Configuración OK', 
                'Supabase está configurado y conectado.\n\n' +
                '⚠️ IMPORTANTE:\n' +
                '1. Ve a tu Supabase Dashboard\n' +
                '2. Authentication → Providers\n' +
                '3. Habilita "Email"\n' +
                '4. DESACTIVA "Confirm email" (para testing)\n' +
                '5. Guarda los cambios'
            );
        } catch (err: any) {
            addLog(`❌ Error: ${err.message}`);
            Alert.alert('❌ Error de Conexión', err.message);
        }
    };

    // Test 2: Sign Up
    const testSignUp = async () => {
        setLoading(true);
        addLog(`📝 Intentando registro: ${email}`);
        try {
            const result = await authService.signUp(email, password, { name });
            setUser(result.user);
            addLog(`✅ Registro exitoso: ${result.user.email}`);
            
            // Verificar si requiere confirmación de email
            if (result.user.emailVerified === null) {
                Alert.alert(
                    '✅ Sign Up OK',
                    `Usuario creado: ${result.user.email}\n\n` +
                    `⚠️ Si no puedes hacer login:\n` +
                    `1. Revisa tu email para confirmar\n` +
                    `2. O desactiva "Confirm email" en Supabase Dashboard`
                );
            } else {
                Alert.alert('✅ Sign Up OK', `Usuario creado: ${result.user.email}`);
            }
        } catch (error: any) {
            addLog(`❌ Error en registro: ${error.message}`);
            
            // Mensaje de error más detallado
            let errorMsg = error.message;
            let suggestions = '';
            
            if (error.message.includes('Database error')) {
                suggestions = '\n\n🔧 SOLUCIONES:\n' +
                    '1. Ve a Supabase Dashboard\n' +
                    '2. Authentication → Providers\n' +
                    '3. Habilita "Email" provider\n' +
                    '4. DESACTIVA "Confirm email"\n' +
                    '5. Guarda y reintenta';
            } else if (error.message.includes('already registered')) {
                suggestions = '\n\n💡 TIP: Usa otro email o elimina el usuario en Supabase Dashboard';
            }
            
            Alert.alert('❌ Error en Sign Up', errorMsg + suggestions);
        } finally {
            setLoading(false);
        }
    };

    // Test 3: Sign In
    const testSignIn = async () => {
        setLoading(true);
        addLog(`🔐 Intentando login: ${email}`);
        try {
            const result = await authService.signIn(email, password);
            setUser(result.user);
            addLog(`✅ Login exitoso: ${result.user.email}`);
            Alert.alert('✅ Sign In OK', `Sesión iniciada: ${result.user.email}`);
        } catch (error: any) {
            addLog(`❌ Error en login: ${error.message}`);
            Alert.alert('❌ Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    // Test 4: Get Current User
    const testGetUser = async () => {
        setLoading(true);
        addLog(`👤 Obteniendo usuario actual...`);
        try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
            if (currentUser) {
                addLog(`✅ Usuario: ${currentUser.email}`);
                Alert.alert('✅ User Found', `Email: ${currentUser.email}\nName: ${currentUser.name || 'N/A'}`);
            } else {
                addLog(`ℹ️ No hay usuario autenticado`);
                Alert.alert('ℹ️ No User', 'No hay sesión activa');
            }
        } catch (error: any) {
            addLog(`❌ Error: ${error.message}`);
            Alert.alert('❌ Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    // Test 5: Get Session
    const testGetSession = async () => {
        setLoading(true);
        addLog(`🔑 Obteniendo sesión...`);
        try {
            const session = await authService.getSession();
            if (session) {
                addLog(`✅ Sesión válida hasta: ${session.expiresAt.toLocaleString()}`);
                Alert.alert('✅ Session OK', `Expira: ${session.expiresAt.toLocaleString()}`);
            } else {
                addLog(`ℹ️ No hay sesión activa`);
                Alert.alert('ℹ️ No Session', 'No hay sesión activa');
            }
        } catch (error: any) {
            addLog(`❌ Error: ${error.message}`);
            Alert.alert('❌ Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    // Test 6: Sign Out
    const testSignOut = async () => {
        setLoading(true);
        addLog(`🚪 Cerrando sesión...`);
        try {
            await authService.signOut();
            setUser(null);
            addLog(`✅ Sesión cerrada`);
            Alert.alert('✅ Signed Out', 'Sesión cerrada correctamente');
        } catch (error: any) {
            addLog(`❌ Error: ${error.message}`);
            Alert.alert('❌ Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    // Test 7: Reset Password
    const testResetPassword = async () => {
        setLoading(true);
        addLog(`📧 Enviando email de reset: ${email}`);
        try {
            const result = await authService.resetPassword(email);
            addLog(`✅ ${result.message}`);
            Alert.alert('✅ Email Sent', result.message);
        } catch (error: any) {
            addLog(`❌ Error: ${error.message}`);
            Alert.alert('❌ Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>🧪 Supabase Auth Test</Text>
                {user && (
                    <View style={styles.userInfo}>
                        <Text style={styles.userText}>👤 {user.email}</Text>
                        <Text style={styles.userText}>📛 {user.name || 'Sin nombre'}</Text>
                    </View>
                )}
            </View>

            {/* Inputs */}
            <View style={styles.form}>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                <TextInput
                    style={styles.input}
                    placeholder="Name (for signup)"
                    value={name}
                    onChangeText={setName}
                />
            </View>

            {/* Botones de Test */}
            <View style={styles.buttons}>
                <TestButton title="1. Config ✓" onPress={testConfig} loading={loading} />
                <TestButton title="2. Sign Up 📝" onPress={testSignUp} loading={loading} />
                <TestButton title="3. Sign In 🔐" onPress={testSignIn} loading={loading} />
                <TestButton title="4. Get User 👤" onPress={testGetUser} loading={loading} />
                <TestButton title="5. Get Session 🔑" onPress={testGetSession} loading={loading} />
                <TestButton title="6. Sign Out 🚪" onPress={testSignOut} loading={loading} />
                <TestButton title="7. Reset Pass 📧" onPress={testResetPassword} loading={loading} />
            </View>

            {/* Log */}
            <View style={styles.logContainer}>
                <Text style={styles.logTitle}>📋 Log de Actividad:</Text>
                {log.map((entry, index) => (
                    <Text key={index} style={styles.logEntry}>{entry}</Text>
                ))}
            </View>
        </ScrollView>
    );
}

function TestButton({ title, onPress, loading }: { title: string; onPress: () => void; loading: boolean }) {
    return (
        <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={onPress}
            disabled={loading}
        >
            <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#6366f1',
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10,
    },
    userInfo: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 10,
        borderRadius: 8,
        width: '100%',
    },
    userText: {
        color: 'white',
        fontSize: 14,
        marginVertical: 2,
    },
    form: {
        padding: 20,
        gap: 10,
    },
    input: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    buttons: {
        padding: 20,
        gap: 10,
    },
    button: {
        backgroundColor: '#6366f1',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#9ca3af',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    logContainer: {
        padding: 20,
        backgroundColor: '#1f2937',
        margin: 20,
        borderRadius: 8,
    },
    logTitle: {
        color: '#10b981',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    logEntry: {
        color: '#e5e7eb',
        fontSize: 12,
        fontFamily: 'monospace',
        marginVertical: 2,
    },
});
