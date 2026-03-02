/**
 * Auth routes layout
 * Handles password reset flow (auth/reset-password)
 */
import { Stack } from "expo-router";

export default function AuthLayout() {
    return (
        <Stack screenOptions={{ headerShown: true }}>
            <Stack.Screen
                name="reset-password"
                options={{
                    headerShown: true,
                    headerBackVisible: true,
                }}
            />
        </Stack>
    );
}
